import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SECRET_KEY: z.string(),
    FF_BRANCH_OPS_PORTAL: z.string().optional(),
    FF_BRANCH_SCOPED_STAFF_ACCESS: z.string().optional(),
    FF_BRANCH_PORTAL_SHORT_ROUTES: z.string().optional(),
    FF_OWNER_CONSOLE_SIDEBAR_V2: z.string().optional(),
    FF_OWNER_TEAM_ACCESS: z.string().optional(),
    FF_OWNER_WORKSPACE_SWITCHER: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
