import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import {
  articleHref,
  articleTitle,
  getAllArticles,
} from "@/lib/blog";
import {
  AUTHORS,
  getAuthorBySlug,
  authorPageHref,
} from "@/lib/authors";
import { SITE_HOST, siteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lc = locale as Locale;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Not found" };

  const title =
    lc === "el"
      ? `${author.name} - Συγγραφέας | ClickClickDrive Κύπρος`
      : `${author.name} - Author | ClickClickDrive Cyprus`;
  const descriptionEl = author.bio_short_el;
  const pathEl = `/arthrografoi/${slug}`;
  const pathEn = `/en/authors/${slug}`;

  return {
    title,
    description: lc === "el" ? author.bio_short_el : author.bio_short_en,
    alternates: {
      canonical: siteUrl(lc === "el" ? pathEl : pathEn),
      languages: {
        "x-default": siteUrl(pathEl),
        el: siteUrl(pathEl),
        en: siteUrl(pathEn),
      },
    },
    openGraph: {
      title,
      description: lc === "el" ? author.bio_short_el : author.bio_short_en,
      url: siteUrl(lc === "el" ? pathEl : pathEn),
      type: "profile",
      locale: lc === "el" ? "el_CY" : "en_CY",
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const allArticles = getAllArticles().filter(
    (a) => a.authorSlug === author.slug,
  );

  const bio = locale === "el" ? author.bio_el : author.bio_en;
  const title = locale === "el" ? author.title_el : author.title_en;
  const heading =
    locale === "el" ? "Άρθρα από τον Συγγραφέα" : "Articles by this Author";
  const backLabel = locale === "el" ? "← Άρθρα" : "← Blog";
  const backHref = locale === "el" ? "/arthra" : "/en/blog";

  const pageUrl = siteUrl(
    locale === "el"
      ? `/arthrografoi/${slug}`
      : `/en/authors/${slug}`,
  );

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.title_en,
    url: pageUrl,
    sameAs: [author.linkedIn],
    image: siteUrl(author.photo),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={personJsonLd} />

      <nav className="mb-8 text-sm">
        <a
          href={backHref}
          className="font-semibold text-brand hover:text-brand-dark"
        >
          {backLabel}
        </a>
      </nav>

      {/* Author card */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Image
          src={author.photo}
          alt={author.name}
          width={112}
          height={112}
          className="size-24 shrink-0 rounded-full object-cover sm:size-28"
          priority
          unoptimized
        />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {author.name}
            </h1>
            <a
              href={author.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#0A66C2] hover:opacity-80"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
          <p className="mt-1 text-text-muted">{title}</p>
          <div className="mt-3 space-y-3 leading-relaxed text-text-secondary">
            {bio.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Article list */}
      {allArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-text-primary">
            {heading}
          </h2>
          <ul className="space-y-6">
            {allArticles.map((a) => {
              const date = new Date(a.publishedDate).toLocaleDateString(
                locale === "el" ? "el-CY" : "en-CY",
                { day: "numeric", month: "long", year: "numeric" },
              );
              const excerpt =
                locale === "el" ? a.excerpt_el : a.excerpt_en;
              return (
                <li key={a.id}>
                  <a
                    href={articleHref(a, locale)}
                    className="group flex gap-4 rounded-xl border border-border bg-surface p-4 hover:border-brand"
                  >
                    <div className="relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:w-40">
                      <Image
                        src={a.heroImagePath}
                        alt={
                          locale === "el"
                            ? a.heroImageAlt_el
                            : a.heroImageAlt_en
                        }
                        fill
                        sizes="(min-width: 640px) 160px, 128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <p className="font-semibold leading-snug text-text-primary group-hover:text-brand">
                          {articleTitle(a, locale)}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary line-clamp-2">
                          {excerpt}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-text-muted">{date}</p>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
