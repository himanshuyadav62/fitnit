import "server-only";

import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

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
};

export type WorkoutBlock = {
  id: string;
  dayNumber: number;
  title: string;
  focus: string;
  exercises: WorkoutExercise[];
};

function groupWorkouts(rows: Array<{
  workoutId: string;
  dayNumber: number;
  title: string;
  focus: string;
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
}>) {
  const grouped = new Map<string, WorkoutBlock>();
  for (const row of rows) {
    const workout = grouped.get(row.workoutId) ?? {
      id: row.workoutId,
      dayNumber: row.dayNumber,
      title: row.title,
      focus: row.focus,
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

export async function getActivePlan(userId: string) {
  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.userId, userId), eq(plans.status, "active")),
    orderBy: desc(plans.createdAt),
  });
  if (!plan) return null;
  const rows = await db
    .select({
      workoutId: planWorkouts.id,
      dayNumber: planWorkouts.dayNumber,
      title: planWorkouts.title,
      focus: planWorkouts.focus,
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
    })
    .from(planWorkouts)
    .leftJoin(planExercises, eq(planExercises.workoutId, planWorkouts.id))
    .leftJoin(exercises, eq(exercises.id, planExercises.exerciseId))
    .where(eq(planWorkouts.planId, plan.id))
    .orderBy(asc(planWorkouts.dayNumber), asc(planExercises.sortOrder));
  return { ...plan, workouts: groupWorkouts(rows) };
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
        id: planExercises.id,
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
      })
      .from(planExercises)
      .innerJoin(exercises, eq(exercises.id, planExercises.exerciseId))
      .where(eq(planExercises.workoutId, sessionRow[0].workoutId))
      .orderBy(asc(planExercises.sortOrder)),
    db.select().from(setLogs).where(eq(setLogs.sessionId, sessionId)),
  ]);
  return { ...sessionRow[0], exercises: exerciseRows, logs };
}

export async function getExercise(slug: string) {
  return db.query.exercises.findFirst({ where: eq(exercises.slug, slug) });
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
