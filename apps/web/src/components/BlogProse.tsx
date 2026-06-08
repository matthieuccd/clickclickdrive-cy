import Image from "next/image";
import React from "react";

interface Props {
  markdown: string;
  /** Inject image2 after the Nth H2 (1-indexed). */
  injectAfterH2?: number;
  injectImageSrc?: string;
  injectImageAlt?: string;
}

export function BlogProse({
  markdown,
  injectAfterH2,
  injectImageSrc,
  injectImageAlt = "",
}: Props) {
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
      elements.push(
        <h2
          key={i}
          className="mt-10 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
        >
          {renderInline(block.slice(3).trim())}
        </h2>,
      );
      // Inject image2 after the requested H2
      if (injectImageSrc && injectAfterH2 !== undefined && h2Count === injectAfterH2) {
        elements.push(
          <figure
            key={`img-inject-${i}`}
            className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted"
          >
            <Image
              src={injectImageSrc}
              alt={injectImageAlt}
              fill
              sizes="(min-width: 1024px) 48rem, 100vw"
              className="object-cover"
            />
          </figure>,
        );
      }
      continue;
    }

    // Standalone image block: ![alt](src)
    const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      elements.push(
        <figure
          key={i}
          className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-muted"
        >
          <Image
            src={imgMatch[2]}
            alt={imgMatch[1]}
            fill
            sizes="(min-width: 1024px) 48rem, 100vw"
            className="object-cover"
          />
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

function renderInline(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match [text](url) links or **bold** spans
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
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
    } else {
      parts.push(
        <strong key={`${m.index}-bold`} className="font-semibold text-text-primary">
          {m[3]}
        </strong>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}
