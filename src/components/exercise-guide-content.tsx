import { ArrowLeft, CircleCheck, Dumbbell, ExternalLink, Lightbulb, NotebookPen, PlayCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

import type { ExerciseGuide } from "@/db/schema";
import { ExerciseDetailsDialog } from "@/components/exercise-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSafeEmbedUrl } from "@/lib/video";

type GuideExercise = {
  slug: string;
  name: string;
  movementPattern: string;
  primaryMuscles: string[];
  equipment: string;
  instructions: string[];
  cues: string[];
  guide: ExerciseGuide | null;
  videoUrl: string | null;
};

type PlanExerciseNotes = {
  id: string;
  label: string | null;
  userNotes: string | null;
  videoUrlOverride: string | null;
  programmingNotes: string | null;
};

export function ExerciseGuideContent({ exercise, planExercise, backHref, backLabel }: {
  exercise: GuideExercise;
  planExercise?: PlanExerciseNotes | null;
  backHref: string;
  backLabel: string;
}) {
  const videoUrl = planExercise?.videoUrlOverride ?? exercise.videoUrl;
  const embedUrl = getSafeEmbedUrl(videoUrl);
  const guide = exercise.guide;
  const editor = planExercise ? <ExerciseDetailsDialog id={planExercise.id} slug={exercise.slug} name={exercise.name} userNotes={planExercise.userNotes} videoUrl={planExercise.videoUrlOverride} label={planExercise.label} /> : null;

  return <div className="mx-auto max-w-5xl">
    <Button variant="ghost" className="mb-6" asChild><Link href={backHref}><ArrowLeft /> {backLabel}</Link></Button>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2"><Badge>{exercise.movementPattern}</Badge>{planExercise?.label && <Badge variant="outline">{planExercise.label}</Badge>}{exercise.primaryMuscles.map((muscle) => <Badge variant="secondary" key={muscle}>{muscle}</Badge>)}</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">{exercise.name}</h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Dumbbell className="size-4" /> {exercise.equipment}</p>
        {guide && <p className="mt-5 text-sm leading-7 text-muted-foreground">{guide.overview}</p>}
        <Card className="mt-8 overflow-hidden border-border">
          <div className="aspect-video border-b bg-black/35">
            {embedUrl ? <iframe src={embedUrl} title={`${exercise.name} form demonstration`} className="size-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="grid size-full place-items-center p-8 text-center"><div><PlayCircle className="mx-auto size-12 text-primary" /><p className="mt-4 font-medium">Form video space</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">A form demonstration has not been added yet. Add one from your notes panel when this exercise belongs to your plan.</p></div></div>}
          </div>
          <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>How to perform it</CardTitle>{embedUrl && videoUrl && <Button variant="ghost" size="sm" asChild><a href={videoUrl} target="_blank" rel="noreferrer">Original video <ExternalLink /></a></Button>}</div></CardHeader>
          <CardContent><ol className="space-y-5">{exercise.instructions.map((instruction, index) => <li key={instruction} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">{index + 1}</span><p className="pt-1 text-sm leading-6">{instruction}</p></li>)}</ol></CardContent>
        </Card>
        {guide && <Card className="mt-6 border-border"><CardHeader><CardTitle>Detailed technique notes</CardTitle><CardDescription>Learn the setup, understand the brace, and troubleshoot before adding more weight.</CardDescription></CardHeader><CardContent><Tabs defaultValue="setup" className="space-y-4"><TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4"><TabsTrigger value="setup" className="h-9">Setup</TabsTrigger><TabsTrigger value="breathing" className="h-9">Breathing</TabsTrigger><TabsTrigger value="mistakes" className="h-9">Common mistakes</TabsTrigger><TabsTrigger value="progression" className="h-9">Progression</TabsTrigger></TabsList><TabsContent value="setup"><NotesList notes={guide.setup} /></TabsContent><TabsContent value="breathing"><NotesList notes={guide.breathing} /></TabsContent><TabsContent value="mistakes" className="space-y-4">{guide.commonMistakes.map(({ issue, correction }) => <div key={issue} className="rounded-lg bg-muted/30 p-4"><h3 className="text-sm font-medium">{issue}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{correction}</p></div>)}</TabsContent><TabsContent value="progression"><NotesList notes={guide.progression} /></TabsContent></Tabs></CardContent></Card>}
      </div>
      <aside className="space-y-4">
        <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="size-4 text-primary" /> Technique cues</CardTitle></CardHeader><CardContent><NotesList notes={exercise.cues} compact /></CardContent></Card>
        {guide && <Card className="border-border"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><PlayCircle className="size-4 text-primary" /> What to watch for</CardTitle><CardDescription>Use these checkpoints while viewing the demonstration.</CardDescription></CardHeader><CardContent><NotesList notes={guide.videoFocus} /></CardContent></Card>}
        {planExercise && <Card className="border-border"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><NotebookPen className="size-4 text-primary" /> Your notes</CardTitle>{editor}</div></CardHeader><CardContent>{planExercise.label && <Badge variant="secondary" className="mb-3">{planExercise.label}</Badge>}<p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{planExercise.userNotes || "No personal notes yet. Add setup details or a reminder for next time."}</p>{planExercise.programmingNotes && <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Plan cue: {planExercise.programmingNotes}</p>}</CardContent></Card>}
        <Card className="border-border"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="size-4 text-primary" /> Train safely</CardTitle></CardHeader><CardContent>{guide ? <NotesList notes={guide.safety} /> : <p className="text-xs leading-5 text-muted-foreground">Muscle effort is expected; sharp, electrical, or worsening joint pain is not. Stop and choose a comfortable alternative.</p>}<p className="mt-4 text-xs leading-5 text-muted-foreground">General education, not a substitute for individual coaching or medical advice.</p></CardContent></Card>
      </aside>
    </div>
  </div>;
}

function NotesList({ notes, compact = false }: { notes: string[]; compact?: boolean }) {
  return <ul className="space-y-3">{notes.map((note) => <li key={note} className="flex gap-2"><CircleCheck className="mt-1 size-4 shrink-0 text-primary" /><p className={`text-sm ${compact ? "leading-5" : "leading-6 text-muted-foreground"}`}>{note}</p></li>)}</ul>;
}
