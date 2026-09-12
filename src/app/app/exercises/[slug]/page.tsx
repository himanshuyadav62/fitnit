import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExerciseGuideContent } from "@/components/exercise-guide-content";
import { getActivePlanExercise, getExercise } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Exercise guide" };

export default async function ExercisePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ item?: string; template?: string }> }) {
  const [{ slug }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const planExerciseId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.item ?? "") ? query.item : undefined;
  const templateSlug = /^[a-z0-9-]{1,120}$/.test(query.template ?? "") ? query.template : undefined;
  const [exercise, planExercise] = await Promise.all([
    getExercise(user.id, slug),
    templateSlug ? Promise.resolve(null) : getActivePlanExercise(user.id, slug, planExerciseId),
  ]);
  if (!exercise) notFound();
  return <ExerciseGuideContent exercise={exercise} planExercise={planExercise} backHref={templateSlug ? `/app/plans/${templateSlug}` : "/app/plan"} backLabel={templateSlug ? "Back to plan preview" : "Back to plan"} />;
}
