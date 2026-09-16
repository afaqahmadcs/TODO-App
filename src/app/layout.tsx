import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afaq TaskFlow | High-Performance Personal Productivity",
  description:
    "Unified productivity and work-management system for Office content, Personal vlogs, College academics, and Web Development.",
  icons: {
    icon: "/assets/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1326",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-background font-body text-on-surface">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
