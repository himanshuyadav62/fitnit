"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CirclePlus, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { addCustomExerciseToWorkout, addExerciseToWorkout, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type LibraryExercise = { id: string; name: string; equipment: string; movementPattern: string; isCustom: boolean };
const initialState: ActionState = {};

export function AddExerciseDialog({ workoutId, exercises }: { workoutId: string; exercises: LibraryExercise[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addExerciseToWorkout, initialState);
  const [customState, customAction, customPending] = useActionState(addCustomExerciseToWorkout, initialState);
  const libraryFormRef = useRef<HTMLFormElement>(null);
  const customFormRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const success = state.success ?? customState.success;
    if (!success) return;
    toast.success(success);
    const timer = window.setTimeout(() => {
      setOpen(false);
      libraryFormRef.current?.reset();
      customFormRef.current?.reset();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId, customState.success, customState.successId]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><CirclePlus /> Add exercise</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Add an exercise</DialogTitle><DialogDescription>Use the shared movement library or create a private exercise when yours is not listed.</DialogDescription></DialogHeader>
      <Tabs defaultValue="library">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="library">Exercise library</TabsTrigger><TabsTrigger value="custom"><Sparkles /> Create custom</TabsTrigger></TabsList>
        <TabsContent value="library" className="mt-5">
          <form ref={libraryFormRef} action={action} className="space-y-5">
            <input type="hidden" name="workoutId" value={workoutId} />
            <div className="space-y-2"><Label htmlFor={`exercise-${workoutId}`}>Exercise</Label><Select name="exerciseId" required><SelectTrigger id={`exercise-${workoutId}`}><SelectValue placeholder="Choose from your movement library" /></SelectTrigger><SelectContent>{exercises.map((exercise) => <SelectItem key={exercise.id} value={exercise.id}>{exercise.name} · {exercise.equipment}{exercise.isCustom ? " · Yours" : ""}</SelectItem>)}</SelectContent></Select></div>
            <PrescriptionFields workoutId={workoutId} prefix="library" />
            <div className="space-y-2"><Label htmlFor={`notes-${workoutId}`}>Your notes</Label><Textarea id={`notes-${workoutId}`} name="userNotes" maxLength={1000} placeholder="Setup, machine seat, pain-free variation, coaching reminder…" /></div>
            <div className="space-y-2"><Label htmlFor={`video-${workoutId}`}>Override form video (optional)</Label><Input id={`video-${workoutId}`} name="videoUrlOverride" type="url" placeholder="YouTube or Vimeo URL" /><p className="text-xs text-muted-foreground">Leave blank to use the library demonstration.</p></div>
            {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Adding…" : "Add to workout"}</Button></DialogFooter>
          </form>
        </TabsContent>
        <TabsContent value="custom" className="mt-5">
          <form ref={customFormRef} action={customAction} className="space-y-5">
            <input type="hidden" name="workoutId" value={workoutId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor={`custom-name-${workoutId}`}>Exercise name</Label><Input id={`custom-name-${workoutId}`} name="name" maxLength={80} placeholder="Landmine press" required /></div>
              <div className="space-y-2"><Label htmlFor={`custom-pattern-${workoutId}`}>Movement pattern</Label><Input id={`custom-pattern-${workoutId}`} name="movementPattern" maxLength={60} placeholder="Vertical push" required /></div>
              <div className="space-y-2"><Label htmlFor={`custom-muscles-${workoutId}`}>Primary muscles</Label><Input id={`custom-muscles-${workoutId}`} name="primaryMuscles" maxLength={200} placeholder="Shoulders, triceps" required /><p className="text-xs text-muted-foreground">Separate muscles with commas.</p></div>
              <div className="space-y-2"><Label htmlFor={`custom-equipment-${workoutId}`}>Equipment</Label><Input id={`custom-equipment-${workoutId}`} name="equipment" maxLength={100} placeholder="Barbell and landmine attachment" required /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor={`custom-instructions-${workoutId}`}>Instructions</Label><Textarea id={`custom-instructions-${workoutId}`} name="instructions" maxLength={1500} rows={4} placeholder={"Set the bar securely.\nBrace before pressing.\nLower with control."} required /><p className="text-xs text-muted-foreground">Put each step on a new line.</p></div>
              <div className="space-y-2"><Label htmlFor={`custom-cues-${workoutId}`}>Technique cues</Label><Textarea id={`custom-cues-${workoutId}`} name="cues" maxLength={1000} rows={4} placeholder={"Ribs stacked\nSmooth tempo\nStay pain-free"} required /><p className="text-xs text-muted-foreground">Put each cue on a new line.</p></div>
            </div>
            <PrescriptionFields workoutId={workoutId} prefix="custom" />
            <div className="space-y-2"><Label htmlFor={`custom-notes-${workoutId}`}>Your notes (optional)</Label><Textarea id={`custom-notes-${workoutId}`} name="userNotes" maxLength={1000} placeholder="Setup or progression reminders…" /></div>
            <div className="space-y-2"><Label htmlFor={`custom-video-${workoutId}`}>Form video (optional)</Label><Input id={`custom-video-${workoutId}`} name="videoUrl" type="url" maxLength={500} placeholder="https://youtube.com/shorts/…" /><p className="text-xs text-muted-foreground">YouTube and Vimeo links are embedded with a privacy-enhanced player.</p></div>
            {customState.error && <Alert variant="destructive"><AlertDescription>{customState.error}</AlertDescription></Alert>}
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={customPending}>{customPending && <LoaderCircle className="animate-spin" />}{customPending ? "Creating…" : "Create & add"}</Button></DialogFooter>
          </form>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>;
}

function PrescriptionFields({ workoutId, prefix }: { workoutId: string; prefix: string }) {
  return <div className="space-y-4">
    <div className="space-y-2"><Label htmlFor={`${prefix}-label-${workoutId}`}>Workout label (optional)</Label><Input id={`${prefix}-label-${workoutId}`} name="label" maxLength={32} placeholder="Heavy, priority, optional, warm-up…" /></div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <Field id={`${prefix}-sets-${workoutId}`} label="Sets"><Input id={`${prefix}-sets-${workoutId}`} name="sets" type="number" min="1" max="10" defaultValue="3" required /></Field>
      <Field id={`${prefix}-min-reps-${workoutId}`} label="Min reps"><Input id={`${prefix}-min-reps-${workoutId}`} name="repMin" type="number" min="1" max="100" defaultValue="8" required /></Field>
      <Field id={`${prefix}-max-reps-${workoutId}`} label="Max reps"><Input id={`${prefix}-max-reps-${workoutId}`} name="repMax" type="number" min="1" max="100" defaultValue="12" required /></Field>
      <Field id={`${prefix}-rest-${workoutId}`} label="Rest (sec)"><Input id={`${prefix}-rest-${workoutId}`} name="restSeconds" type="number" min="15" max="600" step="15" defaultValue="90" required /></Field>
      <Field id={`${prefix}-rir-${workoutId}`} label="RIR"><Input id={`${prefix}-rir-${workoutId}`} name="targetRir" type="number" min="0" max="5" defaultValue="2" required /></Field>
    </div>
  </div>;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
