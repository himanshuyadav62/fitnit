import { del, get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { transformationPhotos } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const parsed = z.string().uuid().safeParse((await params).id);
  if (!parsed.success) return new Response("Not found", { status: 404 });
  const photo = await db.query.transformationPhotos.findFirst({
    where: and(eq(transformationPhotos.id, parsed.data), eq(transformationPhotos.userId, session.user.id)),
  });
  if (!photo) return new Response("Not found", { status: 404 });

  const result = await get(photo.blobPathname, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });
  if (!result) return new Response("Not found", { status: 404 });
  const cacheHeaders = { "Cache-Control": "private, max-age=31536000, immutable", ETag: result.blob.etag };
  if (result.statusCode === 304) return new Response(null, { status: 304, headers: cacheHeaders });

  return new Response(result.stream, {
    headers: {
      ...cacheHeaders,
      "Content-Type": result.blob.contentType,
      "Content-Length": String(result.blob.size),
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const parsed = z.string().uuid().safeParse((await params).id);
  if (!parsed.success) return new Response("Not found", { status: 404 });
  const photo = await db.query.transformationPhotos.findFirst({
    where: and(eq(transformationPhotos.id, parsed.data), eq(transformationPhotos.userId, session.user.id)),
  });
  if (!photo) return new Response("Not found", { status: 404 });

  await del(photo.blobPathname);
  await db.delete(transformationPhotos).where(and(eq(transformationPhotos.id, parsed.data), eq(transformationPhotos.userId, session.user.id)));
  return new Response(null, { status: 204 });
}
