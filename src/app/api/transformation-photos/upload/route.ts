import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";

import { db } from "@/db";
import { transformationPhotos } from "@/db/schema";
import { auth } from "@/lib/auth";

const uploadMetadataSchema = z.object({
  capturedOn: z.string().date(),
  width: z.number().int().min(1).max(1280),
  height: z.number().int().min(1).max(1280),
  byteSize: z.number().int().min(1).max(2_000_000),
});

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) throw new Error("Sign in to upload a transformation photo.");
        const metadata = uploadMetadataSchema.parse(JSON.parse(clientPayload ?? "{}"));
        const expectedPathname = `transformation-photos/${session.user.id}/${metadata.capturedOn}.webp`;
        if (pathname !== expectedPathname) throw new Error("Invalid upload pathname.");
        const capturedAt = new Date(`${metadata.capturedOn}T12:00:00Z`).getTime();
        if (Math.abs(Date.now() - capturedAt) > 1000 * 60 * 60 * 48) throw new Error("Daily photos must be uploaded for today.");

        return {
          allowedContentTypes: ["image/webp"],
          maximumSizeInBytes: 2_000_000,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          tokenPayload: JSON.stringify({ ...metadata, userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const metadata = uploadMetadataSchema.extend({ userId: z.string().min(1) }).parse(JSON.parse(tokenPayload ?? "{}"));
        const expectedPathname = `transformation-photos/${metadata.userId}/${metadata.capturedOn}.webp`;
        if (blob.pathname !== expectedPathname || blob.contentType !== "image/webp") throw new Error("Uploaded photo metadata did not match its authorization.");

        await db
          .insert(transformationPhotos)
          .values({
            userId: metadata.userId,
            capturedOn: metadata.capturedOn,
            blobPathname: blob.pathname,
            blobEtag: blob.etag,
            contentType: blob.contentType,
            width: metadata.width,
            height: metadata.height,
            byteSize: metadata.byteSize,
          })
          .onConflictDoUpdate({
            target: [transformationPhotos.userId, transformationPhotos.capturedOn],
            set: {
              blobPathname: blob.pathname,
              blobEtag: blob.etag,
              contentType: blob.contentType,
              width: metadata.width,
              height: metadata.height,
              byteSize: metadata.byteSize,
              createdAt: new Date(),
            },
          });
      },
    });
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Photo upload could not be authorized.";
    return Response.json({ error: message }, { status: message.includes("Sign in") ? 401 : 400 });
  }
}
