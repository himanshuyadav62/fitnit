"use server";

import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  exercises,
  measurements,
  planExercises,
  planTemplates,
  plans,
  planWorkouts,
  profiles,
  setLogs,
  templateExercises,
  templateWorkouts,
  workoutSessions,
  workoutSessionExercises,
} from "@/db/schema";
import { calculateNutritionTarget, getAge } from "@/lib/fitness";
import { recommendPlanSlug } from "@/lib/plan-recommendation";
import { requireUser } from "@/lib/session";
import { getSafeEmbedUrl } from "@/lib/video";

export type ActionState = { error?: string; success?: string; successId?: string };

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
  daysPerWeek: z.coerce.number().int().min(2).max(6),
  sessionMinutes: z.coerce.number().int().min(30).max(90),
  activityLevel: z.enum(["low", "moderate", "high"]),
  sleepHours: z.coerce.number().min(3).max(12),
  stressLevel: z.coerce.number().int().min(1).max(5),
  limitations: z.string().max(500).optional(),
  timezone: z.string().min(1).max(80),
});

async function cloneTemplatePlan(userId: string, templateSlug: string) {
  const template = await db.query.planTemplates.findFirst({
    where: (table, { eq }) => eq(table.slug, templateSlug),
  });
  if (!template) throw new Error("This plan has not been seeded yet.");
  const sourceWorkouts = await db
    .select()
    .from(templateWorkouts)
    .where(eq(templateWorkouts.templateId, template.id))
    .orderBy(templateWorkouts.dayNumber);
  if (sourceWorkouts.length === 0) throw new Error("The starter plan has no workouts.");

  const selected = sourceWorkouts.map((source, index) => ({ source, dayNumber: index + 1 }));
  const sourceItems = await db
    .select()
    .from(templateExercises)
    .where(inArray(templateExercises.workoutId, [...new Set(selected.map(({ source }) => source.id))]));

  return db.transaction(async (tx) => {
    await tx.update(plans).set({ status: "archived", updatedAt: new Date() }).where(and(eq(plans.userId, userId), eq(plans.status, "active")));
    const [plan] = await tx
      .insert(plans)
      .values({
        userId,
        sourceTemplateId: template.id,
        name: template.title,
        goal: template.goal,
        daysPerWeek: template.daysPerWeek,
        durationWeeks: template.durationWeeks,
      })
      .returning();
    const createdWorkouts = await tx
      .insert(planWorkouts)
      .values(selected.map(({ source, dayNumber }) => ({
          planId: plan.id,
          dayNumber,
          title: source.title,
          focus: source.focus,
        })))
      .returning();
    const exerciseValues = createdWorkouts.flatMap((workout) => {
      const selectedDay = selected[workout.dayNumber - 1];
      return sourceItems
        .filter((item) => item.workoutId === selectedDay.source.id)
        .map((item) => ({
          workoutId: workout.id,
          exerciseId: item.exerciseId,
          sortOrder: item.sortOrder,
          sets: item.sets,
          repMin: item.repMin,
          repMax: item.repMax,
          restSeconds: item.restSeconds,
          targetRir: item.targetRir,
          notes: item.notes,
        }));
    });
    if (exerciseValues.length > 0) await tx.insert(planExercises).values(exerciseValues);
    return plan;
  });
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
        selectedPlanSlug: recommendPlanSlug(data.daysPerWeek, data.goal, data.diet),
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
          selectedPlanSlug: recommendPlanSlug(data.daysPerWeek, data.goal, data.diet),
        },
        updatedAt: new Date(),
      },
    });
  if (medicalClearanceNeeded) {
    revalidatePath("/app/onboarding");
    return { error: "Your answers suggest getting medical clearance before starting a generated exercise plan. Your profile was saved." };
  }
  await cloneTemplatePlan(currentUser.id, recommendPlanSlug(data.daysPerWeek, data.goal, data.diet));
  redirect("/app");
}

export async function cloneStarterPlan() {
  const currentUser = await requireUser();
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, currentUser.id) });
  if (!profile?.onboardingComplete || !profile.goal || !profile.daysPerWeek) redirect("/app/onboarding");
  await cloneTemplatePlan(currentUser.id, recommendPlanSlug(profile.daysPerWeek, profile.goal, profile.diet ?? undefined));
  revalidatePath("/app");
  redirect("/app/plan");
}

export async function activateTemplate(formData: FormData) {
  const currentUser = await requireUser();
  const templateSlug = z.string().min(1).max(120).parse(formData.get("templateSlug"));
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, currentUser.id) });
  if (!profile?.onboardingComplete) redirect("/app/onboarding");
  const exists = await db.query.planTemplates.findFirst({ where: eq(planTemplates.slug, templateSlug) });
  if (!exists) throw new Error("Plan template not found.");
  await cloneTemplatePlan(currentUser.id, templateSlug);
  await db.update(profiles).set({ daysPerWeek: exists.daysPerWeek, updatedAt: new Date() }).where(eq(profiles.userId, currentUser.id));
  revalidatePath("/app");
  revalidatePath("/app/plan");
  redirect("/app/plan");
}

const exerciseMutationSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  sets: z.coerce.number().int().min(1).max(10),
  repMin: z.coerce.number().int().min(1).max(100),
  repMax: z.coerce.number().int().min(1).max(100),
  restSeconds: z.coerce.number().int().min(15).max(600),
  targetRir: z.coerce.number().int().min(0).max(5),
  userNotes: z.string().max(1000).optional(),
  videoUrlOverride: z.string().max(500).optional(),
  label: z.string().trim().max(32).optional(),
});

export async function addExerciseToWorkout(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = exerciseMutationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the exercise details." };
  const data = parsed.data;
  if (data.repMin > data.repMax) return { error: "The minimum reps cannot exceed the maximum reps." };
  if (data.videoUrlOverride && !getSafeEmbedUrl(data.videoUrlOverride)) return { error: "Use a valid YouTube or Vimeo video URL." };
  const owned = await db.select({ id: planWorkouts.id }).from(planWorkouts)
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(planWorkouts.id, data.workoutId), eq(plans.userId, currentUser.id), eq(plans.status, "active"))).limit(1);
  if (!owned[0]) return { error: "Workout not found." };
  const availableExercise = await db.select({ id: exercises.id }).from(exercises)
    .where(and(eq(exercises.id, data.exerciseId), or(isNull(exercises.createdByUserId), eq(exercises.createdByUserId, currentUser.id)))).limit(1);
  if (!availableExercise[0]) return { error: "Exercise is not available in your library." };
  const last = await db.select({ sortOrder: planExercises.sortOrder }).from(planExercises)
    .where(eq(planExercises.workoutId, data.workoutId)).orderBy(desc(planExercises.sortOrder)).limit(1);
  await db.insert(planExercises).values({
    workoutId: data.workoutId,
    exerciseId: data.exerciseId,
    sortOrder: (last[0]?.sortOrder ?? 0) + 1,
    sets: data.sets,
    repMin: data.repMin,
    repMax: data.repMax,
    restSeconds: data.restSeconds,
    targetRir: data.targetRir,
    userNotes: data.userNotes || null,
    videoUrlOverride: data.videoUrlOverride || null,
    label: data.label || null,
  });
  revalidatePath("/app/plan");
  return { success: "Exercise added to the workout.", successId: crypto.randomUUID() };
}

const customExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  movementPattern: z.string().trim().min(2).max(60),
  primaryMuscles: z.string().trim().min(2).max(200),
  equipment: z.string().trim().min(2).max(100),
  instructions: z.string().trim().min(5).max(1500),
  cues: z.string().trim().min(2).max(1000),
  videoUrl: z.string().trim().max(500).optional(),
  sets: z.coerce.number().int().min(1).max(10),
  repMin: z.coerce.number().int().min(1).max(100),
  repMax: z.coerce.number().int().min(1).max(100),
  restSeconds: z.coerce.number().int().min(15).max(600),
  targetRir: z.coerce.number().int().min(0).max(5),
  userNotes: z.string().max(1000).optional(),
  label: z.string().trim().max(32).optional(),
});

function customExerciseSlug(name: string) {
  const base = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "custom-exercise";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function addCustomExerciseToWorkout(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = customExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the custom exercise details." };
  const data = parsed.data;
  if (data.repMin > data.repMax) return { error: "The minimum reps cannot exceed the maximum reps." };
  if (data.videoUrl && !getSafeEmbedUrl(data.videoUrl)) return { error: "Use a valid YouTube or Vimeo video URL." };
  const primaryMuscles = [...new Set(data.primaryMuscles.split(",").map((value) => value.trim()).filter(Boolean))].slice(0, 10);
  const instructions = data.instructions.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).slice(0, 12);
  const cues = data.cues.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).slice(0, 12);
  if (primaryMuscles.length === 0 || instructions.length === 0 || cues.length === 0) return { error: "Add at least one muscle, instruction, and technique cue." };
  const owned = await db.select({ id: planWorkouts.id }).from(planWorkouts)
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(planWorkouts.id, data.workoutId), eq(plans.userId, currentUser.id), eq(plans.status, "active"))).limit(1);
  if (!owned[0]) return { error: "Workout not found." };

  await db.transaction(async (tx) => {
    const [customExercise] = await tx.insert(exercises).values({
      slug: customExerciseSlug(data.name),
      name: data.name,
      movementPattern: data.movementPattern,
      primaryMuscles,
      equipment: data.equipment,
      instructions,
      cues,
      videoUrl: data.videoUrl || null,
      createdByUserId: currentUser.id,
    }).returning({ id: exercises.id });
    const last = await tx.select({ sortOrder: planExercises.sortOrder }).from(planExercises)
      .where(eq(planExercises.workoutId, data.workoutId)).orderBy(desc(planExercises.sortOrder)).limit(1);
    await tx.insert(planExercises).values({
      workoutId: data.workoutId,
      exerciseId: customExercise.id,
      sortOrder: (last[0]?.sortOrder ?? 0) + 1,
      sets: data.sets,
      repMin: data.repMin,
      repMax: data.repMax,
      restSeconds: data.restSeconds,
      targetRir: data.targetRir,
      userNotes: data.userNotes || null,
      label: data.label || null,
    });
  });
  revalidatePath("/app/plan");
  return { success: "Custom exercise created and added.", successId: crypto.randomUUID() };
}

export async function updateExerciseDetails(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = z.object({
    planExerciseId: z.string().uuid(),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(120),
    userNotes: z.string().max(1000).optional(),
    videoUrlOverride: z.string().max(500).optional(),
    label: z.string().trim().max(32).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your notes." };
  const data = parsed.data;
  if (data.videoUrlOverride && !getSafeEmbedUrl(data.videoUrlOverride)) return { error: "Use a valid YouTube or Vimeo video URL." };
  const owned = await db.select({ id: planExercises.id }).from(planExercises)
    .innerJoin(planWorkouts, eq(planWorkouts.id, planExercises.workoutId))
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(planExercises.id, data.planExerciseId), eq(plans.userId, currentUser.id), eq(plans.status, "active"))).limit(1);
  if (!owned[0]) return { error: "Exercise not found in your active plan." };
  await db.update(planExercises).set({ userNotes: data.userNotes || null, videoUrlOverride: data.videoUrlOverride || null, label: data.label || null }).where(eq(planExercises.id, data.planExerciseId));
  revalidatePath("/app/plan");
  revalidatePath(`/app/exercises/${data.slug}`);
  return { success: "Exercise details saved.", successId: crypto.randomUUID() };
}

export async function addWorkoutDay(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = z.object({
    planId: z.string().uuid(),
    title: z.string().trim().min(2).max(80),
    focus: z.string().trim().min(2).max(160),
    label: z.string().trim().max(32).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the new training day." };
  const owned = await db.select({ id: plans.id }).from(plans)
    .where(and(eq(plans.id, parsed.data.planId), eq(plans.userId, currentUser.id), eq(plans.status, "active"))).limit(1);
  if (!owned[0]) return { error: "Active plan not found." };
  const last = await db.select({ dayNumber: planWorkouts.dayNumber }).from(planWorkouts)
    .where(eq(planWorkouts.planId, parsed.data.planId)).orderBy(desc(planWorkouts.dayNumber)).limit(1);
  const dayNumber = (last[0]?.dayNumber ?? 0) + 1;
  if (dayNumber > 7) return { error: "Plans are limited to seven training days per week." };
  await db.transaction(async (tx) => {
    await tx.insert(planWorkouts).values({ planId: parsed.data.planId, dayNumber, title: parsed.data.title, focus: parsed.data.focus, label: parsed.data.label || null });
    await tx.update(plans).set({ daysPerWeek: dayNumber, updatedAt: new Date() }).where(eq(plans.id, parsed.data.planId));
  });
  revalidatePath("/app");
  revalidatePath("/app/plan");
  return { success: `Day ${dayNumber} added.`, successId: crypto.randomUUID() };
}

export async function updateWorkoutDay(_state: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await requireUser();
  const parsed = z.object({
    workoutId: z.string().uuid(),
    title: z.string().trim().min(2).max(80),
    focus: z.string().trim().min(2).max(160),
    label: z.string().trim().max(32).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the day details." };
  const owned = await db.select({ id: planWorkouts.id }).from(planWorkouts)
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(planWorkouts.id, parsed.data.workoutId), eq(plans.userId, currentUser.id), eq(plans.status, "active"))).limit(1);
  if (!owned[0]) return { error: "Training day not found." };
  await db.update(planWorkouts).set({ title: parsed.data.title, focus: parsed.data.focus, label: parsed.data.label || null }).where(eq(planWorkouts.id, parsed.data.workoutId));
  revalidatePath("/app");
  revalidatePath("/app/plan");
  return { success: "Training day updated.", successId: crypto.randomUUID() };
}

export async function removeExercise(formData: FormData) {
  const currentUser = await requireUser();
  const planExerciseId = z.string().uuid().parse(formData.get("planExerciseId"));
  const owned = await db.select({ id: planExercises.id }).from(planExercises)
    .innerJoin(planWorkouts, eq(planWorkouts.id, planExercises.workoutId))
    .innerJoin(plans, eq(plans.id, planWorkouts.planId))
    .where(and(eq(planExercises.id, planExerciseId), eq(planExercises.isActive, true), eq(plans.userId, currentUser.id), eq(plans.status, "active"))).limit(1);
  if (!owned[0]) throw new Error("Exercise not found in your active plan.");
  await db.update(planExercises).set({ isActive: false }).where(eq(planExercises.id, planExerciseId));
  revalidatePath("/app/plan");
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
  const session = await db.transaction(async (tx) => {
    const prescription = await tx.select({
      planExerciseId: planExercises.id,
      exerciseId: planExercises.exerciseId,
      exerciseName: exercises.name,
      exerciseSlug: exercises.slug,
      equipment: exercises.equipment,
      sortOrder: planExercises.sortOrder,
      sets: planExercises.sets,
      repMin: planExercises.repMin,
      repMax: planExercises.repMax,
      restSeconds: planExercises.restSeconds,
      targetRir: planExercises.targetRir,
      programmingNotes: planExercises.notes,
      userNotes: planExercises.userNotes,
      videoUrl: sql<string | null>`coalesce(${planExercises.videoUrlOverride}, ${exercises.videoUrl})`,
      label: planExercises.label,
    }).from(planExercises)
      .innerJoin(exercises, eq(exercises.id, planExercises.exerciseId))
      .where(and(eq(planExercises.workoutId, workoutId), eq(planExercises.isActive, true)))
      .orderBy(planExercises.sortOrder);
    if (prescription.length === 0) throw new Error("Add at least one exercise before starting this workout.");
    const [created] = await tx.insert(workoutSessions).values({ userId: currentUser.id, planWorkoutId: workoutId }).returning();
    await tx.insert(workoutSessionExercises).values(prescription.map((exercise) => ({ sessionId: created.id, ...exercise })));
    return created;
  });
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
  const belongsToWorkout = await db.query.workoutSessionExercises.findFirst({
    where: and(eq(workoutSessionExercises.sessionId, data.sessionId), eq(workoutSessionExercises.planExerciseId, data.planExerciseId)),
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
  revalidatePath("/app/progress");
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
