import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Copy, Dumbbell } from "lucide-react";

import { cloneStarterPlan, startWorkout } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivePlan, getProfile } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "My plan" };
export default async function PlanPage() {
  const user = await requireUser();
  const [plan, profile] = await Promise.all([getActivePlan(user.id), getProfile(user.id)]);
  if (!profile?.onboardingComplete) return <Empty title="Complete your assessment first" copy="Your schedule and readiness answers are needed before a private plan can be created." href="/app/onboarding" label="Complete assessment" />;
  if (!plan) return <Empty title="No active plan" copy="Clone the featured foundation plan, adapted to your selected training days." action />;
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-primary">Private plan · {plan.durationWeeks} weeks</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{plan.name}</h1><p className="mt-2 text-sm text-muted-foreground">{plan.daysPerWeek} days per week · leave about 2 reps in reserve on working sets</p></div><form action={cloneStarterPlan}><SubmitButton variant="outline" pendingLabel="Resetting plan…"><Copy /> Reset from starter</SubmitButton></form></div>
    <div className="grid gap-6 lg:grid-cols-2">{plan.workouts.map((workout) => <Card key={workout.id} className="border-white/8"><CardHeader><div className="flex items-start justify-between"><div><Badge variant="outline">Day {workout.dayNumber}</Badge><CardTitle className="mt-4">{workout.title}</CardTitle><CardDescription className="mt-1">{workout.focus}</CardDescription></div><Dumbbell className="size-5 text-primary" /></div></CardHeader><CardContent><div className="space-y-2">{workout.exercises.map((exercise) => <Link href={`/app/exercises/${exercise.slug}`} key={exercise.id} className="group flex items-center justify-between gap-4 rounded-lg border bg-muted/15 p-3 transition-colors hover:border-primary/30"><div className="min-w-0"><p className="truncate text-sm font-medium group-hover:text-primary">{exercise.name}</p><p className="text-xs text-muted-foreground">{exercise.equipment}</p></div><div className="shrink-0 text-right"><p className="text-sm">{exercise.sets} × {exercise.repMin}–{exercise.repMax}</p><p className="flex items-center justify-end gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{exercise.restSeconds}s</p></div></Link>)}</div><form action={startWorkout} className="mt-5"><input type="hidden" name="workoutId" value={workout.id} /><SubmitButton className="w-full" pendingLabel={`Starting day ${workout.dayNumber}…`}>Start day {workout.dayNumber} <ArrowRight /></SubmitButton></form></CardContent></Card>)}</div>
    <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="text-base">Progression rule</CardTitle><CardDescription>When every set reaches the top of its rep range with steady technique and about 2 reps in reserve, add the smallest load available. If form breaks or you reach failure, keep the load or reduce it slightly next time.</CardDescription></CardHeader></Card>
  </div>;
}

function Empty({ title, copy, href, label, action }: { title: string; copy: string; href?: string; label?: string; action?: boolean }) {
  return <div className="mx-auto max-w-xl py-20 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Dumbbell /></div><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{copy}</p>{action ? <form action={cloneStarterPlan}><SubmitButton className="mt-6" pendingLabel="Creating plan…">Create plan</SubmitButton></form> : <Button className="mt-6" asChild><Link href={href!}>{label}</Link></Button>}</div>;
}
