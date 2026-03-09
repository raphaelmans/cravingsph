import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { getContainer } from "@/shared/infra/container";
import { RestaurantRepository } from "../repositories/restaurant.repository";
import { RestaurantService } from "../services/restaurant.service";

let restaurantRepository: RestaurantRepository | null = null;
let restaurantService: RestaurantService | null = null;

export function makeRestaurantRepository() {
  if (!restaurantRepository) {
    restaurantRepository = new RestaurantRepository(getContainer().db);
  }
  return restaurantRepository;
}

export function makeRestaurantService() {
  if (!restaurantService) {
    restaurantService = new RestaurantService(
      makeRestaurantRepository(),
      makeOrganizationRepository(),
      getContainer().transactionManager,
    );
  }
  return restaurantService;
}
