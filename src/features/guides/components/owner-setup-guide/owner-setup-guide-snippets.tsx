import { Check, Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuideSnippetWrapper } from "@/features/guides/components/guide-snippet-wrapper";

// ---------------------------------------------------------------------------
// Mock: Invitation acceptance
// ---------------------------------------------------------------------------

function MockInvitationPage() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          <p className="font-heading text-lg font-semibold">
            You have been invited
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          You have been invited to join CravingsPH as a restaurant owner.
          Complete registration to get started.
        </p>
        <div className="space-y-3">
          <Input
            placeholder="Email"
            defaultValue="owner@example.com"
            readOnly
          />
          <Input placeholder="Full name" readOnly />
          <Input type="password" placeholder="Password" readOnly />
          <Button className="w-full">Create owner account</Button>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Organization form
// ---------------------------------------------------------------------------

function MockOrgForm() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <p className="font-heading text-lg font-semibold">
          Step 1: Create organization
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium">Organization name</p>
            <Input defaultValue="Maria's Food Group" readOnly />
          </div>
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Restaurant form
// ---------------------------------------------------------------------------

function MockRestaurantForm() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <p className="font-heading text-lg font-semibold">
          Step 2: Register restaurant
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium">Restaurant name</p>
            <Input defaultValue="Kusina ni Maria" readOnly />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl border border-dashed">
              <Plus className="size-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Upload logo</span>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium">Cuisine types</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge>Filipino</Badge>
              <Badge variant="outline">Asian</Badge>
            </div>
          </div>
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Branch form
// ---------------------------------------------------------------------------

function MockBranchForm() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <p className="font-heading text-lg font-semibold">Step 3: Add branch</p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium">Branch name</p>
            <div className="flex items-center rounded-lg border px-3 py-2">
              <span className="text-sm text-muted-foreground">
                Kusina ni Maria —{" "}
              </span>
              <span className="text-sm">Poblacion</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-xs font-medium">City</p>
              <Input defaultValue="Makati" readOnly />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium">Barangay</p>
              <Input defaultValue="Poblacion" readOnly />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium">Street address</p>
            <Input defaultValue="123 Makati Ave" readOnly />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {["Air conditioning", "Free Wi-Fi", "Parking"].map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                >
                  <Check className="size-3 text-primary" />
                  {a}
                </span>
              ))}
            </div>
          </div>
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Menu builder (quick-start form in wizard)
// ---------------------------------------------------------------------------

function MockMenuBuilder() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <p className="font-heading text-lg font-semibold">
          Step 4: Build Your Menu
        </p>
        <p className="text-xs text-muted-foreground">
          Add your first category and item to get started.
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium">Menu Category</p>
            <Input
              placeholder="e.g. Main Dishes, Drinks"
              defaultValue="Main Dishes"
              readOnly
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium">First Item Name</p>
            <Input
              placeholder="e.g. Chicken Adobo, Halo-Halo"
              defaultValue="Chicken Adobo"
              readOnly
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium">Price (PHP)</p>
            <Input placeholder="e.g. 150" defaultValue="180" readOnly />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">Create Menu Item</Button>
            <Button variant="ghost" className="flex-1">
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Completion (all-set and almost-there states)
// ---------------------------------------------------------------------------

function MockCompletionStep() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="size-8 text-primary" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold">
              You are all set!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your restaurant is ready to start accepting orders on cravıngs.
            </p>
          </div>
          <Button>Go to Dashboard</Button>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-warning/30 bg-warning/5 p-6 text-center">
          <p className="font-heading text-lg font-semibold">Almost There</p>
          <p className="text-sm text-muted-foreground">
            You have completed 3 of 4 required steps. Finish these to start
            accepting orders:
          </p>
          <ul className="text-sm text-muted-foreground">
            <li>• Build Menu</li>
          </ul>
          <div className="flex gap-2">
            <Button size="sm">View Setup Progress</Button>
            <Button size="sm" variant="ghost">
              Skip to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Snippet map
// ---------------------------------------------------------------------------

const OWNER_SETUP_GUIDE_SNIPPET_MAP: Record<string, React.ComponentType> = {
  "accept-invitation": MockInvitationPage,
  "create-organization": MockOrgForm,
  "register-restaurant": MockRestaurantForm,
  "add-branch": MockBranchForm,
  "build-menu": MockMenuBuilder,
  completion: MockCompletionStep,
};

export function getOwnerSetupSnippetForSection(
  sectionId: string,
): React.ComponentType | null {
  return OWNER_SETUP_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
