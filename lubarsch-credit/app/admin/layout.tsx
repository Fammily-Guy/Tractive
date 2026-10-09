import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Staff — Lubarsch Credit",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-[16px] antialiased">{children}</body>
    </html>
  );
}
