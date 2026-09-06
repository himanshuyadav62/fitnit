import type { Metadata } from "next";
import { ArrowLeft, CircleCheck, Dumbbell, Lightbulb, NotebookPen, PlayCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExerciseDetailsDialog } from "@/components/exercise-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivePlanExercise, getExercise } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { getSafeEmbedUrl } from "@/lib/video";

export const metadata: Metadata = { title: "Exercise guide" };

export default async function ExercisePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ item?: string }> }) {
  const [{ slug }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const planExerciseId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.item ?? "") ? query.item : undefined;
  const [exercise, planExercise] = await Promise.all([getExercise(slug), getActivePlanExercise(user.id, slug, planExerciseId)]);
  if (!exercise) notFound();
  const embedUrl = getSafeEmbedUrl(planExercise?.videoUrlOverride ?? exercise.videoUrl);

  return <div className="mx-auto max-w-5xl">
    <Button variant="ghost" className="mb-6" asChild><Link href="/app/plan"><ArrowLeft /> Back to plan</Link></Button>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="flex flex-wrap gap-2"><Badge>{exercise.movementPattern}</Badge>{exercise.primaryMuscles.map((muscle) => <Badge variant="secondary" key={muscle}>{muscle}</Badge>)}</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">{exercise.name}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Dumbbell className="size-4" /> {exercise.equipment}</p>
        <Card className="mt-8 overflow-hidden border-white/8">
          <div className="aspect-video border-b bg-black/35">
            {embedUrl ? <iframe src={embedUrl} title={`${exercise.name} form demonstration`} className="size-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="grid size-full place-items-center p-8 text-center"><div><PlayCircle className="mx-auto size-12 text-primary" /><p className="mt-4 font-medium">Form video space</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Attach a trusted YouTube or Vimeo demonstration to this exercise from your plan.</p>{planExercise && <div className="mt-4"><ExerciseDetailsDialog id={planExercise.id} slug={slug} name={exercise.name} userNotes={planExercise.userNotes} videoUrl={planExercise.videoUrlOverride} /></div>}</div></div>}
          </div>
          <CardHeader><CardTitle>How to perform it</CardTitle></CardHeader><CardContent><ol className="space-y-5">{exercise.instructions.map((instruction, index) => <li key={instruction} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">{index + 1}</span><p className="pt-1 text-sm leading-6">{instruction}</p></li>)}</ol></CardContent>
        </Card>
      </div>
      <aside className="space-y-4">
        <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="size-4 text-primary" /> Technique cues</CardTitle></CardHeader><CardContent className="space-y-3">{exercise.cues.map((cue) => <div key={cue} className="flex gap-2 text-sm"><CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />{cue}</div>)}</CardContent></Card>
        {planExercise && <Card className="border-white/8"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><NotebookPen className="size-4 text-primary" /> Your notes</CardTitle><ExerciseDetailsDialog id={planExercise.id} slug={slug} name={exercise.name} userNotes={planExercise.userNotes} videoUrl={planExercise.videoUrlOverride} /></div></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{planExercise.userNotes || "No personal notes yet. Add setup details or a reminder for next time."}</p>{planExercise.programmingNotes && <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Plan cue: {planExercise.programmingNotes}</p>}</CardContent></Card>}
        <Card className="border-white/8"><CardContent className="p-5"><div className="flex gap-3"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-400" /><p className="text-xs leading-5 text-muted-foreground">Muscle effort is expected; sharp, electrical, or worsening joint pain is not. Stop and choose a comfortable alternative.</p></div></CardContent></Card>
      </aside>
    </div>
  </div>;
}
