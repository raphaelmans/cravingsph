import { getContainer } from "@/shared/infra/container";
import { PaymentConfigRepository } from "../repositories/payment-config.repository";
import { PaymentConfigService } from "../services/payment-config.service";

let paymentConfigRepository: PaymentConfigRepository | null = null;
let paymentConfigService: PaymentConfigService | null = null;

export function makePaymentConfigRepository() {
  if (!paymentConfigRepository) {
    paymentConfigRepository = new PaymentConfigRepository(getContainer().db);
  }
  return paymentConfigRepository;
}

export function makePaymentConfigService() {
  if (!paymentConfigService) {
    paymentConfigService = new PaymentConfigService(
      makePaymentConfigRepository(),
    );
  }
  return paymentConfigService;
}
