import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CCNE IV Copilot",
  description: "Generate CCNE Standard IV reports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


