"use client";

import { DISCOVERY_GUIDE_SECTIONS } from "@/features/guides/components/discovery-guide/discovery-guide-content";
import { getDiscoverySnippetForSection } from "@/features/guides/components/discovery-guide/discovery-guide-snippets";
import { InteractiveGuideArticlePage } from "@/features/guides/components/interactive-guide-article-page";

export function DiscoveryGuideArticlePage({
  header,
  footer,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <InteractiveGuideArticlePage
      sections={DISCOVERY_GUIDE_SECTIONS}
      getSnippetForSection={getDiscoverySnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
