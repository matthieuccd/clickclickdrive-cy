import fs from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleCard } from "@/components/ArticleCard";
import { BlogProse } from "@/components/BlogProse";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  articleHref,
  articleTitle,
  blogIndexHref,
  categoryHref,
  categoryTitle,
  findArticleBySlug,
  findCategoryBySlug,
  getAdjacent,
  getArticlesByCategory,
  getCategoryById,
  loadArticleBody,
  type BlogArticle,
  type BlogCategory,
} from "@/lib/blog";
import { SITE_HOST, siteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const isEl = params.locale === "el";
  const categoryParams = BLOG_CATEGORIES.map((c) => ({
    slug: isEl ? c.slug_el : c.slug_en,
  }));
  const articleParams = BLOG_ARTICLES.map((a) => ({
    slug: isEl ? a.slug_el : a.slug_en,
  }));
  return [...categoryParams, ...articleParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lc = locale as Locale;

  const article = findArticleBySlug(slug, lc);
  if (article) {
    const title = articleTitle(article, lc);
    const description =
      lc === "el" ? article.metaDescription_el : article.metaDescription_en;
    const pathEl = `/arthra/${article.slug_el}`;
    const pathEn = `/blog/${article.slug_en}`;
    const canonical = siteUrl(pathEl);
    return {
      title,
      description,
      alternates: {
        canonical,
        languages: {
          "x-default": canonical,
          el: siteUrl(pathEl),
          en: siteUrl(`/en${pathEn}`),
        },
      },
      openGraph: {
        title,
        description,
        url: siteUrl(lc === "el" ? pathEl : `/en${pathEn}`),
        type: "article",
        locale: lc === "el" ? "el_CY" : "en_CY",
        images: [{ url: siteUrl(article.heroImagePath) }],
      },
    };
  }

  const category = findCategoryBySlug(slug, lc);
  if (category) {
    const title = categoryTitle(category, lc);
    const description =
      lc === "el" ? category.description_el : category.description_en;
    const pathEl = `/arthra/${category.slug_el}`;
    const pathEn = `/blog/${category.slug_en}`;
    return {
      title,
      description,
      alternates: {
        canonical: siteUrl(pathEl),
        languages: {
          "x-default": siteUrl(pathEl),
          el: siteUrl(pathEl),
          en: siteUrl(`/en${pathEn}`),
        },
      },
      openGraph: {
        title,
        description,
        url: siteUrl(lc === "el" ? pathEl : `/en${pathEn}`),
        type: "website",
        locale: lc === "el" ? "el_CY" : "en_CY",
      },
    };
  }

  return { title: "Not found" };
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const article = findArticleBySlug(slug, locale);
  if (article) {
    return <ArticleView article={article} locale={locale} />;
  }
  const category = findCategoryBySlug(slug, locale);
  if (category) {
    return <CategoryView category={category} locale={locale} />;
  }
  notFound();
}

// -------- helpers ------------------------------------------------------------

interface FaqEntry { q: string; a: string }

function parseFaq(markdown: string): { body: string; faq: FaqEntry[] } {
  const match = /^## (?:FAQ|Συχνές Ερωτήσεις)\s*$/m.exec(markdown);
  if (!match) return { body: markdown, faq: [] };
  const body = markdown.slice(0, match.index).trimEnd();
  const section = markdown.slice(match.index + match[0].length).trim();
  const faq: FaqEntry[] = [];
  for (const block of section.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    // Each block: **Question?\n**Answer text.
    const m = block.match(/^\*\*(.+?)\*\*\n([\s\S]+)$/);
    if (m) faq.push({ q: m[1].trim(), a: m[2].replace(/\n/g, " ").trim() });
  }
  return { body, faq };
}

function extractHowToSteps(markdown: string): string[] {
  let best: string[] = [];
  for (const block of markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length >= 3 && lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
      const steps = lines.map((l) => l.replace(/^\d+\.\s/, "").trim());
      if (steps.length > best.length) best = steps;
    }
  }
  return best;
}

// -------- article view -------------------------------------------------------

async function ArticleView({
  article,
  locale,
}: {
  article: BlogArticle;
  locale: Locale;
}) {
  const t = await getTranslations();
  const title = articleTitle(article, locale);
  const rawBody = loadArticleBody(article.id, locale);
  const { body, faq } = rawBody ? parseFaq(rawBody) : { body: null, faq: [] };
  const howToSteps = body ? extractHowToSteps(body) : [];
  const category = getCategoryById(article.categoryId);
  const { prev, next } = getAdjacent(article);

  // Check for optional image2
  const image2Src = `/blog/${article.id}/image2.jpg`;
  const image2Exists = fs.existsSync(
    path.join(process.cwd(), "public", image2Src.slice(1)),
  );

  const pathEl = `/arthra/${article.slug_el}`;
  const pathEn = `/blog/${article.slug_en}`;
  const pageUrl = siteUrl(locale === "el" ? pathEl : `/en${pathEn}`);
  const heroUrl = siteUrl(article.heroImagePath);
  const description = locale === "el" ? article.metaDescription_el : article.metaDescription_en;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: [heroUrl],
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "ClickClickDrive Cyprus",
      logo: { "@type": "ImageObject", url: siteUrl("/logo.svg") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: locale === "el" ? "el-CY" : "en-CY",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "el" ? "Αρχική" : "Home",
        item: siteUrl(locale === "el" ? "/" : "/en"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "el" ? "Άρθρα" : "Blog",
        item: siteUrl(blogIndexHref(locale).replace(/^\//, "/")),
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: categoryTitle(category, locale),
              item: siteUrl(categoryHref(category, locale)),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: title,
        item: pageUrl,
      },
    ],
  };

  const faqJsonLd = faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } : null;

  const howToJsonLd = howToSteps.length >= 3 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    step: howToSteps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: text.length > 70 ? text.slice(0, 70) + "…" : text,
      text,
    })),
  } : null;

  const dateLabel = new Date(article.publishedDate).toLocaleDateString(
    locale === "el" ? "el-CY" : "en-CY",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      {howToJsonLd && <JsonLd data={howToJsonLd} />}

      <nav className="mb-6 text-sm text-text-muted">
        <Link
          href="/"
          className="font-semibold text-brand hover:text-brand-dark"
        >
          {locale === "el" ? "Αρχική" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/arthra"
          className="font-semibold text-brand hover:text-brand-dark"
        >
          {t("blog.breadcrumb")}
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <a
              href={categoryHref(category, locale)}
              className="font-semibold text-brand hover:text-brand-dark"
            >
              {categoryTitle(category, locale)}
            </a>
          </>
        )}
      </nav>

      <header className="mb-8">
        {category && (
          <a
            href={categoryHref(category, locale)}
            className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
          >
            {categoryTitle(category, locale)}
          </a>
        )}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          {dateLabel} · {article.author}
        </p>
      </header>

      <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted">
        <Image
          src={article.heroImagePath}
          alt={locale === "el" ? article.heroImageAlt_el : article.heroImageAlt_en}
          fill
          sizes="(min-width: 1024px) 48rem, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {body ? (
        <BlogProse
          markdown={body}
          injectAfterH2={image2Exists ? 4 : undefined}
          injectImageSrc={image2Exists ? image2Src : undefined}
          injectImageAlt={
            locale === "el"
              ? "Έγγραφα άδειας οδήγησης"
              : "Driving licence documents"
          }
        />
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-muted">
          {t("blog.bodyMissing")}
        </p>
      )}

      {faq.length > 0 && (
        <section className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            {locale === "el" ? "Συχνές Ερωτήσεις" : "FAQ"}
          </h2>
          <div className="divide-y divide-border">
            {faq.map(({ q, a }, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <p className="font-bold text-text-primary">{q}</p>
                <p className="mt-2 leading-relaxed text-text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(prev || next) && (
        <nav className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <a
              href={articleHref(prev, locale)}
              className="group rounded-2xl border border-border bg-surface p-4 hover:border-brand"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                ← {t("blog.previous")}
              </span>
              <span className="mt-1 block font-bold text-text-primary group-hover:text-brand">
                {articleTitle(prev, locale)}
              </span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a
              href={articleHref(next, locale)}
              className="group rounded-2xl border border-border bg-surface p-4 text-right hover:border-brand"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {t("blog.next")} →
              </span>
              <span className="mt-1 block font-bold text-text-primary group-hover:text-brand">
                {articleTitle(next, locale)}
              </span>
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  );
}

// -------- category view ------------------------------------------------------

async function CategoryView({
  category,
  locale,
}: {
  category: BlogCategory;
  locale: Locale;
}) {
  const t = await getTranslations();
  const articles = getArticlesByCategory(category.id);
  const title = categoryTitle(category, locale);
  const description =
    locale === "el" ? category.description_el : category.description_en;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "el" ? "Αρχική" : "Home",
        item: siteUrl(locale === "el" ? "/" : "/en"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "el" ? "Άρθρα" : "Blog",
        item: `${SITE_HOST}${blogIndexHref(locale)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_HOST}${categoryHref(category, locale)}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumbJsonLd} />

      <nav className="mb-4 text-sm">
        <Link
          href="/arthra"
          className="font-semibold text-brand hover:text-brand-dark"
        >
          ← {t("blog.breadcrumb")}
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">{description}</p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-muted">
          {t("blog.emptyCategory")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
