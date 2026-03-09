import type { SavedRestaurantDTO } from "../dtos/saved-restaurant.dto";
import type {
  ISavedRestaurantRepository,
  SavedRestaurantRow,
} from "../repositories/saved-restaurant.repository";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ISavedRestaurantService {
  list(userId: string): Promise<SavedRestaurantDTO[]>;
  toggle(
    userId: string,
    restaurantId: string,
    note?: string,
  ): Promise<{ saved: boolean }>;
  isSaved(userId: string, restaurantId: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SavedRestaurantService implements ISavedRestaurantService {
  constructor(private repository: ISavedRestaurantRepository) {}

  async list(userId: string): Promise<SavedRestaurantDTO[]> {
    const rows = await this.repository.findByUserId(userId);
    return this.hydrate(rows);
  }

  async toggle(
    userId: string,
    restaurantId: string,
    note?: string,
  ): Promise<{ saved: boolean }> {
    const alreadySaved = await this.repository.isSaved(userId, restaurantId);

    if (alreadySaved) {
      await this.repository.unsave(userId, restaurantId);
      return { saved: false };
    }

    await this.repository.save(userId, restaurantId, note);
    return { saved: true };
  }

  async isSaved(userId: string, restaurantId: string): Promise<boolean> {
    return this.repository.isSaved(userId, restaurantId);
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private async hydrate(
    rows: SavedRestaurantRow[],
  ): Promise<SavedRestaurantDTO[]> {
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.restaurantId);
    const popularMap = await this.repository.findPopularItems(ids);

    return rows.map((r) => ({
      id: r.id,
      restaurantId: r.restaurantId,
      slug: r.slug,
      name: r.name,
      coverImageUrl: r.coverUrl,
      logoUrl: r.logoUrl,
      cuisineTypes: r.cuisineType
        ? r.cuisineType.split(",").map((s) => s.trim())
        : [],
      popularItems: popularMap.get(r.restaurantId) ?? [],
      locationLabel: r.branchCity,
      savedAt: r.savedAt.toISOString(),
      note: r.note,
    }));
  }
}
