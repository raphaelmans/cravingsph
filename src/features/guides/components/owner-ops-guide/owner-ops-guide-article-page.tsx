"use client";

import { InteractiveGuideArticlePage } from "@/features/guides/components/interactive-guide-article-page";
import { OWNER_OPS_GUIDE_SECTIONS } from "@/features/guides/components/owner-ops-guide/owner-ops-guide-content";
import { getOwnerOpsSnippetForSection } from "@/features/guides/components/owner-ops-guide/owner-ops-guide-snippets";

export function OwnerOpsGuideArticlePage({
  header,
  footer,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <InteractiveGuideArticlePage
      sections={OWNER_OPS_GUIDE_SECTIONS}
      getSnippetForSection={getOwnerOpsSnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
