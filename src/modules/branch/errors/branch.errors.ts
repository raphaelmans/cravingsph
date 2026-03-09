import { NotFoundError } from "@/shared/kernel/errors";

export class BranchNotFoundError extends NotFoundError {
  readonly code = "BRANCH_NOT_FOUND";

  constructor(branchId: string) {
    super("Branch not found", { branchId });
  }
}
