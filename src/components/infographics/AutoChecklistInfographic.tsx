import type { AutoChecklistItem, AutoInfographicContent } from "@/lib/types";

const W = 700;
const LEFT_MARGIN = 20;
const ICON_R = 16;
const ICON_CX = LEFT_MARGIN + ICON_R;
const TEXT_X = ICON_CX + ICON_R + 16;
const RIGHT_MARGIN = 20;
const TOP_Y = 16;
const ROW_H = 52;

type ChecklistContent = Extract<AutoInfographicContent, { template: "checklist" }>;

export function AutoChecklistInfographic({ content }: { content: ChecklistContent }) {
  const { title, caption, items } = content;
  const H = TOP_Y + items.length * ROW_H + 16;

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={title}
      >
        {items.map((item: AutoChecklistItem, i: number) => {
          const rowTop = TOP_Y + i * ROW_H;
          const rowCy = rowTop + ROW_H / 2;
          const isLast = i === items.length - 1;
          return (
            <g key={i}>
              <circle cx={ICON_CX} cy={rowCy} r={ICON_R} fill="#fde7ea" stroke="#f74656" strokeWidth={1.5} />
              <text x={ICON_CX} y={rowCy + 6} textAnchor="middle" fontSize={16} fontFamily="system-ui, sans-serif">
                {item.icon}
              </text>
              <text x={TEXT_X} y={rowCy - 4} fill="#354354" fontSize={13} fontWeight="600" fontFamily="system-ui, sans-serif">
                {item.label}
              </text>
              <text x={TEXT_X} y={rowCy + 14} fill="#7a8794" fontSize={11} fontFamily="system-ui, sans-serif">
                {item.sub}
              </text>
              {!isLast && (
                <line x1={TEXT_X} y1={rowTop + ROW_H} x2={W - RIGHT_MARGIN} y2={rowTop + ROW_H} stroke="#e4e7eb" strokeWidth={1} />
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{caption}</p>
    </figure>
  );
}
