import Image from "next/image";

import {
  articleExcerpt,
  articleHref,
  articleTitle,
  categoryTitle,
  getCategoryById,
  type BlogArticle,
} from "@/lib/blog";
import type { Locale } from "@/lib/types";

export function ArticleCard({
  article,
  locale,
}: {
  article: BlogArticle;
  locale: Locale;
}) {
  const href = articleHref(article, locale);
  const cat = getCategoryById(article.categoryId);
  const dateLabel = new Date(article.publishedDate).toLocaleDateString(
    locale === "el" ? "el-CY" : "en-CY",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <a
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-border transition-colors hover:ring-brand"
    >
      <div className="relative aspect-[16/9] w-full bg-surface-muted">
        <Image
          src={article.heroImagePath}
          alt={
            locale === "el" ? article.heroImageAlt_el : article.heroImageAlt_en
          }
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {cat && (
          <span className="text-xs font-bold uppercase tracking-wide text-brand">
            {categoryTitle(cat, locale)}
          </span>
        )}
        <h3 className="text-lg font-bold tracking-tight text-text-primary group-hover:text-brand">
          {articleTitle(article, locale)}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {articleExcerpt(article, locale)}
        </p>
        <span className="mt-auto text-xs font-semibold text-text-muted">
          {dateLabel}
        </span>
      </div>
    </a>
  );
}
