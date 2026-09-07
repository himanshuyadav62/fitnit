ALTER TABLE "plans" ADD COLUMN "is_current" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "plans" AS "plan"
SET "is_current" = true
FROM (
	SELECT DISTINCT ON ("user_id") "id"
	FROM "plans"
	WHERE "status" = 'active'
	ORDER BY "user_id", "created_at" DESC
) AS "latest"
WHERE "plan"."id" = "latest"."id";--> statement-breakpoint
CREATE UNIQUE INDEX "plans_user_current_idx" ON "plans" USING btree ("user_id") WHERE "plans"."is_current" = true;
