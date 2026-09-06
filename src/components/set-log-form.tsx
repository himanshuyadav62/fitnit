"use client";

import { useOptimistic, useTransition } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { logSet } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SetLogFormProps = {
  sessionId: string;
  planExerciseId: string;
  setNumber: number;
  defaultReps: number;
  defaultWeightKg: string;
  defaultRir: number;
  saved: boolean;
  disabled: boolean;
};

export function SetLogForm({
  sessionId,
  planExerciseId,
  setNumber,
  defaultReps,
  defaultWeightKg,
  defaultRir,
  saved,
  disabled,
}: SetLogFormProps) {
  const [pending, startTransition] = useTransition();
  const [optimisticSaved, markSaved] = useOptimistic(saved, () => true);

  function submit(formData: FormData) {
    startTransition(async () => {
      markSaved(true);
      try {
        await logSet(formData);
        toast.success(`Set ${setNumber} saved`);
      } catch {
        toast.error(`Set ${setNumber} could not be saved`);
      }
    });
  }

  return (
    <form
      action={submit}
      className={cn(
        "grid grid-cols-[42px_1fr_1fr_86px_auto] items-end gap-2 rounded-lg border bg-muted/15 p-3 transition-colors",
        pending && "border-primary/35 bg-primary/5",
      )}
    >
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="planExerciseId" value={planExerciseId} />
      <input type="hidden" name="setNumber" value={setNumber} />
      <div className="pb-2 text-center text-sm font-semibold">
        {optimisticSaved ? <CheckCircle2 className="mx-auto size-4 text-primary" /> : setNumber}
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">KG</Label>
        <Input name="weightKg" type="number" min="0" max="1000" step="0.25" defaultValue={defaultWeightKg} disabled={disabled || pending} required />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">REPS</Label>
        <Input name="reps" type="number" min="0" max="100" defaultValue={defaultReps} disabled={disabled || pending} required />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">RIR</Label>
        <Select name="rir" defaultValue={String(defaultRir)} disabled={disabled || pending}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{[0, 1, 2, 3, 4, 5].map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        size="icon"
        variant={optimisticSaved ? "secondary" : "default"}
        disabled={disabled || pending}
        aria-label={pending ? `Saving set ${setNumber}` : `Save set ${setNumber}`}
        aria-busy={pending}
      >
        {pending ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}
      </Button>
    </form>
  );
}
