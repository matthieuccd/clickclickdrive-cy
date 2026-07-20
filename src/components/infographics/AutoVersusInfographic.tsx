import type { AutoInfographicContent } from "@/lib/types";

const W = 700;
const CARD_W = 270;
const CARD_Y = 42;
const CARD_H = 118;
const LEFT_X = 20;
const RIGHT_X = W - 20 - CARD_W;
const CARD_CY = CARD_Y + CARD_H / 2;
const H = CARD_Y + CARD_H + 20;
const MID_X = W / 2;

type VersusContent = Extract<AutoInfographicContent, { template: "versus" }>;

export function AutoVersusInfographic({ content }: { content: VersusContent }) {
  const { title, caption, left, right } = content;
  const leftCx = LEFT_X + CARD_W / 2;
  const rightCx = RIGHT_X + CARD_W / 2;

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

        <rect x={LEFT_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx={14} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
        <text x={leftCx} y={CARD_Y + 36} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="600" fontFamily="system-ui, sans-serif">
          {left.heading}
        </text>
        {left.sub.map((line, li) => (
          <text key={li} x={leftCx} y={CARD_Y + 62 + li * 20} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
            {line}
          </text>
        ))}

        <line x1={MID_X} y1={CARD_Y + 10} x2={MID_X} y2={CARD_Y + CARD_H - 10} stroke="#e4e7eb" strokeWidth={2} strokeDasharray="4 4" />
        <circle cx={MID_X} cy={CARD_CY} r={13} fill="#f74656" />
        <text x={MID_X} y={CARD_CY + 4} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="700" fontFamily="system-ui, sans-serif">
          VS
        </text>

        <rect x={RIGHT_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx={14} fill="#ffffff" stroke="#f74656" strokeWidth={2} />
        <text x={rightCx} y={CARD_Y + 36} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="600" fontFamily="system-ui, sans-serif">
          {right.heading}
        </text>
        {right.sub.map((line, li) => (
          <text key={li} x={rightCx} y={CARD_Y + 62 + li * 20} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
            {line}
          </text>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{caption}</p>
    </figure>
  );
}
