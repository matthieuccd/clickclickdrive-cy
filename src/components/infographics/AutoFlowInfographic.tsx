import type { AutoFlowItem, AutoInfographicContent } from "@/lib/types";

const W = 700;
const H = 168;
const GAP = 36;
const BOX_H = 112;
const MID_Y = H / 2;

type FlowContent = Extract<AutoInfographicContent, { template: "flow" }>;

export function AutoFlowInfographic({ content }: { content: FlowContent }) {
  const { title, caption, items } = content;
  const n = items.length;
  const BOX_W = Math.floor((W - (n + 1) * GAP) / n);

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={title}
      >
        {items.map((item: AutoFlowItem, i: number) => {
          const x = GAP + i * (BOX_W + GAP);
          const y = (H - BOX_H) / 2;
          const cx = x + BOX_W / 2;
          return (
            <g key={i}>
              <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={10} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
              <circle cx={cx} cy={y + 22} r={14} fill="#f74656" />
              <text x={cx} y={y + 27} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
                {item.num}
              </text>
              {item.title.map((line, li) => (
                <text key={li} x={cx} y={y + 52 + li * 16} textAnchor="middle" fill="#354354" fontSize={11} fontWeight="600" fontFamily="system-ui, sans-serif">
                  {line}
                </text>
              ))}
              {item.sub.map((line, li) => (
                <text key={li} x={cx} y={y + 86 + li * 13} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
                  {line}
                </text>
              ))}
              {i < items.length - 1 && (
                <g>
                  <line x1={x + BOX_W + 4} y1={MID_Y} x2={x + BOX_W + GAP - 9} y2={MID_Y} stroke="#f74656" strokeWidth={2} />
                  <path
                    d={`M${x + BOX_W + GAP - 10},${MID_Y - 5} L${x + BOX_W + GAP},${MID_Y} L${x + BOX_W + GAP - 10},${MID_Y + 5}Z`}
                    fill="#f74656"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{caption}</p>
    </figure>
  );
}
