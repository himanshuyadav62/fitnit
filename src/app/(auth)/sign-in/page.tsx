import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export default async function SignInPage() {
  if (await getCurrentSession()) redirect("/app");
  return <div className="w-full"><p className="text-sm font-medium text-primary">Welcome back</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Continue your progress</h1><p className="mb-8 mt-3 text-sm text-muted-foreground">Sign in to open your private training dashboard.</p><AuthForm mode="sign-in" /></div>;
}
