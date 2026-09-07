import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Copy, Dumbbell, NotebookPen } from "lucide-react";

import { cloneStarterPlan, startWorkout } from "@/app/actions";
import { AddExerciseDialog } from "@/components/add-exercise-dialog";
import { AddWorkoutDayDialog } from "@/components/add-workout-day-dialog";
import { ExerciseDetailsDialog } from "@/components/exercise-details-dialog";
import { PlanDetailsDialog } from "@/components/plan-details-dialog";
import { PlanSwitcher } from "@/components/plan-switcher";
import { RemoveExerciseButton } from "@/components/remove-exercise-button";
import { SubmitButton } from "@/components/submit-button";
import { WorkoutDayDetailsDialog } from "@/components/workout-day-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivePlan, getExerciseLibrary, getProfile, getUserPlans } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "My plan" };

export default async function PlanPage() {
  const user = await requireUser();
  const [plan, profile, exerciseLibrary, userPlans] = await Promise.all([getActivePlan(user.id), getProfile(user.id), getExerciseLibrary(user.id), getUserPlans(user.id)]);
  if (!profile?.onboardingComplete) return <Empty title="Complete your assessment first" copy="Your schedule and readiness answers are needed before a private plan can be created." href="/app/onboarding" label="Complete assessment" />;
  if (!plan) return <Empty title="No active plan" copy="Choose a research-informed template from the plan library, then customize every workout." href="/app/plans" label="Explore plans" />;

  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div><p className="text-sm font-medium text-primary">Current plan · {plan.durationWeeks} weeks</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{plan.name}</h1><p className="mt-2 text-sm text-muted-foreground">{plan.daysPerWeek} days per week · personalized notes and form videos stay with this plan</p></div>
      <div className="space-y-3"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Switch plan</p><PlanSwitcher plans={userPlans.map(({ id, name, goal }) => ({ id, name, goal }))} currentPlanId={plan.id} /></div>
    </div>
    <div className="flex flex-wrap gap-2"><AddWorkoutDayDialog planId={plan.id} disabled={plan.workouts.length >= 7} /><PlanDetailsDialog id={plan.id} name={plan.name} goal={plan.goal} durationWeeks={plan.durationWeeks} /><Button variant="outline" asChild><Link href="/app/plans"><BookOpen /> Browse plans</Link></Button><form action={cloneStarterPlan}><SubmitButton variant="outline" pendingLabel="Creating plan…"><Copy /> Add recommendation</SubmitButton></form></div>

    <div className="grid gap-6 lg:grid-cols-2">{plan.workouts.map((workout) => <Card key={workout.id} className="border-white/8">
      <CardHeader><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">Day {workout.dayNumber}</Badge>{workout.label && <Badge variant="secondary">{workout.label}</Badge>}</div><CardTitle className="mt-4">{workout.title}</CardTitle><CardDescription className="mt-1">{workout.focus}</CardDescription></div><div className="flex items-center gap-1"><WorkoutDayDetailsDialog id={workout.id} title={workout.title} focus={workout.focus} label={workout.label} /><Dumbbell className="size-5 text-primary" /></div></div></CardHeader>
      <CardContent>
        <div className="space-y-2">{workout.exercises.map((exercise) => <div key={exercise.id} className="group flex items-center gap-2 rounded-lg border bg-muted/15 p-3 transition-colors hover:border-primary/30">
          <Link href={`/app/exercises/${exercise.slug}?item=${exercise.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><p className="truncate text-sm font-medium group-hover:text-primary">{exercise.name}</p>{exercise.label && <Badge variant="secondary" className="shrink-0">{exercise.label}</Badge>}</div><p className="text-xs text-muted-foreground">{exercise.equipment}</p>{exercise.userNotes && <p className="mt-1 flex items-center gap-1 truncate text-xs text-primary"><NotebookPen className="size-3" />{exercise.userNotes}</p>}</div>
            <div className="shrink-0 text-right"><p className="text-sm">{exercise.sets} × {exercise.repMin}–{exercise.repMax}</p><p className="flex items-center justify-end gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{exercise.restSeconds}s</p></div>
          </Link>
          <ExerciseDetailsDialog id={exercise.id} slug={exercise.slug} name={exercise.name} userNotes={exercise.userNotes} videoUrl={exercise.videoUrlOverride} label={exercise.label} />
          <RemoveExerciseButton id={exercise.id} name={exercise.name} />
        </div>)}</div>
        {workout.exercises.length === 0 && <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">This day is empty. Add its first exercise before starting.</div>}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row"><AddExerciseDialog workoutId={workout.id} exercises={exerciseLibrary} /><form action={startWorkout} className="flex-1"><input type="hidden" name="workoutId" value={workout.id} /><SubmitButton className="w-full" disabled={workout.exercises.length === 0} pendingLabel={`Starting day ${workout.dayNumber}…`}>Start day {workout.dayNumber} <ArrowRight /></SubmitButton></form></div>
      </CardContent>
    </Card>)}</div>
    <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="text-base">Progression rule</CardTitle><CardDescription>When every set reaches the top of its rep range with steady technique and the prescribed reps in reserve, add the smallest load available. If form breaks or recovery slips, keep the load or reduce a set before adding more.</CardDescription></CardHeader></Card>
  </div>;
}

function Empty({ title, copy, href, label }: { title: string; copy: string; href: string; label: string }) {
  return <div className="mx-auto max-w-xl py-20 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Dumbbell /></div><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{copy}</p><Button className="mt-6" asChild><Link href={href}>{label}</Link></Button></div>;
}
