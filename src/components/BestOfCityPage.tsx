import Image from "next/image";
import { setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import {
  heroImagePath,
  loadBestOfContent,
  rankedSchools,
  schoolPhotoPath,
  type BestOfCityConfig,
} from "@/lib/bestOf";
import { SITE_HOST, siteUrl } from "@/lib/seo";
import { cityHref, displayName, listingHref } from "@/lib/slugs";
import { containsGreek, transliterateGreek } from "@/lib/transliterate";
import type { DrivingSchool, Locale } from "@/lib/types";

function schoolName(school: DrivingSchool, locale: Locale): string {
  const name = displayName(school, locale);
  if (locale === "en" && containsGreek(name)) return transliterateGreek(name);
  return name;
}

// Transliterate any stray Greek characters in AI-generated text on English pages
function sanitize(text: string, locale: Locale): string {
  if (locale === "en" && containsGreek(text)) return transliterateGreek(text);
  return text;
}

interface Props {
  config: BestOfCityConfig;
  locale: Locale;
}

export async function BestOfCityPage({ config, locale }: Props) {
  setRequestLocale(locale);

  const { city, pathEl, pathEn, cityEl, cityElAcc, cityKey } = config;
  const schools = rankedSchools(city);
  const content = loadBestOfContent(cityKey, locale);
  const hero = heroImagePath(cityKey);
  const n = schools.length;

  const cityNameDisplay = locale === "el" ? cityEl : city;
  const cityNameAcc = locale === "el" ? cityElAcc : city;

  const title =
    locale === "el"
      ? `Οι ${n} Καλύτερες Σχολές Οδηγών στη(ν) ${cityNameAcc} 2026`
      : `Best ${n} Driving Schools in ${cityNameDisplay} 2026`;

  const pageUrl = siteUrl(locale === "el" ? pathEl : `/en${pathEn}`);

  // --- JSON-LD ---

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
        name: title,
        item: pageUrl,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: n,
    itemListElement: schools.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: displayName(s, locale),
      url: siteUrl(
        locale === "el"
          ? `/scholes-odigon/${s.slug_el}`
          : `/en/driving-schools/${s.slug_en}`,
      ),
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: "2026-06-20",
    dateModified: "2026-06-20",
    author: { "@type": "Organization", name: "ClickClickDrive Cyprus" },
    publisher: {
      "@type": "Organization",
      name: "ClickClickDrive Cyprus",
      logo: { "@type": "ImageObject", url: siteUrl("/logo.svg") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: locale === "el" ? "el-CY" : "en-CY",
    ...(hero ? { image: [siteUrl(hero)] } : {}),
  };

  const faqItems = content.faq ?? [];
  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={articleJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="font-semibold text-brand hover:text-brand-dark">
          {locale === "el" ? "Αρχική" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <span>{locale === "el" ? "Καλύτερες σχολές" : "Best schools"}</span>
        <span className="mx-2">/</span>
        <span>{cityNameDisplay}</span>
      </nav>

      {/* Hero */}
      {hero ? (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted">
          <Image
            src={hero}
            alt={
              locale === "el"
                ? `Σχολές οδηγών στη(ν) ${cityNameDisplay}, Κύπρος`
                : `Driving schools in ${cityNameDisplay}, Cyprus`
            }
            fill
            sizes="(min-width: 1024px) 56rem, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="mb-8 h-48 w-full rounded-2xl bg-gradient-to-br from-brand-light/60 via-brand/20 to-background sm:h-64" />
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        {title}
      </h1>

      {/* Intro */}
      {content.intro && (
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">
          {sanitize(content.intro, locale)}
        </p>
      )}

      {/* Ranked bullet list */}
      {schools.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            {locale === "el"
              ? `Κατάταξη σχολών στη(ν) ${cityNameAcc}`
              : `Ranked schools in ${cityNameDisplay}`}
          </h2>
          <ol className="space-y-1.5">
            {schools.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-2 text-sm">
                <span className="w-5 shrink-0 font-bold text-brand">{i + 1}.</span>
                <a
                  href={
                    locale === "el"
                      ? `${SITE_HOST}/scholes-odigon/${s.slug_el}`
                      : `${SITE_HOST}/en/driving-schools/${s.slug_en}`
                  }
                  className="font-medium text-text-primary hover:text-brand hover:underline"
                >
                  {schoolName(s, locale)}
                </a>
                {s.rating !== null && (
                  <span className="text-text-muted">
                    {s.rating.toFixed(1)}
                    {s.review_count !== null && <> ({s.review_count})</>}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Per-school sections */}
      {schools.map((s, i) => {
        const name = schoolName(s, locale);
        const paragraph = content.schools?.[s.id];
        const photo = schoolPhotoPath(s.id);
        const addr = s.location.formatted_address;
        return (
          <section key={s.id} className="mt-12 border-t border-border pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              {i + 1}. {name}
            </h2>

            <p className="mt-3 leading-relaxed text-text-secondary">
              {paragraph
                ? sanitize(paragraph, locale)
                : (locale === "el"
                  ? `Η ${name} βρίσκεται στη(ν) ${cityNameDisplay} και προσφέρει μαθήματα οδήγησης. Επικοινωνήστε για πληροφορίες σχετικά με ωράρια, τιμές και διαθεσιμότητα.`
                  : `${name} is based in ${cityNameDisplay} and offers driving lessons. Contact them for information on schedules, pricing, and availability.`)}
            </p>

            {/* Contact block */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
              {s.rating !== null && (
                <span className="flex items-center gap-1.5">
                  <StarIcon />
                  <strong>{s.rating.toFixed(1)}</strong>
                  {s.review_count !== null && (
                    <span className="text-text-muted">
                      ({s.review_count}{" "}
                      {locale === "el" ? "αξιολογήσεις" : "reviews"})
                    </span>
                  )}
                </span>
              )}
              {addr && (
                <span className="text-text-secondary">
                  <span className="font-semibold">
                    {locale === "el" ? "Διεύθυνση:" : "Address:"}
                  </span>{" "}
                  {addr}
                </span>
              )}
              {s.phone_e164 && (
                <span>
                  <span className="font-semibold">
                    {locale === "el" ? "Τηλ:" : "Tel:"}
                  </span>{" "}
                  <a
                    href={`tel:${s.phone_e164}`}
                    className="text-brand hover:text-brand-dark hover:underline"
                  >
                    {s.phone_e164}
                  </a>
                </span>
              )}
              {s.website && (
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-brand-dark hover:underline"
                >
                  {locale === "el" ? "Ιστοσελίδα" : "Website"} →
                </a>
              )}
            </div>

            {/* School photo */}
            {photo && (
              <div className="relative mt-4 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl bg-surface-muted">
                <Image
                  src={photo}
                  alt={name}
                  fill
                  sizes="24rem"
                  className="object-cover"
                />
              </div>
            )}
          </section>
        );
      })}

      {/* Closing */}
      {content.closing && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-text-primary">
            {locale === "el"
              ? `Οδήγηση στη(ν) ${cityNameAcc}`
              : `Driving in ${cityNameDisplay}`}
          </h2>
          <p className="leading-relaxed text-text-secondary">{sanitize(content.closing, locale)}</p>
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            {locale === "el" ? "Συχνές Ερωτήσεις" : "FAQ"}
          </h2>
          <div className="divide-y divide-border">
            {faqItems.map(({ q, a }, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <p className="font-bold text-text-primary">{sanitize(q, locale)}</p>
                <p className="mt-2 leading-relaxed text-text-secondary">{sanitize(a, locale)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom links */}
      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-border pt-8">
        <a
          href={cityHref(city, locale)}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand hover:text-white"
        >
          {locale === "el"
            ? `Δείτε όλες τις σχολές στη(ν) ${cityNameAcc} →`
            : `Explore all driving schools in ${cityNameDisplay} →`}
        </a>
        <a
          href={listingHref(locale)}
          className="text-sm text-text-muted hover:text-brand"
        >
          {locale === "el" ? "Όλες οι σχολές στην Κύπρο" : "All schools in Cyprus"}
        </a>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
