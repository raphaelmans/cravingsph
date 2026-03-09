/**
 * Seed script: creates Supabase Storage buckets for CravingsPH.
 *
 * Usage:
 *   pnpm db:seed:buckets
 *
 * Requires:
 *   DATABASE_URL — Postgres connection string (with access to storage schema)
 *
 * Idempotent — safe to rerun. Uses INSERT ... ON CONFLICT DO NOTHING.
 */

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// ---------------------------------------------------------------------------
// Bucket definitions
// ---------------------------------------------------------------------------

interface BucketDef {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit: number; // bytes
  allowedMimeTypes: string[];
}

const BUCKETS: BucketDef[] = [
  {
    id: "menu-item-images",
    name: "menu-item-images",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "restaurant-assets",
    name: "restaurant-assets",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ],
  },
  {
    id: "verification-docs",
    name: "verification-docs",
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  {
    id: "avatars",
    name: "avatars",
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "payment-proofs",
    name: "payment-proofs",
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🪣 CravingsPH Storage Bucket Seed\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client });

  let created = 0;
  let skipped = 0;

  try {
    for (const bucket of BUCKETS) {
      const mimeArray = `{${bucket.allowedMimeTypes.join(",")}}`;
      const result = await db.execute(
        sql`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (${bucket.id}, ${bucket.name}, ${bucket.public}, ${bucket.fileSizeLimit}, ${mimeArray}::text[])
            ON CONFLICT (id) DO NOTHING`,
      );

      // drizzle-orm returns rowCount on the result
      const inserted = (result as unknown as { rowCount: number }).rowCount > 0;
      if (inserted) {
        console.log(
          `  ✓ Created bucket: ${bucket.id} (${bucket.public ? "public" : "private"})`,
        );
        created++;
      } else {
        console.log(`  - Skipped bucket: ${bucket.id} (already exists)`);
        skipped++;
      }
    }

    console.log(`\n--- Summary: ${created} created, ${skipped} skipped ---\n`);
    console.log("Bucket seed completed successfully.");
  } catch (error) {
    console.error("Bucket seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
