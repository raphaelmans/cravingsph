"use client";

import { ADMIN_GUIDE_SECTIONS } from "@/features/guides/components/admin-guide/admin-guide-content";
import { getAdminSnippetForSection } from "@/features/guides/components/admin-guide/admin-guide-snippets";
import { InteractiveGuideArticlePage } from "@/features/guides/components/interactive-guide-article-page";

export function AdminGuideArticlePage({
  header,
  footer,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <InteractiveGuideArticlePage
      sections={ADMIN_GUIDE_SECTIONS}
      getSnippetForSection={getAdminSnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
