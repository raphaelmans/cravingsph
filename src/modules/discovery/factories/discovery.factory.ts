import { getContainer } from "@/shared/infra/container";
import { DiscoveryRepository } from "../repositories/discovery.repository";
import { DiscoveryService } from "../services/discovery.service";

let discoveryRepository: DiscoveryRepository | null = null;
let discoveryService: DiscoveryService | null = null;

export function makeDiscoveryRepository() {
  if (!discoveryRepository) {
    discoveryRepository = new DiscoveryRepository(getContainer().db);
  }
  return discoveryRepository;
}

export function makeDiscoveryService() {
  if (!discoveryService) {
    discoveryService = new DiscoveryService(makeDiscoveryRepository());
  }
  return discoveryService;
}
