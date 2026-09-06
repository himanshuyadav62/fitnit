import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Info, TimerReset } from "lucide-react";
import { notFound } from "next/navigation";

import { finishWorkout } from "@/app/actions";
import { SetLogForm } from "@/components/set-log-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, getWorkoutSession } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Workout" };
export default async function WorkoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requireUser();
  const { sessionId } = await params;
  const [session, profile] = await Promise.all([getWorkoutSession(user.id, sessionId), getProfile(user.id)]);
  if (!session) notFound();
  const timeZone = profile?.timezone ?? "UTC";
  const startedLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone }).format(session.startedAt);
  const loggedSets = session.logs.length;
  const totalReps = session.logs.reduce((sum, log) => sum + log.reps, 0);
  const volumeKg = session.logs.reduce((sum, log) => sum + Number(log.weightKg) * log.reps, 0);
  return <div className="mx-auto max-w-4xl space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex flex-wrap items-center gap-2"><Badge>{session.completedAt ? "Completed" : "In progress"}</Badge><span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{startedLabel}</span></div><h1 className="mt-3 text-3xl font-semibold tracking-tight">{session.title}</h1><p className="mt-2 text-muted-foreground">{session.focus}</p></div><Button variant="outline" asChild><Link href="/app/plan">Back to plan</Link></Button></div>
    <div className="grid grid-cols-3 gap-3">{[["Sets logged", loggedSets.toLocaleString()], ["Total reps", totalReps.toLocaleString()], ["Volume", `${Math.round(volumeKg).toLocaleString()} kg`]].map(([label, value]) => <div key={label} className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>)}</div>
    <div className="space-y-5">{session.exercises.map((exercise, index) => { const logs = session.logs.filter((log) => log.planExerciseId === exercise.id); return <Card key={exercise.id} className="border-white/8"><CardHeader><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Exercise {index + 1}</p>{exercise.label && <Badge variant="secondary">{exercise.label}</Badge>}</div><CardTitle className="mt-2"><Link className="hover:text-primary" href={`/app/exercises/${exercise.slug}`}>{exercise.name}</Link></CardTitle><CardDescription>{exercise.equipment} · target {exercise.repMin}–{exercise.repMax} reps · {exercise.targetRir} RIR</CardDescription></div><Button variant="ghost" size="icon" asChild><Link href={`/app/exercises/${exercise.slug}`} aria-label={`View ${exercise.name} guide`}><Info /></Link></Button></div></CardHeader><CardContent><div className="space-y-2">{Array.from({ length: exercise.sets }, (_, setIndex) => { const setNumber = setIndex + 1; const saved = logs.find((log) => log.setNumber === setNumber); return <SetLogForm key={setNumber} sessionId={session.id} planExerciseId={exercise.id} setNumber={setNumber} defaultWeightKg={saved?.weightKg ?? "0"} defaultReps={saved?.reps ?? exercise.repMin} defaultRir={saved?.rir ?? exercise.targetRir} saved={Boolean(saved)} disabled={Boolean(session.completedAt)} />; })}</div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><TimerReset className="size-3.5" /> Rest about {exercise.restSeconds} seconds between sets.</div></CardContent></Card>; })}</div>
    {!session.completedAt && <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="text-lg">Finish session</CardTitle><CardDescription>Record the whole-session effort, then recover.</CardDescription></CardHeader><CardContent><form action={finishWorkout} className="grid gap-4 sm:grid-cols-[160px_1fr_auto] sm:items-end"><input type="hidden" name="sessionId" value={session.id} /><div className="space-y-2"><Label>Effort (1–10)</Label><Select name="effort" defaultValue="7"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5,6,7,8,9,10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="notes">Session note</Label><Textarea id="notes" name="notes" rows={2} placeholder="What felt strong or needs attention?" /></div><SubmitButton size="lg" pendingLabel="Completing…"><CheckCircle2 /> Complete workout</SubmitButton></form></CardContent></Card>}
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> Stop if you feel sharp pain, dizziness, chest pain, or unusual shortness of breath.</div>
  </div>;
}
