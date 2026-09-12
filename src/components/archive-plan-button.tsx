"use client";

import { useActionState, useEffect, useState } from "react";
import { Archive, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { archivePlan, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function ArchivePlanButton({ id, name, isCurrent }: { id: string; name: string; isCurrent: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(archivePlan, initialState);

  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);

  return <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogTrigger asChild>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Archive ${name}`} title={`Archive ${name}`} className="shrink-0 text-muted-foreground hover:text-foreground"><Archive /></Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Archive {name}?</AlertDialogTitle>
        <AlertDialogDescription>
          This removes the plan from active training without deleting it. Exercises, notes, completed workouts, set logs, and analytics remain available.{isCurrent ? " Your next most recently used active plan will become current." : ""}
        </AlertDialogDescription>
      </AlertDialogHeader>
      {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>Keep active</AlertDialogCancel>
        <form action={action}>
          <input type="hidden" name="planId" value={id} />
          <Button type="submit" variant="destructive" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Archiving…" : "Archive plan"}</Button>
        </form>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
