ALTER TABLE "order" ADD COLUMN "table_session_id" uuid;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_table_session_id_table_session_id_fk" FOREIGN KEY ("table_session_id") REFERENCES "public"."table_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_order_table_session" ON "order" USING btree ("table_session_id");