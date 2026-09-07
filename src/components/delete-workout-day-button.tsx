"use client";

import { useActionState, useEffect, useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteWorkoutDay, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function DeleteWorkoutDayButton({ id, title, exerciseCount, disabled }: {
  id: string;
  title: string;
  exerciseCount: number;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteWorkoutDay, initialState);

  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);

  return <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogTrigger asChild>
      <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label={`Delete ${title}`} title={disabled ? "A plan must keep at least one training day" : `Delete ${title}`} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Delete {title}?</AlertDialogTitle><AlertDialogDescription>This removes the day and its {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"} from future training. Remaining days will be renumbered. Completed workout history and analytics stay intact.</AlertDialogDescription></AlertDialogHeader>
      {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
      <AlertDialogFooter><AlertDialogCancel disabled={pending}>Keep day</AlertDialogCancel><form action={action}><input type="hidden" name="workoutId" value={id} /><Button type="submit" variant="destructive" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Deleting…" : "Delete day"}</Button></form></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
