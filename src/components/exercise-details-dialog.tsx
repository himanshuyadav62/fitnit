"use client";

import { useActionState, useEffect, useState } from "react";
import { FilePenLine, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { updateExerciseDetails, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function ExerciseDetailsDialog({ id, slug, name, userNotes, videoUrl, label }: { id: string; slug: string; name: string; userNotes: string | null; videoUrl: string | null; label: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateExerciseDetails, initialState);
  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit details for ${name}`}><FilePenLine /></Button></DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <form action={action} className="space-y-5">
        <input type="hidden" name="planExerciseId" value={id} /><input type="hidden" name="slug" value={slug} />
        <DialogHeader><DialogTitle>{name}</DialogTitle><DialogDescription>Keep private reminders and attach the form video that works best for you.</DialogDescription></DialogHeader>
        <div className="space-y-2"><Label htmlFor={`personal-label-${id}`}>Label (optional)</Label><Input id={`personal-label-${id}`} name="label" defaultValue={label ?? ""} maxLength={32} placeholder="Heavy, priority, optional…" /></div>
        <div className="space-y-2"><Label htmlFor={`personal-notes-${id}`}>Personal notes</Label><Textarea id={`personal-notes-${id}`} name="userNotes" defaultValue={userNotes ?? ""} maxLength={1000} placeholder="Seat position, grip, tempo, next-session reminder…" rows={5} /></div>
        <div className="space-y-2"><Label htmlFor={`personal-video-${id}`}>YouTube or Vimeo video</Label><Input id={`personal-video-${id}`} name="videoUrlOverride" type="url" defaultValue={videoUrl ?? ""} placeholder="https://youtu.be/…" /></div>
        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Saving…" : "Save details"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
