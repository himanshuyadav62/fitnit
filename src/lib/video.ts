const YOUTUBE_ID = /^[a-zA-Z0-9_-]{6,15}$/;

export function getSafeEmbedUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] ?? null;
    }
    if (id && YOUTUBE_ID.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (["vimeo.com", "www.vimeo.com"].includes(url.hostname)) {
      const vimeoId = url.pathname.split("/").filter(Boolean)[0];
      if (vimeoId && /^\d+$/.test(vimeoId)) return `https://player.vimeo.com/video/${vimeoId}`;
    }
  } catch {
    return null;
  }
  return null;
}
