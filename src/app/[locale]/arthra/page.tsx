import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleCard } from "@/components/ArticleCard";
import {
  BLOG_CATEGORIES,
  blogIndexHref,
  categoryHref,
  categoryTitle,
  getAllArticles,
} from "@/lib/blog";
import { buildAlternates, siteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "el"
      ? "Άρθρα και οδηγοί για δίπλωμα οδήγησης στην Κύπρο"
      : "Articles and guides for Cyprus driving licences";
  const description =
    locale === "el"
      ? "Πρακτικοί οδηγοί για να βγάλετε δίπλωμα οδήγησης στην Κύπρο. Θεωρία, πράξη, ξένοι, κόστος."
      : "Practical guides for getting a Cyprus driving licence. Theory, practical, foreigners, cost.";
  return {
    title,
    description,
    alternates: buildAlternates({ pathEl: "/arthra", pathEn: "/blog" }),
    openGraph: {
      title,
      description,
      url: siteUrl(blogIndexHref(locale as Locale)),
      type: "website",
      locale: locale === "el" ? "el_CY" : "en_CY",
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations();
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 sm:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {t("blog.indexTitle")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          {t("blog.indexLead")}
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">
          {t("blog.categories")}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={categoryHref(c, locale)}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-text-primary hover:border-brand hover:text-brand"
            >
              {categoryTitle(c, locale)}
            </a>
          ))}
        </div>
      </section>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-muted">
          {t("blog.empty")}
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
