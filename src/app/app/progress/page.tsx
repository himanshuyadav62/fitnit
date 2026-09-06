import type { Metadata } from "next";
import { Scale, TrendingUp } from "lucide-react";

import { MeasurementForm } from "@/components/measurement-form";
import { WeightChart } from "@/components/weight-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProgress } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Progress" };
export default async function ProgressPage() {
  const user = await requireUser();
  const entries = await getProgress(user.id);
  const first = entries[0];
  const latest = entries.at(-1);
  const change = first && latest ? Number(latest.weightKg) - Number(first.weightKg) : 0;
  return <div className="space-y-8"><div><p className="text-sm font-medium text-primary">Signals, not judgment</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Progress</h1><p className="mt-2 text-sm text-muted-foreground">Use comparable weekly measurements and look at the trend—not a single day.</p></div><div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><Card className="border-white/8"><CardHeader><div className="flex items-start justify-between"><div><CardTitle>Body-weight trend</CardTitle><CardDescription>Up to 52 recent entries</CardDescription></div>{latest && <Badge variant="secondary">{change >= 0 ? '+' : ''}{change.toFixed(1)} kg total</Badge>}</div></CardHeader><CardContent><WeightChart data={entries.map((entry) => ({ measuredOn: entry.measuredOn, weightKg: entry.weightKg }))} /></CardContent></Card><Card className="border-white/8"><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-5 text-primary" /> Add measurement</CardTitle><CardDescription>Once weekly, under similar conditions, is enough.</CardDescription></CardHeader><CardContent><MeasurementForm /></CardContent></Card></div><Card className="border-white/8"><CardHeader><CardTitle className="text-base">Measurement history</CardTitle></CardHeader><CardContent>{entries.length ? <div className="divide-y">{[...entries].reverse().map((entry) => <div key={entry.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-5 py-3 text-sm"><span className="text-muted-foreground">{new Date(`${entry.measuredOn}T00:00:00`).toLocaleDateString()}</span><span className="font-medium">{entry.weightKg} kg</span><span className="w-20 text-right text-muted-foreground">{entry.waistCm ? `${entry.waistCm} cm` : '—'}</span></div>)}</div> : <div className="py-10 text-center"><TrendingUp className="mx-auto size-6 text-primary" /><p className="mt-3 text-sm text-muted-foreground">No measurements yet.</p></div>}</CardContent></Card></div>;
}
