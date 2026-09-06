"use client";

import { useActionState, useEffect, useState } from "react";
import { FilePenLine, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { updateWorkoutDay, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function WorkoutDayDetailsDialog({ id, title, focus, label }: { id: string; title: string; focus: string; label: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateWorkoutDay, initialState);

  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${title}`}><FilePenLine /></Button></DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <form action={action} className="space-y-5">
        <input type="hidden" name="workoutId" value={id} />
        <DialogHeader><DialogTitle>Edit training day</DialogTitle><DialogDescription>Rename this day, add a short label, or clarify its training focus.</DialogDescription></DialogHeader>
        <div className="space-y-2"><Label htmlFor={`day-title-${id}`}>Day name</Label><Input id={`day-title-${id}`} name="title" defaultValue={title} maxLength={80} required /></div>
        <div className="space-y-2"><Label htmlFor={`day-label-${id}`}>Label (optional)</Label><Input id={`day-label-${id}`} name="label" defaultValue={label ?? ""} maxLength={32} placeholder="Heavy, recovery-friendly, priority…" /></div>
        <div className="space-y-2"><Label htmlFor={`day-focus-${id}`}>Focus</Label><Textarea id={`day-focus-${id}`} name="focus" defaultValue={focus} maxLength={160} rows={3} required /></div>
        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Saving…" : "Save day"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
