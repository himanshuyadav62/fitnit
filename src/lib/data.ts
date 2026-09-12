import "server-only";

import { and, asc, desc, eq, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  coachMessages,
  exercises,
  measurements,
  planExercises,
  plans,
  planTemplates,
  planWorkouts,
  profiles,
  setLogs,
  templateExercises,
  templateWorkouts,
  workoutSessions,
  workoutSessionExercises,
} from "@/db/schema";

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  slug: string;
  name: string;
  equipment: string;
  sortOrder: number;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  targetRir: number;
  notes: string | null;
  userNotes: string | null;
  videoUrlOverride: string | null;
  label: string | null;
};

export type WorkoutBlock = {
  id: string;
  dayNumber: number;
  title: string;
  focus: string;
  label: string | null;
  exercises: WorkoutExercise[];
};

function groupWorkouts(rows: Array<{
  workoutId: string;
  dayNumber: number;
  title: string;
  focus: string;
  workoutLabel?: string | null;
  itemId: string | null;
  exerciseId: string | null;
  slug: string | null;
  name: string | null;
  equipment: string | null;
  sortOrder: number | null;
  sets: number | null;
  repMin: number | null;
  repMax: number | null;
  restSeconds: number | null;
  targetRir: number | null;
  notes: string | null;
  userNotes?: string | null;
  videoUrlOverride?: string | null;
  itemLabel?: string | null;
}>) {
  const grouped = new Map<string, WorkoutBlock>();
  for (const row of rows) {
    const workout = grouped.get(row.workoutId) ?? {
      id: row.workoutId,
      dayNumber: row.dayNumber,
      title: row.title,
      focus: row.focus,
      label: row.workoutLabel ?? null,
      exercises: [],
    };
    if (row.itemId && row.exerciseId && row.slug && row.name && row.equipment) {
      workout.exercises.push({
        id: row.itemId,
        exerciseId: row.exerciseId,
        slug: row.slug,
        name: row.name,
        equipment: row.equipment,
        sortOrder: row.sortOrder!,
        sets: row.sets!,
        repMin: row.repMin!,
        repMax: row.repMax!,
        restSeconds: row.restSeconds!,
        targetRir: row.targetRir!,
        notes: row.notes,
        userNotes: row.userNotes ?? null,
        videoUrlOverride: row.videoUrlOverride ?? null,
        label: row.itemLabel ?? null,
      });
    }
    grouped.set(row.workoutId, workout);
  }
  return [...grouped.values()].sort((a, b) => a.dayNumber - b.dayNumber);
}

export async function getFeaturedTemplate() {
  const template = await db.query.planTemplates.findFirst({
    where: eq(planTemplates.slug, "beginner-vegan-muscle-gain-3-day"),
  });
  if (!template) return null;
  const rows = await db
    .select({
      workoutId: templateWorkouts.id,
      dayNumber: templateWorkouts.dayNumber,
      title: templateWorkouts.title,
      focus: templateWorkouts.focus,
      itemId: templateExercises.id,
      exerciseId: exercises.id,
      slug: exercises.slug,
      name: exercises.name,
      equipment: exercises.equipment,
      sortOrder: templateExercises.sortOrder,
      sets: templateExercises.sets,
      repMin: templateExercises.repMin,
      repMax: templateExercises.repMax,
      restSeconds: templateExercises.restSeconds,
      targetRir: templateExercises.targetRir,
      notes: templateExercises.notes,
    })
    .from(templateWorkouts)
    .leftJoin(templateExercises, eq(templateExercises.workoutId, templateWorkouts.id))
    .leftJoin(exercises, eq(exercises.id, templateExercises.exerciseId))
    .where(eq(templateWorkouts.templateId, template.id))
    .orderBy(asc(templateWorkouts.dayNumber), asc(templateExercises.sortOrder));
  return { ...template, workouts: groupWorkouts(rows) };
}

export async function getPlanTemplates() {
  return db
    .select()
    .from(planTemplates)
    .orderBy(asc(planTemplates.daysPerWeek), asc(planTemplates.title));
}

export async function getTemplateBySlug(slug: string) {
  const template = await db.query.planTemplates.findFirst({ where: eq(planTemplates.slug, slug) });
  if (!template) return null;
  const rows = await db
    .select({
      workoutId: templateWorkouts.id,
      dayNumber: templateWorkouts.dayNumber,
      title: templateWorkouts.title,
      focus: templateWorkouts.focus,
      itemId: templateExercises.id,
      exerciseId: exercises.id,
      slug: exercises.slug,
      name: exercises.name,
      equipment: exercises.equipment,
      sortOrder: templateExercises.sortOrder,
      sets: templateExercises.sets,
      repMin: templateExercises.repMin,
      repMax: templateExercises.repMax,
      restSeconds: templateExercises.restSeconds,
      targetRir: templateExercises.targetRir,
      notes: templateExercises.notes,
    })
    .from(templateWorkouts)
    .leftJoin(templateExercises, eq(templateExercises.workoutId, templateWorkouts.id))
    .leftJoin(exercises, eq(exercises.id, templateExercises.exerciseId))
    .where(eq(templateWorkouts.templateId, template.id))
    .orderBy(asc(templateWorkouts.dayNumber), asc(templateExercises.sortOrder));
  return { ...template, workouts: groupWorkouts(rows) };
}

export async function getExerciseLibrary(userId: string) {
  return db
    .select({
      id: exercises.id,
      slug: exercises.slug,
      name: exercises.name,
      equipment: exercises.equipment,
      movementPattern: exercises.movementPattern,
      isCustom: sql<boolean>`${exercises.createdByUserId} is not null`,
    })
    .from(exercises)
    .where(or(isNull(exercises.createdByUserId), eq(exercises.createdByUserId, userId)))
    .orderBy(asc(exercises.name));
}

export async function getActivePlan(userId: string) {
  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.userId, userId), eq(plans.isCurrent, true), eq(plans.status, "active")),
    orderBy: desc(plans.createdAt),
  });
  if (!plan) return null;
  const rows = await db
    .select({
      workoutId: planWorkouts.id,
      dayNumber: planWorkouts.dayNumber,
      title: planWorkouts.title,
      focus: planWorkouts.focus,
      workoutLabel: planWorkouts.label,
      itemId: planExercises.id,
      exerciseId: exercises.id,
      slug: exercises.slug,
      name: exercises.name,
      equipment: exercises.equipment,
      sortOrder: planExercises.sortOrder,
      sets: planExercises.sets,
      repMin: planExercises.repMin,
      repMax: planExercises.repMax,
      restSeconds: planExercises.restSeconds,
      targetRir: planExercises.targetRir,
      notes: planExercises.notes,
      userNotes: planExercises.userNotes,
      videoUrlOverride: planExercises.videoUrlOverride,
      itemLabel: planExercises.label,
    })
    .from(planWorkouts)
    .leftJoin(planExercises, and(eq(planExercises.workoutId, planWorkouts.id), eq(planExercises.isActive, true)))
    .leftJoin(exercises, eq(exercises.id, planExercises.exerciseId))
    .where(and(eq(planWorkouts.planId, plan.id), eq(planWorkouts.isActive, true)))
    .orderBy(asc(planWorkouts.dayNumber), asc(planExercises.sortOrder));
  return { ...plan, workouts: groupWorkouts(rows) };
}

export async function getUserPlans(userId: string) {
  return db
    .select({
      id: plans.id,
      name: plans.name,
      goal: plans.goal,
      status: plans.status,
      isCurrent: plans.isCurrent,
      daysPerWeek: plans.daysPerWeek,
      durationWeeks: plans.durationWeeks,
      sourceTemplateId: plans.sourceTemplateId,
      workoutCount: sql<number>`count(distinct ${planWorkouts.id})::int`,
      exerciseCount: sql<number>`count(distinct ${planExercises.id}) filter (where ${planExercises.isActive} = true)::int`,
      updatedAt: plans.updatedAt,
    })
    .from(plans)
    .leftJoin(planWorkouts, and(eq(planWorkouts.planId, plans.id), eq(planWorkouts.isActive, true)))
    .leftJoin(planExercises, eq(planExercises.workoutId, planWorkouts.id))
    .where(and(eq(plans.userId, userId), eq(plans.status, "active")))
    .groupBy(plans.id)
    .orderBy(desc(plans.isCurrent), desc(plans.updatedAt));
}

export async function getProfile(userId: string) {
  return db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
}

export async function getDashboardData(userId: string) {
  const [profile, plan, recentSessions, latestMeasurement, totals] = await Promise.all([
    getProfile(userId),
    getActivePlan(userId),
    db
      .select({
        id: workoutSessions.id,
        startedAt: workoutSessions.startedAt,
        completedAt: workoutSessions.completedAt,
        title: planWorkouts.title,
      })
      .from(workoutSessions)
      .innerJoin(planWorkouts, eq(planWorkouts.id, workoutSessions.planWorkoutId))
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startedAt))
      .limit(4),
    db.query.measurements.findFirst({
      where: eq(measurements.userId, userId),
      orderBy: desc(measurements.measuredOn),
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(workoutSessions)
      .where(and(eq(workoutSessions.userId, userId), sql`${workoutSessions.completedAt} is not null`)),
  ]);
  return { profile, plan, recentSessions, latestMeasurement, completedWorkouts: totals[0]?.count ?? 0 };
}

export async function getWorkoutSession(userId: string, sessionId: string) {
  const sessionRow = await db
    .select({
      id: workoutSessions.id,
      startedAt: workoutSessions.startedAt,
      completedAt: workoutSessions.completedAt,
      workoutId: planWorkouts.id,
      title: planWorkouts.title,
      focus: planWorkouts.focus,
    })
    .from(workoutSessions)
    .innerJoin(planWorkouts, eq(planWorkouts.id, workoutSessions.planWorkoutId))
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
    .limit(1);
  if (!sessionRow[0]) return null;
  const [exerciseRows, logs] = await Promise.all([
    db
      .select({
        id: workoutSessionExercises.planExerciseId,
        exerciseId: workoutSessionExercises.exerciseId,
        slug: workoutSessionExercises.exerciseSlug,
        name: workoutSessionExercises.exerciseName,
        equipment: workoutSessionExercises.equipment,
        sortOrder: workoutSessionExercises.sortOrder,
        sets: workoutSessionExercises.sets,
        repMin: workoutSessionExercises.repMin,
        repMax: workoutSessionExercises.repMax,
        restSeconds: workoutSessionExercises.restSeconds,
        targetRir: workoutSessionExercises.targetRir,
        notes: workoutSessionExercises.programmingNotes,
        userNotes: workoutSessionExercises.userNotes,
        videoUrlOverride: workoutSessionExercises.videoUrl,
        label: workoutSessionExercises.label,
      })
      .from(workoutSessionExercises)
      .where(eq(workoutSessionExercises.sessionId, sessionId))
      .orderBy(asc(workoutSessionExercises.sortOrder)),
    db.select().from(setLogs).where(eq(setLogs.sessionId, sessionId)),
  ]);
  return { ...sessionRow[0], exercises: exerciseRows, logs };
}

export async function getExercise(userId: string, slug: string) {
  return db.query.exercises.findFirst({
    where: and(eq(exercises.slug, slug), or(isNull(exercises.createdByUserId), eq(exercises.createdByUserId, userId))),
  });
}

export async function getPublicExercise(slug: string) {
  return db.query.exercises.findFirst({
    where: and(eq(exercises.slug, slug), isNull(exercises.createdByUserId)),
  });
}

export async function getActivePlanExercise(userId: string, slug: string, planExerciseId?: string) {
  const rows = await db
    .select({
      id: planExercises.id,
      label: planExercises.label,
      userNotes: planExercises.userNotes,
      videoUrlOverride: planExercises.videoUrlOverride,
      programmingNotes: planExercises.notes,
    })
    .from(planExercises)
    .innerJoin(exercises, eq(exercises.id, planExercises.exerciseId))
    .innerJoin(planWorkouts, eq(planWorkouts.id, planExercises.workoutId))
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(plans.userId, userId), eq(plans.isCurrent, true), eq(plans.status, "active"), eq(planWorkouts.isActive, true), eq(exercises.slug, slug), planExerciseId ? eq(planExercises.id, planExerciseId) : undefined))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTrainingAnalytics(userId: string) {
  const sessionRowsPromise = db
    .select({
      id: workoutSessions.id,
      startedAt: workoutSessions.startedAt,
      completedAt: workoutSessions.completedAt,
      title: planWorkouts.title,
      planName: plans.name,
      planDay: planWorkouts.dayNumber,
      dayLabel: planWorkouts.label,
      effort: workoutSessions.perceivedEffort,
      totalSets: sql<number>`count(${setLogs.id})::int`,
      totalReps: sql<number>`coalesce(sum(${setLogs.reps}), 0)::int`,
      volumeKg: sql<string>`coalesce(sum(${setLogs.weightKg} * ${setLogs.reps}), 0)::text`,
      maxWeightKg: sql<string>`coalesce(max(${setLogs.weightKg}), 0)::text`,
      durationMinutes: sql<number>`greatest(1, round(extract(epoch from (${workoutSessions.completedAt} - ${workoutSessions.startedAt})) / 60))::int`,
    })
    .from(workoutSessions)
    .innerJoin(planWorkouts, eq(planWorkouts.id, workoutSessions.planWorkoutId))
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .leftJoin(setLogs, eq(setLogs.sessionId, workoutSessions.id))
    .where(and(eq(workoutSessions.userId, userId), isNotNull(workoutSessions.completedAt)))
    .groupBy(workoutSessions.id, planWorkouts.title, plans.name, planWorkouts.dayNumber, planWorkouts.label)
    .orderBy(desc(workoutSessions.startedAt))
    .limit(60);

  const exerciseTotalsPromise = db
    .select({
      exerciseId: workoutSessionExercises.exerciseId,
      name: workoutSessionExercises.exerciseName,
      sessions: sql<number>`count(distinct ${workoutSessions.id})::int`,
      totalSets: sql<number>`count(${setLogs.id})::int`,
      totalReps: sql<number>`coalesce(sum(${setLogs.reps}), 0)::int`,
      volumeKg: sql<string>`coalesce(sum(${setLogs.weightKg} * ${setLogs.reps}), 0)::text`,
      maxWeightKg: sql<string>`coalesce(max(${setLogs.weightKg}), 0)::text`,
    })
    .from(workoutSessions)
    .innerJoin(workoutSessionExercises, eq(workoutSessionExercises.sessionId, workoutSessions.id))
    .leftJoin(setLogs, and(eq(setLogs.sessionId, workoutSessionExercises.sessionId), eq(setLogs.planExerciseId, workoutSessionExercises.planExerciseId)))
    .where(and(eq(workoutSessions.userId, userId), isNotNull(workoutSessions.completedAt)))
    .groupBy(workoutSessionExercises.exerciseId, workoutSessionExercises.exerciseName)
    .orderBy(desc(sql`coalesce(sum(${setLogs.weightKg} * ${setLogs.reps}), 0)`))
    .limit(10);

  const [sessions, exerciseTotals] = await Promise.all([sessionRowsPromise, exerciseTotalsPromise]);
  const recentSessionIds = sessions.slice(0, 8).map((session) => session.id);
  const recentExercises = recentSessionIds.length === 0 ? [] : await db
    .select({
      sessionId: workoutSessionExercises.sessionId,
      planExerciseId: workoutSessionExercises.planExerciseId,
      name: workoutSessionExercises.exerciseName,
      label: workoutSessionExercises.label,
      sortOrder: workoutSessionExercises.sortOrder,
      sets: sql<number>`count(${setLogs.id})::int`,
      reps: sql<number>`coalesce(sum(${setLogs.reps}), 0)::int`,
      maxWeightKg: sql<string>`coalesce(max(${setLogs.weightKg}), 0)::text`,
      volumeKg: sql<string>`coalesce(sum(${setLogs.weightKg} * ${setLogs.reps}), 0)::text`,
    })
    .from(workoutSessionExercises)
    .leftJoin(setLogs, and(eq(setLogs.sessionId, workoutSessionExercises.sessionId), eq(setLogs.planExerciseId, workoutSessionExercises.planExerciseId)))
    .where(inArray(workoutSessionExercises.sessionId, recentSessionIds))
    .groupBy(workoutSessionExercises.sessionId, workoutSessionExercises.planExerciseId, workoutSessionExercises.exerciseName, workoutSessionExercises.label, workoutSessionExercises.sortOrder)
    .orderBy(desc(workoutSessionExercises.sessionId), asc(workoutSessionExercises.sortOrder));

  return { sessions, exerciseTotals, recentExercises };
}

export async function getProgress(userId: string) {
  return db
    .select()
    .from(measurements)
    .where(eq(measurements.userId, userId))
    .orderBy(asc(measurements.measuredOn))
    .limit(52);
}

export async function getCoachHistory(userId: string) {
  return db
    .select()
    .from(coachMessages)
    .where(eq(coachMessages.userId, userId))
    .orderBy(asc(coachMessages.createdAt))
    .limit(40);
}

export async function getOpenSession(userId: string) {
  return db.query.workoutSessions.findFirst({
    where: and(eq(workoutSessions.userId, userId), isNull(workoutSessions.completedAt)),
    orderBy: desc(workoutSessions.startedAt),
  });
}
