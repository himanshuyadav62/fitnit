"use client";

import { useActionState, useEffect, useState } from "react";
import { FilePenLine, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { updatePlanDetails, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState: ActionState = {};

export function PlanDetailsDialog({ id, name, goal, durationWeeks }: {
  id: string;
  name: string;
  goal: "build_muscle" | "lose_fat" | "get_stronger" | "general_fitness";
  durationWeeks: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updatePlanDetails, initialState);

  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.successId]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button type="button" variant="outline"><FilePenLine /> Edit plan</Button></DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <form action={action} className="space-y-5">
        <input type="hidden" name="planId" value={id} />
        <DialogHeader><DialogTitle>Edit plan details</DialogTitle><DialogDescription>Give this plan a clear name and target so it stays distinct from your other routines.</DialogDescription></DialogHeader>
        <div className="space-y-2"><Label htmlFor={`plan-name-${id}`}>Plan name</Label><Input id={`plan-name-${id}`} name="name" defaultValue={name} maxLength={80} required /></div>
        <div className="space-y-2"><Label htmlFor={`plan-goal-${id}`}>Target</Label><Select name="goal" defaultValue={goal} required><SelectTrigger id={`plan-goal-${id}`} className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="build_muscle">Build muscle</SelectItem><SelectItem value="lose_fat">Lose fat</SelectItem><SelectItem value="get_stronger">Get stronger</SelectItem><SelectItem value="general_fitness">General fitness</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor={`plan-duration-${id}`}>Duration (weeks)</Label><Input id={`plan-duration-${id}`} name="durationWeeks" type="number" min={1} max={52} defaultValue={durationWeeks} required /></div>
        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "Saving…" : "Save plan"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
