import { getContainer } from "@/shared/infra/container";
import { OrderRepository } from "../repositories/order.repository";
import { BranchChecker } from "../services/branch-checker";
import { OrderService } from "../services/order.service";

let orderRepository: OrderRepository | null = null;
let orderService: OrderService | null = null;

export function makeOrderRepository() {
  if (!orderRepository) {
    orderRepository = new OrderRepository(getContainer().db);
  }
  return orderRepository;
}

export function makeOrderService() {
  if (!orderService) {
    const db = getContainer().db;
    orderService = new OrderService(
      makeOrderRepository(),
      new BranchChecker(db),
    );
  }
  return orderService;
}
