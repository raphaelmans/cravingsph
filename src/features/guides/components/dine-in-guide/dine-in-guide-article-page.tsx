"use client";

import { DINE_IN_GUIDE_SECTIONS } from "@/features/guides/components/dine-in-guide/dine-in-guide-content";
import { getDineInSnippetForSection } from "@/features/guides/components/dine-in-guide/dine-in-guide-snippets";
import { InteractiveGuideArticlePage } from "@/features/guides/components/interactive-guide-article-page";

export function DineInGuideArticlePage({
  header,
  footer,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <InteractiveGuideArticlePage
      sections={DINE_IN_GUIDE_SECTIONS}
      getSnippetForSection={getDineInSnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
