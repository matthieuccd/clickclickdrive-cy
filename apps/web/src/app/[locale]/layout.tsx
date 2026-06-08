import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";

import { localeConfig } from "../../../i18n.config";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "greek", "greek-ext"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    template: "%s · ClickClickDrive Cyprus",
    default: "ClickClickDrive Cyprus — Σχολές οδηγών",
  },
  description:
    "Find driving schools across Cyprus. Compare ratings, hours, and contact details — free.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const htmlLang = localeConfig[locale].htmlLang;
  return (
    <html lang={htmlLang} className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background text-text-primary">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
