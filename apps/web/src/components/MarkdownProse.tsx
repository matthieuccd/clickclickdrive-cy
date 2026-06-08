import React from "react";

/**
 * Minimal markdown renderer for SEO body text produced by
 * scraper/generate_content.py and inline city deep-content.
 * Handles: ##/### headings, **bold** inline, paragraph breaks,
 * and inline links [text](url).
 */
export function MarkdownProse({ markdown }: { markdown: string }) {
  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-relaxed text-text-secondary">
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) {
          return (
            <h2
              key={i}
              className="mt-6 text-lg font-bold tracking-tight text-text-primary first:mt-0"
            >
              {renderInline(block.slice(4))}
            </h2>
          );
        }
        if (block.startsWith("## ") || block.startsWith("# ")) {
          const text = block.startsWith("## ") ? block.slice(3) : block.slice(2);
          return (
            <h1
              key={i}
              className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
            >
              {renderInline(text)}
            </h1>
          );
        }
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </div>
  );
}

function renderInline(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Combined regex: markdown link [text](url) or **bold**
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    if (m[1] !== undefined) {
      // Link
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
      // Bold
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
