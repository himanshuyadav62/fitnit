DROP INDEX "plan_workout_day_idx";--> statement-breakpoint
ALTER TABLE "plan_workouts" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "plan_workout_day_idx" ON "plan_workouts" USING btree ("plan_id","day_number") WHERE "plan_workouts"."is_active" = true;