import type { Metadata } from "next";
import "./globals.css";
import { DarkModeProvider } from '@/lib/darkmode';

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
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
