export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideSection = {
  title: string;
  paragraphs: string[];
};

export type GuideLink = {
  label: string;
  href: string;
};

export type GuideEntry = {
  slug: string;
  title: string;
  description: string;
  audience: "customer" | "owner" | "admin";
  heroEyebrow: string;
  publishedAt: string;
  updatedAt: string;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  relatedLinks: GuideLink[];
};

// ---------------------------------------------------------------------------
// Slug constants
// ---------------------------------------------------------------------------

export const DISCOVERY_GUIDE_SLUG =
  "how-to-find-restaurants-and-dishes-on-cravingsph";
export const OWNER_SETUP_GUIDE_SLUG =
  "how-to-set-up-your-restaurant-on-cravingsph";
export const ORDERING_GUIDE_SLUG = "how-to-order-dine-in-on-cravingsph";
export const OWNER_OPS_GUIDE_SLUG =
  "how-to-manage-orders-and-operations-on-cravingsph";
export const ADMIN_GUIDE_SLUG = "how-to-administer-the-cravingsph-platform";
export const DINE_IN_GUIDE_SLUG = "how-to-use-qr-table-ordering-on-cravingsph";

const GUIDE_PUBLISHED_AT = "2026-03-13";

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export const GUIDE_ENTRIES: GuideEntry[] = [
  // ── Journey 1 — Discovery & Search (Customer) ────────────────────────
  {
    slug: DISCOVERY_GUIDE_SLUG,
    title: "How To Find Restaurants And Dishes On CravingsPH",
    description:
      "A customer guide to discovering restaurants and searching for specific dishes on CravingsPH, using filters for cuisine, location, and barangay.",
    audience: "customer",
    heroEyebrow: "Customer Guide",
    publishedAt: GUIDE_PUBLISHED_AT,
    updatedAt: GUIDE_PUBLISHED_AT,
    intro:
      "To find restaurants on CravingsPH, use the search page with Restaurant or Food mode. Restaurant mode lets you filter by cuisine, city, and barangay. Food mode searches dishes by name so you can see which restaurants serve what you are craving. You can also tap the Scan button in the bottom navigation bar to scan a QR code at a table and jump directly to a restaurant's menu.",
    sections: [],
    faqs: [
      {
        question: "Can I search for a specific dish?",
        answer:
          "Yes. Switch to Food mode on the search page and type a dish name. CravingsPH shows matching dishes grouped by restaurant, with prices and photos.",
      },
      {
        question: "What filters are available?",
        answer:
          "In Restaurant mode you can filter by cuisine type, city, and barangay. In Food mode you can filter by barangay. Both modes support a text search.",
      },
      {
        question: "How do I find restaurants near me?",
        answer:
          "The home page shows nearby restaurants when location is available. You can also filter by barangay on the search page to narrow results to your area.",
      },
      {
        question: "What does the QR code do?",
        answer:
          "Restaurants place QR codes on tables. Tap the Scan button in the bottom navigation bar to open the scanner, then point your camera at the code. It takes you directly to that restaurant's menu with your table number pre-filled so you can order immediately.",
      },
    ],
    relatedLinks: [
      { label: "Search restaurants", href: "/search" },
      { label: "Browse all restaurants", href: "/" },
      { label: "More guides", href: "/guides" },
    ],
  },

  // ── Journey 2 — Owner Setup & Launch Readiness (Owner) ───────────────
  {
    slug: OWNER_SETUP_GUIDE_SLUG,
    title: "How To Set Up Your Restaurant On CravingsPH",
    description:
      "An owner guide to setting up a restaurant on CravingsPH, from accepting your invitation through organization creation, branch setup, menu building, and going live.",
    audience: "owner",
    heroEyebrow: "Owner Guide",
    publishedAt: GUIDE_PUBLISHED_AT,
    updatedAt: GUIDE_PUBLISHED_AT,
    intro:
      "After accepting your invitation link, the 5-step onboarding wizard walks you through creating an organization, registering your restaurant, adding a branch, and building your first menu item. A completion summary shows your progress and links to anything still outstanding. Your dashboard displays a setup checklist until all steps are done. Once your branch is set up, you can add tables and generate QR codes so customers can scan and order directly from their seat.",
    sections: [],
    faqs: [
      {
        question: "How do I get an invitation?",
        answer:
          "CravingsPH is invite-only during the MVP phase. A platform admin generates an invitation link and shares it with you. Contact CravingsPH to request one.",
      },
      {
        question: "How many steps is the onboarding wizard?",
        answer:
          "The wizard has 5 steps: Organization, Restaurant, Branch, Menu, and Complete. The first four create your setup, and the fifth summarises your progress. You can skip the menu step and add items later.",
      },
      {
        question: "What if I don't finish all the steps?",
        answer:
          'The completion step shows "Almost There" with a list of what still needs to be done. Your dashboard also shows a setup checklist banner with a progress bar and links to incomplete steps. You can finish at your own pace.',
      },
      {
        question: "How do I set up tables for QR ordering?",
        answer:
          "After creating a branch, add tables from the branch settings. Each table gets a label (e.g., Table 1), a short code (e.g., T-01), and a sort order. You can also add bar seats or any seating arrangement. Once tables are added, generate QR codes to print and place on each table.",
      },
      {
        question: "Can I manage multiple restaurants?",
        answer:
          "Yes. An organization can have multiple restaurants, each with its own branches, menus, tables, and settings.",
      },
      {
        question: "What happens after I complete setup?",
        answer:
          "Your restaurant appears in search results and on the home page. Customers can scan the QR code at their table to open a session and order directly, or browse your menu through search. Your dashboard shows stats like Orders Today, Pending Orders, Active Locations, and Revenue Today.",
      },
    ],
    relatedLinks: [
      { label: "Owner portal", href: "/organization" },
      { label: "More guides", href: "/guides" },
    ],
  },

  // ── Journey 3 — Dine-in Ordering Flow (Customer) ─────────────────────
  {
    slug: ORDERING_GUIDE_SLUG,
    title: "How To Order Dine-In On CravingsPH",
    description:
      "A customer guide to placing a dine-in order on CravingsPH, from browsing the menu through checkout and order tracking.",
    audience: "customer",
    heroEyebrow: "Customer Guide",
    publishedAt: GUIDE_PUBLISHED_AT,
    updatedAt: GUIDE_PUBLISHED_AT,
    intro:
      "To order dine-in, scan the QR code on your table — it identifies the branch and table, opens a table session, and takes you straight to the menu. Browse items, add them to your cart with any variant or modifier customisations, review your cart, and submit the order. Your table is already pre-filled from the QR code so there is nothing extra to enter. You can track the order status in real time from the order tracking page.",
    sections: [],
    faqs: [
      {
        question: "Do I need an account to order?",
        answer:
          "You can browse menus without an account, but you need to sign in before submitting an order so the restaurant knows who placed it.",
      },
      {
        question: "What does scanning the QR code do?",
        answer:
          "Each table has a unique QR code. Scanning it opens a table session that links your visit to that specific table. The restaurant sees which table your order is for, and you skip the step of manually entering a table number.",
      },
      {
        question: "Can I order without scanning a QR code?",
        answer:
          "Yes. You can find the restaurant through search and browse the menu. At checkout you will need to enter your table number manually if you did not scan a QR code.",
      },
      {
        question: "Can I order for pickup?",
        answer:
          "Currently, CravingsPH supports dine-in orders only. Pickup ordering may be added in a future update.",
      },
      {
        question: "How do I customise my order?",
        answer:
          "Tap a menu item to open its detail sheet. Select a variant (e.g., size) and toggle any modifiers (e.g., extra rice, no onions) before adding to cart. Required modifiers like steak temperature must be selected before you can add the item.",
      },
      {
        question: "What happens after I submit my order?",
        answer:
          "The restaurant receives your order and can accept or reject it. You see real-time status updates on the order tracking page — from submitted through preparation to ready.",
      },
    ],
    relatedLinks: [
      { label: "Find a restaurant", href: "/search" },
      {
        label: "QR table ordering guide",
        href: `/guides/${DINE_IN_GUIDE_SLUG}`,
      },
      { label: "View your orders", href: "/orders" },
      { label: "More guides", href: "/guides" },
    ],
  },

  // ── Journey 3b — QR Table Ordering (Customer) ─────────────────────────
  {
    slug: DINE_IN_GUIDE_SLUG,
    title: "How To Use QR Table Ordering On CravingsPH",
    description:
      "A step-by-step customer guide to scanning a QR code at your table, opening a table session, customising items with required and optional modifiers, and placing dine-in orders on CravingsPH.",
    audience: "customer",
    heroEyebrow: "Customer Guide",
    publishedAt: GUIDE_PUBLISHED_AT,
    updatedAt: GUIDE_PUBLISHED_AT,
    intro:
      "Scan the QR code on your table to open a table session. The system identifies your branch and table automatically — no need to type anything. Browse the menu, customise items with required modifiers (like steak temperature) and optional extras (like sauce or wine pairing), add to cart, and submit. Your table is pre-filled at checkout. You can place multiple orders during a single session — drinks first, then food, then dessert — and the restaurant sees all orders grouped by your table.",
    sections: [],
    faqs: [
      {
        question: "What is a table session?",
        answer:
          "A table session is a live record that connects your visit to a physical table. It starts when you scan the QR code and stays active until the restaurant closes it out. All orders you place during the session are linked to the same table.",
      },
      {
        question: "Can multiple people at the same table scan the QR code?",
        answer:
          "Yes. Each guest can scan the same QR code. All orders go to the same table session, so the restaurant can serve the right table regardless of who placed each order.",
      },
      {
        question: "What are required modifiers?",
        answer:
          "Required modifiers force you to make a selection before adding an item. For example, a steak requires a temperature choice. The Add to Cart button stays disabled until all required selections are made. This ensures the kitchen always knows how to prepare your item.",
      },
      {
        question: "What are optional modifiers?",
        answer:
          "Optional modifiers let you add extras without obligation — like a sauce or wine pairing. Some have an additional cost. You can toggle them on or skip them entirely. Multi-select groups may have a maximum limit.",
      },
      {
        question: "Can I place more than one order per visit?",
        answer:
          "Yes. After submitting an order, your cart clears but the table session stays active. Browse the menu and place another order whenever you are ready — drinks first, then starters, then mains.",
      },
      {
        question: "What if I cannot scan the QR code?",
        answer:
          "You can find the restaurant through the search page and browse its menu. At checkout, you will need to enter your table number manually instead of having it auto-filled.",
      },
      {
        question: "When does my table session end?",
        answer:
          "The restaurant staff closes the session after you pay and leave. You do not need to do anything — but you can also close it yourself from the session banner if you want.",
      },
      {
        question: "Is my cart saved between orders?",
        answer:
          "Yes. Your cart is stored on your device. If you close the browser and return, your items are still there as long as you go back to the same restaurant. Your table session also remains active.",
      },
    ],
    relatedLinks: [
      {
        label: "General ordering guide",
        href: `/guides/${ORDERING_GUIDE_SLUG}`,
      },
      { label: "Find a restaurant", href: "/search" },
      { label: "View your orders", href: "/orders" },
      { label: "More guides", href: "/guides" },
    ],
  },

  // ── Journey 4 — Owner Operations & Fulfillment (Owner) ───────────────
  {
    slug: OWNER_OPS_GUIDE_SLUG,
    title: "How To Manage Orders And Operations On CravingsPH",
    description:
      "An owner guide to managing incoming orders, updating fulfillment status, editing your menu, and configuring branch settings on CravingsPH.",
    audience: "owner",
    heroEyebrow: "Owner Guide",
    publishedAt: GUIDE_PUBLISHED_AT,
    updatedAt: GUIDE_PUBLISHED_AT,
    intro:
      "When a customer scans a QR code, a table session opens for that table. When they submit an order, it appears in your order queue as a new order linked to the table. Accept or reject it, then update the status as you prepare and serve it. Between orders, use the dashboard quick actions — Add Restaurant, Manage Menu, and Set Operating Hours — to manage your setup from the owner portal.",
    sections: [],
    faqs: [
      {
        question: "How do I know when a new order comes in?",
        answer:
          "New orders appear in the Inbox tab of your order queue. The tab shows a count badge so you can see at a glance if anything needs attention. Each order shows the table it came from.",
      },
      {
        question: "What are table sessions?",
        answer:
          "A table session starts when a customer scans the QR code at a table. It stays active until the table is closed out. Sessions let you see which tables are occupied and track all orders placed during a visit.",
      },
      {
        question: "Can I edit my menu while orders are coming in?",
        answer:
          "Yes. Menu changes take effect immediately. You can add or remove categories, items, variants, and modifiers at any time without disrupting active orders.",
      },
      {
        question: "What order statuses are available?",
        answer:
          "Orders move through: New → Accepted → Preparing → Ready → Completed. You can also reject an order or mark it as cancelled.",
      },
      {
        question: "Can I deactivate a table?",
        answer:
          "Yes. Each table has an active toggle. Deactivated tables stop accepting QR scans but existing sessions are unaffected.",
      },
      {
        question: "Can I temporarily disable ordering?",
        answer:
          "Yes. The branch settings page has an ordering toggle. Turn it off to stop accepting new orders while keeping your listing visible.",
      },
    ],
    relatedLinks: [
      { label: "Owner portal", href: "/organization" },
      { label: "More guides", href: "/guides" },
    ],
  },

  // ── Journey 5 — Governance & Maturity (Admin) ────────────────────────
  {
    slug: ADMIN_GUIDE_SLUG,
    title: "How To Administer The CravingsPH Platform",
    description:
      "An admin guide to monitoring the platform dashboard, generating invitation links, managing restaurants, and overseeing users on CravingsPH.",
    audience: "admin",
    heroEyebrow: "Admin Guide",
    publishedAt: GUIDE_PUBLISHED_AT,
    updatedAt: GUIDE_PUBLISHED_AT,
    intro:
      "As a platform admin, you monitor key metrics on the dashboard, generate invitation links for new restaurant owners, review and manage restaurant listings, and oversee user accounts. The admin portal gives you full visibility and control over the CravingsPH platform.",
    sections: [],
    faqs: [
      {
        question: "How do I invite a new restaurant owner?",
        answer:
          "Go to the Invitations page, fill in the optional email and restaurant name hints, and click Generate Invite Link. Copy the link and share it with the owner via WhatsApp, email, or any channel.",
      },
      {
        question: "Can I revoke an invitation?",
        answer:
          "Yes. Pending invitations can be revoked from the Invitations page. Revoked invitations cannot be used to register.",
      },
      {
        question: "How do I manage a restaurant listing?",
        answer:
          "Navigate to the Restaurants page, find the restaurant, and open its profile. You can update details, toggle active status, and mark it as featured.",
      },
      {
        question: "What user management is available?",
        answer:
          "The Users page shows all registered accounts with search and filter. You can view user details and manage their active status.",
      },
    ],
    relatedLinks: [
      { label: "Admin dashboard", href: "/admin" },
      { label: "Manage invitations", href: "/admin/invitations" },
      { label: "More guides", href: "/guides" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export const GUIDE_MAP = new Map(
  GUIDE_ENTRIES.map((entry) => [entry.slug, entry] as const),
);

export function getGuideBySlug(slug: string): GuideEntry | undefined {
  return GUIDE_MAP.get(slug);
}
