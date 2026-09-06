"use client";

import { Trash2 } from "lucide-react";

import { removeExercise } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function RemoveExerciseButton({ id, name }: { id: string; name: string }) {
  return <AlertDialog>
    <AlertDialogTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${name}`} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Remove {name}?</AlertDialogTitle><AlertDialogDescription>This removes it from future workouts. Completed workout records and analytics remain intact.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Keep exercise</AlertDialogCancel><form action={removeExercise}><input type="hidden" name="planExerciseId" value={id} /><SubmitButton variant="destructive" pendingLabel="Removing…">Remove</SubmitButton></form></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
