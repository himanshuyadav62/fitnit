"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = { weight: { label: "Weight", color: "var(--chart-1)" } } satisfies ChartConfig;

export function WeightChart({ data }: { data: Array<{ measuredOn: string; weightKg: string }> }) {
  const chartData = data.map((item) => ({ date: item.measuredOn.slice(5), weight: Number(item.weightKg) }));
  if (chartData.length < 2) return <div className="grid h-64 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Add two measurements to see your trend.</div>;
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <LineChart data={chartData} margin={{ left: 0, right: 16, top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-weight)" }} />
      </LineChart>
    </ChartContainer>
  );
}
