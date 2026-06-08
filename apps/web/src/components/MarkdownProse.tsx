import React from "react";

/**
 * Minimal markdown renderer for the SEO body produced by
 * scraper/generate_content.py. We control the upstream output (no arbitrary
 * HTML), so we only handle: paragraph splits on blank lines and inline
 * Markdown links `[text](url)`. Bullets and tables are explicitly excluded
 * by the generator's style rules.
 */
export function MarkdownProse({ markdown }: { markdown: string }) {
  const paragraphs = markdown
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-relaxed text-text-secondary">
      {paragraphs.map((p, i) => (
        <p key={i}>{renderInline(p)}</p>
      ))}
    </div>
  );
}

function renderInline(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    const url = m[2];
    const isExternal = /^https?:\/\//.test(url);
    parts.push(
      <a
        key={`${m.index}-${url}`}
        href={url}
        className="font-semibold text-brand hover:text-brand-dark hover:underline"
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : null)}
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}
