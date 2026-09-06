import Link from "next/link";
import { Activity } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_30px_-8px_var(--primary)]">
        <Activity className="size-4" strokeWidth={2.5} />
      </span>
      {!compact && <span className="text-lg">forme</span>}
    </Link>
  );
}
