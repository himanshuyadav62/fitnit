"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CirclePlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { addExerciseToWorkout, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type LibraryExercise = { id: string; name: string; equipment: string; movementPattern: string };
const initialState: ActionState = {};

export function AddExerciseDialog({ workoutId, exercises }: { workoutId: string; exercises: LibraryExercise[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addExerciseToWorkout, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => {
      setOpen(false);
      formRef.current?.reset();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><CirclePlus /> Add exercise</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <form ref={formRef} action={action} className="space-y-5">
        <input type="hidden" name="workoutId" value={workoutId} />
        <DialogHeader><DialogTitle>Add an exercise</DialogTitle><DialogDescription>Choose the movement, then shape its prescription for this workout.</DialogDescription></DialogHeader>
        <div className="space-y-2"><Label htmlFor={`exercise-${workoutId}`}>Exercise</Label><Select name="exerciseId" required><SelectTrigger id={`exercise-${workoutId}`}><SelectValue placeholder="Search the movement library" /></SelectTrigger><SelectContent>{exercises.map((exercise) => <SelectItem key={exercise.id} value={exercise.id}>{exercise.name} · {exercise.equipment}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Field label="Sets"><Input name="sets" type="number" min="1" max="10" defaultValue="3" required /></Field>
          <Field label="Min reps"><Input name="repMin" type="number" min="1" max="100" defaultValue="8" required /></Field>
          <Field label="Max reps"><Input name="repMax" type="number" min="1" max="100" defaultValue="12" required /></Field>
          <Field label="Rest (sec)"><Input name="restSeconds" type="number" min="15" max="600" step="15" defaultValue="90" required /></Field>
          <Field label="RIR"><Input name="targetRir" type="number" min="0" max="5" defaultValue="2" required /></Field>
        </div>
        <div className="space-y-2"><Label htmlFor={`notes-${workoutId}`}>Your notes</Label><Textarea id={`notes-${workoutId}`} name="userNotes" maxLength={1000} placeholder="Setup, machine seat, pain-free variation, coaching reminder…" /></div>
        <div className="space-y-2"><Label htmlFor={`video-${workoutId}`}>Form video (optional)</Label><Input id={`video-${workoutId}`} name="videoUrlOverride" type="url" placeholder="YouTube or Vimeo URL" /><p className="text-xs text-muted-foreground">The app converts supported links to a privacy-enhanced embedded player.</p></div>
        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Adding…" : "Add to workout"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
