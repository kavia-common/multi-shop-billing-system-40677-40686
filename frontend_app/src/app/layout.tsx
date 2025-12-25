import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Ocean Billing — Multi‑Shop System",
  description:
    "Professional multi-shop billing system with modern, accessible UI built on Next.js App Router.",
  applicationName: "Ocean Billing",
  keywords: ["billing", "multi-shop", "nextjs", "invoicing", "customers"],
  authors: [{ name: "Ocean Billing" }],
  icons: { icon: "/favicon.ico" },
};

 /**
  * PUBLIC_INTERFACE
  * RootLayout
  * @description Application root layout using Next.js App Router. Wraps all pages with AppShell to provide
  * a consistent top navigation, responsive sidebar, and content area, while applying global styles.
  */
export default function RootLayout({
  children,
}: {
  /** React subtree to render inside the AppShell */
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
