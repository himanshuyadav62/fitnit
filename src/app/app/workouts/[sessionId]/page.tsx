import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, Info, TimerReset } from "lucide-react";
import { notFound } from "next/navigation";

import { finishWorkout, logSet } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkoutSession } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Workout" };
export default async function WorkoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requireUser();
  const { sessionId } = await params;
  const session = await getWorkoutSession(user.id, sessionId);
  if (!session) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><Badge>{session.completedAt ? "Completed" : "In progress"}</Badge><span className="text-xs text-muted-foreground">Started {session.startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><h1 className="mt-3 text-3xl font-semibold tracking-tight">{session.title}</h1><p className="mt-2 text-muted-foreground">{session.focus}</p></div><Button variant="outline" asChild><Link href="/app/plan">Back to plan</Link></Button></div>
    <div className="space-y-5">{session.exercises.map((exercise, index) => { const logs = session.logs.filter((log) => log.planExerciseId === exercise.id); return <Card key={exercise.id} className="border-white/8"><CardHeader><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Exercise {index + 1}</p><CardTitle className="mt-2"><Link className="hover:text-primary" href={`/app/exercises/${exercise.slug}`}>{exercise.name}</Link></CardTitle><CardDescription>{exercise.equipment} · target {exercise.repMin}–{exercise.repMax} reps · {exercise.targetRir} RIR</CardDescription></div><Button variant="ghost" size="icon" asChild><Link href={`/app/exercises/${exercise.slug}`} aria-label={`View ${exercise.name} guide`}><Info /></Link></Button></div></CardHeader><CardContent><div className="space-y-2">{Array.from({ length: exercise.sets }, (_, setIndex) => { const setNumber = setIndex + 1; const saved = logs.find((log) => log.setNumber === setNumber); return <form action={logSet} key={setNumber} className="grid grid-cols-[42px_1fr_1fr_86px_auto] items-end gap-2 rounded-lg border bg-muted/15 p-3"><input type="hidden" name="sessionId" value={session.id} /><input type="hidden" name="planExerciseId" value={exercise.id} /><input type="hidden" name="setNumber" value={setNumber} /><div className="pb-2 text-center text-sm font-semibold">{saved ? <CheckCircle2 className="mx-auto size-4 text-primary" /> : setNumber}</div><div><Label className="text-[10px] text-muted-foreground">KG</Label><Input name="weightKg" type="number" min="0" max="1000" step="0.25" defaultValue={saved?.weightKg ?? "0"} disabled={!!session.completedAt} required /></div><div><Label className="text-[10px] text-muted-foreground">REPS</Label><Input name="reps" type="number" min="0" max="100" defaultValue={saved?.reps ?? exercise.repMin} disabled={!!session.completedAt} required /></div><div><Label className="text-[10px] text-muted-foreground">RIR</Label><Select name="rir" defaultValue={String(saved?.rir ?? exercise.targetRir)} disabled={!!session.completedAt}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[0,1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select></div><Button size="icon" variant={saved ? "secondary" : "default"} disabled={!!session.completedAt} aria-label={`Save set ${setNumber}`}><CheckCircle2 /></Button></form>; })}</div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><TimerReset className="size-3.5" /> Rest about {exercise.restSeconds} seconds between sets.</div></CardContent></Card>; })}</div>
    {!session.completedAt && <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="text-lg">Finish session</CardTitle><CardDescription>Record the whole-session effort, then recover.</CardDescription></CardHeader><CardContent><form action={finishWorkout} className="grid gap-4 sm:grid-cols-[160px_1fr_auto] sm:items-end"><input type="hidden" name="sessionId" value={session.id} /><div className="space-y-2"><Label>Effort (1–10)</Label><Select name="effort" defaultValue="7"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5,6,7,8,9,10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="notes">Session note</Label><Textarea id="notes" name="notes" rows={2} placeholder="What felt strong or needs attention?" /></div><Button size="lg"><CheckCircle2 /> Complete workout</Button></form></CardContent></Card>}
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> Stop if you feel sharp pain, dizziness, chest pain, or unusual shortness of breath.</div>
  </div>;
}
