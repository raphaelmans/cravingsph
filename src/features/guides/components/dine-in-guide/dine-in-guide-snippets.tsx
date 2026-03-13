import { Check, Minus, Plus, QrCode, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideSnippetWrapper } from "@/features/guides/components/guide-snippet-wrapper";

// ---------------------------------------------------------------------------
// Mock: QR scanner viewfinder
// ---------------------------------------------------------------------------

function MockQRScanner() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-xs space-y-4 text-center">
        <div className="relative mx-auto flex size-48 items-center justify-center rounded-3xl border-2 border-dashed border-primary/40 bg-muted/30">
          <div className="absolute top-0 left-0 size-6 rounded-tl-xl border-t-3 border-l-3 border-primary" />
          <div className="absolute top-0 right-0 size-6 rounded-tr-xl border-t-3 border-r-3 border-primary" />
          <div className="absolute bottom-0 left-0 size-6 rounded-bl-xl border-b-3 border-l-3 border-primary" />
          <div className="absolute bottom-0 right-0 size-6 rounded-br-xl border-b-3 border-r-3 border-primary" />
          <QrCode className="size-16 text-muted-foreground/40" />
        </div>
        <p className="text-xs text-muted-foreground">
          Point your camera at the QR code on the table
        </p>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Table session banner
// ---------------------------------------------------------------------------

function MockTableSessionBanner() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Utensils className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Table 5</p>
              <p className="text-xs text-muted-foreground">
                Le Petit Bistro · Legaspi Village
              </p>
            </div>
          </div>
          <Badge className="bg-success/10 text-success">Active</Badge>
        </div>
        <div className="flex gap-2">
          {["Les Entrées", "Les Plats", "Les Desserts", "Les Boissons"].map(
            (cat, i) => (
              <span
                key={cat}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "border text-muted-foreground"
                }`}
              >
                {cat}
              </span>
            ),
          )}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Menu browsing
// ---------------------------------------------------------------------------

function MockDineInMenuBrowsing() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-2">
        {[
          {
            name: "Steak Frites",
            desc: "250g ribeye with hand-cut frites",
            price: "₱1,650",
            hasModifiers: true,
          },
          {
            name: "Confit de Canard",
            desc: "Slow-cooked duck leg confit",
            price: "₱1,450",
            hasModifiers: true,
          },
          {
            name: "Coq au Vin",
            desc: "Braised chicken in red wine",
            price: "₱1,280",
            hasModifiers: false,
            inCart: true,
          },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-muted" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="max-w-40 truncate text-xs text-muted-foreground">
                  {item.desc}
                </p>
                <p className="text-xs font-medium text-primary">{item.price}</p>
              </div>
            </div>
            {item.inCart ? (
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full border">
                  <Minus className="size-3" />
                </span>
                <span className="text-sm font-medium">1</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Plus className="size-3" />
                </span>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full">
                {item.hasModifiers ? (
                  "Customise"
                ) : (
                  <Plus className="size-3.5" />
                )}
              </Button>
            )}
          </div>
        ))}
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Required modifier (steak temperature)
// ---------------------------------------------------------------------------

function MockRequiredModifiers() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="size-16 rounded-xl bg-muted" />
          <div>
            <p className="font-heading text-base font-semibold">Steak Frites</p>
            <p className="text-xs text-muted-foreground">₱1,650</p>
          </div>
        </div>

        {/* Required: Temperature */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-medium">Temperature</p>
            <Badge
              variant="destructive"
              className="h-4 px-1.5 text-[10px] font-medium"
            >
              Required
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Rare", selected: false },
              { label: "Medium Rare", selected: true },
              { label: "Medium", selected: false },
              { label: "Well Done", selected: false },
            ].map((t) => (
              <span
                key={t.label}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  t.selected
                    ? "bg-primary text-primary-foreground"
                    : "border text-muted-foreground"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Optional: Sauce */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-medium">Sauce</p>
            <span className="text-[10px] text-muted-foreground">Optional</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Béarnaise", price: "Free", checked: true },
              { label: "Au Poivre", price: "Free", checked: false },
              { label: "Roquefort", price: "+₱50", checked: false },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      s.checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {s.checked ? <Check className="size-2.5" /> : null}
                  </div>
                  <span className="text-sm">{s.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional: Wine Pairing */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-medium">Wine Pairing</p>
            <span className="text-[10px] text-muted-foreground">Optional</span>
          </div>
          <div className="space-y-2">
            {[
              {
                label: "Glass of Côtes du Rhône",
                price: "+₱380",
                checked: false,
              },
              { label: "Glass of Bordeaux", price: "+₱450", checked: false },
            ].map((w) => (
              <div
                key={w.label}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-4 items-center justify-center rounded-full border" />
                  <span className="text-sm">{w.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{w.price}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full">Add to cart — ₱1,650</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Variant selector (coffee)
// ---------------------------------------------------------------------------

function MockVariantSelector() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="size-16 rounded-xl bg-muted" />
          <div>
            <p className="font-heading text-base font-semibold">Café</p>
            <p className="text-xs text-muted-foreground">
              French-press coffee, single origin
            </p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium">Choose your style</p>
          <div className="flex gap-2">
            {[
              { label: "Espresso", price: "₱150", selected: false },
              { label: "Double", price: "₱180", selected: true },
              { label: "Café Crème", price: "₱200", selected: false },
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
        <Button className="w-full">Add to cart — ₱180</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Cart with table session info
// ---------------------------------------------------------------------------

function MockCartWithTable() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-semibold">Your Order</p>
          <Badge variant="secondary">3 items</Badge>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2">
          <Utensils className="size-3.5 text-primary" />
          <span className="text-xs font-medium">Table 5</span>
          <span className="text-xs text-muted-foreground">
            · Session active
          </span>
        </div>

        <div className="space-y-3 divide-y">
          {[
            {
              name: "Steak Frites",
              mods: "Medium Rare · Béarnaise",
              qty: 1,
              price: "₱1,650",
            },
            {
              name: "Coq au Vin",
              mods: "",
              qty: 1,
              price: "₱1,280",
            },
            {
              name: "Café (Double)",
              mods: "",
              qty: 2,
              price: "₱360",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between pt-3 first:pt-0"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                {item.mods ? (
                  <p className="text-xs text-muted-foreground">{item.mods}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
              </div>
              <span className="text-sm font-medium">{item.price}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-heading text-sm font-semibold">Total</span>
          <span className="font-heading text-lg font-semibold">₱3,290</span>
        </div>
        <Button className="w-full">Checkout</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Checkout with pre-filled table
// ---------------------------------------------------------------------------

function MockCheckoutPreFilled() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <p className="font-heading text-base font-semibold">Checkout</p>

        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
          <QrCode className="size-4 text-primary" />
          <div>
            <p className="text-xs font-medium">Table 5 — Le Petit Bistro</p>
            <p className="text-[10px] text-muted-foreground">
              Auto-filled from QR scan
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-medium">Order summary</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>1x Steak Frites (Med Rare, Béarnaise)</span>
              <span>₱1,650</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>1x Coq au Vin</span>
              <span>₱1,280</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>2x Café (Double)</span>
              <span>₱360</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-medium">
            <span className="text-sm">Total</span>
            <span className="text-sm">₱3,290</span>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium">Special instructions</p>
          <div className="rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
            Anniversary dinner — please bring the dessert with a candle
          </div>
        </div>

        <Button className="w-full">Submit Order</Button>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Order tracker with table context
// ---------------------------------------------------------------------------

function MockOrderTrackerWithTable() {
  return (
    <GuideSnippetWrapper>
      <div className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-semibold">Order #1087</p>
          <Badge variant="secondary" className="text-xs">
            Table 5
          </Badge>
        </div>
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
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Session orders
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Order #1087</span>
              <Badge className="bg-primary/10 text-primary text-[10px]">
                Preparing
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Order #1085</span>
              <Badge variant="secondary" className="text-[10px]">
                Completed
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Snippet map
// ---------------------------------------------------------------------------

const DINE_IN_GUIDE_SNIPPET_MAP: Record<string, React.ComponentType> = {
  "scan-qr": MockQRScanner,
  "table-session": MockTableSessionBanner,
  "browse-menu": MockDineInMenuBrowsing,
  "customise-order/required-modifiers": MockRequiredModifiers,
  "customise-order/variants": MockVariantSelector,
  "review-cart": MockCartWithTable,
  "submit-order": MockCheckoutPreFilled,
  "track-order": MockOrderTrackerWithTable,
};

export function getDineInSnippetForSection(
  sectionId: string,
): React.ComponentType | null {
  return DINE_IN_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
