import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Dumbbell, Sparkles } from "lucide-react";

import { activateTemplate } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivePlan, getPlanTemplates } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Plan library" };
const goalLabels = { build_muscle: "Muscle", lose_fat: "Fat loss", get_stronger: "Strength", general_fitness: "All-round" };

export default async function PlansPage() {
  const user = await requireUser();
  const [templates, activePlan] = await Promise.all([getPlanTemplates(), getActivePlan(user.id)]);
  return <div className="space-y-8">
    <div className="max-w-3xl"><p className="flex items-center gap-2 text-sm font-medium text-primary"><Sparkles className="size-4" /> Evidence-informed templates</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Find a plan that fits your real week</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Choose by schedule, goal, and experience. Any template becomes your private plan, where you can add exercises, notes, and form videos.</p></div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => {
      const active = activePlan?.sourceTemplateId === template.id;
      return <Card key={template.id} className={active ? "border-primary/40 bg-primary/5" : "border-white/8"}>
        <CardHeader><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2"><Badge>{template.daysPerWeek} days</Badge><Badge variant="secondary">{template.experience}</Badge>{template.dietFit === "vegan" && <Badge variant="outline">Vegan focus</Badge>}</div>{active && <CheckCircle2 className="size-5 text-primary" />}</div><CardTitle className="mt-3">{template.title}</CardTitle><CardDescription className="leading-6">{template.description}</CardDescription></CardHeader>
        <CardContent><div className="mb-5 flex items-center justify-between rounded-lg bg-muted/35 px-3 py-2 text-sm"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{template.durationWeeks} weeks</span><span>{goalLabels[template.goal]}</span></div><div className="flex gap-2"><Button className="flex-1" variant="outline" asChild><Link href={`/app/plans/${template.slug}`}>View schedule <ArrowRight /></Link></Button>{active ? <Button className="flex-1" disabled><CheckCircle2 /> Active</Button> : <form action={activateTemplate} className="flex-1"><input type="hidden" name="templateSlug" value={template.slug} /><SubmitButton className="w-full" pendingLabel="Activating…"><Dumbbell /> Use plan</SubmitButton></form>}</div></CardContent>
      </Card>;
    })}</div>
    <Card className="border-amber-400/20 bg-amber-400/5"><CardContent className="p-5 text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">Recovery guardrail:</span> five- and six-day plans are not automatically better. Start them only when your training experience, sleep, and schedule support them; otherwise the two-to-four-day plans can produce excellent results.</CardContent></Card>
  </div>;
}
