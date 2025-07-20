import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
});

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secondhand Studio - Curated Pre-loved Fashion",
  description: "Discover and shop for unique, high-quality secondhand fashion at Secondhand Studio. Explore our curated collection of dresses, handbags, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <Providers>

          <div className="relative flex min-h-screen w-full flex-col">
            <Header />
            <main
              className="flex-1"
            >
              {children}
            </main>
            <MobileBottomNav />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
