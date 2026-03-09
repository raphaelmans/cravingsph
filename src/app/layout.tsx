import type { Metadata } from "next";
import { HealthCheck } from "@/components/health-check";
import { Providers } from "@/components/providers";
import { antonio, geistMono, inter, leagueSpartan } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "CravingsPH",
  description:
    "Mobile-first restaurant menu and ordering platform for the Philippines.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${leagueSpartan.variable} ${antonio.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <HealthCheck />
        </Providers>
      </body>
    </html>
  );
}
