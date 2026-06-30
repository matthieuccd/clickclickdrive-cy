import fs from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleCard } from "@/components/ArticleCard";
import { AuthorBio } from "@/components/AuthorBio";
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
import { getAuthorBySlug, authorPageHref } from "@/lib/authors";
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
    const canonical = siteUrl(lc === "el" ? pathEl : `/en${pathEn}`);
    return {
      title,
      description,
      alternates: {
        canonical,
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
        canonical: siteUrl(lc === "el" ? pathEl : `/en${pathEn}`),
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

interface TocItem { title: string; href: string }

function isTocBlock(block: string): boolean {
  const lines = block.trim().split("\n").filter(Boolean);
  return lines.length > 0 && lines.every((l) => /^-\s+\[/.test(l.trim()));
}

function parseTocBlock(block: string): TocItem[] {
  return block
    .trim()
    .split("\n")
    .map((l) => l.trim().match(/^-\s+\[([^\]]+)\]\(([^)]+)\)/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ title: m[1], href: m[2] }));
}

function extractSummaryAndToc(markdown: string): {
  summary: string | null;
  tocItems: TocItem[];
  remaining: string;
} {
  const blocks = markdown.trim().split(/\n\n+/);
  const first = blocks[0]?.trim() ?? "";

  // If first block is a heading or TOC, nothing to extract
  if (first.startsWith("## ") || isTocBlock(first)) {
    return { summary: null, tocItems: [], remaining: markdown };
  }

  // Block 0 = summary paragraph
  const summary = first;

  if (blocks.length > 1 && isTocBlock(blocks[1])) {
    return {
      summary,
      tocItems: parseTocBlock(blocks[1]),
      remaining: blocks.slice(2).join("\n\n"),
    };
  }

  return { summary, tocItems: [], remaining: blocks.slice(1).join("\n\n") };
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
  const { summary, tocItems, remaining } = body
    ? extractSummaryAndToc(body)
    : { summary: null, tocItems: [], remaining: body ?? "" };
  const howToSteps = body ? extractHowToSteps(body) : [];
  const category = getCategoryById(article.categoryId);
  const { prev, next } = getAdjacent(article);
  const author = getAuthorBySlug(article.authorSlug);

  // Build inject-image list: image2.jpg (legacy, after H2 #4) + inline-N.jpg (after H2 #3, #5, #7)
  type InjectImg = { afterH2: number; src: string; alt: string; caption?: string };
  const injectImages: InjectImg[] = [];

  // image2.jpg: injected after H2 #4 for articles that don't embed images in
  // their markdown body. Articles with inline_image_queries embed images directly
  // in the markdown (via the generator), so they are not added here.
  const image2Src = `/blog/${article.id}/image2.jpg`;
  if (fs.existsSync(path.join(process.cwd(), "public", image2Src.slice(1)))) {
    const credit = article.imageCredits?.["image2"];
    injectImages.push({
      afterH2: 4,
      src: image2Src,
      alt: credit
        ? (locale === "el" ? credit.alt_el : credit.alt_en)
        : (locale === "el" ? "Έγγραφα άδειας οδήγησης" : "Driving licence documents"),
      caption: credit
        ? (locale === "el" ? credit.caption_el : credit.caption_en)
        : (locale === "el" ? "Φωτογραφία via Pexels.com" : "Photo via Pexels.com"),
    });
  }

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
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          url: siteUrl(authorPageHref(author.slug, "el")),
          sameAs: [author.linkedIn],
        }
      : { "@type": "Organization", name: article.author },
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
        <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          {author && (
            <Image
              src={author.photo}
              alt={author.name}
              width={22}
              height={22}
              className="size-[22px] rounded-full object-cover"
            />
          )}
          <span>
            {dateLabel} ·{" "}
            {author ? (
              <a href="#author-bio" className="hover:text-brand hover:underline">
                {article.author}
              </a>
            ) : (
              article.author
            )}
          </span>
        </div>
      </header>

      {summary && (
        <div className="relative mb-8 mt-4 rounded-xl border border-brand/25 bg-brand/[0.04] px-5 pb-5 pt-6">
          <span className="absolute -top-3 left-4 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
            {locale === "el" ? "Με μια ματιά" : "At a glance"}
          </span>
          <p className="text-lg leading-relaxed text-text-secondary">
            {summary}
          </p>
        </div>
      )}

      {tocItems.length > 0 && (
        <nav aria-label={locale === "el" ? "Πίνακας περιεχομένων" : "Table of contents"} className="mb-8 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <ol className="space-y-2">
            {tocItems.map((item, i) => (
              <li key={i} className="flex items-baseline gap-2.5">
                <span className="shrink-0 text-sm font-bold tabular-nums text-brand">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <a
                  href={item.href}
                  className="text-sm leading-snug text-text-secondary hover:text-brand hover:underline"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <figure className="mb-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted">
          <Image
            src={article.heroImagePath}
            alt={locale === "el" ? article.heroImageAlt_el : article.heroImageAlt_en}
            fill
            sizes="(min-width: 1024px) 48rem, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <figcaption className="mt-2 text-center text-xs italic text-text-muted">
          {locale === "el" ? article.heroCaption_el : article.heroCaption_en}
        </figcaption>
      </figure>

      {!rawBody ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-muted">
          {t("blog.bodyMissing")}
        </p>
      ) : remaining ? (
        <BlogProse
          markdown={remaining}
          locale={locale}
          injectImages={injectImages.length > 0 ? injectImages : undefined}
        />
      ) : null}

      {author && (
        <div id="author-bio">
          <AuthorBio author={author} locale={locale} />
        </div>
      )}

      {faq.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-surface p-6 sm:p-8">
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
              className="group overflow-hidden rounded-2xl border border-border bg-surface hover:border-brand"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                <Image
                  src={prev.heroImagePath}
                  alt={locale === "el" ? prev.heroImageAlt_el : prev.heroImageAlt_en}
                  fill
                  sizes="(min-width: 640px) 24rem, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                  ← {t("blog.previous")}
                </span>
                <span className="mt-1 block font-bold text-text-primary group-hover:text-brand">
                  {articleTitle(prev, locale)}
                </span>
              </div>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a
              href={articleHref(next, locale)}
              className="group overflow-hidden rounded-2xl border border-border bg-surface hover:border-brand"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                <Image
                  src={next.heroImagePath}
                  alt={locale === "el" ? next.heroImageAlt_el : next.heroImageAlt_en}
                  fill
                  sizes="(min-width: 640px) 24rem, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-right">
                <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                  {t("blog.next")} →
                </span>
                <span className="mt-1 block font-bold text-text-primary group-hover:text-brand">
                  {articleTitle(next, locale)}
                </span>
              </div>
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
