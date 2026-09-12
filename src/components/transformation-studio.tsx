/* eslint-disable @next/next/no-img-element -- private authenticated image routes cannot be fetched by Next's unauthenticated image optimizer */
"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Camera, CheckCircle2, Images, LoaderCircle, Pause, Play, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type Photo = { id: string; capturedOn: string; blobEtag: string; width: number; height: number; byteSize: number };

function photoUrl(photo: Photo) {
  return `/api/transformation-photos/${photo.id}?v=${encodeURIComponent(photo.blobEtag)}`;
}

function todayKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function compressPhoto(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 960 / bitmap.width, 1280 / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Your browser could not prepare this photo.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.84;
  let blob: Blob | null = null;
  do {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    quality -= 0.1;
  } while (blob && blob.size > 2_000_000 && quality >= 0.44);
  if (!blob || blob.size > 2_000_000) throw new Error("This image is still too large after optimization. Try a different photo.");
  return { file: new File([blob], "daily-transformation.webp", { type: "image/webp" }), width, height };
}

export function TransformationStudio({ userId, photos, blobConfigured }: { userId: string; photos: Photo[]; blobConfigured: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [index, setIndex] = useState(Math.max(0, photos.length - 1));
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(4);
  const current = photos[index];

  useEffect(() => {
    if (!playing || photos.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => value >= photos.length - 1 ? 0 : value + 1), 1000 / fps);
    return () => window.clearInterval(timer);
  }, [fps, photos.length, playing]);
  useEffect(() => {
    if (!current) return;
    for (let offset = 1; offset <= Math.min(3, photos.length - 1); offset++) {
      const image = new Image();
      image.src = photoUrl(photos[(index + offset) % photos.length]);
    }
  }, [current, index, photos]);

  async function handlePhoto(file: File) {
    if (!blobConfigured) return toast.error("Connect the private Blob store to this Vercel project first.");
    if (!file.type.startsWith("image/")) return toast.error("Choose a JPEG, PNG, or WebP image.");
    setUploading(true);
    setProgress(8);
    try {
      const optimized = await compressPhoto(file);
      const capturedOn = todayKey();
      await upload(`transformation-photos/${userId}/${capturedOn}.webp`, optimized.file, {
        access: "private",
        handleUploadUrl: "/api/transformation-photos/upload",
        clientPayload: JSON.stringify({ capturedOn, width: optimized.width, height: optimized.height, byteSize: optimized.file.size }),
        contentType: "image/webp",
        onUploadProgress: ({ percentage }) => setProgress(Math.max(10, percentage)),
      });
      setProgress(100);
      toast.success(photos.some((photo) => photo.capturedOn === capturedOn) ? "Today’s photo replaced." : "Today’s photo added to your journey.");
      router.refresh();
      window.setTimeout(() => router.refresh(), 1800);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The photo could not be uploaded.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function deleteCurrentPhoto() {
    if (!current || !window.confirm(`Delete your photo from ${current.capturedOn}? This cannot be undone.`)) return;
    setDeleting(true);
    setPlaying(false);
    try {
      const response = await fetch(`/api/transformation-photos/${current.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text() || "The photo could not be deleted.");
      toast.success("Photo permanently deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The photo could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
      <Card className="border-primary/20 bg-primary/5"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><Camera className="size-5 text-primary" /> Today’s frame</CardTitle><CardDescription className="mt-1">One aligned photo a day creates a transformation worth replaying.</CardDescription></div>{photos.some((photo) => photo.capturedOn === todayKey()) && <Badge><CheckCircle2 className="size-3" /> Added today</Badge>}</div></CardHeader><CardContent className="space-y-5">
        <div className="rounded-xl border border-dashed bg-background/40 p-5 text-sm text-muted-foreground"><p className="font-medium text-foreground">For a smooth result</p><ul className="mt-2 space-y-1.5"><li>• Use the same pose and camera height.</li><li>• Keep lighting and distance consistent.</li><li>• Wear similar fitted clothing.</li></ul></div>
        <div><Label htmlFor="transformation-photo">Take or choose today’s photo</Label><input ref={inputRef} id="transformation-photo" type="file" accept="image/jpeg,image/png,image/webp" capture="user" disabled={uploading || !blobConfigured} className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handlePhoto(file); }} /></div>
        {uploading && <div><div className="mb-2 flex items-center justify-between text-xs"><span className="flex items-center gap-1.5"><LoaderCircle className="size-3.5 animate-spin" /> Optimizing and uploading</span><span>{Math.round(progress)}%</span></div><Progress value={progress} /></div>}
        {!blobConfigured && <p className="text-xs text-amber-300">Blob is not configured locally. Connect the private store and pull Vercel environment variables.</p>}
        <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><p>Photos are compressed in your browser, uploaded directly to your private Blob store, and served only after account authentication.</p></div>
      </CardContent></Card>

      <Card className="overflow-hidden border-white/8"><CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary" /> Transformation timelapse</CardTitle><CardDescription className="mt-1">{photos.length ? `${photos.length} daily ${photos.length === 1 ? "frame" : "frames"} ready` : "Add your first frame to begin"}</CardDescription></div>{photos.length > 1 && <Select value={String(fps)} onValueChange={(value) => setFps(Number(value))}><SelectTrigger className="w-28" aria-label="Playback speed"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 fps</SelectItem><SelectItem value="2">2 fps</SelectItem><SelectItem value="4">4 fps</SelectItem><SelectItem value="8">8 fps</SelectItem></SelectContent></Select>}</CardHeader><CardContent>
        {current ? <div className="space-y-5"><div className="relative mx-auto aspect-[3/4] max-h-[580px] overflow-hidden rounded-2xl border bg-black"><img key={current.id} src={photoUrl(current)} alt={`Transformation photo from ${current.capturedOn}`} className="size-full object-contain" decoding="async" /><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-xs text-white"><span>{new Date(`${current.capturedOn}T12:00:00Z`).toLocaleDateString(undefined, { dateStyle: "medium" })}</span><span>Frame {index + 1} / {photos.length}</span></div></div>
          <div className="flex items-center gap-4"><Button type="button" size="icon" disabled={photos.length < 2} aria-label={playing ? "Pause timelapse" : "Play timelapse"} onClick={() => setPlaying((value) => !value)}>{playing ? <Pause /> : <Play />}</Button><Slider value={[index]} max={Math.max(0, photos.length - 1)} step={1} onValueChange={([value]) => { setPlaying(false); setIndex(value); }} aria-label="Timelapse frame" className="flex-1" /><Button type="button" size="icon" variant="ghost" disabled={deleting} aria-label="Delete current photo" onClick={() => void deleteCurrentPhoto()}>{deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}</Button></div>
        </div> : <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed bg-muted/10 text-center"><div><Images className="mx-auto size-9 text-primary" /><p className="mt-4 font-medium">Your story starts with one frame</p><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Use the daily photo control to begin. The player will become richer and smoother as your timeline grows.</p></div></div>}
      </CardContent></Card>
    </div>

    {photos.length >= 2 && <Card className="border-white/8"><CardHeader><CardTitle className="text-base">Then & now</CardTitle><CardDescription>Your first and latest frames, fetched only when this comparison is visible.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{[photos[0], photos.at(-1)!].map((photo, photoIndex) => <figure key={photo.id} className="overflow-hidden rounded-xl border bg-black"><img src={photoUrl(photo)} alt={`${photoIndex === 0 ? "First" : "Latest"} transformation photo`} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-contain" /><figcaption className="border-t bg-card px-3 py-2 text-xs text-muted-foreground">{photoIndex === 0 ? "First" : "Latest"} · {new Date(`${photo.capturedOn}T12:00:00Z`).toLocaleDateString()}</figcaption></figure>)}</CardContent></Card>}
  </div>;
}
