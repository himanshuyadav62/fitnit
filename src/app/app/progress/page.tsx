import type { Metadata } from "next";
import { CalendarDays, Dumbbell, Gauge, Layers3, Scale, TrendingUp } from "lucide-react";

import { MeasurementForm } from "@/components/measurement-form";
import { TrainingVolumeChart } from "@/components/training-volume-chart";
import { WeightChart } from "@/components/weight-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfile, getProgress, getTrainingAnalytics } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Analytics" };

export default async function ProgressPage() {
  const user = await requireUser();
  const [entries, analytics, profile] = await Promise.all([getProgress(user.id), getTrainingAnalytics(user.id), getProfile(user.id)]);
  const timeZone = profile?.timezone ?? "UTC";
  const first = entries[0];
  const latest = entries.at(-1);
  const weightChange = first && latest ? Number(latest.weightKg) - Number(first.weightKg) : 0;
  const totalSets = analytics.sessions.reduce((sum, session) => sum + session.totalSets, 0);
  const totalReps = analytics.sessions.reduce((sum, session) => sum + session.totalReps, 0);
  const totalVolume = analytics.sessions.reduce((sum, session) => sum + Number(session.volumeKg), 0);
  const recentBySession = new Map<string, typeof analytics.recentExercises>();
  for (const exercise of analytics.recentExercises) {
    const rows = recentBySession.get(exercise.sessionId) ?? [];
    rows.push(exercise);
    recentBySession.set(exercise.sessionId, rows);
  }
  const chartData = analytics.sessions.slice(0, 12).reverse().map((session) => ({
    date: new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone }).format(session.startedAt),
    volume: Math.round(Number(session.volumeKg)),
  }));

  return <div className="space-y-8">
    <div><p className="text-sm font-medium text-primary">Every set becomes a signal</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Analytics & progress</h1><p className="mt-2 text-sm text-muted-foreground">Review workout consistency, volume, exercise performance, and body measurements in one place.</p></div>
    <Tabs defaultValue="training" className="space-y-6">
      <TabsList><TabsTrigger value="training"><Dumbbell /> Training</TabsTrigger><TabsTrigger value="body"><Scale /> Body measurements</TabsTrigger></TabsList>
      <TabsContent value="training" className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={CalendarDays} label="Workouts" value={analytics.sessions.length.toLocaleString()} hint="Last 60 completed" />
          <Metric icon={Layers3} label="Working sets" value={totalSets.toLocaleString()} hint={`${totalReps.toLocaleString()} total reps`} />
          <Metric icon={Gauge} label="Training volume" value={`${Math.round(totalVolume).toLocaleString()} kg`} hint="Load × completed reps" />
          <Metric icon={Dumbbell} label="Top movement" value={analytics.exerciseTotals[0]?.name ?? "—"} hint={analytics.exerciseTotals[0] ? `${analytics.exerciseTotals[0].totalSets} logged sets` : "Log your first workout"} compact />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <Card className="border-white/8"><CardHeader><CardTitle>Volume by workout</CardTitle><CardDescription>Your latest 12 completed sessions. Bodyweight movements contribute reps but zero load volume.</CardDescription></CardHeader><CardContent><TrainingVolumeChart data={chartData} /></CardContent></Card>
          <Card className="border-white/8"><CardHeader><CardTitle>Exercise leaders</CardTitle><CardDescription>Highest accumulated load volume across your last 60 sessions.</CardDescription></CardHeader><CardContent>{analytics.exerciseTotals.length ? <div className="space-y-4">{analytics.exerciseTotals.slice(0, 6).map((exercise, index) => <div key={exercise.exerciseId} className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{exercise.name}</p><p className="text-xs text-muted-foreground">{exercise.sessions} sessions · {exercise.totalSets} sets · {exercise.totalReps} reps</p></div><div className="text-right"><p className="text-sm font-medium tabular-nums">{Math.round(Number(exercise.volumeKg)).toLocaleString()} kg</p><p className="text-xs text-muted-foreground">max {Number(exercise.maxWeightKg).toLocaleString()} kg</p></div></div>)}</div> : <EmptyTraining />}</CardContent></Card>
        </div>
        <Card className="border-white/8"><CardHeader><CardTitle>Recent workout details</CardTitle><CardDescription>Actual date, weekday, plan day, exercises, reps, load and session effort.</CardDescription></CardHeader><CardContent>{analytics.sessions.length ? <div className="divide-y">{analytics.sessions.slice(0, 8).map((session) => {
          const date = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone }).format(session.startedAt);
          const sessionExercises = recentBySession.get(session.id) ?? [];
          return <div key={session.id} className="py-5 first:pt-0 last:pb-0"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{session.title}</p><Badge variant="outline">Plan day {session.planDay}</Badge>{session.dayLabel && <Badge variant="secondary">{session.dayLabel}</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{date} · {session.durationMinutes} min{session.effort ? ` · effort ${session.effort}/10` : ""}</p></div><div className="text-sm tabular-nums sm:text-right"><p>{session.totalSets} sets · {session.totalReps} reps</p><p className="text-xs text-muted-foreground">{Math.round(Number(session.volumeKg)).toLocaleString()} kg volume</p></div></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{sessionExercises.map((exercise) => <div key={exercise.planExerciseId} className="flex items-center justify-between rounded-lg bg-muted/35 px-3 py-2 text-xs"><span className="flex min-w-0 items-center gap-2"><span className="truncate font-medium">{exercise.name}</span>{exercise.label && <Badge variant="secondary" className="shrink-0">{exercise.label}</Badge>}</span><span className="ml-3 shrink-0 text-muted-foreground">{exercise.sets} sets · {exercise.reps} reps · max {Number(exercise.maxWeightKg).toLocaleString()} kg</span></div>)}</div></div>;
        })}</div> : <EmptyTraining />}</CardContent></Card>
      </TabsContent>
      <TabsContent value="body" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><Card className="border-white/8"><CardHeader><div className="flex items-start justify-between"><div><CardTitle>Body-weight trend</CardTitle><CardDescription>Up to 52 recent entries</CardDescription></div>{latest && <Badge variant="secondary">{weightChange >= 0 ? "+" : ""}{weightChange.toFixed(1)} kg total</Badge>}</div></CardHeader><CardContent><WeightChart data={entries.map((entry) => ({ measuredOn: entry.measuredOn, weightKg: entry.weightKg }))} /></CardContent></Card><Card className="border-white/8"><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-5 text-primary" /> Add measurement</CardTitle><CardDescription>Once weekly, under similar conditions, is enough.</CardDescription></CardHeader><CardContent><MeasurementForm /></CardContent></Card></div>
        <Card className="border-white/8"><CardHeader><CardTitle className="text-base">Measurement history</CardTitle></CardHeader><CardContent>{entries.length ? <div className="divide-y">{[...entries].reverse().map((entry) => <div key={entry.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-5 py-3 text-sm"><span className="text-muted-foreground">{new Date(`${entry.measuredOn}T00:00:00`).toLocaleDateString()}</span><span className="font-medium">{entry.weightKg} kg</span><span className="w-20 text-right text-muted-foreground">{entry.waistCm ? `${entry.waistCm} cm` : "—"}</span></div>)}</div> : <div className="py-10 text-center"><TrendingUp className="mx-auto size-6 text-primary" /><p className="mt-3 text-sm text-muted-foreground">No measurements yet.</p></div>}</CardContent></Card>
      </TabsContent>
    </Tabs>
  </div>;
}

function Metric({ icon: Icon, label, value, hint, compact = false }: { icon: typeof Dumbbell; label: string; value: string; hint: string; compact?: boolean }) {
  return <Card className="border-white/8"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className={`mt-3 font-semibold ${compact ? "truncate text-lg" : "text-2xl tabular-nums"}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></CardContent></Card>;
}

function EmptyTraining() {
  return <div className="py-10 text-center"><TrendingUp className="mx-auto size-6 text-primary" /><p className="mt-3 text-sm text-muted-foreground">Complete a workout and save its sets to see analytics.</p></div>;
}
