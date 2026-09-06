import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CheckCircle2, Dumbbell, Leaf, ShieldCheck, Sparkles } from "lucide-react";

import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Dumbbell, title: "A plan that fits", copy: "Training days, experience, equipment, and constraints shape a plan you can actually follow." },
  { icon: BarChart3, title: "Progress you can see", copy: "Log sets, workouts, body weight, and recovery signals without spreadsheet friction." },
  { icon: Bot, title: "Guidance in context", copy: "Ask the coach about progression, technique, recovery, or practical vegan protein choices." },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <PublicHeader />
      <main>
        <section className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div className="relative z-10">
            <Badge variant="outline" className="mb-7 border-primary/30 bg-primary/10 text-primary"><Sparkles className="size-3" /> Fitness, made actionable</Badge>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Build strength with a plan that <span className="text-primary">learns from you.</span>
            </h1>
            <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-muted-foreground">Forme turns your goals, schedule, equipment, and recovery into clear workouts—then helps you track the small wins that compound.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 px-6" asChild><Link href="/sign-up">Create my plan <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" className="h-12 px-6" asChild><Link href="/plans/starter">Preview the starter plan</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {['Adults 18+', 'Private by default', 'Vegan-friendly'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />{item}</span>)}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-20 -z-10 rounded-full bg-primary/10 blur-3xl" />
            <Card className="hairline overflow-hidden border-white/10 bg-card/75 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b p-5"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Today · Foundation A</p><h2 className="mt-1 text-xl font-semibold">Full body strength</h2></div><div className="grid size-11 place-items-center rounded-full border-4 border-primary/25 text-xs font-semibold">68%</div></div>
                <div className="space-y-3 p-5">
                  {[['Goblet squat','3 × 8–12','Done'],['Dumbbell bench press','3 × 8–12','Done'],['Lat pulldown','3 × 8–12','Next'],['Romanian deadlift','3 × 8–12',''],['Front plank','3 × 20–40s','']].map(([name, sets, status], i) => <div key={name} className={`flex items-center gap-4 rounded-xl border p-4 ${status === 'Next' ? 'border-primary/40 bg-primary/5' : 'bg-background/35'}`}><span className={`grid size-8 place-items-center rounded-lg text-xs font-semibold ${i < 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i < 2 ? <CheckCircle2 className="size-4" /> : i + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-medium">{name}</p><p className="text-xs text-muted-foreground">{sets}</p></div>{status && <Badge variant={status === 'Next' ? 'default' : 'secondary'}>{status}</Badge>}</div>)}
                </div>
                <div className="grid grid-cols-3 border-t bg-muted/20 p-5 text-center"><div><p className="text-2xl font-semibold">3</p><p className="text-xs text-muted-foreground">days / week</p></div><div className="border-x"><p className="text-2xl font-semibold">90g</p><p className="text-xs text-muted-foreground">protein target</p></div><div><p className="text-2xl font-semibold">8</p><p className="text-xs text-muted-foreground">week block</p></div></div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-white/5 bg-black/10">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">One feedback loop</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Plan. Train. Learn. Repeat.</h2><p className="mt-4 text-muted-foreground">Fitness improves when the next useful action is obvious.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{features.map(({ icon: Icon, title, copy }, index) => <Card key={title} className="border-white/8 bg-card/55"><CardContent className="p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary"><Icon className="size-5" /></span><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span></div><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></CardContent></Card>)}</div></div>
        </section>

        <section id="principles" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="grid gap-12 lg:grid-cols-2"><div><Badge variant="outline"><Leaf className="size-3 text-primary" /> Built for every diet</Badge><h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight">Vegan-friendly guidance without fitness folklore.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">Your starter plan includes practical protein targets and whole-food options, while still supporting vegetarian, omnivore, and other preferences.</p></div><div className="grid gap-4">{[[ShieldCheck,'Safety before automation','Readiness flags pause automatic programming and point you toward appropriate professional care.'],[Sparkles,'Progressive, not punishing','Start with reps in reserve, earn load increases, and adjust from logged performance.'],[Leaf,'Nutrition as a starting estimate','Targets are transparent estimates that change with real weight trends and energy.']].map(([Icon,title,copy]) => { const C = Icon as typeof ShieldCheck; return <div key={String(title)} className="flex gap-4 rounded-2xl border border-white/8 bg-card/40 p-5"><C className="mt-1 size-5 shrink-0 text-primary" /><div><h3 className="font-medium">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{String(copy)}</p></div></div>; })}</div></div></section>

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/8 px-6 py-16 text-center sm:px-12"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--primary),transparent_60%)] opacity-10" /><h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Your next level starts with your next session.</h2><p className="mx-auto mt-4 max-w-xl text-muted-foreground">Answer a focused five-part assessment. Get a private plan and begin tracking today.</p><Button size="lg" className="mt-8" asChild><Link href="/sign-up">Build my plan <ArrowRight /></Link></Button></div></section>
      </main>
      <footer className="border-t border-white/5"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© {new Date().getFullYear()} Forme. Educational fitness guidance.</p><p>Not medical advice · Private plans by default</p></div></footer>
    </div>
  );
}
