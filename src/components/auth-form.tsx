"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(data.get("name")), email, password })
        : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      toast.error(result.error.message ?? "Authentication failed");
      return;
    }
    router.push(mode === "sign-up" ? "/app/onboarding" : "/app");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {mode === "sign-up" && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" minLength={2} required placeholder="Your name" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required />
        {mode === "sign-up" && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
      </div>
      <Button className="w-full" size="lg" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />}
        {mode === "sign-up" ? "Create account" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-up" ? "Already have an account? " : "New to Forme? "}
        <Link className="font-medium text-primary hover:underline" href={mode === "sign-up" ? "/sign-in" : "/sign-up"}>
          {mode === "sign-up" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
