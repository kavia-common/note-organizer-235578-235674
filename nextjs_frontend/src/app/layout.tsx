import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retro Notes",
  description: "A retro-themed notes organizer with tags, pinned, favorites, and search.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
