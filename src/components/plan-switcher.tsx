"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { selectPlan } from "@/app/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PlanOption = {
  id: string;
  name: string;
  goal: "build_muscle" | "lose_fat" | "get_stronger" | "general_fitness";
};

const goalLabels = {
  build_muscle: "Muscle",
  lose_fat: "Fat loss",
  get_stronger: "Strength",
  general_fitness: "Fitness",
};

export function PlanSwitcher({ plans, currentPlanId }: { plans: PlanOption[]; currentPlanId: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentPlanId);
  const [pending, startTransition] = useTransition();

  function handleChange(planId: string) {
    if (planId === selectedId) return;
    const previousId = selectedId;
    setSelectedId(planId);
    startTransition(async () => {
      const result = await selectPlan(planId);
      if (result.error) {
        setSelectedId(previousId);
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Plan switched.");
      router.refresh();
    });
  }

  return <div className="flex items-center gap-2">
    {pending && <LoaderCircle className="size-4 animate-spin text-primary" aria-label="Switching plan" />}
    <Select value={selectedId} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-10 w-full min-w-52 sm:w-72" aria-label="Current workout plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {plans.map((plan) => <SelectItem key={plan.id} value={plan.id}>
          <span className="max-w-44 truncate">{plan.name}</span>
          <span className="text-xs text-muted-foreground">{goalLabels[plan.goal]}</span>
        </SelectItem>)}
      </SelectContent>
    </Select>
  </div>;
}
