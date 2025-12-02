import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "📷 Real or AI 🍌",
  description:
    "Can you tell the difference between real photos and AI-generated images?",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    title: "Real or AI",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "📷 Real or AI 🍌",
    description:
      "Can you tell the difference between real photos and AI-generated images?",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Real or AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "📷 Real or AI 🍌",
    description:
      "Can you tell the difference between real photos and AI-generated images?",
    images: ["/og.jpg"],
  },
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
