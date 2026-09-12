import type { Metadata } from "next";
import { Film } from "lucide-react";

import { TransformationStudio } from "@/components/transformation-studio";
import { Badge } from "@/components/ui/badge";
import { getTransformationPhotos } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Transformation journey" };

export default async function TransformationPage() {
  const user = await requireUser();
  const photos = await getTransformationPhotos(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your visual progress</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Transformation journey</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Capture one consistent photo each day, then replay your progress as a smooth, private timelapse.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1.5">
          <Film className="size-3.5 text-primary" /> Private by default
        </Badge>
      </div>
      <TransformationStudio
        key={photos.at(-1)?.id ?? "empty"}
        userId={user.id}
        photos={photos}
        blobConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </div>
  );
}
