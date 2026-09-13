import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasca · Le tue finanze",
  description: "Entrate, spese e budget mensili, sempre a portata di mano.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable:true, title:"Tasca", statusBarStyle:"default"},
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {width:"device-width", initialScale:1, themeColor:"#635bdb"};

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
