"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarPlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { addWorkoutDay, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function AddWorkoutDayDialog({ planId, disabled }: { planId: string; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addWorkoutDay, initialState);
  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button disabled={disabled}><CalendarPlus /> Add training day</Button></DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <form action={action} className="space-y-5">
        <input type="hidden" name="planId" value={planId} />
        <DialogHeader><DialogTitle>Add a training day</DialogTitle><DialogDescription>Create an empty day, then add exercises from the movement library. Keep at least one recovery day when possible.</DialogDescription></DialogHeader>
        <div className="space-y-2"><Label htmlFor="day-title">Day name</Label><Input id="day-title" name="title" placeholder="Optional Arms + Core" maxLength={80} required /></div>
        <div className="space-y-2"><Label htmlFor="day-label">Label (optional)</Label><Input id="day-label" name="label" placeholder="Recovery-friendly, optional, priority…" maxLength={32} /></div>
        <div className="space-y-2"><Label htmlFor="day-focus">Focus</Label><Textarea id="day-focus" name="focus" placeholder="Technique work, smaller muscle groups, and easy conditioning" maxLength={160} required /></div>
        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Adding day…" : "Add day"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
