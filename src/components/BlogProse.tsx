import Image from "next/image";
import React from "react";

import { CostBreakdownInfographic } from "@/components/infographics/CostBreakdownInfographic";
import { EuExchangeInfographic } from "@/components/infographics/EuExchangeInfographic";
import { LicenceStepsInfographic } from "@/components/infographics/LicenceStepsInfographic";
import { UkExchangeInfographic } from "@/components/infographics/UkExchangeInfographic";
import { PriceCalculator } from "@/components/widgets/PriceCalculator";
import type { Locale } from "@/lib/types";

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
}

export function BlogProse({ markdown, locale, injectImages = [] }: Props) {
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
      if (id === "price-calculator") {
        elements.push(<PriceCalculator key={i} locale={locale} />);
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
