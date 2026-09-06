import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, Dumbbell } from "lucide-react";
import { notFound } from "next/navigation";

import { activateTemplate } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplateBySlug } from "@/lib/data";

export const metadata: Metadata = { title: "Plan preview" };

export default async function PlanTemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = await getTemplateBySlug(slug);
  if (!plan) notFound();
  return <div className="space-y-8">
    <Button variant="ghost" asChild><Link href="/app/plans"><ArrowLeft /> Back to library</Link></Button>
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="max-w-3xl"><div className="flex flex-wrap gap-2"><Badge>{plan.daysPerWeek} days / week</Badge><Badge variant="secondary">{plan.experience}</Badge><Badge variant="outline">{plan.durationWeeks} weeks</Badge></div><h1 className="mt-5 text-4xl font-semibold tracking-tight">{plan.title}</h1><p className="mt-3 leading-7 text-muted-foreground">{plan.description}</p></div><form action={activateTemplate}><input type="hidden" name="templateSlug" value={plan.slug} /><SubmitButton size="lg" pendingLabel="Building your plan…"><Dumbbell /> Make this my plan</SubmitButton></form></div>
    <div className="grid gap-5 lg:grid-cols-2">{plan.workouts.map((workout) => <Card key={workout.id} className="border-white/8"><CardHeader><Badge variant="outline" className="w-fit">Day {workout.dayNumber}</Badge><CardTitle className="mt-2">{workout.title}</CardTitle><CardDescription>{workout.focus}</CardDescription></CardHeader><CardContent className="space-y-2">{workout.exercises.map((exercise, index) => <div key={exercise.id} className="flex items-center justify-between gap-4 rounded-lg border bg-muted/15 p-3"><div className="min-w-0"><p className="text-sm font-medium">{index + 1}. {exercise.name}</p><p className="text-xs text-muted-foreground">{exercise.equipment}</p></div><div className="shrink-0 text-right text-xs"><p>{exercise.sets} × {exercise.repMin}–{exercise.repMax}</p><p className="mt-1 flex items-center justify-end gap-1 text-muted-foreground"><Clock3 className="size-3" />{exercise.restSeconds}s · {exercise.targetRir} RIR</p></div></div>)}</CardContent></Card>)}</div>
    <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="text-base">Nutrition & recovery note</CardTitle><CardDescription className="leading-6">{plan.nutritionNotes}</CardDescription></CardHeader></Card>
  </div>;
}
