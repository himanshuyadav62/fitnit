import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };
export default async function SignUpPage() {
  if (await getCurrentSession()) redirect("/app");
  return <div className="w-full"><p className="text-sm font-medium text-primary">Start your feedback loop</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your account</h1><p className="mb-8 mt-3 text-sm text-muted-foreground">Your plan and health logs stay private to your account.</p><AuthForm mode="sign-up" /></div>;
}
