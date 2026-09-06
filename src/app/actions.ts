"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  measurements,
  planExercises,
  plans,
  planWorkouts,
  profiles,
  setLogs,
  templateExercises,
  templateWorkouts,
  workoutSessions,
} from "@/db/schema";
import { calculateNutritionTarget, getAge } from "@/lib/fitness";
import { requireUser } from "@/lib/session";

export type ActionState = { error?: string };

const onboardingSchema = z.object({
  birthDate: z.string().date(),
  sexAtBirth: z.enum(["male", "female", "intersex", "prefer_not_to_say"]),
  genderIdentity: z.string().max(80).optional(),
  heightCm: z.coerce.number().min(120).max(230),
  currentWeightKg: z.coerce.number().min(30).max(300),
  targetWeightKg: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().min(30).max(300).optional(),
  ),
  goal: z.enum(["build_muscle", "lose_fat", "get_stronger", "general_fitness"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  diet: z.enum(["vegan", "vegetarian", "omnivore", "other"]),
  daysPerWeek: z.coerce.number().int().min(2).max(4),
  sessionMinutes: z.coerce.number().int().min(30).max(90),
  activityLevel: z.enum(["low", "moderate", "high"]),
  sleepHours: z.coerce.number().min(3).max(12),
  stressLevel: z.coerce.number().int().min(1).max(5),
  limitations: z.string().max(500).optional(),
  timezone: z.string().min(1).max(80),
});

async function cloneFeaturedPlan(userId: string, daysPerWeek: number, goal: "build_muscle" | "lose_fat" | "get_stronger" | "general_fitness") {
  const template = await db.query.planTemplates.findFirst({
    where: (table, { eq }) => eq(table.slug, "beginner-vegan-muscle-gain-3-day"),
  });
  if (!template) throw new Error("The starter plan has not been seeded yet.");
  const sourceWorkouts = await db
    .select()
    .from(templateWorkouts)
    .where(eq(templateWorkouts.templateId, template.id))
    .orderBy(templateWorkouts.dayNumber);

  await db.update(plans).set({ status: "archived", updatedAt: new Date() }).where(and(eq(plans.userId, userId), eq(plans.status, "active")));
  const [plan] = await db
    .insert(plans)
    .values({
      userId,
      sourceTemplateId: template.id,
      name: daysPerWeek === 3 ? template.title : `Personal Foundation — ${daysPerWeek} Days`,
      goal,
      daysPerWeek,
      durationWeeks: 8,
    })
    .returning();

  const selected = Array.from({ length: daysPerWeek }, (_, index) => sourceWorkouts[index % sourceWorkouts.length]);
  for (const [index, source] of selected.entries()) {
    const [workout] = await db
      .insert(planWorkouts)
      .values({
        planId: plan.id,
        dayNumber: index + 1,
        title: index < sourceWorkouts.length ? source.title : "Foundation D",
        focus: index < sourceWorkouts.length ? source.focus : "Technique, easy volume and recovery",
      })
      .returning();
    const items = await db.select().from(templateExercises).where(eq(templateExercises.workoutId, source.id));
    await db.insert(planExercises).values(
      items.map((item) => ({
        workoutId: workout.id,
        exerciseId: item.exerciseId,
        sortOrder: item.sortOrder,
        sets: index >= 3 ? Math.max(2, item.sets - 1) : item.sets,
        repMin: item.repMin,
        repMax: item.repMax,
        restSeconds: item.restSeconds,
        targetRir: index >= 3 ? 3 : item.targetRir,
        notes: index >= 3 ? "Keep this optional day easy and technique-focused." : item.notes,
      })),
    );
  }
  return plan;
}

export async function completeOnboarding(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  const data = parsed.data;
  const age = getAge(data.birthDate);
  if (age < 18) return { error: "Forme is currently available only to adults aged 18 or older." };
  const medicalClearanceNeeded = formData.get("medicalClearanceNeeded") === "yes";
  const equipment = formData.getAll("equipment").map(String);
  if (equipment.length === 0) return { error: "Choose at least one equipment option." };
  const target = calculateNutritionTarget({
    weightKg: data.currentWeightKg,
    heightCm: data.heightCm,
    age,
    sexAtBirth: data.sexAtBirth,
    activityLevel: data.activityLevel,
    goal: data.goal,
  });
  await db
    .insert(profiles)
    .values({
      userId: currentUser.id,
      birthDate: data.birthDate,
      sexAtBirth: data.sexAtBirth,
      genderIdentity: data.genderIdentity,
      heightCm: String(data.heightCm),
      currentWeightKg: String(data.currentWeightKg),
      targetWeightKg: data.targetWeightKg ? String(data.targetWeightKg) : null,
      goal: data.goal,
      experience: data.experience,
      diet: data.diet,
      daysPerWeek: data.daysPerWeek,
      calorieTarget: target.calories,
      proteinTargetG: target.proteinG,
      timezone: data.timezone,
      onboardingComplete: !medicalClearanceNeeded,
      safetyFlag: medicalClearanceNeeded,
      answers: {
        equipment,
        limitations: data.limitations ?? "",
        preferredDays: formData.getAll("preferredDays").map(String),
        sessionMinutes: data.sessionMinutes,
        activityLevel: data.activityLevel,
        sleepHours: data.sleepHours,
        stressLevel: data.stressLevel,
        medicalClearanceNeeded,
      },
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        birthDate: data.birthDate,
        sexAtBirth: data.sexAtBirth,
        genderIdentity: data.genderIdentity,
        heightCm: String(data.heightCm),
        currentWeightKg: String(data.currentWeightKg),
        targetWeightKg: data.targetWeightKg ? String(data.targetWeightKg) : null,
        goal: data.goal,
        experience: data.experience,
        diet: data.diet,
        daysPerWeek: data.daysPerWeek,
        calorieTarget: target.calories,
        proteinTargetG: target.proteinG,
        timezone: data.timezone,
        onboardingComplete: !medicalClearanceNeeded,
        safetyFlag: medicalClearanceNeeded,
        answers: {
          equipment,
          limitations: data.limitations ?? "",
          preferredDays: formData.getAll("preferredDays").map(String),
          sessionMinutes: data.sessionMinutes,
          activityLevel: data.activityLevel,
          sleepHours: data.sleepHours,
          stressLevel: data.stressLevel,
          medicalClearanceNeeded,
        },
        updatedAt: new Date(),
      },
    });
  if (medicalClearanceNeeded) {
    revalidatePath("/app/onboarding");
    return { error: "Your answers suggest getting medical clearance before starting a generated exercise plan. Your profile was saved." };
  }
  await cloneFeaturedPlan(currentUser.id, data.daysPerWeek, data.goal);
  redirect("/app");
}

export async function cloneStarterPlan() {
  const currentUser = await requireUser();
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, currentUser.id) });
  if (!profile?.onboardingComplete || !profile.goal || !profile.daysPerWeek) redirect("/app/onboarding");
  await cloneFeaturedPlan(currentUser.id, profile.daysPerWeek, profile.goal);
  revalidatePath("/app");
  redirect("/app/plan");
}

export async function startWorkout(formData: FormData) {
  const currentUser = await requireUser();
  const workoutId = z.string().uuid().parse(formData.get("workoutId"));
  const owned = await db
    .select({ id: planWorkouts.id })
    .from(planWorkouts)
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(planWorkouts.id, workoutId), eq(plans.userId, currentUser.id), eq(plans.status, "active")))
    .limit(1);
  if (!owned[0]) throw new Error("Workout not found.");
  const [session] = await db.insert(workoutSessions).values({ userId: currentUser.id, planWorkoutId: workoutId }).returning();
  redirect(`/app/workouts/${session.id}`);
}

export async function logSet(formData: FormData) {
  const currentUser = await requireUser();
  const data = z
    .object({
      sessionId: z.string().uuid(),
      planExerciseId: z.string().uuid(),
      setNumber: z.coerce.number().int().min(1).max(20),
      reps: z.coerce.number().int().min(0).max(100),
      weightKg: z.coerce.number().min(0).max(1000),
      rir: z.coerce.number().int().min(0).max(5),
    })
    .parse(Object.fromEntries(formData));
  const owned = await db.query.workoutSessions.findFirst({
    where: and(eq(workoutSessions.id, data.sessionId), eq(workoutSessions.userId, currentUser.id)),
  });
  if (!owned || owned.completedAt) throw new Error("This workout session is not open.");
  const belongsToWorkout = await db.query.planExercises.findFirst({
    where: and(eq(planExercises.id, data.planExerciseId), eq(planExercises.workoutId, owned.planWorkoutId)),
  });
  if (!belongsToWorkout) throw new Error("Exercise does not belong to this workout.");
  await db
    .insert(setLogs)
    .values({ ...data, weightKg: String(data.weightKg) })
    .onConflictDoUpdate({
      target: [setLogs.sessionId, setLogs.planExerciseId, setLogs.setNumber],
      set: { reps: data.reps, weightKg: String(data.weightKg), rir: data.rir, completed: true },
    });
  revalidatePath(`/app/workouts/${data.sessionId}`);
}

export async function finishWorkout(formData: FormData) {
  const currentUser = await requireUser();
  const sessionId = z.string().uuid().parse(formData.get("sessionId"));
  const effort = z.coerce.number().int().min(1).max(10).parse(formData.get("effort"));
  await db
    .update(workoutSessions)
    .set({ completedAt: new Date(), perceivedEffort: effort, notes: String(formData.get("notes") ?? "") })
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, currentUser.id)));
  revalidatePath("/app");
  redirect("/app");
}

export async function addMeasurement(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = z
    .object({
      measuredOn: z.string().date(),
      weightKg: z.coerce.number().min(30).max(300),
      waistCm: z.union([z.coerce.number().min(30).max(250), z.literal("")]).optional(),
      notes: z.string().max(300).optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the measurement." };
  const data = parsed.data;
  await db
    .insert(measurements)
    .values({
      userId: currentUser.id,
      measuredOn: data.measuredOn,
      weightKg: String(data.weightKg),
      waistCm: data.waistCm === "" || data.waistCm === undefined ? null : String(data.waistCm),
      notes: data.notes,
    })
    .onConflictDoUpdate({
      target: [measurements.userId, measurements.measuredOn],
      set: {
        weightKg: String(data.weightKg),
        waistCm: data.waistCm === "" || data.waistCm === undefined ? null : String(data.waistCm),
        notes: data.notes,
      },
    });
  await db.update(profiles).set({ currentWeightKg: String(data.weightKg), updatedAt: new Date() }).where(eq(profiles.userId, currentUser.id));
  revalidatePath("/app/progress");
  revalidatePath("/app");
  return {};
}
