import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanity Country Personalization Demo",
  description: "Next.js 15 App Router demo with Sanity CMS and country-based content selection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
