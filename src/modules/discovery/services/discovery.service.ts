import type {
  BarangayDTO,
  FoodSearchResultDTO,
  LocationDTO,
  RestaurantPreviewDTO,
} from "../dtos/discovery.dto";
import type {
  DiscoveryRow,
  FoodSearchRow,
  IDiscoveryRepository,
} from "../repositories/discovery.repository";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IDiscoveryService {
  listFeatured(limit: number): Promise<RestaurantPreviewDTO[]>;
  listNearby(
    lat: number | undefined,
    lng: number | undefined,
    limit: number,
  ): Promise<RestaurantPreviewDTO[]>;
  search(opts: {
    query?: string;
    cuisine?: string;
    city?: string;
    barangay?: string;
    limit: number;
  }): Promise<RestaurantPreviewDTO[]>;
  searchFood(opts: {
    query: string;
    barangay?: string;
    limit?: number;
  }): Promise<FoodSearchResultDTO[]>;
  listLocations(): Promise<LocationDTO[]>;
  listBarangays(): Promise<BarangayDTO[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class DiscoveryService implements IDiscoveryService {
  constructor(private repository: IDiscoveryRepository) {}

  async listFeatured(limit: number): Promise<RestaurantPreviewDTO[]> {
    const rows = await this.repository.findFeatured(limit);
    return this.hydrate(rows);
  }

  async listNearby(
    lat: number | undefined,
    lng: number | undefined,
    limit: number,
  ): Promise<RestaurantPreviewDTO[]> {
    const rows = await this.repository.findNearby(lat, lng, limit);
    return this.hydrate(rows);
  }

  async search(opts: {
    query?: string;
    cuisine?: string;
    city?: string;
    barangay?: string;
    limit: number;
  }): Promise<RestaurantPreviewDTO[]> {
    const rows = await this.repository.search(opts);
    return this.hydrate(rows);
  }

  async searchFood(opts: {
    query: string;
    barangay?: string;
    limit?: number;
  }): Promise<FoodSearchResultDTO[]> {
    const rows = await this.repository.searchFood(opts);
    return this.groupFoodResults(rows);
  }

  async listLocations(): Promise<LocationDTO[]> {
    const rows = await this.repository.findLocations();
    return rows.map((r) => ({
      city: r.city,
      province: r.province,
      slug: r.city.toLowerCase().replace(/\s+/g, "-"),
      count: r.count,
    }));
  }

  async listBarangays(): Promise<BarangayDTO[]> {
    const rows = await this.repository.findBarangays();
    return rows.map((r) => ({
      barangay: r.barangay,
      city: r.city,
      slug: r.barangay.toLowerCase().replace(/\s+/g, "-"),
      count: r.count,
    }));
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  /**
   * Group flat food search rows by restaurant, collecting matched items.
   */
  private groupFoodResults(rows: FoodSearchRow[]): FoodSearchResultDTO[] {
    const map = new Map<string, FoodSearchResultDTO>();

    for (const row of rows) {
      let entry = map.get(row.restaurantId);
      if (!entry) {
        entry = {
          id: row.restaurantId,
          slug: row.restaurantSlug,
          name: row.restaurantName,
          logoUrl: row.logoUrl,
          coverUrl: row.coverUrl,
          cuisineTypes: row.cuisineType
            ? row.cuisineType.split(",").map((s) => s.trim())
            : [],
          branchCity: row.branchCity,
          branchBarangay: row.branchBarangay,
          matchedItems: [],
        };
        map.set(row.restaurantId, entry);
      }

      entry.matchedItems.push({
        name: row.itemName,
        basePrice: row.itemBasePrice,
        imageUrl: row.itemImageUrl,
      });
    }

    return Array.from(map.values());
  }

  /**
   * Transform raw DB rows into RestaurantPreviewDTO[],
   * enriching with popular menu items.
   */
  private async hydrate(rows: DiscoveryRow[]): Promise<RestaurantPreviewDTO[]> {
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const popularMap = await this.repository.findPopularItems(ids);

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      coverImageUrl: r.coverUrl,
      logoUrl: r.logoUrl,
      cuisineTypes: r.cuisineType
        ? r.cuisineType.split(",").map((s) => s.trim())
        : [],
      popularItems: popularMap.get(r.id) ?? [],
      branchCity: r.branchCity,
    }));
  }
}
