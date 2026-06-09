import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { cityHref, displayName, schoolHref } from "@/lib/slugs";
import type { DrivingSchool, Locale } from "@/lib/types";

import { RatingStars } from "./RatingStars";

export function SchoolCard({ school }: { school: DrivingSchool }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const href = schoolHref(school, locale);
  const name = displayName(school, locale);
  // Fallback image is fetched once by scraper/fetch_school_fallback.py (or
  // manually) and saved to public/schools/fallback.jpg. Until the real
  // Unsplash photo lands, a placeholder JPG ships at that path.
  const photo = school.photo_paths[0] ?? "/schools/fallback.jpg";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-surface-muted">
        <Link href={href} className="absolute inset-0 z-0 block">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        </Link>
        {school.location.city && (
          <Link
            href={cityHref(school.location.city, locale)}
            className="absolute left-3 top-3 z-10 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text-primary backdrop-blur hover:bg-surface hover:text-brand"
          >
            {t(`cities.${school.location.city}`)}
          </Link>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug tracking-tight">
          <Link href={href} className="hover:text-brand">
            {name}
          </Link>
        </h3>
        {school.rating !== null && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <RatingStars rating={school.rating} />
            <span className="font-semibold">{school.rating.toFixed(1)}</span>
            {school.review_count !== null && school.review_count > 0 && (
              <span className="text-text-muted">
                · {t("card.reviews", { count: school.review_count })}
              </span>
            )}
          </div>
        )}
        {school.opening_hours.length > 0 && (
          <p className="mt-2 text-xs text-text-muted line-clamp-1">
            {school.opening_hours[0]}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {school.phone_e164 && (
            <a
              href={`tel:${school.phone_e164}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 font-semibold text-text-primary hover:bg-brand-light hover:text-brand"
            >
              <PhoneIcon /> {t("card.callNow")}
            </a>
          )}
          {school.website && (
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 font-semibold text-text-primary hover:bg-brand-light hover:text-brand"
            >
              <GlobeIcon /> {t("card.website")}
            </a>
          )}
        </div>
        <Link
          href={href}
          className="mt-auto pt-4 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          {t("card.viewDetails")} →
        </Link>
      </div>
    </article>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}
