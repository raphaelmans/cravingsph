import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
process.env.SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY ??= "test-supabase-secret-key";
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??=
  "test-supabase-publishable-key";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3443";

afterEach(() => {
  cleanup();
});
