# 03 — Content Model & Slugs

## GuideEntry type

Every guide in the registry is a `GuideEntry`. This single type powers the
index page, metadata generation, JSON-LD, and article rendering.

```ts
interface GuideEntry {
  slug: string;               // URL-safe identifier: "how-to-order-dine-in"
  title: string;              // H1 / og:title: "How to order dine-in at a restaurant"
  description: string;        // Meta description / og:description
  audience: "customer" | "owner" | "admin";
  intro: string;              // "Direct answer" paragraph at top of article
  lastUpdated: string;        // ISO date: "2026-03-01"
  isInteractive: boolean;     // true → routed to journey-specific article page
  sections: GuideSection[];   // Body content (generic articles only)
  faqs: GuideFaq[];           // FAQ accordion
  relatedLinks: GuideLink[];  // "Keep exploring" footer links
}

interface GuideSection {
  id: string;                 // Anchor: "search-restaurants"
  title: string;
  paragraphs: string[];
}

interface GuideFaq {
  question: string;
  answer: string;
}

interface GuideLink {
  label: string;
  href: string;
  description?: string;
}
```

Interactive guides use `isInteractive: true` and leave `sections` empty —
their content lives in dedicated `*-content.ts` files using the richer
`InteractiveGuideSection` type (see doc 04).

## Slug conventions

Slugs follow the pattern: `how-to-{verb}-{object}`.

| Slug | Journey | Type |
|------|---------|------|
| `how-to-find-restaurants-and-dishes` | Discovery & Search | Interactive |
| `how-to-find-filipino-restaurants` | Discovery (supplementary) | Generic |
| `how-to-find-restaurants-by-barangay` | Discovery (supplementary) | Generic |
| `how-to-set-up-your-restaurant` | Owner Setup | Interactive |
| `how-to-order-dine-in` | Dine-in Ordering | Interactive |
| `how-to-manage-orders-and-operations` | Owner Operations | Interactive |
| `how-to-administer-the-platform` | Governance | Interactive |

### Slug constants

Exported from `content/guides.ts` for use in route branching:

```ts
export const DISCOVERY_GUIDE_SLUG = "how-to-find-restaurants-and-dishes";
export const OWNER_SETUP_GUIDE_SLUG = "how-to-set-up-your-restaurant";
export const ORDERING_GUIDE_SLUG = "how-to-order-dine-in";
export const OWNER_OPS_GUIDE_SLUG = "how-to-manage-orders-and-operations";
export const ADMIN_GUIDE_SLUG = "how-to-administer-the-platform";
```

## Registry structure

The registry file (`content/guides.ts`) exports:

```ts
// All guide entries (used by index page and static params)
export const GUIDE_ENTRIES: GuideEntry[] = [
  // Journey 1 - Customer discovery
  { slug: DISCOVERY_GUIDE_SLUG, audience: "customer", isInteractive: true, ... },
  { slug: "how-to-find-filipino-restaurants", audience: "customer", isInteractive: false, ... },
  { slug: "how-to-find-restaurants-by-barangay", audience: "customer", isInteractive: false, ... },

  // Journey 2 - Owner setup
  { slug: OWNER_SETUP_GUIDE_SLUG, audience: "owner", isInteractive: true, ... },

  // Journey 3 - Dine-in ordering
  { slug: ORDERING_GUIDE_SLUG, audience: "customer", isInteractive: true, ... },

  // Journey 4 - Owner operations
  { slug: OWNER_OPS_GUIDE_SLUG, audience: "owner", isInteractive: true, ... },

  // Journey 5 - Admin governance
  { slug: ADMIN_GUIDE_SLUG, audience: "admin", isInteractive: true, ... },
];

// O(1) lookup
export const GUIDE_MAP = new Map(GUIDE_ENTRIES.map((e) => [e.slug, e]));

// Typed accessor
export function getGuideBySlug(slug: string): GuideEntry | undefined {
  return GUIDE_MAP.get(slug);
}
```

## Section IDs

Section IDs are kebab-case and must be unique within a guide. They serve as:
- HTML `id` attributes for anchor links
- Keys in the snippet map
- TOC navigation targets

### Proposed section IDs per journey

**Journey 1 — Discovery & Search**
| Section ID | Step | Title |
|-----------|------|-------|
| `search-restaurants` | 1 | Search for restaurants |
| `search-dishes` | 2 | Search for dishes |
| `apply-filters` | 3 | Filter by location, cuisine & barangay |
| `browse-menu` | 4 | Browse a restaurant's menu |
| `scan-qr-code` | 5 | Scan a QR code at a table |

**Journey 2 — Owner Setup**
| Section ID | Step | Title |
|-----------|------|-------|
| `accept-invitation` | 1 | Accept your invitation link |
| `create-organization` | 2 | Create your organization |
| `register-restaurant` | 3 | Register your restaurant |
| `add-branch` | 4 | Add a branch location |
| `build-menu` | 5 | Build your menu |
| `set-operating-hours` | 6 | Set operating hours |
| `go-live` | 7 | Go live |

**Journey 3 — Dine-in Ordering**
| Section ID | Step | Title |
|-----------|------|-------|
| `find-restaurant` | 1 | Find the restaurant |
| `browse-and-add` | 2 | Browse menu & add to cart |
| `customise-items` | 3 | Customise items (variants & modifiers) |
| `review-cart` | 4 | Review your cart |
| `checkout` | 5 | Confirm & submit order |
| `track-order` | 6 | Track your order |

**Journey 4 — Owner Operations**
| Section ID | Step | Title |
|-----------|------|-------|
| `view-order-queue` | 1 | View incoming orders |
| `accept-reject` | 2 | Accept or reject an order |
| `update-status` | 3 | Update order status |
| `manage-menu` | 4 | Manage your menu |
| `branch-settings` | 5 | Configure branch settings |
| `operating-hours` | 6 | Manage operating hours |

**Journey 5 — Governance**
| Section ID | Step | Title |
|-----------|------|-------|
| `dashboard-overview` | 1 | Monitor the dashboard |
| `manage-invitations` | 2 | Generate & manage invitations |
| `manage-restaurants` | 3 | Review & manage restaurants |
| `manage-users` | 4 | Manage platform users |

## Adding supplementary guides

Generic (non-interactive) guides can be added to expand a journey's coverage.
For example, Journey 1 might get "How to find Filipino restaurants" covering
the cuisine filter in more detail.

To add one:
1. Add a `GuideEntry` to `GUIDE_ENTRIES` with `isInteractive: false`
2. Fill `sections` with `GuideSection[]` content
3. No snippet map needed — `GuideArticlePage` handles rendering
4. The index page will automatically include it in the appropriate audience group
