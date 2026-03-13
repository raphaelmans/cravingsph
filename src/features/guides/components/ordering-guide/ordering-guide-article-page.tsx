"use client";

import { InteractiveGuideArticlePage } from "@/features/guides/components/interactive-guide-article-page";
import { ORDERING_GUIDE_SECTIONS } from "@/features/guides/components/ordering-guide/ordering-guide-content";
import { getOrderingSnippetForSection } from "@/features/guides/components/ordering-guide/ordering-guide-snippets";

export function OrderingGuideArticlePage({
  header,
  footer,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <InteractiveGuideArticlePage
      sections={ORDERING_GUIDE_SECTIONS}
      getSnippetForSection={getOrderingSnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
