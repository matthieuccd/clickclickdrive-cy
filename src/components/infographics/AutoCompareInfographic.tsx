import type { AutoCompareCard, AutoInfographicContent } from "@/lib/types";

const W = 700;
const GAP = 24;
const CARD_Y = 42;
const CARD_H = 150;
const H = CARD_Y + CARD_H + 14;
const HEADING_LINE_H = 16;
const HEADING_SLOT_TOP = CARD_Y + 30;
const HEADING_SLOT_BOTTOM = CARD_Y + 30 + HEADING_LINE_H;
const BODY_START_Y = HEADING_SLOT_BOTTOM + 26;
const BODY_LINE_H = 15;
const BODY_BULLET_GAP = 8;

function layoutBody(body: string[][]) {
  const lines: { text: string; y: number }[] = [];
  let y = BODY_START_Y;
  body.forEach((bullet, bulletIndex) => {
    if (bulletIndex > 0) y += BODY_BULLET_GAP;
    bullet.forEach((line) => {
      lines.push({ text: line, y });
      y += BODY_LINE_H;
    });
  });
  return lines;
}

type CompareContent = Extract<AutoInfographicContent, { template: "compare" }>;

export function AutoCompareInfographic({ content }: { content: CompareContent }) {
  const { title, caption, cards } = content;
  const n = cards.length;
  const CARD_W = Math.floor((W - (n + 1) * GAP) / n);

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={title}
      >
        <text x={W / 2} y={22} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
          {title}
        </text>
        {cards.map((card: AutoCompareCard, i: number) => {
          const x = GAP + i * (CARD_W + GAP);
          const cx = x + CARD_W / 2;
          const clipId = `auto-compare-clip-${i}`;
          const bodyLines = layoutBody(card.body);
          return (
            <g key={i}>
              <defs>
                <clipPath id={clipId}>
                  <rect x={x} y={CARD_Y} width={CARD_W} height={CARD_H} rx={10} />
                </clipPath>
              </defs>
              <rect x={x} y={CARD_Y} width={CARD_W} height={CARD_H} rx={10} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
              <rect x={x} y={CARD_Y} width={CARD_W} height={4} fill={card.accent} clipPath={`url(#${clipId})`} />
              {card.heading.length === 1 ? (
                <text x={cx} y={(HEADING_SLOT_TOP + HEADING_SLOT_BOTTOM) / 2 + 4} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
                  {card.heading[0]}
                </text>
              ) : (
                card.heading.map((line, li) => (
                  <text key={li} x={cx} y={HEADING_SLOT_TOP + li * HEADING_LINE_H} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
                    {line}
                  </text>
                ))
              )}
              {bodyLines.map((line, li) => (
                <text key={li} x={cx} y={line.y} textAnchor="middle" fill="#7a8794" fontSize={11} fontFamily="system-ui, sans-serif">
                  {line.text}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{caption}</p>
    </figure>
  );
}
