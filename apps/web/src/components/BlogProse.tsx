import React from "react";

/**
 * Renders the long-form Markdown for a blog article. The generator only emits
 * `## H2` headings, paragraphs, and inline `[text](url)` links. No lists, no
 * blockquotes, no code — the editorial rules forbid them.
 */
export function BlogProse({ markdown }: { markdown: string }) {
  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5 text-lg leading-relaxed text-text-secondary">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          const text = block.slice(3).trim();
          return (
            <h2
              key={i}
              className="mt-10 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
            >
              {renderInline(text)}
            </h2>
          );
        }
        const flat = block.replace(/\n/g, " ");
        return <p key={i}>{renderInline(flat)}</p>;
      })}
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
