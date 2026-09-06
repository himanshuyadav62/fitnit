import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

async function main() {
  const { db, sqlClient } = await import("./index");
  const {
    exercises,
    planTemplates,
    templateExercises,
    templateWorkouts,
  } = await import("./schema");

const exerciseSeed = [
  {
    slug: "goblet-squat",
    name: "Goblet squat",
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    equipment: "dumbbell",
    instructions: ["Hold one dumbbell at your chest.", "Sit between your hips with your whole foot planted.", "Stand tall by driving the floor away."],
    cues: ["Knees follow toes", "Ribs stacked", "Control the descent"],
  },
  {
    slug: "dumbbell-bench-press",
    name: "Dumbbell bench press",
    movementPattern: "horizontal push",
    primaryMuscles: ["chest", "triceps"],
    equipment: "dumbbells and bench",
    instructions: ["Set your shoulder blades into the bench.", "Lower the dumbbells beside your chest.", "Press up without bouncing."],
    cues: ["Wrists stacked", "Feet grounded", "Leave 1–3 reps in reserve"],
  },
  {
    slug: "lat-pulldown",
    name: "Lat pulldown",
    movementPattern: "vertical pull",
    primaryMuscles: ["lats", "upper back"],
    equipment: "cable machine",
    instructions: ["Grip just outside shoulder width.", "Pull elbows down toward your ribs.", "Return slowly to a full stretch."],
    cues: ["Chest tall", "No swinging", "Lead with elbows"],
  },
  {
    slug: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian deadlift",
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    equipment: "dumbbells",
    instructions: ["Hold the dumbbells close to your thighs.", "Push your hips back with soft knees.", "Stand when you feel a strong hamstring stretch."],
    cues: ["Long spine", "Hips travel back", "Weights stay close"],
  },
  {
    slug: "front-plank",
    name: "Front plank",
    movementPattern: "brace",
    primaryMuscles: ["core"],
    equipment: "bodyweight",
    instructions: ["Set elbows below shoulders.", "Make a straight line from head to heels.", "Breathe behind a firm brace."],
    cues: ["Squeeze glutes", "Do not hold your breath", "Stop before form slips"],
  },
  {
    slug: "kettlebell-deadlift",
    name: "Kettlebell deadlift",
    movementPattern: "hinge",
    primaryMuscles: ["glutes", "hamstrings"],
    equipment: "kettlebell",
    instructions: ["Place the bell between your feet.", "Hinge down and grip with a long spine.", "Stand by pushing the floor away."],
    cues: ["Brace first", "Arms stay long", "Finish tall"],
  },
  {
    slug: "seated-dumbbell-overhead-press",
    name: "Seated dumbbell overhead press",
    movementPattern: "vertical push",
    primaryMuscles: ["shoulders", "triceps"],
    equipment: "dumbbells and bench",
    instructions: ["Sit with your back supported.", "Start with wrists over elbows.", "Press overhead and lower under control."],
    cues: ["Ribs down", "No hard lockout", "Move smoothly"],
  },
  {
    slug: "seated-cable-row",
    name: "Seated cable row",
    movementPattern: "horizontal pull",
    primaryMuscles: ["upper back", "lats"],
    equipment: "cable machine",
    instructions: ["Sit tall with arms long.", "Pull the handle toward your lower ribs.", "Reach forward without rounding hard."],
    cues: ["Shoulders away from ears", "Pause at ribs", "No torso swing"],
  },
  {
    slug: "rear-foot-elevated-split-squat",
    name: "Rear-foot-elevated split squat",
    movementPattern: "single-leg squat",
    primaryMuscles: ["quads", "glutes"],
    equipment: "bench and dumbbells",
    instructions: ["Set a comfortable split stance.", "Lower the back knee toward the floor.", "Drive through the front foot to stand."],
    cues: ["Front foot planted", "Control depth", "Use support if needed"],
  },
  {
    slug: "dead-bug",
    name: "Dead bug",
    movementPattern: "anti-extension",
    primaryMuscles: ["core"],
    equipment: "bodyweight",
    instructions: ["Lie on your back with hips and knees at 90 degrees.", "Exhale and lower opposite arm and leg.", "Return without your lower back lifting."],
    cues: ["Move slowly", "Keep breathing", "Shorten range if needed"],
  },
  {
    slug: "leg-press",
    name: "Leg press",
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    equipment: "leg press machine",
    instructions: ["Place feet at a comfortable width.", "Lower until your pelvis is about to tuck.", "Press through the whole foot."],
    cues: ["Do not lock knees", "Keep hips down", "Use a controlled range"],
  },
  {
    slug: "incline-dumbbell-press",
    name: "Incline dumbbell press",
    movementPattern: "horizontal push",
    primaryMuscles: ["upper chest", "triceps"],
    equipment: "dumbbells and incline bench",
    instructions: ["Set a low incline.", "Lower dumbbells beside your upper chest.", "Press up and slightly inward."],
    cues: ["Shoulders set", "Forearms vertical", "No bounce"],
  },
  {
    slug: "assisted-pull-up",
    name: "Assisted pull-up",
    movementPattern: "vertical pull",
    primaryMuscles: ["lats", "upper back"],
    equipment: "assisted pull-up machine",
    instructions: ["Choose enough assistance for smooth reps.", "Pull your chest toward the handles.", "Lower to straight arms under control."],
    cues: ["Lead with elbows", "Avoid shrugging", "Full comfortable range"],
  },
  {
    slug: "hip-thrust",
    name: "Hip thrust",
    movementPattern: "hip extension",
    primaryMuscles: ["glutes"],
    equipment: "bench and barbell",
    instructions: ["Set your upper back against the bench.", "Drive hips up until your torso is level.", "Lower under control."],
    cues: ["Chin tucked", "Shins vertical at top", "Finish with glutes"],
  },
  {
    slug: "dumbbell-lateral-raise",
    name: "Dumbbell lateral raise",
    movementPattern: "isolation",
    primaryMuscles: ["side delts"],
    equipment: "dumbbells",
    instructions: ["Start with light dumbbells at your sides.", "Raise arms to about shoulder height.", "Lower slowly."],
    cues: ["Lead with elbows", "No shrug", "Keep reps smooth"],
  },
  {
    slug: "farmers-carry",
    name: "Farmer’s carry",
    movementPattern: "carry",
    primaryMuscles: ["grip", "core", "upper back"],
    equipment: "dumbbells",
    instructions: ["Stand tall with a weight in each hand.", "Walk with short controlled steps.", "Set the weights down safely."],
    cues: ["Tall posture", "Quiet steps", "Breathe and brace"],
  },
] as const;

const programming = [
  {
    dayNumber: 1,
    title: "Foundation A",
    focus: "Squat, push and hinge",
    exercises: [
      ["goblet-squat", 3, 8, 12, 90],
      ["dumbbell-bench-press", 3, 8, 12, 90],
      ["lat-pulldown", 3, 8, 12, 90],
      ["dumbbell-romanian-deadlift", 3, 8, 12, 120],
      ["front-plank", 3, 20, 40, 60],
    ],
  },
  {
    dayNumber: 2,
    title: "Foundation B",
    focus: "Hinge, shoulders and single-leg strength",
    exercises: [
      ["kettlebell-deadlift", 3, 6, 10, 120],
      ["seated-dumbbell-overhead-press", 3, 8, 12, 90],
      ["seated-cable-row", 3, 8, 12, 90],
      ["rear-foot-elevated-split-squat", 3, 8, 10, 90],
      ["dead-bug", 3, 6, 10, 60],
    ],
  },
  {
    dayNumber: 3,
    title: "Foundation C",
    focus: "Legs, upper body and work capacity",
    exercises: [
      ["leg-press", 3, 10, 15, 120],
      ["incline-dumbbell-press", 3, 8, 12, 90],
      ["assisted-pull-up", 3, 6, 10, 120],
      ["hip-thrust", 3, 8, 12, 120],
      ["dumbbell-lateral-raise", 2, 12, 20, 60],
      ["farmers-carry", 3, 30, 45, 75],
    ],
  },
] as const;

  await db.transaction(async (tx) => {
  const exerciseIds = new Map<string, string>();
  for (const item of exerciseSeed) {
    const [row] = await tx
      .insert(exercises)
      .values({
        slug: item.slug,
        name: item.name,
        movementPattern: item.movementPattern,
        primaryMuscles: [...item.primaryMuscles],
        equipment: item.equipment,
        instructions: [...item.instructions],
        cues: [...item.cues],
      })
      .onConflictDoUpdate({
        target: exercises.slug,
        set: {
          name: item.name,
          movementPattern: item.movementPattern,
          primaryMuscles: [...item.primaryMuscles],
          equipment: item.equipment,
          instructions: [...item.instructions],
          cues: [...item.cues],
          updatedAt: new Date(),
        },
      })
      .returning({ id: exercises.id, slug: exercises.slug });
    exerciseIds.set(row.slug, row.id);
  }

  const existing = await tx.query.planTemplates.findFirst({
    where: eq(planTemplates.slug, "beginner-vegan-muscle-gain-3-day"),
  });

  const [template] = existing
    ? await tx
        .update(planTemplates)
        .set({
          title: "Beginner Vegan Muscle Gain — 3 Days",
          description: "An approachable full-body plan built around progressive overload, good technique, and recovery.",
          goal: "build_muscle",
          experience: "beginner",
          dietFit: "vegan",
          daysPerWeek: 3,
          durationWeeks: 8,
          isFeatured: true,
          nutritionNotes: "Start near maintenance plus 200–300 kcal. Aim for roughly 1.6–2.0 g protein/kg/day from varied vegan foods, spread across 3–5 meals.",
          updatedAt: new Date(),
        })
        .where(eq(planTemplates.id, existing.id))
        .returning()
    : await tx
        .insert(planTemplates)
        .values({
          slug: "beginner-vegan-muscle-gain-3-day",
          title: "Beginner Vegan Muscle Gain — 3 Days",
          description: "An approachable full-body plan built around progressive overload, good technique, and recovery.",
          goal: "build_muscle",
          experience: "beginner",
          dietFit: "vegan",
          daysPerWeek: 3,
          durationWeeks: 8,
          isFeatured: true,
          nutritionNotes: "Start near maintenance plus 200–300 kcal. Aim for roughly 1.6–2.0 g protein/kg/day from varied vegan foods, spread across 3–5 meals.",
        })
        .returning();

  if (existing) {
    await tx.delete(templateWorkouts).where(eq(templateWorkouts.templateId, template.id));
  }

  for (const workout of programming) {
    const [workoutRow] = await tx
      .insert(templateWorkouts)
      .values({
        templateId: template.id,
        dayNumber: workout.dayNumber,
        title: workout.title,
        focus: workout.focus,
      })
      .returning();

    await tx.insert(templateExercises).values(
      workout.exercises.map(([slug, sets, repMin, repMax, restSeconds], index) => ({
        workoutId: workoutRow.id,
        exerciseId: exerciseIds.get(slug)!,
        sortOrder: index + 1,
        sets,
        repMin,
        repMax,
        restSeconds,
        targetRir: 2,
        notes: slug === "farmers-carry" ? "Reps represent seconds." : null,
      })),
    );
  }
  });

  console.log("Seeded the featured vegan starter plan and exercise library.");
  await sqlClient.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
