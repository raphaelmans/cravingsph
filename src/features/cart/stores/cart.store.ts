import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

// --- Types ---

export interface SelectedModifier {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  uuid: string;
  menuItemId: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  variantId: string | null;
  variantName: string | null;
  variantPrice: number | null;
  modifiers: SelectedModifier[];
  quantity: number;
  unitPrice: number; // base/variant + modifiers (single unit, excludes quantity)
}

interface CartState {
  items: CartItem[];
  branchSlug: string | null;
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (uuid: string) => void;
  updateItem: (uuid: string, item: CartItem) => void;
  updateQuantity: (uuid: string, quantity: number) => void;
  clearCart: () => void;
  setBranch: (slug: string) => void;
}

// --- Helpers ---

/**
 * Two cart items are considered identical (and should merge) when they
 * reference the same menu item, the same variant, and the exact same
 * set of modifiers (order-independent).
 */
function isEqual(a: CartItem, b: CartItem): boolean {
  if (a.menuItemId !== b.menuItemId) return false;
  if (a.variantId !== b.variantId) return false;
  if (a.modifiers.length !== b.modifiers.length) return false;

  const sortedA = [...a.modifiers].sort((x, y) => x.id.localeCompare(y.id));
  const sortedB = [...b.modifiers].sort((x, y) => x.id.localeCompare(y.id));

  return sortedA.every((mod, i) => mod.id === sortedB[i].id);
}

function computeUnitPrice(item: CartItem): number {
  const base = item.variantPrice ?? item.basePrice;
  const modifierTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
  return base + modifierTotal;
}

// --- Store ---

const INITIAL_STATE: CartState = {
  items: [],
  branchSlug: null,
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addItem: (item) => {
        const state = get();
        const items = [...state.items];
        const duplicateIndex = items.findIndex((i) => isEqual(i, item));

        if (duplicateIndex !== -1) {
          const existing = items[duplicateIndex];
          items[duplicateIndex] = {
            ...existing,
            quantity: existing.quantity + item.quantity,
          };
        } else {
          items.push({ ...item, uuid: crypto.randomUUID() });
        }

        set({ items });
      },

      removeItem: (uuid) => {
        set({ items: get().items.filter((i) => i.uuid !== uuid) });
      },

      updateItem: (uuid, updatedItem) => {
        const items = [...get().items];
        const itemIndex = items.findIndex((i) => i.uuid === uuid);
        if (itemIndex === -1) return;

        // Check for collision: updating this item may make it identical to another
        const collisionIndex = items.findIndex(
          (i, idx) => idx !== itemIndex && isEqual(i, updatedItem),
        );

        if (collisionIndex !== -1) {
          const colliding = items[collisionIndex];
          items[collisionIndex] = {
            ...colliding,
            quantity: colliding.quantity + updatedItem.quantity,
          };
          items.splice(itemIndex, 1);
        } else {
          items[itemIndex] = { ...updatedItem, uuid };
        }

        set({ items });
      },

      updateQuantity: (uuid, quantity) => {
        if (quantity <= 0) {
          get().removeItem(uuid);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.uuid === uuid ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set(INITIAL_STATE),

      setBranch: (slug) => set({ branchSlug: slug }),
    }),
    {
      name: "cravings-cart",
      partialize: (state) => ({
        items: state.items,
        branchSlug: state.branchSlug,
      }),
    },
  ),
);

// --- Selectors ---

export const useCartItems = () => useCartStore((s) => s.items);

export const useCartTotal = () =>
  useCartStore((s) =>
    s.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
  );

export const useCartItemCount = () =>
  useCartStore((s) =>
    s.items.reduce((count, item) => count + item.quantity, 0),
  );

export const useCartBranch = () => useCartStore((s) => s.branchSlug);

export const useCartActions = () =>
  useCartStore(
    useShallow((s) => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateItem: s.updateItem,
      updateQuantity: s.updateQuantity,
      clearCart: s.clearCart,
      setBranch: s.setBranch,
    })),
  );

export { computeUnitPrice };
