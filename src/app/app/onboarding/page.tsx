import type { Metadata } from "next";

import { OnboardingForm } from "@/components/onboarding-form";
import { getProfile } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Build your plan" };
export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  return <div className="mx-auto max-w-3xl"><div className="mb-10"><p className="text-sm font-medium text-primary">Personal assessment · about 4 minutes</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Build a plan around your life</h1><p className="mt-3 max-w-2xl text-muted-foreground">These questions cover the inputs that materially change a useful beginner program. You can update them later.</p></div><OnboardingForm defaults={{ name: user.name, weight: profile?.currentWeightKg ?? "52", diet: profile?.diet ?? "vegan" }} /></div>;
}
