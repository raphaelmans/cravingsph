import { notFound } from "next/navigation";
import { BranchNotFoundError } from "@/modules/branch/errors/branch.errors";
import { makeBranchService } from "@/modules/branch/factories/branch.factory";

interface BranchPortalPageProps {
  params: Promise<{ portalSlug: string }>;
}

/**
 * Branch portal overview page (placeholder).
 * Step 5 will replace this with the full branch overview.
 */
export default async function BranchPortalPage({
  params,
}: BranchPortalPageProps) {
  const { portalSlug } = await params;

  const branch = await makeBranchService()
    .getByPortalSlug(portalSlug)
    .catch((error: unknown) => {
      if (error instanceof BranchNotFoundError) {
        notFound();
      }
      throw error;
    });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="font-heading text-2xl font-semibold">{branch.name}</h1>
      <p className="text-muted-foreground text-sm">
        Branch portal — content coming in Step 5
      </p>
    </div>
  );
}
