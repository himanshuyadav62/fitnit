import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { CoachChat } from "@/components/coach-chat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachHistory } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Coach" };
export default async function CoachPage() {
  const user = await requireUser();
  const messages = await getCoachHistory(user.id);
  return <div className="mx-auto max-w-4xl"><div className="mb-7 flex items-end justify-between"><div><p className="text-sm font-medium text-primary">Context-aware guidance</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Coach</h1></div><Badge variant="outline"><Sparkles className="size-3" /> Safe mock mode</Badge></div><Card className="border-white/8"><CardHeader className="border-b"><CardTitle className="text-base">Training conversation</CardTitle></CardHeader><CardContent className="p-5"><CoachChat initialMessages={messages.map((message) => ({ id: message.id, role: message.role, content: message.content }))} /></CardContent></Card></div>;
}
