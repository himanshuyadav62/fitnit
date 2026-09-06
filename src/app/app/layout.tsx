import { Bell } from "lucide-react";

import { AppNav } from "@/components/app-nav";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]"><aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-white/5 bg-sidebar/80 p-4 backdrop-blur-xl lg:flex lg:flex-col"><div className="px-2 py-2"><Brand /></div><Separator className="my-5" /><div className="flex-1"><AppNav /></div><div className="rounded-xl border bg-muted/20 p-3"><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div><Separator className="my-2" /><SignOutButton /></div></aside><div className="lg:col-start-2"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 px-5 backdrop-blur-xl lg:px-8"><div className="lg:hidden"><Brand compact /></div><p className="hidden text-sm text-muted-foreground sm:block">Small steps, logged consistently.</p><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button></header><main className="mx-auto max-w-7xl px-5 py-8 pb-28 lg:px-8 lg:py-10">{children}</main><div className="fixed inset-x-0 bottom-0 z-30 border-t bg-sidebar/95 px-2 backdrop-blur lg:hidden"><AppNav mobile /></div></div></div>;
}
