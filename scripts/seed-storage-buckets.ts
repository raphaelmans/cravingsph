/**
 * Seed script: creates Supabase Storage buckets and RLS policies for CravingsPH.
 *
 * Usage:
 *   pnpm db:seed:buckets
 *
 * Requires:
 *   DATABASE_URL — Postgres connection string (with access to storage schema)
 *
 * Idempotent — safe to rerun. Uses ON CONFLICT DO NOTHING and IF NOT EXISTS.
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
// RLS policy definitions
// ---------------------------------------------------------------------------

interface PolicyDef {
  name: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  role: "authenticated" | "public";
  bucketId: string;
  /** For INSERT → WITH CHECK, otherwise → USING */
  expression: string;
}

/**
 * Build standard policies for a public bucket:
 * - Anyone can read
 * - Authenticated users can insert/update/delete
 */
function publicBucketPolicies(bucketId: string): PolicyDef[] {
  return [
    {
      name: `${bucketId}_public_read`,
      operation: "SELECT",
      role: "public",
      bucketId,
      expression: `bucket_id = '${bucketId}'`,
    },
    {
      name: `${bucketId}_auth_insert`,
      operation: "INSERT",
      role: "authenticated",
      bucketId,
      expression: `bucket_id = '${bucketId}'`,
    },
    {
      name: `${bucketId}_auth_update`,
      operation: "UPDATE",
      role: "authenticated",
      bucketId,
      expression: `bucket_id = '${bucketId}'`,
    },
    {
      name: `${bucketId}_auth_delete`,
      operation: "DELETE",
      role: "authenticated",
      bucketId,
      expression: `bucket_id = '${bucketId}'`,
    },
  ];
}

/**
 * Build standard policies for a private bucket:
 * - Authenticated users can upload
 * - Users can only read files in their own folder (folder name = user ID)
 */
function privateBucketPolicies(bucketId: string): PolicyDef[] {
  return [
    {
      name: `${bucketId}_auth_insert`,
      operation: "INSERT",
      role: "authenticated",
      bucketId,
      expression: `bucket_id = '${bucketId}'`,
    },
    {
      name: `${bucketId}_owner_read`,
      operation: "SELECT",
      role: "authenticated",
      bucketId,
      expression: `bucket_id = '${bucketId}' AND (storage.foldername(name))[1] = auth.uid()::text`,
    },
  ];
}

const POLICIES: PolicyDef[] = [
  ...publicBucketPolicies("menu-item-images"),
  ...publicBucketPolicies("restaurant-assets"),
  ...publicBucketPolicies("avatars"),
  ...privateBucketPolicies("verification-docs"),
  ...privateBucketPolicies("payment-proofs"),
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
  console.log("CravingsPH Storage Bucket Seed\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client });

  let bucketsCreated = 0;
  let bucketsSkipped = 0;
  let policiesCreated = 0;
  let policiesSkipped = 0;

  try {
    // --- Buckets ---
    console.log("Buckets:");
    for (const bucket of BUCKETS) {
      const mimeArray = `{${bucket.allowedMimeTypes.join(",")}}`;
      const result = await db.execute(
        sql`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (${bucket.id}, ${bucket.name}, ${bucket.public}, ${bucket.fileSizeLimit}, ${mimeArray}::text[])
            ON CONFLICT (id) DO NOTHING`,
      );

      const inserted = (result as unknown as { rowCount: number }).rowCount > 0;
      if (inserted) {
        console.log(
          `  + Created: ${bucket.id} (${bucket.public ? "public" : "private"})`,
        );
        bucketsCreated++;
      } else {
        console.log(`  - Skipped: ${bucket.id} (already exists)`);
        bucketsSkipped++;
      }
    }

    // --- RLS Policies ---
    console.log("\nPolicies:");
    for (const policy of POLICIES) {
      const check =
        policy.operation === "INSERT"
          ? `WITH CHECK (${policy.expression})`
          : `USING (${policy.expression})`;

      const toRole = policy.role === "public" ? "" : `TO ${policy.role}`;

      const statement = `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
              AND tablename = 'objects'
              AND policyname = '${policy.name}'
          ) THEN
            CREATE POLICY "${policy.name}"
              ON storage.objects FOR ${policy.operation}
              ${toRole}
              ${check};
          END IF;
        END $$;
      `;

      await db.execute(sql.raw(statement));

      // Check if it was just created or already existed
      const exists = await db.execute(
        sql`SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
              AND tablename = 'objects'
              AND policyname = ${policy.name}`,
      );
      const rows = exists as unknown as { length: number };
      if (rows.length > 0) {
        policiesCreated++;
        console.log(`  + Ensured: ${policy.name} (${policy.operation})`);
      } else {
        policiesSkipped++;
        console.log(`  ? Failed:  ${policy.name}`);
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(
      `Buckets:  ${bucketsCreated} created, ${bucketsSkipped} skipped`,
    );
    console.log(`Policies: ${policiesCreated} ensured`);
    console.log("\nStorage seed completed successfully.");
  } catch (error) {
    console.error("Storage seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
