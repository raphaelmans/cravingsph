CREATE TABLE "scoped_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" uuid NOT NULL,
	"role_template" varchar(50) NOT NULL,
	"scope_type" varchar(20) NOT NULL,
	"scope_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(100) NOT NULL,
	"role_template" varchar(50) NOT NULL,
	"scope_type" varchar(20) NOT NULL,
	"scope_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scoped_assignment" ADD CONSTRAINT "scoped_assignment_membership_id_team_membership_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."team_membership"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invite" ADD CONSTRAINT "team_invite_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invite" ADD CONSTRAINT "team_invite_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_scoped_assignment_membership" ON "scoped_assignment" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_scoped_assignment_scope" ON "scoped_assignment" USING btree ("scope_type","scope_id");--> statement-breakpoint
CREATE INDEX "idx_scoped_assignment_role" ON "scoped_assignment" USING btree ("role_template");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_team_invite_token" ON "team_invite" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_team_invite_org" ON "team_invite" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_team_invite_email" ON "team_invite" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_team_membership_user_org" ON "team_membership" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "idx_team_membership_org" ON "team_membership" USING btree ("organization_id");