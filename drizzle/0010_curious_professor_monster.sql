CREATE TABLE "transformation_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"captured_on" date NOT NULL,
	"blob_pathname" text NOT NULL,
	"blob_etag" text NOT NULL,
	"content_type" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"byte_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transformation_photos" ADD CONSTRAINT "transformation_photos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "transformation_photo_user_date_idx" ON "transformation_photos" USING btree ("user_id","captured_on");--> statement-breakpoint
CREATE UNIQUE INDEX "transformation_photo_blob_idx" ON "transformation_photos" USING btree ("blob_pathname");