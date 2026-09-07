ALTER TABLE "exercises" ADD COLUMN "created_by_user_id" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercise_created_by_user_idx" ON "exercises" USING btree ("created_by_user_id");