import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { StoreHydration } from "@/components/StoreHydration";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SplitMint — Your Gateway to Karbon",
  description: "A premium expense splitting application for groups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          outfit.variable,
          "font-sans min-h-screen bg-background text-foreground"
        )}
      >
        <ThemeProvider>
          <StoreHydration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

