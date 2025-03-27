// app/layout.jsx
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
// app/layout.tsx
import { Toaster } from 'react-hot-toast';

import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

import AuthProvider from "./providers/AuthProvider";

export const metadata: Metadata = {
  title: "Wusle - A Solana base Health Coin",
  description: "Earn wusle coins by tracking and improving your heart health.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Wusle - A Solana base Health Coin",
    description: "Earn wusle coins by tracking and improving your heart health.",
    images: "/favicon.ico",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wusle - A Solana base Health Coin",
    description: "Earn wusle coins by tracking and improving your heart health.",
    images: "/favicon.ico",
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
