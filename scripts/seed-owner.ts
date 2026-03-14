import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../src/shared/infra/db/schema";
import type { DemoSeed } from "./seed-data/demo-restaurant";

type DB = PostgresJsDatabase<typeof schema>;

type SeedAuthUserRow = {
  id: string;
  email: string | null;
  rawUserMetaData: unknown;
};

export type SeedOwnerContext = {
  userId: string;
  email: string | null;
  displayName: string | null;
  namespace: string;
  label: string;
};

export const DEFAULT_SEED_OWNER_USER_ID =
  "68fb241f-eaa2-4292-99ea-a229ae7737f5";

export const DEFAULT_OTHER_SEED_OWNER_USER_ID =
  "2359a982-b0ca-4252-93f2-d1fcf3515d0a";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function envOrDefault(name: string, fallback: string): string {
  return optionalEnv(name) ?? fallback;
}

function normalizeSeedToken(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "seed";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function firstNonEmptyString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

function resolveDisplayName(
  rawUserMetaData: unknown,
  email: string | null,
): string | null {
  const metadata = asRecord(rawUserMetaData);

  return (
    firstNonEmptyString([
      metadata?.display_name,
      metadata?.displayName,
      metadata?.full_name,
      metadata?.fullName,
      metadata?.name,
      metadata?.user_name,
    ]) ??
    email?.split("@")[0] ??
    null
  );
}

export function buildSeedNamespace(
  userId: string,
  explicitNamespace?: string,
): string {
  const fallbackToken = userId.replace(/-/g, "").slice(0, 8) || "owner";
  const token = normalizeSeedToken(explicitNamespace ?? fallbackToken);
  return `owner-${token}`;
}

export async function getSeedOwnerContext(
  db: DB,
  userId: string,
  options?: {
    namespace?: string;
    label?: string;
  },
): Promise<SeedOwnerContext | null> {
  const [authUser] = await db.execute<SeedAuthUserRow>(
    sql`
      SELECT
        id,
        email,
        raw_user_meta_data AS "rawUserMetaData"
      FROM auth.users
      WHERE id = ${userId}
    `,
  );

  if (!authUser) {
    return null;
  }

  const namespace = buildSeedNamespace(userId, options?.namespace);
  const displayName = resolveDisplayName(
    authUser.rawUserMetaData,
    authUser.email ?? null,
  );
  const label =
    options?.label?.trim() ||
    displayName ||
    authUser.email?.split("@")[0] ||
    namespace;

  return {
    userId: authUser.id,
    email: authUser.email ?? null,
    displayName,
    namespace,
    label,
  };
}

export function namespaceSeedFixture(
  fixture: DemoSeed,
  owner: Pick<SeedOwnerContext, "namespace" | "label">,
): DemoSeed {
  const organizationDescription = [
    fixture.organization.description,
    `Sandbox seed for ${owner.label}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...fixture,
    organization: {
      ...fixture.organization,
      name: `${fixture.organization.name} (${owner.label})`,
      slug: `${fixture.organization.slug}-${owner.namespace}`,
      description: organizationDescription || undefined,
    },
    restaurant: {
      ...fixture.restaurant,
      slug: `${fixture.restaurant.slug}-${owner.namespace}`,
    },
    branch: {
      ...fixture.branch,
      slug: `${fixture.branch.slug}-${owner.namespace}`,
    },
  };
}

export function namespaceSeedFixtures(
  fixtures: DemoSeed[],
  owner: Pick<SeedOwnerContext, "namespace" | "label">,
): DemoSeed[] {
  return fixtures.map((fixture) => namespaceSeedFixture(fixture, owner));
}
