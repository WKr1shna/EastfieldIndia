import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import "@/styles/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "EastField India | Bihar-Origin Makhana Aggregation & B2B Supply",
    template: "%s | EastField India",
  },
  description: siteConfig.description,
  keywords: [
    "Bihar makhana",
    "Makhana supplier",
    "Makhana bulk supply",
    "Makhana aggregator",
    "Makhana wholesale",
    "Bihar-origin makhana",
    "Makhana sourcing",
    "Makhana exporter",
    "Purnea makhana",
    "Katihar makhana",
    "B2B makhana supply",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "EastField India — Bihar-Origin Makhana. Built for B2B Supply.",
    description: siteConfig.description,
    images: [
      {
        url: "/images/hero/makhana-hero.jpg",
        width: 1200,
        height: 900,
        alt: "Bihar-origin makhana in a handcrafted stoneware bowl",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EastField India — Bihar-Origin Makhana. Built for B2B Supply.",
    description: siteConfig.description,
    images: ["/images/hero/makhana-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased selection:bg-gold-500 selection:text-forest-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-forest-950"
        >
          Skip to main content
        </a>
        <InquiryProvider>{children}</InquiryProvider>
      </body>
    </html>
  );
}
