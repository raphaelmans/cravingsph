import { LayoutDashboard, Store, UserPlus, Users } from "lucide-react";
import type { InteractiveGuideSection } from "@/features/guides/components/interactive-guide-types";

export const ADMIN_GUIDE_SECTIONS: InteractiveGuideSection[] = [
  {
    id: "dashboard-overview",
    stepNumber: 1,
    icon: LayoutDashboard,
    title: "Monitor the dashboard",
    paragraphs: [
      "The admin dashboard gives you a real-time overview of the platform. Key metrics include total restaurants, active users, pending orders, and recent activity.",
      "Use the stat cards at the top to quickly gauge platform health. The recent activity feed below shows the latest events — new restaurants, user registrations, and order activity.",
    ],
    tip: {
      text: "Check the dashboard daily during the early MVP phase to catch issues early and monitor growth.",
    },
  },
  {
    id: "manage-invitations",
    stepNumber: 2,
    icon: UserPlus,
    title: "Generate and manage invitations",
    paragraphs: [
      "CravingsPH is invite-only during the MVP phase. As an admin, you generate invitation links from the Invitations page. Each link is a unique, time-limited token that lets a restaurant owner register.",
      "Fill in the optional email and restaurant name hints to help you track who each invitation is for. Click Generate Invite Link, then copy the URL and share it with the owner via WhatsApp, email, or any channel you prefer.",
    ],
    subsections: [
      {
        id: "manage-invitations/tracking",
        title: "Track invitation status",
        paragraphs: [
          "The invitations table shows all generated links with their status: Pending (not yet used), Accepted (owner registered), or Expired (past the 7-day window). You can see who accepted each invitation and when.",
        ],
      },
      {
        id: "manage-invitations/revoke",
        title: "Revoke an invitation",
        paragraphs: [
          "If you need to cancel a pending invitation, click the Revoke button. The link becomes invalid immediately and cannot be used to register.",
        ],
      },
    ],
    accordionItems: [
      {
        trigger: "How long do invitation links last?",
        content:
          "Invitation links expire after 7 days by default. If an owner misses the window, generate a new link.",
      },
      {
        trigger: "Can I re-send an invitation to the same email?",
        content:
          "Yes. Generate a new invitation link — each link is independent. The old one still works until it expires or is revoked.",
      },
    ],
  },
  {
    id: "manage-restaurants",
    stepNumber: 3,
    icon: Store,
    title: "Review and manage restaurants",
    paragraphs: [
      "The Restaurants page lists all registered restaurants with their status. Filter by pending, approved, featured, or active to find what you need.",
      "Open a restaurant's profile to review and edit its details. You can toggle active status to show or hide it from customer-facing pages, and mark it as featured to promote it on the home page.",
    ],
    tip: {
      text: "Review new restaurants promptly after they complete onboarding. A quick approval sets a positive tone for the owner relationship.",
    },
  },
  {
    id: "manage-users",
    stepNumber: 4,
    icon: Users,
    title: "Manage platform users",
    paragraphs: [
      "The Users page shows all registered accounts — customers and owners. Use the search bar to find specific users by name or email, and filter by role or status.",
      "From the user list, you can view account details and manage active status. Deactivating a user prevents them from signing in without deleting their data.",
    ],
    accordionItems: [
      {
        trigger: "Can I delete a user account?",
        content:
          "The admin portal currently supports deactivating accounts rather than deleting them. This preserves order history and data integrity.",
      },
    ],
  },
];
