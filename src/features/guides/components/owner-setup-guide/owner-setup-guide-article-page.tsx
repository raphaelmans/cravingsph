"use client";

import { InteractiveGuideArticlePage } from "@/features/guides/components/interactive-guide-article-page";
import { OWNER_SETUP_GUIDE_SECTIONS } from "@/features/guides/components/owner-setup-guide/owner-setup-guide-content";
import { getOwnerSetupSnippetForSection } from "@/features/guides/components/owner-setup-guide/owner-setup-guide-snippets";

export function OwnerSetupGuideArticlePage({
  header,
  footer,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <InteractiveGuideArticlePage
      sections={OWNER_SETUP_GUIDE_SECTIONS}
      getSnippetForSection={getOwnerSetupSnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
