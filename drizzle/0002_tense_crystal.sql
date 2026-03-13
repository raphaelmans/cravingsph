CREATE TABLE "branch_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"label" varchar(50) NOT NULL,
	"code" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "table_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_table_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"opened_by" uuid,
	"closed_by" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_table" ADD CONSTRAINT "branch_table_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_session" ADD CONSTRAINT "table_session_branch_table_id_branch_table_id_fk" FOREIGN KEY ("branch_table_id") REFERENCES "public"."branch_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_session" ADD CONSTRAINT "table_session_opened_by_users_id_fk" FOREIGN KEY ("opened_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_session" ADD CONSTRAINT "table_session_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_branch_table_branch_code" ON "branch_table" USING btree ("branch_id","code");--> statement-breakpoint
CREATE INDEX "idx_branch_table_branch" ON "branch_table" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_branch_table_sort" ON "branch_table" USING btree ("branch_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_table_session_branch_table" ON "table_session" USING btree ("branch_table_id");--> statement-breakpoint
CREATE INDEX "idx_table_session_branch_table_status" ON "table_session" USING btree ("branch_table_id","status");--> statement-breakpoint
CREATE INDEX "idx_table_session_opened_at" ON "table_session" USING btree ("opened_at");