import { getContainer } from "@/shared/infra/container";
import { ReviewRepository } from "../repositories/review.repository";
import { ReviewService } from "../services/review.service";

let reviewRepository: ReviewRepository | null = null;
let reviewService: ReviewService | null = null;

export function makeReviewRepository() {
  if (!reviewRepository) {
    reviewRepository = new ReviewRepository(getContainer().db);
  }
  return reviewRepository;
}

export function makeReviewService() {
  if (!reviewService) {
    reviewService = new ReviewService(makeReviewRepository());
  }
  return reviewService;
}
