import Link from "next/link";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/session";

export async function PublicHeader() {
  const session = await getCurrentSession();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" href="/plans/starter">Starter plan</Link>
          <Link className="transition-colors hover:text-foreground" href="/#how-it-works">How it works</Link>
          <Link className="transition-colors hover:text-foreground" href="/#principles">Principles</Link>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild><Link href="/app">Open dashboard</Link></Button>
          ) : (
            <>
              <Button variant="ghost" asChild><Link href="/sign-in">Sign in</Link></Button>
              <Button asChild><Link href="/sign-up">Build my plan</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
