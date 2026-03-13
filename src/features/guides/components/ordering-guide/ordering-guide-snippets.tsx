import { Check, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuideSnippetWrapper } from "@/features/guides/components/guide-snippet-wrapper";

// ---------------------------------------------------------------------------
// Mock: Menu browsing with quick add
// ---------------------------------------------------------------------------

function MockMenuBrowsing() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-2">
        {[
          { name: "Chicken Adobo", price: "₱180", inCart: true },
          { name: "Sinigang na Baboy", price: "₱220", inCart: false },
          { name: "Kare-Kare", price: "₱260", inCart: false },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-muted" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.price}</p>
              </div>
            </div>
            {item.inCart ? (
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full border">
                  <Minus className="size-3" />
                </span>
                <span className="text-sm font-medium">2</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Plus className="size-3" />
                </span>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full">
                <Plus className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Variant selector
// ---------------------------------------------------------------------------

function MockVariantSelector() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="size-16 rounded-xl bg-muted" />
          <div>
            <p className="font-heading text-base font-semibold">
              Chicken Adobo
            </p>
            <p className="text-xs text-muted-foreground">
              Classic Filipino braised chicken
            </p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium">Size</p>
          <div className="flex gap-2">
            {[
              { label: "Regular", price: "₱180", selected: false },
              { label: "Large", price: "₱250", selected: true },
              { label: "Family", price: "₱420", selected: false },
            ].map((v) => (
              <span
                key={v.label}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  v.selected
                    ? "bg-primary text-primary-foreground"
                    : "border text-muted-foreground"
                }`}
              >
                {v.label} ({v.price})
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium">Extras</p>
          <div className="space-y-2">
            {[
              { label: "Extra Rice", price: "+₱25", checked: true },
              { label: "Egg", price: "+₱20", checked: false },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-4 items-center justify-center rounded border ${
                      m.checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {m.checked ? <Check className="size-3" /> : null}
                  </div>
                  <span className="text-sm">{m.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{m.price}</span>
              </div>
            ))}
          </div>
        </div>
        <Button className="w-full">Add to cart — ₱275</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Cart drawer
// ---------------------------------------------------------------------------

function MockCartDrawer() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-semibold">Your Order</p>
          <Badge variant="secondary">3 items</Badge>
        </div>
        <div className="space-y-3 divide-y">
          {[
            {
              name: "Chicken Adobo (Large)",
              extras: "Extra Rice",
              qty: 2,
              price: "₱550",
            },
            {
              name: "Sinigang na Baboy",
              extras: "",
              qty: 1,
              price: "₱220",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between pt-3 first:pt-0"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                {item.extras ? (
                  <p className="text-xs text-muted-foreground">
                    + {item.extras}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
              </div>
              <span className="text-sm font-medium">{item.price}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-heading text-sm font-semibold">Total</span>
          <span className="font-heading text-lg font-semibold">₱770</span>
        </div>
        <Button className="w-full">Checkout</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Checkout
// ---------------------------------------------------------------------------

function MockCheckoutSheet() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <p className="font-heading text-base font-semibold">Checkout</p>
        <div>
          <p className="mb-1 text-xs font-medium">Table number</p>
          <Input defaultValue="12" readOnly className="max-w-20" />
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-medium">Order summary</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>2x Chicken Adobo (Large)</span>
              <span>₱550</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>1x Sinigang na Baboy</span>
              <span>₱220</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-medium">
            <span className="text-sm">Total</span>
            <span className="text-sm">₱770</span>
          </div>
        </div>
        <Button className="w-full">Submit Order</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Order tracker
// ---------------------------------------------------------------------------

function MockOrderTracker() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <p className="font-heading text-base font-semibold">Order #1042</p>
        <div className="space-y-3">
          {[
            { label: "Submitted", done: true },
            { label: "Accepted", done: true },
            { label: "Preparing", done: true, active: true },
            { label: "Ready", done: false },
            { label: "Completed", done: false },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-primary text-primary-foreground"
                    : "border border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {step.done ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={`text-sm ${
                  step.active
                    ? "font-semibold text-primary"
                    : step.done
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {step.active ? (
                <Badge className="bg-primary/10 text-primary text-[10px]">
                  Current
                </Badge>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Snippet map
// ---------------------------------------------------------------------------

const ORDERING_GUIDE_SNIPPET_MAP: Record<string, React.ComponentType> = {
  "browse-and-add": MockMenuBrowsing,
  "browse-and-add/select-variant": MockVariantSelector,
  "review-cart": MockCartDrawer,
  checkout: MockCheckoutSheet,
  "track-order": MockOrderTracker,
};

export function getOrderingSnippetForSection(
  sectionId: string,
): React.ComponentType | null {
  return ORDERING_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
