import type { Metadata } from "next";
import { Mulish, Noto_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";

import { localeConfig } from "../../../i18n.config";
import "../globals.css";

// Brand font (matches clickclickdrive.de). Greek glyphs aren't in Mulish on
// Google Fonts, so the body font stack falls through to Noto Sans for Greek.
const mulish = Mulish({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mulish",
  display: "swap",
});

const notoSansGreek = Noto_Sans({
  subsets: ["greek", "greek-ext"],
  variable: "--font-greek",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    template: "%s · ClickClickDrive Cyprus",
    default: "ClickClickDrive Cyprus - Σχολές οδηγών στην Κύπρο",
  },
  description:
    "Βρείτε σχολές οδηγών σε όλη την Κύπρο. Συγκρίνετε αξιολογήσεις, ωράρια και στοιχεία επικοινωνίας - δωρεάν.",
  icons: {
    icon: [
      { url: "/favicon-small.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
    ],
    apple: { url: "/favicon.png", type: "image/png" },
    shortcut: "/favicon.png",
  },
  manifest: "/site.webmanifest",
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
    <html
      lang={htmlLang}
      className={`${mulish.variable} ${notoSansGreek.variable}`}
    >
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
