/* eslint-disable @next/next/no-img-element -- local camera preview uses a temporary object URL */
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, RefreshCw, SwitchCamera, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DailyPhotoCamera({ disabled, uploading, onUpload }: {
  disabled: boolean;
  uploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [snapshot, setSnapshot] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => () => {
    requestRef.current++;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function stopCamera() {
    requestRef.current++;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }

  function clearSnapshot() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setSnapshot(null);
  }

  async function startCamera(nextFacing = facing) {
    stopCamera();
    clearSnapshot();
    setOpen(true);
    setFacing(nextFacing);
    setError("");
    const requestId = requestRef.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access needs HTTPS and a supported browser.");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: nextFacing }, width: { ideal: 960 }, height: { ideal: 1280 } },
      });
      // Permission can resolve after the user cancels or navigates away.
      if (requestId !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cause) {
      if (requestId !== requestRef.current) return;
      stopCamera();
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, then retry."
        : name === "NotFoundError" ? "No camera was found on this device. Open this page on your phone or a device with a webcam."
        : name === "NotReadableError" ? "Your camera is busy. Close other apps using it, then retry."
        : cause instanceof Error ? cause.message : "The camera could not open. Please retry.");
    }
  }

  function closeCamera() {
    stopCamera();
    clearSnapshot();
    setOpen(false);
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !ready || !video.videoWidth || !video.videoHeight) return;
    setCapturing(true);
    const requestId = requestRef.current;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 960 / video.videoWidth, 1280 / video.videoHeight);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d", { alpha: false });
    try {
      if (!context) throw new Error("Your browser could not capture the photo.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
      if (requestId !== requestRef.current) return;
      if (!blob) throw new Error("The photo could not be captured. Please retry.");
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setSnapshot({ file: new File([blob], "daily-camera-photo.webp", { type: blob.type }), url });
      stopCamera();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Capture failed.");
    } finally {
      setCapturing(false);
    }
  }

  return <div className="space-y-3">
    {!open && <div className="space-y-2">
      <Button type="button" className="w-full" disabled={disabled || uploading} onClick={() => void startCamera()}><Camera /> Take today’s photo</Button>
      <Button type="button" variant="outline" className="w-full" disabled={disabled || uploading} onClick={() => galleryRef.current?.click()}><Upload /> Upload from gallery</Button>
      <p className="text-xs text-muted-foreground">Already took today’s photo? Choose a JPEG, PNG, or WebP from your device.</p>
    </div>}
    <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a photo from gallery" hidden disabled={disabled || uploading || open} onChange={async (event) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      if (file) await onUpload(file);
      input.value = "";
    }} />
    <div hidden={!open} className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-black" hidden={Boolean(error)}>
        <video ref={videoRef} autoPlay playsInline muted hidden={Boolean(snapshot)} onLoadedData={() => setReady(true)} aria-label="Live camera preview" className={`size-full object-contain ${facing === "user" ? "-scale-x-100" : ""}`} />
        {snapshot && <img src={snapshot.url} alt="Preview of today’s captured photo" className="absolute inset-0 size-full object-contain" />}
        {!snapshot && !ready && <div role="status" className="absolute inset-0 grid place-items-center bg-black/60 text-sm text-white"><span className="flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" /> Waiting for camera permission…</span></div>}
      </div>
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {snapshot ? <>
          <Button type="button" disabled={uploading} onClick={async () => { if (await onUpload(snapshot.file)) closeCamera(); }}><Upload /> {uploading ? "Uploading…" : "Upload today’s photo"}</Button>
          <Button type="button" variant="outline" disabled={uploading} onClick={() => void startCamera()}><RefreshCw /> Retake</Button>
        </> : error ? <Button type="button" variant="outline" onClick={() => void startCamera()}><RefreshCw /> Retry camera</Button> : <>
          <Button type="button" disabled={!ready || capturing} onClick={() => void capture()}><Camera /> {capturing ? "Capturing…" : "Capture photo"}</Button>
          <Button type="button" variant="outline" disabled={capturing} onClick={() => void startCamera(facing === "user" ? "environment" : "user")}><SwitchCamera /> Flip camera</Button>
        </>}
        <Button type="button" variant="ghost" disabled={uploading || capturing} onClick={closeCamera}><X /> Cancel</Button>
      </div>
      <p className="text-xs text-muted-foreground">Camera only, no microphone. Nothing is uploaded until you confirm your photo.</p>
    </div>
  </div>;
}
