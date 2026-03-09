import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search restaurants | CravingsPH",
  description:
    "Search restaurants, cuisines, and popular dishes across the CravingsPH customer discovery experience.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
