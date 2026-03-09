import { getContainer } from "@/shared/infra/container";
import { SavedRestaurantRepository } from "../repositories/saved-restaurant.repository";
import { SavedRestaurantService } from "../services/saved-restaurant.service";

let savedRestaurantRepository: SavedRestaurantRepository | null = null;
let savedRestaurantService: SavedRestaurantService | null = null;

export function makeSavedRestaurantRepository() {
  if (!savedRestaurantRepository) {
    savedRestaurantRepository = new SavedRestaurantRepository(
      getContainer().db,
    );
  }
  return savedRestaurantRepository;
}

export function makeSavedRestaurantService() {
  if (!savedRestaurantService) {
    savedRestaurantService = new SavedRestaurantService(
      makeSavedRestaurantRepository(),
    );
  }
  return savedRestaurantService;
}
