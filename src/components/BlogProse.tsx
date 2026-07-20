import Image from "next/image";
import React from "react";

import { AutoInfographic } from "@/components/infographics/AutoInfographic";
import { BookingMethodsInfographic } from "@/components/infographics/BookingMethodsInfographic";
import { CategoryBVehiclesInfographic } from "@/components/infographics/CategoryBVehiclesInfographic";
import { CategoryOverviewInfographic } from "@/components/infographics/CategoryOverviewInfographic";
import { CostBreakdownInfographic } from "@/components/infographics/CostBreakdownInfographic";
import { EuExchangeInfographic } from "@/components/infographics/EuExchangeInfographic";
import { FeeStagesInfographic } from "@/components/infographics/FeeStagesInfographic";
import { ForeignerDocumentsInfographic } from "@/components/infographics/ForeignerDocumentsInfographic";
import { IdpDocumentsInfographic } from "@/components/infographics/IdpDocumentsInfographic";
import { LicencePathsInfographic } from "@/components/infographics/LicencePathsInfographic";
import { LicenceStepsInfographic } from "@/components/infographics/LicenceStepsInfographic";
import { LicenceTimelineInfographic } from "@/components/infographics/LicenceTimelineInfographic";
import { MedicalAssessmentInfographic } from "@/components/infographics/MedicalAssessmentInfographic";
import { RenewalPathInfographic } from "@/components/infographics/RenewalPathInfographic";
import { RequirementsChecklistInfographic } from "@/components/infographics/RequirementsChecklistInfographic";
import { SignShapesInfographic } from "@/components/infographics/SignShapesInfographic";
import { TestFormatInfographic } from "@/components/infographics/TestFormatInfographic";
import { TheoryTopicsInfographic } from "@/components/infographics/TheoryTopicsInfographic";
import { TouristVsResidentInfographic } from "@/components/infographics/TouristVsResidentInfographic";
import { UkExchangeInfographic } from "@/components/infographics/UkExchangeInfographic";
import { UkLicenceSwapInfographic } from "@/components/infographics/UkLicenceSwapInfographic";
import { CategoryFinder } from "@/components/widgets/CategoryFinder";
import { EligibilityChecker } from "@/components/widgets/EligibilityChecker";
import { EuExchangeChecker } from "@/components/widgets/EuExchangeChecker";
import { ForeignerPathChecker } from "@/components/widgets/ForeignerPathChecker";
import { IdpChecker } from "@/components/widgets/IdpChecker";
import { PriceCalculator } from "@/components/widgets/PriceCalculator";
import { RenewalChecker } from "@/components/widgets/RenewalChecker";
import { SignCategoryChecker } from "@/components/widgets/SignCategoryChecker";
import { TestReadinessChecker } from "@/components/widgets/TestReadinessChecker";
import { UkLicenceChecker } from "@/components/widgets/UkLicenceChecker";
import type { AutoInfographicData, Locale } from "@/lib/types";

interface InjectImage {
  afterH2: number;
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  markdown: string;
  locale: Locale;
  /** Images to inject after specific H2 headings (1-indexed). */
  injectImages?: InjectImage[];
  autoInfographicData?: AutoInfographicData;
}

export function BlogProse({
  markdown,
  locale,
  injectImages = [],
  autoInfographicData,
}: Props) {
  const injectMap = new Map<number, InjectImage>(
    injectImages.map((img) => [img.afterH2, img]),
  );

  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  let h2Count = 0;
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // H2 heading
    if (block.startsWith("## ")) {
      h2Count++;
      const headingText = block.slice(3).trim();
      elements.push(
        <h2
          key={i}
          id={toSlug(headingText)}
          className="mt-10 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
        >
          {renderInline(headingText)}
        </h2>,
      );
      const inject = injectMap.get(h2Count);
      if (inject) {
        elements.push(
          <figure key={`img-inject-${i}`} className="my-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted">
              <Image
                src={inject.src}
                alt={inject.alt}
                fill
                sizes="(min-width: 1024px) 48rem, 100vw"
                className="object-cover"
              />
            </div>
            {inject.caption && (
              <figcaption className="mt-2 text-center text-xs italic text-text-muted">
                {inject.caption}
              </figcaption>
            )}
          </figure>,
        );
      }
      continue;
    }

    // Infographic token: {{infographic:type}}
    const infographicMatch = block.match(/^\{\{infographic:([^}]+)\}\}$/);
    if (infographicMatch) {
      const type = infographicMatch[1];
      if (type === "licence-steps") {
        elements.push(<LicenceStepsInfographic key={i} locale={locale} />);
      } else if (type === "cost-breakdown") {
        elements.push(<CostBreakdownInfographic key={i} locale={locale} />);
      } else if (type === "uk-exchange") {
        elements.push(<UkExchangeInfographic key={i} locale={locale} />);
      } else if (type === "eu-exchange") {
        elements.push(<EuExchangeInfographic key={i} locale={locale} />);
      } else if (type === "foreigner-documents") {
        elements.push(<ForeignerDocumentsInfographic key={i} locale={locale} />);
      } else if (type === "licence-timeline") {
        elements.push(<LicenceTimelineInfographic key={i} locale={locale} />);
      } else if (type === "category-b-vehicles") {
        elements.push(<CategoryBVehiclesInfographic key={i} locale={locale} />);
      } else if (type === "licence-paths") {
        elements.push(<LicencePathsInfographic key={i} locale={locale} />);
      } else if (type === "test-format") {
        elements.push(<TestFormatInfographic key={i} locale={locale} />);
      } else if (type === "renewal-path") {
        elements.push(<RenewalPathInfographic key={i} locale={locale} />);
      } else if (type === "fee-stages") {
        elements.push(<FeeStagesInfographic key={i} locale={locale} />);
      } else if (type === "uk-licence-swap") {
        elements.push(<UkLicenceSwapInfographic key={i} locale={locale} />);
      } else if (type === "medical-assessment") {
        elements.push(<MedicalAssessmentInfographic key={i} locale={locale} />);
      } else if (type === "category-overview") {
        elements.push(<CategoryOverviewInfographic key={i} locale={locale} />);
      } else if (type === "theory-topics") {
        elements.push(<TheoryTopicsInfographic key={i} locale={locale} />);
      } else if (type === "requirements-checklist") {
        elements.push(<RequirementsChecklistInfographic key={i} locale={locale} />);
      } else if (type === "sign-shapes") {
        elements.push(<SignShapesInfographic key={i} locale={locale} />);
      } else if (type === "booking-methods") {
        elements.push(<BookingMethodsInfographic key={i} locale={locale} />);
      } else if (type === "tourist-resident") {
        elements.push(<TouristVsResidentInfographic key={i} locale={locale} />);
      } else if (type === "idp-documents") {
        elements.push(<IdpDocumentsInfographic key={i} locale={locale} />);
      } else if (type === "auto" && autoInfographicData) {
        elements.push(
          <AutoInfographic key={i} locale={locale} data={autoInfographicData} />,
        );
      }
      continue;
    }

    // Video token: {{video:youtube_id}}
    const videoMatch = block.match(/^\{\{video:([^}]+)\}\}$/);
    if (videoMatch) {
      const youtubeId = videoMatch[1];
      elements.push(
        <div
          key={i}
          className="my-8 overflow-hidden rounded-2xl aspect-video"
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>,
      );
      continue;
    }

    // Widget token: {{widget:id}}
    const widgetMatch = block.match(/^\{\{widget:([^}]+)\}\}$/);
    if (widgetMatch) {
      const id = widgetMatch[1];
      let widget: React.ReactNode = null;
      if (id === "price-calculator") {
        widget = <PriceCalculator locale={locale} />;
      } else if (id === "uk-licence-checker") {
        widget = <UkLicenceChecker locale={locale} />;
      } else if (id === "eu-exchange-checker") {
        widget = <EuExchangeChecker locale={locale} />;
      } else if (id === "foreigner-path-checker") {
        widget = <ForeignerPathChecker locale={locale} />;
      } else if (id === "test-readiness-checker") {
        widget = <TestReadinessChecker locale={locale} />;
      } else if (id === "renewal-checker") {
        widget = <RenewalChecker locale={locale} />;
      } else if (id === "category-finder") {
        widget = <CategoryFinder locale={locale} />;
      } else if (id === "sign-category-checker") {
        widget = <SignCategoryChecker locale={locale} />;
      } else if (id === "eligibility-checker") {
        widget = <EligibilityChecker locale={locale} />;
      } else if (id === "idp-checker") {
        widget = <IdpChecker locale={locale} />;
      }
      if (widget) {
        const widgetLabel: Record<string, { en: string; el: string }> = {
          "price-calculator": { en: "Estimate your total cost", el: "Υπολογίστε το κόστος σας" },
          "uk-licence-checker": { en: "Do you need to sit a test?", el: "Χρειάζεστε εξετάσεις;" },
          "eu-exchange-checker": { en: "Can you exchange without tests?", el: "Ανταλλαγή χωρίς εξετάσεις;" },
          "foreigner-path-checker": { en: "Which process applies to you?", el: "Ποια διαδικασία ισχύει για εσάς;" },
          "test-readiness-checker": { en: "Are you ready for the test?", el: "Είστε έτοιμοι για την εξέταση;" },
          "renewal-checker": { en: "Check your renewal path", el: "Ελέγξτε πότε ανανεώνετε" },
          "category-finder": { en: "Which category do you need?", el: "Ποια κατηγορία χρειάζεστε;" },
          "sign-category-checker": { en: "What shape do you see?", el: "Τι σχήμα βλέπετε;" },
          "eligibility-checker": { en: "Check your eligibility", el: "Πληρείτε τις προϋποθέσεις;" },
          "idp-checker": { en: "Do you need an IDP?", el: "Χρειάζεστε ΔΑΟ;" },
        };
        const widgetPillLabel = widgetLabel[id]?.[locale] ?? (locale === "el" ? "Διαδραστικό εργαλείο" : "Interactive tool");
        elements.push(
          <div key={i} className="relative my-10 rounded-2xl border-2 border-brand/40 bg-brand/[0.04] p-3 shadow-sm">
            <span className="absolute -top-3.5 left-5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
              {widgetPillLabel}
            </span>
            {widget}
          </div>
        );
      }
      continue;
    }

    // Standalone image block: ![alt](src)
    // Caption may follow on the very next line (same block, no blank line) OR
    // as the next block (separated by a blank line). Both forms are handled.
    const blockLines = block.split("\n");
    const imgLineMatch = blockLines[0].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgLineMatch) {
      const CAPTION_RE = /^\*([^*].*[^*])\*$|^\*([^*])\*$/;
      // Caption on same block (line 2)?
      const sameLine = blockLines[1]?.trim() ?? "";
      const sameMatch = CAPTION_RE.exec(sameLine);
      // Caption on next block?
      let caption: string | null = null;
      if (sameMatch) {
        caption = sameMatch[1] ?? sameMatch[2];
      } else {
        const nextBlock = blocks[i + 1]?.trim() ?? "";
        const nextMatch = CAPTION_RE.exec(nextBlock);
        if (nextMatch) {
          i++;
          caption = nextMatch[1] ?? nextMatch[2];
        }
      }
      elements.push(
        <figure key={i} className="my-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted">
            <Image
              src={imgLineMatch[2]}
              alt={imgLineMatch[1]}
              fill
              sizes="(min-width: 1024px) 48rem, 100vw"
              className="object-cover"
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-center text-xs italic text-text-muted">
              {caption}
            </figcaption>
          )}
        </figure>,
      );
      continue;
    }

    // Unordered list: block where every non-empty line starts with - or *
    const ulLines = block.split("\n").filter((l) => l.trim());
    if (ulLines.length > 0 && ulLines.every((l) => /^[-*]\s/.test(l.trim()))) {
      elements.push(
        <ul key={i} className="my-2 space-y-1.5 pl-6 list-disc marker:text-brand">
          {ulLines.map((l, j) => (
            <li key={j} className="text-text-secondary">
              {renderInline(l.replace(/^[-*]\s/, "").trim())}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list: block where every non-empty line starts with N.
    const olLines = block.split("\n").filter((l) => l.trim());
    if (olLines.length > 0 && olLines.every((l) => /^\d+\.\s/.test(l.trim()))) {
      elements.push(
        <ol key={i} className="my-2 space-y-1.5 pl-6 list-decimal marker:text-brand">
          {olLines.map((l, j) => (
            <li key={j} className="text-text-secondary">
              {renderInline(l.replace(/^\d+\.\s/, "").trim())}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Regular paragraph (flatten internal newlines)
    elements.push(<p key={i}>{renderInline(block.replace(/\n/g, " "))}</p>);
  }

  return (
    <div className="space-y-5 text-lg leading-relaxed text-text-secondary">
      {elements}
    </div>
  );
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderInline(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match [text](url) links, **bold**, or *italic* spans
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    if (m[1] !== undefined) {
      const url = m[2];
      const isExternal = /^https?:\/\//.test(url);
      parts.push(
        <a
          key={`${m.index}-link`}
          href={url}
          className="font-semibold text-brand hover:text-brand-dark hover:underline"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : null)}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] !== undefined) {
      parts.push(
        <strong key={`${m.index}-bold`} className="font-semibold text-text-primary">
          {m[3]}
        </strong>,
      );
    } else {
      parts.push(
        <em key={`${m.index}-italic`} className="italic">
          {m[4]}
        </em>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}
