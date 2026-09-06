import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, RotateCcw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };
export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  return <div className="mx-auto max-w-3xl space-y-7"><div><p className="text-sm font-medium text-primary">Account & preferences</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1></div><Card className="border-white/8"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Profile</CardTitle><CardDescription>The details connected to your private account.</CardDescription></CardHeader><CardContent className="grid gap-4 text-sm sm:grid-cols-2"><Item label="Name" value={user.name} /><Item label="Email" value={user.email} /><Item label="Goal" value={profile?.goal?.replaceAll('_',' ') ?? 'Not set'} /><Item label="Diet" value={profile?.diet ?? 'Not set'} /><Item label="Training days" value={profile?.daysPerWeek ? `${profile.daysPerWeek} / week` : 'Not set'} /><Item label="Data visibility" value="Private" /></CardContent></Card><Card className="border-white/8"><CardHeader><CardTitle className="flex items-center gap-2"><RotateCcw className="size-5 text-primary" /> Reassess your plan</CardTitle><CardDescription>Update schedule, equipment, body metrics, nutrition preference, or readiness answers. Submitting creates a new private plan and archives the current one.</CardDescription></CardHeader><CardContent><Button variant="outline" asChild><Link href="/app/onboarding">Open assessment</Link></Button></CardContent></Card><Card className="border-white/8"><CardHeader><CardTitle className="flex items-center gap-2"><LockKeyhole className="size-5 text-primary" /> Security note</CardTitle><CardDescription>Email verification and password reset email delivery are intentionally deferred in this local preview. Add a transactional email provider before public production use.</CardDescription></CardHeader></Card></div>;
}

function Item({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 capitalize">{value}</p></div>; }
