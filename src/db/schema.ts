import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// Better Auth core tables. Export names intentionally match Better Auth models.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_issuer_account_idx").on(table.issuer, table.accountId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const goalEnum = pgEnum("fitness_goal", [
  "build_muscle",
  "lose_fat",
  "get_stronger",
  "general_fitness",
]);
export const experienceEnum = pgEnum("experience_level", ["beginner", "intermediate", "advanced"]);
export const dietEnum = pgEnum("diet_type", ["vegan", "vegetarian", "omnivore", "other"]);
export const sexEnum = pgEnum("sex_at_birth", ["male", "female", "intersex", "prefer_not_to_say"]);
export const planStatusEnum = pgEnum("plan_status", ["active", "paused", "archived"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

export type OnboardingAnswers = {
  equipment: string[];
  limitations: string;
  preferredDays: string[];
  sessionMinutes: number;
  activityLevel: string;
  sleepHours: number;
  stressLevel: number;
  medicalClearanceNeeded: boolean;
  selectedPlanSlug?: string;
};

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  birthDate: date("birth_date"),
  sexAtBirth: sexEnum("sex_at_birth"),
  genderIdentity: text("gender_identity"),
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
  currentWeightKg: numeric("current_weight_kg", { precision: 5, scale: 1 }),
  targetWeightKg: numeric("target_weight_kg", { precision: 5, scale: 1 }),
  goal: goalEnum("goal"),
  experience: experienceEnum("experience"),
  diet: dietEnum("diet"),
  daysPerWeek: integer("days_per_week"),
  calorieTarget: integer("calorie_target"),
  proteinTargetG: integer("protein_target_g"),
  timezone: text("timezone").default("UTC").notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  safetyFlag: boolean("safety_flag").default(false).notNull(),
  answers: jsonb("answers").$type<OnboardingAnswers>(),
  ...timestamps,
});

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    movementPattern: text("movement_pattern").notNull(),
    primaryMuscles: text("primary_muscles").array().notNull(),
    equipment: text("equipment").notNull(),
    instructions: text("instructions").array().notNull(),
    cues: text("cues").array().notNull(),
    videoUrl: text("video_url"),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("exercise_created_by_user_idx").on(table.createdByUserId)],
);

export const exerciseSubstitutions = pgTable(
  "exercise_substitutions",
  {
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    substituteId: uuid("substitute_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    reason: text("reason"),
  },
  (table) => [primaryKey({ columns: [table.exerciseId, table.substituteId] })],
);

export const planTemplates = pgTable("plan_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goal: goalEnum("goal").notNull(),
  experience: experienceEnum("experience").notNull(),
  dietFit: dietEnum("diet_fit"),
  daysPerWeek: integer("days_per_week").notNull(),
  durationWeeks: integer("duration_weeks").default(8).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  nutritionNotes: text("nutrition_notes"),
  ...timestamps,
});

export const templateWorkouts = pgTable(
  "template_workouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => planTemplates.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    focus: text("focus").notNull(),
  },
  (table) => [
    uniqueIndex("template_workout_day_idx").on(table.templateId, table.dayNumber),
    index("template_workout_template_idx").on(table.templateId),
  ],
);

export const templateExercises = pgTable(
  "template_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => templateWorkouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    sortOrder: integer("sort_order").notNull(),
    sets: integer("sets").notNull(),
    repMin: integer("rep_min").notNull(),
    repMax: integer("rep_max").notNull(),
    restSeconds: integer("rest_seconds").notNull(),
    targetRir: integer("target_rir").default(2).notNull(),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("template_exercise_order_idx").on(table.workoutId, table.sortOrder),
    index("template_exercise_exercise_idx").on(table.exerciseId),
  ],
);

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sourceTemplateId: uuid("source_template_id").references(() => planTemplates.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    goal: goalEnum("goal").notNull(),
    status: planStatusEnum("status").default("active").notNull(),
    daysPerWeek: integer("days_per_week").notNull(),
    durationWeeks: integer("duration_weeks").notNull(),
    ...timestamps,
  },
  (table) => [index("plans_user_status_idx").on(table.userId, table.status)],
);

export const planWorkouts = pgTable(
  "plan_workouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    focus: text("focus").notNull(),
    label: text("label"),
  },
  (table) => [
    uniqueIndex("plan_workout_day_idx").on(table.planId, table.dayNumber),
    index("plan_workout_plan_idx").on(table.planId),
  ],
);

export const planExercises = pgTable(
  "plan_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => planWorkouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    sortOrder: integer("sort_order").notNull(),
    sets: integer("sets").notNull(),
    repMin: integer("rep_min").notNull(),
    repMax: integer("rep_max").notNull(),
    restSeconds: integer("rest_seconds").notNull(),
    targetRir: integer("target_rir").default(2).notNull(),
    notes: text("notes"),
    userNotes: text("user_notes"),
    videoUrlOverride: text("video_url_override"),
    label: text("label"),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    uniqueIndex("plan_exercise_order_idx").on(table.workoutId, table.sortOrder),
    index("plan_exercise_exercise_idx").on(table.exerciseId),
  ],
);

export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planWorkoutId: uuid("plan_workout_id")
      .notNull()
      .references(() => planWorkouts.id),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    perceivedEffort: integer("perceived_effort"),
    notes: text("notes"),
  },
  (table) => [index("workout_session_user_started_idx").on(table.userId, table.startedAt)],
);

export const workoutSessionExercises = pgTable(
  "workout_session_exercises",
  {
    sessionId: uuid("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    planExerciseId: uuid("plan_exercise_id")
      .notNull()
      .references(() => planExercises.id),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    exerciseName: text("exercise_name").notNull(),
    exerciseSlug: text("exercise_slug").notNull(),
    equipment: text("equipment").notNull(),
    sortOrder: integer("sort_order").notNull(),
    sets: integer("sets").notNull(),
    repMin: integer("rep_min").notNull(),
    repMax: integer("rep_max").notNull(),
    restSeconds: integer("rest_seconds").notNull(),
    targetRir: integer("target_rir").notNull(),
    programmingNotes: text("programming_notes"),
    userNotes: text("user_notes"),
    videoUrl: text("video_url"),
    label: text("label"),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.planExerciseId] }),
    index("workout_session_exercise_exercise_idx").on(table.exerciseId),
    index("workout_session_exercise_plan_exercise_idx").on(table.planExerciseId),
  ],
);

export const setLogs = pgTable(
  "set_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    planExerciseId: uuid("plan_exercise_id")
      .notNull()
      .references(() => planExercises.id),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps").notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }).default("0").notNull(),
    rir: integer("rir"),
    completed: boolean("completed").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("set_log_unique_set_idx").on(table.sessionId, table.planExerciseId, table.setNumber),
    index("set_log_plan_exercise_idx").on(table.planExerciseId),
  ],
);

export const measurements = pgTable(
  "measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    measuredOn: date("measured_on").notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 1 }).notNull(),
    waistCm: numeric("waist_cm", { precision: 5, scale: 1 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("measurement_user_date_idx").on(table.userId, table.measuredOn)],
);

export const dailyCheckins = pgTable(
  "daily_checkins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    checkedOn: date("checked_on").notNull(),
    sleepHours: numeric("sleep_hours", { precision: 3, scale: 1 }),
    energy: integer("energy"),
    soreness: integer("soreness"),
    steps: integer("steps"),
    calories: integer("calories"),
    proteinG: integer("protein_g"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("checkin_user_date_idx").on(table.userId, table.checkedOn)],
);

export const coachMessages = pgTable(
  "coach_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("coach_message_user_created_idx").on(table.userId, table.createdAt)],
);
