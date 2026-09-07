import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

type ExerciseSeed = {
  slug: string; name: string; movementPattern: string; primaryMuscles: string[]; equipment: string;
  instructions: string[]; cues: string[]; videoUrl?: string;
};
type ProgramExercise = readonly [string, number, number, number, number, number?, string?];
type TemplateSeed = {
  slug: string; title: string; description: string;
  goal: "build_muscle" | "lose_fat" | "get_stronger" | "general_fitness";
  experience: "beginner" | "intermediate" | "advanced";
  dietFit?: "vegan" | "vegetarian" | "omnivore" | "other";
  daysPerWeek: number; durationWeeks: number; isFeatured?: boolean; nutritionNotes: string;
  workouts: Array<{ title: string; focus: string; exercises: ProgramExercise[] }>;
};

const rawExercises: Array<[string, string, string, string[], string, string[], string[]]> = [
  ["goblet-squat", "Goblet squat", "squat", ["quads", "glutes"], "dumbbell", ["Hold one dumbbell at your chest.", "Sit between your hips with your whole foot planted.", "Stand tall by driving the floor away."], ["Knees follow toes", "Ribs stacked", "Control the descent"]],
  ["barbell-back-squat", "Barbell back squat", "squat", ["quads", "glutes", "core"], "barbell and rack", ["Set the bar securely across your upper back.", "Brace, then sit down between your hips.", "Drive through the whole foot to stand."], ["Brace before each rep", "Knees track over toes", "Use safeties"]],
  ["dumbbell-bench-press", "Dumbbell bench press", "horizontal push", ["chest", "triceps"], "dumbbells and bench", ["Set your shoulder blades into the bench.", "Lower the dumbbells beside your chest.", "Press up without bouncing."], ["Wrists stacked", "Feet grounded", "Control the bottom"]],
  ["barbell-bench-press", "Barbell bench press", "horizontal push", ["chest", "triceps", "front delts"], "barbell, bench and rack", ["Plant your feet and set your upper back.", "Lower the bar to your lower chest with control.", "Press the bar up and slightly back."], ["Use a spotter or safeties", "Wrists over elbows", "No bounce"]],
  ["lat-pulldown", "Lat pulldown", "vertical pull", ["lats", "upper back"], "cable machine", ["Grip just outside shoulder width.", "Pull elbows down toward your ribs.", "Return slowly to a full stretch."], ["Chest tall", "No swinging", "Lead with elbows"]],
  ["pull-up", "Pull-up", "vertical pull", ["lats", "upper back", "biceps"], "pull-up bar", ["Begin from a controlled full hang.", "Drive your elbows down as your chest rises.", "Lower smoothly to the start."], ["Avoid kicking", "Keep ribs controlled", "Use assistance if needed"]],
  ["assisted-pull-up", "Assisted pull-up", "vertical pull", ["lats", "upper back"], "assisted pull-up machine", ["Choose enough assistance for smooth reps.", "Pull your chest toward the handles.", "Lower to straight arms under control."], ["Lead with elbows", "Avoid shrugging", "Full comfortable range"]],
  ["dumbbell-romanian-deadlift", "Dumbbell Romanian deadlift", "hinge", ["hamstrings", "glutes"], "dumbbells", ["Hold the dumbbells close to your thighs.", "Push your hips back with soft knees.", "Stand when you feel a strong hamstring stretch."], ["Long spine", "Hips travel back", "Weights stay close"]],
  ["barbell-deadlift", "Barbell deadlift", "hinge", ["glutes", "hamstrings", "back"], "barbell and plates", ["Stand with the bar over mid-foot.", "Brace and take the slack out of the bar.", "Push the floor away and finish tall."], ["Bar stays close", "Do not jerk from the floor", "Reset when position changes"]],
  ["kettlebell-deadlift", "Kettlebell deadlift", "hinge", ["glutes", "hamstrings"], "kettlebell", ["Place the bell between your feet.", "Hinge down and grip with a long spine.", "Stand by pushing the floor away."], ["Brace first", "Arms stay long", "Finish tall"]],
  ["seated-dumbbell-overhead-press", "Seated dumbbell overhead press", "vertical push", ["shoulders", "triceps"], "dumbbells and bench", ["Sit with your back supported.", "Start with wrists over elbows.", "Press overhead and lower under control."], ["Ribs down", "Stay controlled", "Move smoothly"]],
  ["standing-barbell-overhead-press", "Standing barbell overhead press", "vertical push", ["shoulders", "triceps", "core"], "barbell and rack", ["Start with the bar at upper chest height.", "Brace and press overhead in a straight path.", "Lower to the shoulders under control."], ["Squeeze glutes", "Move your head through", "No excessive lean"]],
  ["seated-cable-row", "Seated cable row", "horizontal pull", ["upper back", "lats"], "cable machine", ["Sit tall with arms long.", "Pull the handle toward your lower ribs.", "Reach forward without rounding hard."], ["Shoulders away from ears", "Pause at ribs", "No torso swing"]],
  ["barbell-row", "Barbell row", "horizontal pull", ["upper back", "lats", "biceps"], "barbell", ["Hinge until your torso is stable.", "Row the bar toward your lower ribs.", "Lower until the arms are long."], ["Hold the hinge", "Pull elbows back", "Avoid heaving"]],
  ["chest-supported-dumbbell-row", "Chest-supported dumbbell row", "horizontal pull", ["upper back", "lats"], "dumbbells and incline bench", ["Lie chest-down on a low incline bench.", "Row the dumbbells toward your hips.", "Lower to a comfortable stretch."], ["Keep chest supported", "Pause briefly", "Do not shrug"]],
  ["rear-foot-elevated-split-squat", "Rear-foot-elevated split squat", "single-leg squat", ["quads", "glutes"], "bench and dumbbells", ["Set a comfortable split stance.", "Lower the back knee toward the floor.", "Drive through the front foot to stand."], ["Front foot planted", "Control depth", "Use support if needed"]],
  ["walking-lunge", "Walking lunge", "single-leg squat", ["quads", "glutes"], "dumbbells or bodyweight", ["Step forward into a stable stance.", "Lower both knees with control.", "Push through the front foot into the next step."], ["Stay tall", "Knee follows toes", "Choose stable steps"]],
  ["leg-press", "Leg press", "squat", ["quads", "glutes"], "leg press machine", ["Place feet at a comfortable width.", "Lower until your pelvis is about to tuck.", "Press through the whole foot."], ["Do not lock knees", "Keep hips down", "Use a controlled range"]],
  ["seated-leg-curl", "Seated leg curl", "knee flexion", ["hamstrings"], "leg curl machine", ["Align your knee with the machine pivot.", "Curl the pad down through a comfortable range.", "Return slowly without losing hip contact."], ["Keep hips down", "Pause in the curl", "Control the return"]],
  ["leg-extension", "Leg extension", "knee extension", ["quads"], "leg extension machine", ["Align your knee with the machine pivot.", "Extend the knees without kicking.", "Lower the pad slowly."], ["Use a comfortable range", "Smooth reps", "Keep hips against the pad"]],
  ["hip-thrust", "Hip thrust", "hip extension", ["glutes"], "bench and barbell", ["Set your upper back against the bench.", "Drive hips up until your torso is level.", "Lower under control."], ["Chin tucked", "Shins vertical at top", "Finish with glutes"]],
  ["standing-calf-raise", "Standing calf raise", "plantar flexion", ["calves"], "calf raise machine", ["Stand with the balls of your feet supported.", "Rise as high as you can without bouncing.", "Lower into a comfortable stretch."], ["Pause at the top", "Straight path", "Control the stretch"]],
  ["incline-dumbbell-press", "Incline dumbbell press", "horizontal push", ["upper chest", "triceps"], "dumbbells and incline bench", ["Set a low incline.", "Lower dumbbells beside your upper chest.", "Press up and slightly inward."], ["Shoulders set", "Forearms vertical", "No bounce"]],
  ["push-up", "Push-up", "horizontal push", ["chest", "triceps", "core"], "bodyweight", ["Set hands just outside shoulder width.", "Lower your body as one unit.", "Push the floor away to return."], ["Body stays long", "Elbows at a comfortable angle", "Elevate hands to scale"]],
  ["cable-chest-fly", "Cable chest fly", "chest isolation", ["chest"], "cable machine", ["Take a staggered stance between the cables.", "Bring your hands together in a wide arc.", "Return until you feel a comfortable chest stretch."], ["Soft elbows", "Shoulders stay down", "Use light control"]],
  ["dumbbell-lateral-raise", "Dumbbell lateral raise", "shoulder isolation", ["side delts"], "dumbbells", ["Start with light dumbbells at your sides.", "Raise arms to about shoulder height.", "Lower slowly."], ["Lead with elbows", "No shrug", "Keep reps smooth"]],
  ["face-pull", "Cable face pull", "horizontal pull", ["rear delts", "upper back"], "rope cable", ["Set the cable near eye level.", "Pull the rope toward your face while separating the ends.", "Return with control."], ["Elbows high but comfortable", "Do not lean back", "Finish wide"]],
  ["cable-triceps-pressdown", "Cable triceps pressdown", "elbow extension", ["triceps"], "cable machine", ["Pin your elbows near your sides.", "Extend the elbows until the arms are straight.", "Return without letting the shoulders roll forward."], ["Upper arms stay still", "No torso swing", "Control the return"]],
  ["incline-dumbbell-curl", "Incline dumbbell curl", "elbow flexion", ["biceps"], "dumbbells and incline bench", ["Sit back with arms hanging long.", "Curl without moving your upper arms forward.", "Lower to a comfortable stretch."], ["Keep shoulders back", "No swinging", "Full controlled range"]],
  ["front-plank", "Front plank", "brace", ["core"], "bodyweight", ["Set elbows below shoulders.", "Make a straight line from head to heels.", "Breathe behind a firm brace."], ["Squeeze glutes", "Do not hold your breath", "Stop before form slips"]],
  ["dead-bug", "Dead bug", "anti-extension", ["core"], "bodyweight", ["Lie on your back with hips and knees at 90 degrees.", "Exhale and lower opposite arm and leg.", "Return without your lower back lifting."], ["Move slowly", "Keep breathing", "Shorten range if needed"]],
  ["cable-crunch", "Cable crunch", "trunk flexion", ["core"], "rope cable", ["Kneel facing away from a high cable.", "Bring your ribs toward your pelvis without pulling with the arms.", "Return under control."], ["Hips stay mostly still", "Exhale as you crunch", "Avoid yanking the neck"]],
  ["farmers-carry", "Farmer’s carry", "carry", ["grip", "core", "upper back"], "dumbbells", ["Stand tall with a weight in each hand.", "Walk with short controlled steps.", "Set the weights down safely."], ["Tall posture", "Quiet steps", "Breathe and brace"]],
  ["rowing-ergometer", "Rowing ergometer", "conditioning", ["legs", "back", "cardiovascular"], "rowing machine", ["Drive first with the legs while the arms stay long.", "Finish by drawing the handle toward the lower ribs.", "Recover arms, torso, then knees."], ["Legs then arms", "Smooth recovery", "Use conversational pace unless prescribed"]],
];
const curatedVideoUrls: Record<string, string> = {
  "goblet-squat": "https://www.youtube.com/shorts/3gpXflqRiEc",
  "barbell-back-squat": "https://www.youtube.com/shorts/rrJIyZGlK8c",
  "dumbbell-bench-press": "https://www.youtube.com/shorts/O7ECGhZj_Hc",
  "barbell-bench-press": "https://www.youtube.com/shorts/_FkbD0FhgVE",
  "lat-pulldown": "https://www.youtube.com/shorts/y9C_xyBMgpw",
  "pull-up": "https://www.youtube.com/shorts/ZPG8OsHKXLw",
  "assisted-pull-up": "https://www.youtube.com/shorts/gx0RWT7WbmA",
  "dumbbell-romanian-deadlift": "https://www.youtube.com/shorts/hQgFixeXdZo",
  "barbell-deadlift": "https://www.youtube.com/shorts/AweC3UaM14o",
  "kettlebell-deadlift": "https://www.youtube.com/shorts/l6gDwf3xC6s",
  "seated-dumbbell-overhead-press": "https://www.youtube.com/shorts/qEwKCR5JCog",
  "standing-barbell-overhead-press": "https://www.youtube.com/shorts/G2qpTG1Eh40",
  "seated-cable-row": "https://www.youtube.com/shorts/xQNrFHEMhI4",
  "barbell-row": "https://www.youtube.com/shorts/FWJR5Ve8bnQ",
  "chest-supported-dumbbell-row": "https://www.youtube.com/shorts/nl2MnK1i504",
  "rear-foot-elevated-split-squat": "https://www.youtube.com/shorts/vgn7bSXkgkA",
  "walking-lunge": "https://www.youtube.com/shorts/L8fvypPrzzs",
  "leg-press": "https://www.youtube.com/shorts/8EMbB0tCn7Q",
  "seated-leg-curl": "https://www.youtube.com/shorts/Orxowest56U",
  "leg-extension": "https://www.youtube.com/shorts/m0FOpMEgero",
  "hip-thrust": "https://www.youtube.com/shorts/-1cAnwFNBLg",
  "standing-calf-raise": "https://www.youtube.com/shorts/eMTy3qylqnE",
  "incline-dumbbell-press": "https://www.youtube.com/shorts/IP4oeKh1Sd4",
  "push-up": "https://www.youtube.com/shorts/UIcct-7b6oE",
  "cable-chest-fly": "https://www.youtube.com/shorts/8wAvRidL0PQ",
  "dumbbell-lateral-raise": "https://www.youtube.com/shorts/XPPfnSEATJA",
  "face-pull": "https://www.youtube.com/shorts/V8dZ3pyiCBo",
  "cable-triceps-pressdown": "https://www.youtube.com/shorts/2-LAMcpzODU",
  "incline-dumbbell-curl": "https://www.youtube.com/shorts/soxrZlIl35U",
  "front-plank": "https://www.youtube.com/shorts/pSHjTRCQxIw",
  "dead-bug": "https://www.youtube.com/shorts/g_BYB0R-4Ws",
  "cable-crunch": "https://www.youtube.com/shorts/ToJeyhydUxU",
  "farmers-carry": "https://www.youtube.com/shorts/p5MNNosenJc",
  "rowing-ergometer": "https://www.youtube.com/shorts/4zWu1yuJ0_g",
};
const exerciseSeed: ExerciseSeed[] = rawExercises.map(([slug, name, movementPattern, primaryMuscles, equipment, instructions, cues]) => ({
  slug,
  name,
  movementPattern,
  primaryMuscles,
  equipment,
  instructions,
  cues,
  videoUrl: curatedVideoUrls[slug],
}));

const templates: TemplateSeed[] = [
  {
    slug: "minimalist-full-body-2-day", title: "Minimalist Full Body — 2 Days", daysPerWeek: 2, durationWeeks: 8,
    description: "Two efficient full-body sessions for busy beginners. Every major pattern is trained twice weekly without marathon workouts.",
    goal: "general_fitness", experience: "beginner", nutritionNotes: "Use a consistent meal pattern and aim for a protein-rich food at each meal. Adjust calories from your measured trend, not a single weigh-in.",
    workouts: [
      { title: "Full Body A", focus: "Squat, push, pull and hinge", exercises: [["goblet-squat",3,8,12,120], ["dumbbell-bench-press",3,8,12,120], ["lat-pulldown",3,8,12,120], ["dumbbell-romanian-deadlift",3,8,12,120], ["dumbbell-lateral-raise",2,12,20,75], ["front-plank",3,20,40,60,3,"Reps represent seconds."]] },
      { title: "Full Body B", focus: "Legs, shoulders, back and arms", exercises: [["leg-press",3,10,15,120], ["seated-dumbbell-overhead-press",3,8,12,120], ["seated-cable-row",3,8,12,120], ["rear-foot-elevated-split-squat",2,8,12,90], ["cable-triceps-pressdown",2,10,15,75], ["incline-dumbbell-curl",2,10,15,75]] },
    ],
  },
  {
    slug: "beginner-vegan-muscle-gain-3-day", title: "Beginner Vegan Muscle Gain — 3 Days", daysPerWeek: 3, durationWeeks: 8, isFeatured: true, dietFit: "vegan",
    description: "An approachable full-body plan built around progressive overload, good technique, and recoverable weekly volume.",
    goal: "build_muscle", experience: "beginner", nutritionNotes: "Start near maintenance plus 200–300 kcal. Aim for roughly 1.6–2.0 g protein/kg/day from varied vegan foods, spread across 3–5 meals.",
    workouts: [
      { title: "Foundation A", focus: "Squat, push and hinge", exercises: [["goblet-squat",3,8,12,90], ["dumbbell-bench-press",3,8,12,90], ["lat-pulldown",3,8,12,90], ["dumbbell-romanian-deadlift",3,8,12,120], ["front-plank",3,20,40,60,3,"Reps represent seconds."]] },
      { title: "Foundation B", focus: "Hinge, shoulders and single-leg strength", exercises: [["kettlebell-deadlift",3,6,10,120], ["seated-dumbbell-overhead-press",3,8,12,90], ["seated-cable-row",3,8,12,90], ["rear-foot-elevated-split-squat",3,8,10,90], ["dead-bug",3,6,10,60]] },
      { title: "Foundation C", focus: "Legs, upper body and work capacity", exercises: [["leg-press",3,10,15,120], ["incline-dumbbell-press",3,8,12,90], ["assisted-pull-up",3,6,10,120], ["hip-thrust",3,8,12,120], ["dumbbell-lateral-raise",2,12,20,60], ["farmers-carry",3,30,45,75,3,"Reps represent seconds."]] },
    ],
  },
  {
    slug: "strength-foundations-3-day", title: "Strength Foundations — 3 Days", daysPerWeek: 3, durationWeeks: 10,
    description: "A three-day introduction to barbell strength with skill practice, patient loading and balanced assistance work.",
    goal: "get_stronger", experience: "beginner", nutritionNotes: "Eat enough to recover, keep protein consistent, and avoid an aggressive calorie deficit while learning the main lifts.",
    workouts: [
      { title: "Squat + Bench", focus: "Primary strength practice", exercises: [["barbell-back-squat",3,4,6,180,3], ["barbell-bench-press",3,4,6,180,3], ["chest-supported-dumbbell-row",3,8,12,120], ["seated-leg-curl",2,10,15,90], ["front-plank",3,25,45,60,3,"Reps represent seconds."]] },
      { title: "Deadlift + Press", focus: "Hinge and overhead strength", exercises: [["barbell-deadlift",3,3,5,210,3], ["standing-barbell-overhead-press",3,5,8,180,3], ["lat-pulldown",3,8,12,120], ["walking-lunge",2,8,12,90], ["cable-crunch",3,10,15,75]] },
      { title: "Volume Practice", focus: "Technique volume across the main patterns", exercises: [["barbell-back-squat",3,6,8,150,3], ["barbell-bench-press",3,6,8,150,3], ["seated-cable-row",3,8,12,120], ["hip-thrust",3,8,12,120], ["face-pull",2,12,20,75]] },
    ],
  },
  {
    slug: "upper-lower-builder-4-day", title: "Upper / Lower Builder — 4 Days", daysPerWeek: 4, durationWeeks: 10,
    description: "A balanced four-day split for intermediate muscle gain, with two exposures per week for every major muscle group.",
    goal: "build_muscle", experience: "intermediate", nutritionNotes: "For muscle gain, use a small sustainable surplus and distribute daily protein over several meals. Increase food only when the multi-week trend stalls.",
    workouts: [
      { title: "Upper A", focus: "Horizontal push and pull", exercises: [["barbell-bench-press",3,5,8,150], ["chest-supported-dumbbell-row",3,6,10,120], ["incline-dumbbell-press",3,8,12,120], ["lat-pulldown",3,8,12,120], ["dumbbell-lateral-raise",3,12,20,75], ["cable-triceps-pressdown",2,10,15,75]] },
      { title: "Lower A", focus: "Squat and posterior chain", exercises: [["barbell-back-squat",3,5,8,180], ["dumbbell-romanian-deadlift",3,8,12,150], ["leg-press",3,10,15,120], ["seated-leg-curl",3,10,15,90], ["standing-calf-raise",3,10,15,75], ["dead-bug",3,8,12,60]] },
      { title: "Upper B", focus: "Vertical push and pull", exercises: [["standing-barbell-overhead-press",3,5,8,150], ["pull-up",3,5,10,150], ["dumbbell-bench-press",3,8,12,120], ["seated-cable-row",3,8,12,120], ["face-pull",2,12,20,75], ["incline-dumbbell-curl",2,10,15,75]] },
      { title: "Lower B", focus: "Hinge and unilateral legs", exercises: [["barbell-deadlift",3,3,6,210,3], ["rear-foot-elevated-split-squat",3,8,12,120], ["hip-thrust",3,8,12,120], ["leg-extension",3,10,15,90], ["standing-calf-raise",3,12,20,75], ["front-plank",3,30,50,60,3,"Reps represent seconds."]] },
    ],
  },
  {
    slug: "strength-athletic-5-day", title: "Strength + Athletic — 5 Days", daysPerWeek: 5, durationWeeks: 8,
    description: "Four focused lifting days plus one adjustable conditioning and carry session for well-rounded intermediate fitness.",
    goal: "general_fitness", experience: "intermediate", nutritionNotes: "Fuel harder sessions with carbohydrates, keep protein consistent, and make the conditioning day easier when lower-body recovery is poor.",
    workouts: [
      { title: "Lower Strength", focus: "Squat strength and posterior chain", exercises: [["barbell-back-squat",4,3,6,210,3], ["dumbbell-romanian-deadlift",3,6,10,150], ["leg-press",2,10,15,120], ["seated-leg-curl",3,10,15,90], ["standing-calf-raise",3,10,15,75]] },
      { title: "Upper Strength", focus: "Press and pull strength", exercises: [["barbell-bench-press",4,3,6,210,3], ["barbell-row",3,6,10,150], ["standing-barbell-overhead-press",3,5,8,150], ["pull-up",3,5,10,150], ["face-pull",2,12,20,75]] },
      { title: "Engine + Core", focus: "Low-impact conditioning, carries and trunk", exercises: [["rowing-ergometer",6,45,60,75,3,"Reps represent work seconds. Keep technique crisp; this is not an all-out test."], ["farmers-carry",4,30,45,75,3,"Reps represent seconds."], ["dead-bug",3,8,12,60], ["cable-crunch",3,10,15,75]] },
      { title: "Lower Builder", focus: "Unilateral legs and hip extension", exercises: [["barbell-deadlift",3,3,5,210,3], ["rear-foot-elevated-split-squat",3,8,12,120], ["hip-thrust",3,8,12,120], ["leg-extension",3,10,15,90], ["seated-leg-curl",3,10,15,90]] },
      { title: "Upper Builder", focus: "Upper-body hypertrophy", exercises: [["incline-dumbbell-press",3,8,12,120], ["lat-pulldown",3,8,12,120], ["seated-dumbbell-overhead-press",3,8,12,120], ["chest-supported-dumbbell-row",3,8,12,120], ["dumbbell-lateral-raise",3,12,20,75], ["cable-triceps-pressdown",2,10,15,75], ["incline-dumbbell-curl",2,10,15,75]] },
    ],
  },
  {
    slug: "push-pull-legs-6-day", title: "Push / Pull / Legs — 6 Days", daysPerWeek: 6, durationWeeks: 8,
    description: "A higher-frequency intermediate hypertrophy split with compact sessions, repeat exposures and one intentionally lighter leg day.",
    goal: "build_muscle", experience: "intermediate", nutritionNotes: "Six days demands reliable sleep and adequate energy. If performance falls for two sessions, reduce a set or use the sixth day as recovery.",
    workouts: [
      { title: "Push A", focus: "Chest-led pressing", exercises: [["barbell-bench-press",3,5,8,150], ["incline-dumbbell-press",3,8,12,120], ["seated-dumbbell-overhead-press",2,8,12,120], ["dumbbell-lateral-raise",3,12,20,75], ["cable-triceps-pressdown",3,10,15,75]] },
      { title: "Pull A", focus: "Vertical pull and upper back", exercises: [["pull-up",3,5,10,150], ["chest-supported-dumbbell-row",3,8,12,120], ["lat-pulldown",2,10,15,105], ["face-pull",3,12,20,75], ["incline-dumbbell-curl",3,10,15,75]] },
      { title: "Legs A", focus: "Squat-led legs", exercises: [["barbell-back-squat",3,5,8,180], ["dumbbell-romanian-deadlift",3,8,12,150], ["leg-press",2,10,15,120], ["seated-leg-curl",3,10,15,90], ["standing-calf-raise",3,10,15,75]] },
      { title: "Push B", focus: "Shoulder-led pressing", exercises: [["standing-barbell-overhead-press",3,5,8,150], ["dumbbell-bench-press",3,8,12,120], ["cable-chest-fly",2,10,15,90], ["dumbbell-lateral-raise",3,12,20,75], ["cable-triceps-pressdown",3,10,15,75]] },
      { title: "Pull B", focus: "Rows, lats and biceps", exercises: [["barbell-row",3,6,10,150], ["lat-pulldown",3,8,12,120], ["seated-cable-row",2,10,15,105], ["face-pull",2,12,20,75], ["incline-dumbbell-curl",3,10,15,75]] },
      { title: "Legs B", focus: "Hinge and single-leg technique", exercises: [["barbell-deadlift",2,3,5,210,3,"Keep this exposure crisp; stop well before grinding."], ["rear-foot-elevated-split-squat",3,8,12,120], ["hip-thrust",3,8,12,120], ["leg-extension",2,12,15,90], ["standing-calf-raise",3,12,20,75], ["dead-bug",3,8,12,60]] },
    ],
  },
];

async function main() {
  const { db, sqlClient } = await import("./index");
  const { exercises, planTemplates, templateExercises, templateWorkouts } = await import("./schema");
  await db.transaction(async (tx) => {
    const exerciseIds = new Map<string, string>();
    for (const item of exerciseSeed) {
      const [row] = await tx.insert(exercises).values(item).onConflictDoUpdate({ target: exercises.slug, set: { ...item, updatedAt: new Date() } }).returning({ id: exercises.id, slug: exercises.slug });
      exerciseIds.set(row.slug, row.id);
    }
    for (const item of templates) {
      const existing = await tx.query.planTemplates.findFirst({ where: eq(planTemplates.slug, item.slug) });
      const values = { slug: item.slug, title: item.title, description: item.description, goal: item.goal, experience: item.experience, dietFit: item.dietFit ?? null, daysPerWeek: item.daysPerWeek, durationWeeks: item.durationWeeks, isFeatured: item.isFeatured ?? false, nutritionNotes: item.nutritionNotes };
      const [template] = existing
        ? await tx.update(planTemplates).set({ ...values, updatedAt: new Date() }).where(eq(planTemplates.id, existing.id)).returning()
        : await tx.insert(planTemplates).values(values).returning();
      await tx.delete(templateWorkouts).where(eq(templateWorkouts.templateId, template.id));
      for (const [dayIndex, workout] of item.workouts.entries()) {
        const [workoutRow] = await tx.insert(templateWorkouts).values({ templateId: template.id, dayNumber: dayIndex + 1, title: workout.title, focus: workout.focus }).returning();
        await tx.insert(templateExercises).values(workout.exercises.map(([slug, sets, repMin, repMax, restSeconds, targetRir = 2, notes], index) => ({ workoutId: workoutRow.id, exerciseId: exerciseIds.get(slug)!, sortOrder: index + 1, sets, repMin, repMax, restSeconds, targetRir, notes: notes ?? null })));
      }
    }
  });
  console.log(`Seeded ${templates.length} plans and ${exerciseSeed.length} exercises.`);
  await sqlClient.end();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
