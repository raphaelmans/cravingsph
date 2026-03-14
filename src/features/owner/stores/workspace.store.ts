import { create } from "zustand";
import { useShallow } from "zustand/shallow";

// --- Types ---

interface WorkspaceState {
  /** null means "All Restaurants" (no filter) */
  selectedRestaurantId: string | null;
}

interface WorkspaceActions {
  selectRestaurant: (restaurantId: string) => void;
  clearSelection: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

// --- Store ---

const useWorkspaceStoreBase = create<WorkspaceStore>((set) => ({
  selectedRestaurantId: null,
  selectRestaurant: (restaurantId) =>
    set({ selectedRestaurantId: restaurantId }),
  clearSelection: () => set({ selectedRestaurantId: null }),
}));

// --- Selectors ---

export function useSelectedRestaurantId() {
  return useWorkspaceStoreBase((s) => s.selectedRestaurantId);
}

export function useWorkspaceActions() {
  return useWorkspaceStoreBase(
    useShallow((s) => ({
      selectRestaurant: s.selectRestaurant,
      clearSelection: s.clearSelection,
    })),
  );
}
