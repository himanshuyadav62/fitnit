CREATE TABLE "workout_session_exercises" (
	"session_id" uuid NOT NULL,
	"plan_exercise_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"exercise_slug" text NOT NULL,
	"equipment" text NOT NULL,
	"sort_order" integer NOT NULL,
	"sets" integer NOT NULL,
	"rep_min" integer NOT NULL,
	"rep_max" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"target_rir" integer NOT NULL,
	"programming_notes" text,
	"user_notes" text,
	"video_url" text,
	CONSTRAINT "workout_session_exercises_session_id_plan_exercise_id_pk" PRIMARY KEY("session_id","plan_exercise_id")
);
--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_plan_exercise_id_plan_exercises_id_fk" FOREIGN KEY ("plan_exercise_id") REFERENCES "public"."plan_exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workout_session_exercise_exercise_idx" ON "workout_session_exercises" USING btree ("exercise_id");--> statement-breakpoint
INSERT INTO "workout_session_exercises" (
	"session_id", "plan_exercise_id", "exercise_id", "exercise_name", "exercise_slug", "equipment",
	"sort_order", "sets", "rep_min", "rep_max", "rest_seconds", "target_rir",
	"programming_notes", "user_notes", "video_url"
)
SELECT
	ws."id", pe."id", pe."exercise_id", e."name", e."slug", e."equipment",
	pe."sort_order", pe."sets", pe."rep_min", pe."rep_max", pe."rest_seconds", pe."target_rir",
	pe."notes", pe."user_notes", pe."video_url_override"
FROM "workout_sessions" ws
INNER JOIN "plan_exercises" pe ON pe."workout_id" = ws."plan_workout_id"
INNER JOIN "exercises" e ON e."id" = pe."exercise_id"
ON CONFLICT ("session_id", "plan_exercise_id") DO NOTHING;
