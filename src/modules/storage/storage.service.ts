import { randomUUID } from "node:crypto";
import {
  BUCKETS,
  type BucketName,
  deleteFile,
  getPublicUrl,
  getSignedUrl,
  uploadFile,
} from "@/shared/infra/supabase/storage";

// ---------------------------------------------------------------------------
// Validation config per bucket
// ---------------------------------------------------------------------------

interface BucketConfig {
  maxSizeBytes: number;
  allowedTypes: string[];
}

const BUCKET_CONFIG: Record<BucketName, BucketConfig> = {
  [BUCKETS.menuItemImages]: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [BUCKETS.restaurantAssets]: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  },
  [BUCKETS.verificationDocs]: {
    maxSizeBytes: 10 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  [BUCKETS.avatars]: {
    maxSizeBytes: 2 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [BUCKETS.paymentProofs]: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};

// ---------------------------------------------------------------------------
// Public buckets (where getPublicUrl works)
// ---------------------------------------------------------------------------

const PUBLIC_BUCKETS = new Set<BucketName>([
  BUCKETS.menuItemImages,
  BUCKETS.restaurantAssets,
  BUCKETS.avatars,
]);

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class FileTooLargeError extends Error {
  constructor(bucket: BucketName, maxBytes: number) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
    super(`File exceeds ${maxMB} MB limit for bucket "${bucket}"`);
    this.name = "FileTooLargeError";
  }
}

export class InvalidFileTypeError extends Error {
  constructor(bucket: BucketName, mimeType: string, allowed: string[]) {
    super(
      `File type "${mimeType}" not allowed for bucket "${bucket}". Allowed: ${allowed.join(", ")}`,
    );
    this.name = "InvalidFileTypeError";
  }
}

// ---------------------------------------------------------------------------
// Storage service
// ---------------------------------------------------------------------------

export interface UploadResult {
  /** Storage path within the bucket */
  path: string;
  /** Publicly accessible URL (public buckets) or signed URL (private buckets) */
  url: string;
}

export class StorageService {
  /**
   * Validate and upload a file to the specified bucket.
   *
   * @param bucket    - Target bucket
   * @param file      - File contents
   * @param mimeType  - MIME type of the file
   * @param sizeBytes - File size in bytes
   * @param prefix    - Path prefix (e.g. "org-123" or "user-456")
   * @param filename  - Optional original filename (used for extension extraction)
   */
  async upload(
    bucket: BucketName,
    file: Buffer | Blob,
    mimeType: string,
    sizeBytes: number,
    prefix: string,
    filename?: string,
  ): Promise<UploadResult> {
    // Validate
    const config = BUCKET_CONFIG[bucket];
    if (sizeBytes > config.maxSizeBytes) {
      throw new FileTooLargeError(bucket, config.maxSizeBytes);
    }
    if (!config.allowedTypes.includes(mimeType)) {
      throw new InvalidFileTypeError(bucket, mimeType, config.allowedTypes);
    }

    // Generate unique path
    const ext = this.extractExtension(mimeType, filename);
    const uniqueName = `${randomUUID()}${ext}`;
    const storagePath = prefix ? `${prefix}/${uniqueName}` : uniqueName;

    // Upload
    const path = await uploadFile(bucket, storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

    // Generate URL
    const url = PUBLIC_BUCKETS.has(bucket)
      ? getPublicUrl(bucket, path)
      : await getSignedUrl(bucket, path);

    return { path, url };
  }

  /**
   * Delete a file and return void.
   */
  async delete(bucket: BucketName, path: string): Promise<void> {
    await deleteFile(bucket, path);
  }

  /**
   * Get a URL for an existing file.
   * Public buckets → permanent URL. Private buckets → signed URL.
   */
  async getUrl(bucket: BucketName, path: string): Promise<string> {
    if (PUBLIC_BUCKETS.has(bucket)) {
      return getPublicUrl(bucket, path);
    }
    return getSignedUrl(bucket, path);
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private extractExtension(mimeType: string, filename?: string): string {
    // Try from filename first
    if (filename) {
      const dotIndex = filename.lastIndexOf(".");
      if (dotIndex !== -1) {
        return filename.slice(dotIndex);
      }
    }

    // Fallback to MIME type
    const MIME_TO_EXT: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "application/pdf": ".pdf",
    };

    return MIME_TO_EXT[mimeType] ?? "";
  }
}
