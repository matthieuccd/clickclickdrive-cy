import Image from "next/image";

import { authorPageHref, type Author } from "@/lib/authors";
import type { Locale } from "@/lib/types";

interface Props {
  author: Author;
  locale: Locale;
}

export function AuthorBio({ author, locale }: Props) {
  const label = locale === "el" ? "Σχετικά με τον Συγγραφέα" : "About the Author";
  const title = locale === "el" ? author.title_el : author.title_en;
  const bio = locale === "el" ? author.bio_short_el : author.bio_short_en;
  const href = authorPageHref(author.slug, locale);

  return (
    <div className="mt-12 rounded-xl border border-border bg-surface p-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <div className="flex items-start gap-4">
        <a href={href} className="shrink-0">
          <Image
            src={author.photo}
            alt={author.name}
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
            priority
          />
        </a>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <a href={href} className="font-bold text-text-primary hover:text-brand">{author.name}</a>
            <a
              href={author.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#0A66C2] hover:opacity-80"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
          <p className="mt-0.5 text-sm text-text-muted">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{bio}</p>
        </div>
      </div>
    </div>
  );
}
