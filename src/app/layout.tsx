import type { Metadata } from "next";
import { inter, leagueSpartan, antonio, geistMono } from "@/lib/fonts";
import { HealthCheck } from "@/components/health-check";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CravingsPH",
  description:
    "Mobile-first restaurant menu and ordering platform for the Philippines.",
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
