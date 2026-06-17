import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KanbaFlow - Project Management That Moves Teams Forward",
  description:
    "Plan projects, organize tasks, track progress, and collaborate seamlessly with your team using KanbaFlow.",
  metadataBase: new URL("https://kanbaflow.vercel.app"),
  openGraph: {
    title: "KanbaFlow",
    description: "Project management that moves teams forward.",
    url: "https://kanbaflow.vercel.app",
    siteName: "KanbaFlow",
    images: [
      {
        url: "https://kanbaflow.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "KanbaFlow",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "KanbaFlow",
    description: "Project management that moves teams forward.",
    images: ["https://kanbaflow.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
