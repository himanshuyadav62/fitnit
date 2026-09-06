import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { coachMessages, profiles, workoutSessions } from "@/db/schema";
import { coachReply } from "@/lib/fitness";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ message: z.string().trim().min(1).max(600) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  const [profile, totals] = await Promise.all([
    db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) }),
    db.select({ count: sql<number>`count(*)::int` }).from(workoutSessions).where(and(eq(workoutSessions.userId, session.user.id), sql`${workoutSessions.completedAt} is not null`)),
  ]);
  const reply = coachReply(parsed.data.message, { workoutCount: totals[0]?.count ?? 0, proteinTarget: profile?.proteinTargetG });
  await db.insert(coachMessages).values([
    { userId: session.user.id, role: "user", content: parsed.data.message },
    { userId: session.user.id, role: "assistant", content: reply },
  ]);
  return NextResponse.json({ message: { id: crypto.randomUUID(), role: "assistant" as const, content: reply }, mode: process.env.AI_MODE ?? "mock" });
}
