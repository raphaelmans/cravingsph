ALTER TABLE "branch" ADD COLUMN "portal_slug" varchar(400);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_branch_portal_slug" ON "branch" USING btree ("portal_slug");