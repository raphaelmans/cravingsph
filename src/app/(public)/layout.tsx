import type { Metadata } from "next";
import { CustomerShell } from "@/components/layout/customer-shell";

export const metadata: Metadata = {
  title: "CravingsPH | Discover restaurants and order faster",
  description:
    "Discover local restaurants, browse digital menus, and place dine-in or pickup orders with CravingsPH.",
  openGraph: {
    title: "CravingsPH | Discover restaurants and order faster",
    description:
      "Discover local restaurants, browse digital menus, and place dine-in or pickup orders with CravingsPH.",
    images: ["/logo.svg"],
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerShell>{children}</CustomerShell>;
}
