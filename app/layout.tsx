import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://call-ava.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Ava — AI Voice Assistant | Talk, Control, Remember",
    template: "%s | Ava AI",
  },
  description:
    "Ava is the AI voice assistant that listens, acts, and remembers. Control your Mac, set smart reminders, search the web, and have real conversations — on iOS, Android, Mac, PC & web. Free to start.",
  keywords: [
    "AI voice assistant", "voice AI", "Ava AI", "AI companion",
    "Mac control AI", "AI reminders", "Gemini AI assistant",
    "AI assistant iOS", "AI assistant Android", "desktop AI agent",
    "AI web search", "real-time AI voice", "AI voice chat",
    "assistant vocal IA", "IA voix", "contrôle Mac IA",
  ],
  authors: [{ name: "Woonix LTD", url: BASE_URL }],
  creator: "Woonix LTD",
  publisher: "Woonix LTD",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Ava — The AI Voice Assistant That Actually Does Things",
    description:
      "Talk to Ava like a friend. She listens, remembers, controls your Mac, sets reminders, and searches the web — all with your voice. Free on iOS, Android, Mac, PC & web.",
    url: BASE_URL,
    siteName: "Ava AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1280,
        height: 720,
        alt: "Ava — AI Real-Time Voice Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ava — The AI Voice Assistant That Actually Does Things",
    description:
      "Talk to Ava like a friend. She listens, remembers, controls your Mac, sets reminders, and searches the web — all with your voice.",
    images: ["/og-image.png"],
    site: "@woonixltd",
    creator: "@woonixltd",
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Ava",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "iOS, Android, macOS, Windows, Web Browser",
  description:
    "Ava is an AI voice assistant powered by Google Gemini Live. Control your Mac, set reminders, search the web, and have real conversations — all with your voice.",
  url: BASE_URL,
  image: `${BASE_URL}/og-image.png`,
  screenshot: `${BASE_URL}/og-image.png`,
  author: {
    "@type": "Organization",
    name: "Woonix LTD",
    url: BASE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "71-75 Shelton Street, Covent Garden",
      addressLocality: "London",
      postalCode: "WC2H 9JQ",
      addressCountry: "GB",
    },
  },
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "EUR",
      description: "5 free credits per day",
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "39.90",
      priceCurrency: "EUR",
      description: "250 min voice/month, 300 text messages/day, unlimited features",
    },
    {
      "@type": "Offer",
      name: "Custom Plan",
      price: "14.99",
      priceCurrency: "EUR",
      description: "Unlimited voice & text with your own Gemini API key",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2400",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {children}
        <Script src="https://gumroad.com/js/gumroad.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
