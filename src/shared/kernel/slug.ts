/**
 * Shared slug generation utilities.
 *
 * Provides a single canonical `generateSlug` and a
 * `generatePortalSlug` for globally-unique branch portal URLs.
 */

/**
 * Convert an arbitrary name into a URL-safe slug.
 * Lowercases, strips non-alphanumeric characters (except hyphens),
 * collapses whitespace/hyphens, and trims leading/trailing hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a random 4-character alphanumeric suffix for collision resolution.
 */
export function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

/**
 * Compose a portal slug from restaurant and branch slugs.
 * Format: `<restaurant-slug>-<branch-slug>`
 */
export function composePortalSlug(
  restaurantSlug: string,
  branchSlug: string,
): string {
  return `${restaurantSlug}-${branchSlug}`;
}

/**
 * Generate a globally-unique portal slug with collision handling.
 *
 * Strategy:
 * 1. Try `<restaurant-slug>-<branch-slug>`
 * 2. If taken, append city: `<restaurant-slug>-<branch-slug>-<city-slug>`
 * 3. If still taken, append random suffix: `<restaurant-slug>-<branch-slug>-<suffix>`
 *
 * @param restaurantSlug - The restaurant's existing slug
 * @param branchSlug - The branch's existing slug
 * @param city - Optional city for collision fallback
 * @param isSlugTaken - Async function to check if a portal slug already exists
 */
export async function generatePortalSlug(
  restaurantSlug: string,
  branchSlug: string,
  city: string | null | undefined,
  isSlugTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  // Attempt 1: base slug
  const base = composePortalSlug(restaurantSlug, branchSlug);
  if (!(await isSlugTaken(base))) {
    return base;
  }

  // Attempt 2: append city
  if (city) {
    const citySlug = generateSlug(city);
    if (citySlug) {
      const withCity = `${base}-${citySlug}`;
      if (!(await isSlugTaken(withCity))) {
        return withCity;
      }
    }
  }

  // Attempt 3: append random suffix
  const withSuffix = `${base}-${randomSuffix()}`;
  return withSuffix;
}
