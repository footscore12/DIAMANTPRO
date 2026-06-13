import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIAMANT PRO SERVICES - Gestion",
  description: "Application de gestion pour DIAMANT PRO SERVICES",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
