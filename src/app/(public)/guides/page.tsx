import type { Metadata } from "next";
import { GUIDE_ENTRIES } from "@/features/guides/content/guides";
import { GuidesIndexPage } from "@/features/guides/pages/guides-index-page";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cravings.ph";

const title = "Guides — CravingsPH";
const description =
  "Step-by-step guides for finding restaurants, scanning QR codes to order dine-in, setting up your venue with tables, managing operations, and administering the platform.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: new URL("/guides", appUrl) },
  openGraph: {
    title,
    description,
    url: new URL("/guides", appUrl),
  },
};

export default function GuidesPage() {
  return <GuidesIndexPage guides={GUIDE_ENTRIES} />;
}
