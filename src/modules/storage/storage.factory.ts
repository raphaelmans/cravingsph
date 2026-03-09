import { StorageService } from "./storage.service";

let storageService: StorageService | null = null;

export function makeStorageService() {
  if (!storageService) {
    storageService = new StorageService();
  }
  return storageService;
}
