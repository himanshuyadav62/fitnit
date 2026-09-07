import { describe, expect, it } from "vitest";

import { getSafeEmbedUrl } from "./video";

describe("getSafeEmbedUrl", () => {
  it("converts supported YouTube links to the privacy-enhanced player", () => {
    expect(getSafeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(getSafeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(getSafeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("accepts Vimeo and rejects arbitrary iframe hosts", () => {
    expect(getSafeEmbedUrl("https://vimeo.com/12345678")).toBe("https://player.vimeo.com/video/12345678");
    expect(getSafeEmbedUrl("https://example.com/video")).toBeNull();
    expect(getSafeEmbedUrl("javascript:alert(1)")).toBeNull();
  });
});
