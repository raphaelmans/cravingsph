import type { LocationDTO, RestaurantPreviewDTO } from "../dtos/discovery.dto";
import type {
  DiscoveryRow,
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
    limit: number;
  }): Promise<RestaurantPreviewDTO[]>;
  listLocations(): Promise<LocationDTO[]>;
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
    limit: number;
  }): Promise<RestaurantPreviewDTO[]> {
    const rows = await this.repository.search(opts);
    return this.hydrate(rows);
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

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

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
