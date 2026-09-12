import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExerciseGuideContent } from "@/components/exercise-guide-content";
import { PublicHeader } from "@/components/public-header";
import { getPublicExercise } from "@/lib/data";

export const metadata: Metadata = { title: "Exercise technique guide" };

export default async function PublicExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = await getPublicExercise(slug);
  if (!exercise) notFound();

  return <div className="min-h-screen"><PublicHeader /><main className="mx-auto max-w-6xl px-5 py-12 lg:px-8"><ExerciseGuideContent exercise={exercise} backHref="/plans/starter" backLabel="Back to starter plan" /></main></div>;
}
