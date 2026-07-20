import type { AutoInfographicContent, AutoTimelineMilestone } from "@/lib/types";

const W = 700;
const MARGIN = 60;
const BASELINE_Y = 95;
const H = 180;

type TimelineContent = Extract<AutoInfographicContent, { template: "timeline" }>;

export function AutoTimelineInfographic({ content }: { content: TimelineContent }) {
  const { title, caption, milestones } = content;
  const n = milestones.length;
  const spacing = n > 1 ? (W - 2 * MARGIN) / (n - 1) : 0;

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={title}
      >
        <line x1={MARGIN} y1={BASELINE_Y} x2={W - MARGIN} y2={BASELINE_Y} stroke="#f74656" strokeWidth={2} />
        {milestones.map((m: AutoTimelineMilestone, i: number) => {
          const cx = MARGIN + i * spacing;
          return (
            <g key={i}>
              <circle cx={cx} cy={BASELINE_Y} r={8} fill="#f74656" stroke="#ffffff" strokeWidth={2} />
              <text x={cx} y={BASELINE_Y - 34} textAnchor="middle" fill="#354354" fontSize={12} fontWeight="600" fontFamily="system-ui, sans-serif">
                {m.label}
              </text>
              <text x={cx} y={BASELINE_Y + 28} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
                {m.sub}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{caption}</p>
    </figure>
  );
}
