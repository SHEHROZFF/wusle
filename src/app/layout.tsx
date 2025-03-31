// app/layout.tsx

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import AuthProvider from "./providers/AuthProvider";

export const metadata = {
  title: "Wusle - A Solana Base Health Coin",
  description: "Earn Wusle coins by tracking and improving your heart health.",
  // icons: {
  //   icon: "/favicon.png",
  //   // Optionally add an apple-touch-icon if needed:
  //   // apple: "/apple-touch-icon.png"
  // },
  // openGraph: {
  //   title: "Wusle - A Solana Base Health Coin",
  //   description: "Earn Wusle coins by tracking and improving your heart health.",
  //   url: "https://wusle.com",
  //   siteName: "Wusle",
  //   type: "website",
  //   images: [
  //     {
  //       url: "https://wusle.com/favicon.png", // Ensure this image is large enough (e.g., 1200x630)
  //       width: 1200,
  //       height: 630,
  //       alt: "Wusle - A Solana Base Health Coin",
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Wusle - A Solana Base Health Coin",
  //   description: "Earn Wusle coins by tracking and improving your heart health.",
  //   images: ["https://wusle.com/favicon.png"],
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
