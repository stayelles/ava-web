import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ava — Your AI Friend, Always There",
  description:
    "Meet Ava, the AI assistant that listens, remembers, and controls your world. Voice conversations, desktop control, and more.",
  keywords: ["AI assistant", "voice AI", "Ava", "desktop control", "AI companion"],
  openGraph: {
    title: "Ava — Your AI Friend, Always There",
    description: "Meet Ava, the AI assistant that truly listens.",
    url: "https://call-ava.com",
    siteName: "Ava",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ava — Your AI Friend, Always There",
    description: "Meet Ava, the AI assistant that truly listens.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {children}
        <Script src="https://gumroad.com/js/gumroad.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
