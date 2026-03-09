import { notFound } from "next/navigation";
import { AdminVerificationReviewPage } from "@/features/admin/components/admin-verification-review-page";
import { NotFoundError } from "@/shared/kernel/errors";
import { api } from "@/trpc/server";

async function assertVerificationRequestExists(requestId: string) {
  const caller = await api();

  try {
    await caller.admin.getVerificationRequest({ requestId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
}

export default async function AdminVerificationRequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  await assertVerificationRequestExists(requestId);

  return <AdminVerificationReviewPage requestId={requestId} />;
}
