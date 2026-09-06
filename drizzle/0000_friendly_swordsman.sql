CREATE TYPE "public"."diet_type" AS ENUM('vegan', 'vegetarian', 'omnivore', 'other');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."fitness_goal" AS ENUM('build_muscle', 'lose_fat', 'get_stronger', 'general_fitness');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."sex_at_birth" AS ENUM('male', 'female', 'intersex', 'prefer_not_to_say');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"checked_on" date NOT NULL,
	"sleep_hours" numeric(3, 1),
	"energy" integer,
	"soreness" integer,
	"steps" integer,
	"calories" integer,
	"protein_g" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_substitutions" (
	"exercise_id" uuid NOT NULL,
	"substitute_id" uuid NOT NULL,
	"reason" text,
	CONSTRAINT "exercise_substitutions_exercise_id_substitute_id_pk" PRIMARY KEY("exercise_id","substitute_id")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"movement_pattern" text NOT NULL,
	"primary_muscles" text[] NOT NULL,
	"equipment" text NOT NULL,
	"instructions" text[] NOT NULL,
	"cues" text[] NOT NULL,
	"video_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"measured_on" date NOT NULL,
	"weight_kg" numeric(5, 1) NOT NULL,
	"waist_cm" numeric(5, 1),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"sets" integer NOT NULL,
	"rep_min" integer NOT NULL,
	"rep_max" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"target_rir" integer DEFAULT 2 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "plan_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"goal" "fitness_goal" NOT NULL,
	"experience" "experience_level" NOT NULL,
	"diet_fit" "diet_type",
	"days_per_week" integer NOT NULL,
	"duration_weeks" integer DEFAULT 8 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"nutrition_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "plan_workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"title" text NOT NULL,
	"focus" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_template_id" uuid,
	"name" text NOT NULL,
	"goal" "fitness_goal" NOT NULL,
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"days_per_week" integer NOT NULL,
	"duration_weeks" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"birth_date" date,
	"sex_at_birth" "sex_at_birth",
	"gender_identity" text,
	"height_cm" numeric(5, 1),
	"current_weight_kg" numeric(5, 1),
	"target_weight_kg" numeric(5, 1),
	"goal" "fitness_goal",
	"experience" "experience_level",
	"diet" "diet_type",
	"days_per_week" integer,
	"calorie_target" integer,
	"protein_target_g" integer,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"safety_flag" boolean DEFAULT false NOT NULL,
	"answers" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "set_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"plan_exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer NOT NULL,
	"weight_kg" numeric(6, 2) DEFAULT '0' NOT NULL,
	"rir" integer,
	"completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"sets" integer NOT NULL,
	"rep_min" integer NOT NULL,
	"rep_max" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"target_rir" integer DEFAULT 2 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "template_workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"title" text NOT NULL,
	"focus" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_workout_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"perceived_effort" integer,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_substitutions" ADD CONSTRAINT "exercise_substitutions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_substitutions" ADD CONSTRAINT "exercise_substitutions_substitute_id_exercises_id_fk" FOREIGN KEY ("substitute_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_workout_id_plan_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."plan_workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_workouts" ADD CONSTRAINT "plan_workouts_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_source_template_id_plan_templates_id_fk" FOREIGN KEY ("source_template_id") REFERENCES "public"."plan_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_plan_exercise_id_plan_exercises_id_fk" FOREIGN KEY ("plan_exercise_id") REFERENCES "public"."plan_exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_workout_id_template_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."template_workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_workouts" ADD CONSTRAINT "template_workouts_template_id_plan_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."plan_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_plan_workout_id_plan_workouts_id_fk" FOREIGN KEY ("plan_workout_id") REFERENCES "public"."plan_workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "coach_message_user_created_idx" ON "coach_messages" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "checkin_user_date_idx" ON "daily_checkins" USING btree ("user_id","checked_on");--> statement-breakpoint
CREATE UNIQUE INDEX "measurement_user_date_idx" ON "measurements" USING btree ("user_id","measured_on");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_exercise_order_idx" ON "plan_exercises" USING btree ("workout_id","sort_order");--> statement-breakpoint
CREATE INDEX "plan_exercise_exercise_idx" ON "plan_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_workout_day_idx" ON "plan_workouts" USING btree ("plan_id","day_number");--> statement-breakpoint
CREATE INDEX "plan_workout_plan_idx" ON "plan_workouts" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plans_user_status_idx" ON "plans" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "set_log_unique_set_idx" ON "set_logs" USING btree ("session_id","plan_exercise_id","set_number");--> statement-breakpoint
CREATE INDEX "set_log_plan_exercise_idx" ON "set_logs" USING btree ("plan_exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "template_exercise_order_idx" ON "template_exercises" USING btree ("workout_id","sort_order");--> statement-breakpoint
CREATE INDEX "template_exercise_exercise_idx" ON "template_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "template_workout_day_idx" ON "template_workouts" USING btree ("template_id","day_number");--> statement-breakpoint
CREATE INDEX "template_workout_template_idx" ON "template_workouts" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "workout_session_user_started_idx" ON "workout_sessions" USING btree ("user_id","started_at");