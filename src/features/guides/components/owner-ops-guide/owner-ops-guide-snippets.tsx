import { Check, Clock, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideSnippetWrapper } from "@/features/guides/components/guide-snippet-wrapper";

// ---------------------------------------------------------------------------
// Mock: Order queue
// ---------------------------------------------------------------------------

function MockOrderQueue() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="flex gap-2 border-b pb-2">
          {[
            { label: "Inbox", count: 3, active: true },
            { label: "Accepted", count: 1, active: false },
            { label: "Completed", count: 12, active: false },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`flex items-center gap-1.5 pb-1 text-sm font-medium ${
                tab.active
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { id: "#1042", table: "Table 12", items: 3, time: "2 min ago" },
            { id: "#1041", table: "Table 5", items: 1, time: "5 min ago" },
            { id: "#1040", table: "Table 8", items: 4, time: "8 min ago" },
          ].map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border bg-card p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{order.id}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    New
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {order.table} • {order.items} items
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {order.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Accept/Reject actions
// ---------------------------------------------------------------------------

function MockAcceptReject() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-semibold">Order #1042</p>
          <Badge variant="secondary">New</Badge>
        </div>
        <div className="space-y-1 rounded-lg bg-muted/50 p-3">
          <div className="flex justify-between text-xs">
            <span>2x Chicken Adobo (Large)</span>
            <span>₱550</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>1x Sinigang na Baboy</span>
            <span>₱220</span>
          </div>
          <div className="mt-1 flex justify-between border-t pt-1 text-sm font-medium">
            <span>Total</span>
            <span>₱770</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Table 12</p>
        <div className="flex gap-2">
          <Button className="flex-1">
            <Check className="size-4" />
            Accept
          </Button>
          <Button variant="destructive" className="flex-1">
            <X className="size-4" />
            Reject
          </Button>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Status update
// ---------------------------------------------------------------------------

function MockStatusUpdate() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-semibold">Order #1042</p>
          <Badge className="bg-primary/10 text-primary">Preparing</Badge>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium">Update status</p>
          <div className="flex gap-2">
            {["Ready", "Completed"].map((status) => (
              <Button key={status} size="sm" variant="outline">
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Menu editor
// ---------------------------------------------------------------------------

function MockMenuEditor() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">Menu Management</p>
          <Button size="sm" variant="outline">
            <Plus className="size-3.5" />
            Add category
          </Button>
        </div>
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <p className="text-sm font-medium">Main Course</p>
            <Button size="sm" variant="ghost">
              <Plus className="size-3.5" />
              Add item
            </Button>
          </div>
          <div className="divide-y">
            {[
              { name: "Chicken Adobo", price: "₱180", available: true },
              { name: "Lechon Kawali", price: "₱280", available: false },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-muted" />
                  <div>
                    <span className="text-sm">{item.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.price}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={item.available ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {item.available ? "Available" : "Unavailable"}
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
// Mock: Branch settings
// ---------------------------------------------------------------------------

function MockBranchSettings() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <p className="font-heading text-base font-semibold">Branch Settings</p>
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Accept orders</p>
            <p className="text-xs text-muted-foreground">
              When enabled, customers can place dine-in orders
            </p>
          </div>
          <div className="h-6 w-10 rounded-full bg-primary p-0.5">
            <div className="ml-auto size-5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Snippet map
// ---------------------------------------------------------------------------

const OWNER_OPS_GUIDE_SNIPPET_MAP: Record<string, React.ComponentType> = {
  "view-order-queue": MockOrderQueue,
  "accept-reject": MockAcceptReject,
  "update-status": MockStatusUpdate,
  "manage-menu": MockMenuEditor,
  "branch-settings": MockBranchSettings,
};

export function getOwnerOpsSnippetForSection(
  sectionId: string,
): React.ComponentType | null {
  return OWNER_OPS_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
