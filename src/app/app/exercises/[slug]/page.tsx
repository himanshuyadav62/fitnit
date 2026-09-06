import type { Metadata } from "next";
import { ArrowLeft, CircleCheck, Dumbbell, Lightbulb, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExercise } from "@/lib/data";

export const metadata: Metadata = { title: "Exercise guide" };
export default async function ExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = await getExercise(slug);
  if (!exercise) notFound();
  return <div className="mx-auto max-w-4xl"><Button variant="ghost" className="mb-6" asChild><Link href="/app/plan"><ArrowLeft /> Back to plan</Link></Button><div className="grid gap-8 lg:grid-cols-[1fr_280px]"><div><div className="flex flex-wrap gap-2"><Badge>{exercise.movementPattern}</Badge>{exercise.primaryMuscles.map((muscle) => <Badge variant="secondary" key={muscle}>{muscle}</Badge>)}</div><h1 className="mt-5 text-4xl font-semibold tracking-tight">{exercise.name}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Dumbbell className="size-4" /> {exercise.equipment}</p><Card className="mt-8 border-white/8"><CardHeader><CardTitle>How to perform it</CardTitle></CardHeader><CardContent><ol className="space-y-5">{exercise.instructions.map((instruction, index) => <li key={instruction} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">{index+1}</span><p className="pt-1 text-sm leading-6">{instruction}</p></li>)}</ol></CardContent></Card></div><aside className="space-y-4"><Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="size-4 text-primary" /> Technique cues</CardTitle></CardHeader><CardContent className="space-y-3">{exercise.cues.map((cue) => <div key={cue} className="flex gap-2 text-sm"><CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />{cue}</div>)}</CardContent></Card><Card className="border-white/8"><CardContent className="p-5"><div className="flex gap-3"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-400" /><p className="text-xs leading-5 text-muted-foreground">Muscle effort is expected; sharp, electrical, or worsening joint pain is not. Stop and choose a comfortable alternative.</p></div></CardContent></Card></aside></div></div>;
}
