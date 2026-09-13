import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasca · Le tue finanze",
  description: "Entrate, spese e budget mensili, sempre a portata di mano.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
