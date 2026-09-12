"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PlanError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Plan page failed to render", error);
  }, [error]);

  return (
    <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Your plan could not load</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The training database is temporarily busy. Wait a moment and retry—your plan and workout history are safe.
        </p>
        <Button className="mt-6" onClick={reset}>
          <RefreshCw /> Retry
        </Button>
      </div>
    </div>
  );
}
