// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DailyPhotoCamera } from "./daily-photo-camera";

describe("daily camera capture", () => {
  const stop = vi.fn();
  const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  const getUserMedia = vi.fn();

  beforeEach(() => {
    stop.mockClear();
    getUserMedia.mockReset().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:camera-preview"), revokeObjectURL: vi.fn() }));
  });

  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("opens the camera on demand without a gallery picker or microphone", async () => {
    const onUpload = vi.fn();
    const { container, unmount } = render(<DailyPhotoCamera disabled={false} uploading={false} onUpload={onUpload} />);
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Take today’s photo" }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: false })));
    await waitFor(() => expect(container.querySelector("video")?.srcObject).toBe(stream));
    expect(onUpload).not.toHaveBeenCalled();
    unmount();
    expect(stop).toHaveBeenCalled();
  });

  it("shows a useful permission error and allows retry", async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"));
    render(<DailyPhotoCamera disabled={false} uploading={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Take today’s photo" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Camera permission was denied");
    fireEvent.click(screen.getByRole("button", { name: "Retry camera" }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));
  });

  it("stops a permission request that resolves after cancellation", async () => {
    let resolve!: (value: MediaStream) => void;
    getUserMedia.mockReturnValue(new Promise<MediaStream>((done) => { resolve = done; }));
    render(<DailyPhotoCamera disabled={false} uploading={false} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Take today’s photo" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await act(async () => resolve(stream));
    expect(stop).toHaveBeenCalledOnce();
  });

  it("requires confirmation before uploading a captured image and supports retake", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(new Blob(["photo"], { type: "image/webp" })));
    const onUpload = vi.fn().mockResolvedValue(true);
    const { container } = render(<DailyPhotoCamera disabled={false} uploading={false} onUpload={onUpload} />);
    fireEvent.click(screen.getByRole("button", { name: "Take today’s photo" }));
    const video = container.querySelector("video")!;
    await waitFor(() => expect(video.srcObject).toBe(stream));
    Object.defineProperties(video, { videoWidth: { value: 960 }, videoHeight: { value: 1280 } });
    fireEvent.loadedData(video);
    fireEvent.click(screen.getByRole("button", { name: "Capture photo" }));
    await screen.findByAltText("Preview of today’s captured photo");
    expect(onUpload).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retake" }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));
    fireEvent.loadedData(video);
    fireEvent.click(screen.getByRole("button", { name: "Capture photo" }));
    await screen.findByAltText("Preview of today’s captured photo");
    fireEvent.click(screen.getByRole("button", { name: "Upload today’s photo" }));
    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(expect.any(File)));
    await screen.findByRole("button", { name: "Take today’s photo" });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:camera-preview");
  });
});
