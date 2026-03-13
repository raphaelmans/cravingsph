import { Copy, LayoutDashboard, Store, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuideSnippetWrapper } from "@/features/guides/components/guide-snippet-wrapper";

// ---------------------------------------------------------------------------
// Mock: Admin dashboard
// ---------------------------------------------------------------------------

function MockAdminDashboard() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold">Dashboard</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Restaurants", value: "24", icon: Store },
            { label: "Users", value: "156", icon: Users },
            { label: "Invitations", value: "8", icon: UserPlus },
            { label: "Orders today", value: "42", icon: LayoutDashboard },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2">
                <stat.icon className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="mt-1 font-heading text-2xl font-bold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Invitations page
// ---------------------------------------------------------------------------

function MockInvitationsPage() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">Invitations</p>
          <Button size="sm">
            <UserPlus className="size-3.5" />
            Generate invite
          </Button>
        </div>
        <div className="rounded-xl border bg-card">
          <div className="space-y-0 divide-y">
            {[
              {
                email: "juan@example.com",
                restaurant: "Juan's BBQ",
                status: "pending",
              },
              {
                email: "maria@example.com",
                restaurant: "Kusina ni Maria",
                status: "accepted",
              },
              {
                email: "pedro@example.com",
                restaurant: "Pedro's Grill",
                status: "expired",
              },
            ].map((inv) => (
              <div
                key={inv.email}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.restaurant}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      inv.status === "accepted"
                        ? "default"
                        : inv.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-[10px]"
                  >
                    {inv.status}
                  </Badge>
                  {inv.status === "pending" ? (
                    <Button size="sm" variant="ghost" className="h-7">
                      <Copy className="size-3" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Restaurant management
// ---------------------------------------------------------------------------

function MockRestaurantManagement() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">Restaurants</p>
          <div className="flex gap-2">
            {["All", "Active", "Featured"].map((filter) => (
              <span
                key={filter}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  filter === "All"
                    ? "bg-primary text-primary-foreground"
                    : "border text-muted-foreground"
                }`}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[
            {
              name: "Kusina ni Maria",
              city: "Makati",
              active: true,
              featured: true,
            },
            {
              name: "Juan's BBQ",
              city: "Quezon City",
              active: true,
              featured: false,
            },
            {
              name: "Pedro's Grill",
              city: "Cebu",
              active: false,
              featured: false,
            },
          ].map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between rounded-xl border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted" />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.city}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {r.featured ? (
                  <Badge className="text-[10px]">Featured</Badge>
                ) : null}
                <Badge
                  variant={r.active ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {r.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: User management
// ---------------------------------------------------------------------------

function MockUserManagement() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">Users</p>
          <Input placeholder="Search users..." className="max-w-48" readOnly />
        </div>
        <div className="rounded-xl border bg-card">
          <div className="divide-y">
            {[
              {
                name: "Maria Santos",
                email: "maria@example.com",
                role: "owner",
              },
              {
                name: "Juan Dela Cruz",
                email: "juan@example.com",
                role: "customer",
              },
              {
                name: "Pedro Reyes",
                email: "pedro@example.com",
                role: "customer",
              },
            ].map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Snippet map
// ---------------------------------------------------------------------------

const ADMIN_GUIDE_SNIPPET_MAP: Record<string, React.ComponentType> = {
  "dashboard-overview": MockAdminDashboard,
  "manage-invitations": MockInvitationsPage,
  "manage-restaurants": MockRestaurantManagement,
  "manage-users": MockUserManagement,
};

export function getAdminSnippetForSection(
  sectionId: string,
): React.ComponentType | null {
  return ADMIN_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
