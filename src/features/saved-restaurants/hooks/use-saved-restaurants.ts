"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { RestaurantPreview } from "@/features/discovery/components/restaurant-card";

const STORAGE_KEY = "cravings-saved-restaurants";

export interface SavedRestaurantRecord extends RestaurantPreview {
  locationLabel: string;
  deliveryWindow: string;
  averageTicketAmount: number;
  savedAt: string;
  lastOrderedAt: string | null;
  note: string;
}

interface SavedRestaurantsStore {
  restaurants: SavedRestaurantRecord[];
}

const INITIAL_STORE: SavedRestaurantsStore = {
  restaurants: [
    {
      slug: "mang-inasal-sm-north",
      name: "Mang Inasal",
      coverImageUrl: null,
      logoUrl: null,
      cuisineTypes: ["Filipino", "Chicken"],
      popularItems: ["Chicken Inasal Paa", "Pork BBQ", "Halo-Halo"],
      locationLabel: "SM North EDSA",
      deliveryWindow: "20-25 min",
      averageTicketAmount: 285,
      savedAt: "2026-03-08T09:45:00.000Z",
      lastOrderedAt: "2026-03-07T12:20:00.000Z",
      note: "Reliable grilled favorites for family lunches.",
    },
    {
      slug: "lugawan-sa-kanto",
      name: "Lugawan sa Kanto",
      coverImageUrl: null,
      logoUrl: null,
      cuisineTypes: ["Filipino", "Street Food"],
      popularItems: ["Lugaw", "Tokwa't Baboy", "Goto"],
      locationLabel: "Katipunan Avenue",
      deliveryWindow: "15-20 min",
      averageTicketAmount: 160,
      savedAt: "2026-03-06T20:15:00.000Z",
      lastOrderedAt: "2026-03-04T08:10:00.000Z",
      note: "Best quick comfort food when I want something warm.",
    },
    {
      slug: "brew-coffee-co",
      name: "Brew Coffee Co.",
      coverImageUrl: null,
      logoUrl: null,
      cuisineTypes: ["Coffee", "Pastries"],
      popularItems: ["Iced Spanish Latte", "Matcha Latte", "Ensaymada"],
      locationLabel: "BGC High Street",
      deliveryWindow: "18-24 min",
      averageTicketAmount: 210,
      savedAt: "2026-03-01T15:30:00.000Z",
      lastOrderedAt: "2026-02-28T17:35:00.000Z",
      note: "Easy cafe fallback for late afternoon cravings.",
    },
  ],
};

let savedRestaurantsStore = INITIAL_STORE;
let hasHydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function isSavedRestaurantRecord(
  value: unknown,
): value is SavedRestaurantRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.cuisineTypes) &&
    Array.isArray(candidate.popularItems) &&
    typeof candidate.locationLabel === "string" &&
    typeof candidate.deliveryWindow === "string" &&
    typeof candidate.averageTicketAmount === "number" &&
    typeof candidate.savedAt === "string" &&
    typeof candidate.note === "string"
  );
}

function hydrateFromStorage() {
  if (hasHydrated || typeof window === "undefined") {
    return;
  }

  hasHydrated = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { restaurants?: unknown[] }).restaurants)
    ) {
      const restaurants = (parsed as { restaurants: unknown[] }).restaurants
        .filter(isSavedRestaurantRecord)
        .map((restaurant) => ({
          ...restaurant,
          coverImageUrl: restaurant.coverImageUrl ?? null,
          logoUrl: restaurant.logoUrl ?? null,
          lastOrderedAt: restaurant.lastOrderedAt ?? null,
        }));

      savedRestaurantsStore = { restaurants };
    }
  } catch {
    savedRestaurantsStore = INITIAL_STORE;
  }
}

function persistStore() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(savedRestaurantsStore),
  );
}

function getSnapshot() {
  hydrateFromStorage();
  return savedRestaurantsStore;
}

function getServerSnapshot() {
  return INITIAL_STORE;
}

function updateStore(
  updater: (store: SavedRestaurantsStore) => SavedRestaurantsStore,
) {
  savedRestaurantsStore = updater(savedRestaurantsStore);
  persistStore();
  emitChange();
}

export function useSavedRestaurants() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const restaurants = useMemo(
    () =>
      [...snapshot.restaurants].sort(
        (left, right) =>
          new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime(),
      ),
    [snapshot.restaurants],
  );

  const stats = useMemo(() => {
    const cuisineCount = new Set(
      restaurants.flatMap((restaurant) => restaurant.cuisineTypes),
    ).size;
    const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlySavedCount = restaurants.filter(
      (restaurant) => new Date(restaurant.savedAt).getTime() >= recentCutoff,
    ).length;

    return {
      totalSaved: restaurants.length,
      cuisineCount,
      recentlySavedCount,
    };
  }, [restaurants]);

  const unsaveRestaurant = (slug: string) => {
    updateStore((store) => ({
      restaurants: store.restaurants.filter(
        (restaurant) => restaurant.slug !== slug,
      ),
    }));
  };

  const saveRestaurant = (restaurant: SavedRestaurantRecord) => {
    updateStore((store) => {
      const existing = store.restaurants.find(
        (entry) => entry.slug === restaurant.slug,
      );

      if (existing) {
        return {
          restaurants: store.restaurants.map((entry) =>
            entry.slug === restaurant.slug ? restaurant : entry,
          ),
        };
      }

      return {
        restaurants: [restaurant, ...store.restaurants],
      };
    });
  };

  const toggleSavedRestaurant = (restaurant: SavedRestaurantRecord) => {
    const existing = snapshot.restaurants.some(
      (entry) => entry.slug === restaurant.slug,
    );

    if (existing) {
      unsaveRestaurant(restaurant.slug);
      return false;
    }

    saveRestaurant(restaurant);
    return true;
  };

  const isSaved = (slug: string) =>
    snapshot.restaurants.some((restaurant) => restaurant.slug === slug);

  return {
    restaurants,
    stats,
    saveRestaurant,
    unsaveRestaurant,
    toggleSavedRestaurant,
    isSaved,
  };
}
