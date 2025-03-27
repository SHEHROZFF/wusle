// app/layout.jsx
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
// app/layout.tsx
import { Toaster } from 'react-hot-toast';

import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

import AuthProvider from "./providers/AuthProvider";

export const metadata: Metadata = {
  title: "Wusle - A Solana Base Health Coin",
  description: "Earn Wusle coins by tracking and improving your heart health.",

  // ✅ Use PNG instead of ICO for compatibility
  icons: {
    icon: "/favicon.png", // Ensure /public/favicon.png exists
    apple: "/wusle.png", // Ensure /public/wusle.png exists
  },

  // ✅ OpenGraph metadata (for Solana & Phantom wallets)
  openGraph: {
    title: "Wusle - A Solana Base Health Coin",
    description: "Earn Wusle coins by tracking and improving your heart health.",
    url: "https://wusle.com",
    siteName: "Wusle",
    images: [
      {
        url: "https://wusle.com/wusle.png", // Must be a publicly accessible image
        width: 1024,
        height: 1024,
        alt: "Wusle Logo",
      },
    ],
    type: "website",
  },

  // ✅ Twitter metadata (for wallets using Twitter metadata)
  twitter: {
    card: "summary_large_image",
    title: "Wusle - A Solana Base Health Coin",
    description: "Earn Wusle coins by tracking and improving your heart health.",
    images: [
      {
        url: "https://wusle.com/wusle.png", // Must match OpenGraph image
        alt: "Wusle Logo",
      },
    ],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>{children}</ClientProviders>
          <Toaster position="top-center" />
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
