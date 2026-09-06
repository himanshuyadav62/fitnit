"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = { volume: { label: "Training volume (kg)", color: "var(--chart-2)" } } satisfies ChartConfig;

export function TrainingVolumeChart({ data }: { data: Array<{ date: string; volume: number }> }) {
  if (data.length === 0) return <div className="grid h-64 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Complete a workout to begin your training trend.</div>;
  return <ChartContainer config={config} className="h-64 w-full">
    <BarChart data={data} margin={{ left: 0, right: 12, top: 10 }}>
      <CartesianGrid vertical={false} strokeDasharray="4 4" />
      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
      <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(value) => Number(value).toLocaleString(undefined, { notation: "compact" })} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="volume" fill="var(--color-volume)" radius={[5, 5, 0, 0]} />
    </BarChart>
  </ChartContainer>;
}
