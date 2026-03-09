import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// ---------------------------------------------------------------------------
// Bucket constants (must match seed-storage-buckets.ts)
// ---------------------------------------------------------------------------

export const BUCKETS = {
  menuItemImages: "menu-item-images",
  restaurantAssets: "restaurant-assets",
  verificationDocs: "verification-docs",
  avatars: "avatars",
  paymentProofs: "payment-proofs",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// ---------------------------------------------------------------------------
// Admin storage client (uses service key — server-side only)
// ---------------------------------------------------------------------------

let adminClient: ReturnType<typeof createSupabaseClient> | null = null;

function getAdminClient() {
  if (!adminClient) {
    adminClient = createSupabaseClient(
      env.SUPABASE_URL,
      env.SUPABASE_SECRET_KEY,
    );
  }
  return adminClient;
}

// ---------------------------------------------------------------------------
// Upload / Delete / URL helpers
// ---------------------------------------------------------------------------

/**
 * Upload a file to a Supabase Storage bucket.
 *
 * @param bucket  - One of the BUCKETS constants
 * @param path    - Destination path within the bucket (e.g. "org-123/logo.png")
 * @param file    - File body (Buffer, Blob, or ReadableStream)
 * @param options - Optional content type and upsert behavior
 * @returns The full storage path of the uploaded file
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: Buffer | Blob,
  options?: { contentType?: string; upsert?: boolean },
): Promise<string> {
  const { data, error } = await getAdminClient()
    .storage.from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    });

  if (error) {
    throw new Error(
      `Storage upload failed [${bucket}/${path}]: ${error.message}`,
    );
  }

  return data.path;
}

/**
 * Delete a file from a Supabase Storage bucket.
 */
export async function deleteFile(
  bucket: BucketName,
  path: string,
): Promise<void> {
  const { error } = await getAdminClient().storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(
      `Storage delete failed [${bucket}/${path}]: ${error.message}`,
    );
  }
}

/**
 * Get the public URL for a file in a public bucket.
 * Returns a fully-qualified URL. Only works for public buckets.
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = getAdminClient().storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get a signed URL for a file in a private bucket.
 *
 * @param expiresIn - Seconds until the URL expires (default: 1 hour)
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 3600,
): Promise<string> {
  const { data, error } = await getAdminClient()
    .storage.from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Signed URL failed [${bucket}/${path}]: ${error.message}`);
  }

  return data.signedUrl;
}
