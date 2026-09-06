"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { addMeasurement, type ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MeasurementForm() {
  const [state, action, pending] = useActionState(addMeasurement, {} as ActionState);
  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="measuredOn">Date</Label><Input id="measuredOn" name="measuredOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div>
      <div className="space-y-2"><Label htmlFor="weightKg">Weight (kg)</Label><Input id="weightKg" name="weightKg" type="number" min="30" max="300" step="0.1" required /></div>
      <div className="space-y-2"><Label htmlFor="waistCm">Waist (cm, optional)</Label><Input id="waistCm" name="waistCm" type="number" min="30" max="250" step="0.1" /></div>
      <div className="space-y-2"><Label htmlFor="notes">Note (optional)</Label><Input id="notes" name="notes" maxLength={300} placeholder="Same conditions as last time" /></div>
      <Button className="sm:col-span-2" disabled={pending}>{pending ? "Saving…" : "Save measurement"}</Button>
    </form>
  );
}
