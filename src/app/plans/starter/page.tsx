import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Dumbbell, Leaf, Repeat2 } from "lucide-react";

import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeaturedTemplate } from "@/lib/data";

export const metadata: Metadata = { title: "Vegan muscle-gain starter plan" };

export default async function StarterPlanPage() {
  const plan = await getFeaturedTemplate();
  return <div className="min-h-screen"><PublicHeader /><main className="mx-auto max-w-6xl px-5 py-16 lg:px-8"><div className="max-w-3xl"><div className="flex flex-wrap gap-2"><Badge><Leaf className="size-3" /> Vegan-friendly</Badge><Badge variant="secondary">Beginner</Badge><Badge variant="secondary">8 weeks</Badge></div><h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{plan?.title ?? "Beginner Vegan Muscle Gain — 3 Days"}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{plan?.description ?? "A balanced full-body foundation built for progressive strength and muscle gain."}</p><div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">{[[Dumbbell,'3','sessions / week'],[Clock3,'50–65','minutes'],[Repeat2,'2–3','reps in reserve']].map(([Icon,value,label]) => { const C=Icon as typeof Dumbbell; return <div key={String(label)} className="rounded-xl border bg-card/50 p-4"><C className="size-4 text-primary" /><p className="mt-4 text-xl font-semibold">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p></div>; })}</div></div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">{plan?.workouts.map((workout) => <Card key={workout.id} className="border-white/8"><CardHeader><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Day {workout.dayNumber}</p><CardTitle>{workout.title}</CardTitle><CardDescription>{workout.focus}</CardDescription></CardHeader><CardContent className="space-y-3">{workout.exercises.map((exercise, index) => <Link href={`/exercises/${exercise.slug}`} key={exercise.id} className="flex gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:border-primary/30"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs">{index+1}</span><div><p className="text-sm font-medium">{exercise.name}</p><p className="text-xs text-muted-foreground">{exercise.sets} sets · {exercise.repMin}–{exercise.repMax} reps · {exercise.restSeconds}s rest</p></div></Link>)}</CardContent></Card>)}</div>

      <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><Card className="border-primary/20 bg-primary/5"><CardContent className="p-6"><h2 className="font-semibold">How to progress</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Choose loads that leave 2–3 clean reps in reserve. Add reps inside the range first. When every set reaches the top of the range with stable technique, increase the load by the smallest amount and restart near the lower end.</p></CardContent></Card><Button size="lg" asChild><Link href="/sign-up">Personalize and track it <ArrowRight /></Link></Button></div>

      <Card className="mt-5 border-white/8"><CardHeader><CardTitle>Vegan nutrition starting point</CardTitle><CardDescription>{plan?.nutritionNotes}</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">For the original 25-year-old, 52 kg male profile, a practical first protein target is about 85–105 g/day. Calories depend strongly on height and activity, so Forme asks for both before calculating an estimate. Track a weekly-average body-weight trend and adjust gradually.</p></CardContent></Card>
    </main></div>;
}
