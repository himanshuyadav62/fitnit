"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground"
      disabled={pending}
      aria-busy={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace("/");
      }}
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <LogOut />}
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
