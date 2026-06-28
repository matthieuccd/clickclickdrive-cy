import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Πόσο καιρό παίρνει το δίπλωμα στην Κύπρο;",
    caption: "Ενδεικτικό χρονοδιάγραμμα. Ο χρόνος ποικίλλει ανάλογα με τη διαθεσιμότητα και τον αριθμό μαθημάτων.",
    steps: [
      { label: "Εκπαιδευτική άδεια", weeks: "1-2 εβδ.", pct: 12, color: "#f74656" },
      { label: "Μαθήματα οδήγησης", weeks: "6-12 εβδ.", pct: 44, color: "#354354" },
      { label: "Θεωρητική εξέταση", weeks: "1-2 εβδ.", pct: 12, color: "#4b5d70" },
      { label: "Πρακτική εξέταση", weeks: "2-4 εβδ.", pct: 20, color: "#7a8794" },
      { label: "Παραλαβή", weeks: "1-2 εβδ.", pct: 12, color: "#e4e7eb" },
    ],
    total: "Σύνολο: 3-6 μήνες κατά μέσο όρο",
  },
  en: {
    title: "How long does a Cyprus driving licence take?",
    caption: "Indicative timeline. Actual time depends on lesson frequency and test availability.",
    steps: [
      { label: "Learner's licence", weeks: "1-2 wks", pct: 12, color: "#f74656" },
      { label: "Driving lessons", weeks: "6-12 wks", pct: 44, color: "#354354" },
      { label: "Theory test", weeks: "1-2 wks", pct: 12, color: "#4b5d70" },
      { label: "Practical test", weeks: "2-4 wks", pct: 20, color: "#7a8794" },
      { label: "Collect licence", weeks: "1-2 wks", pct: 12, color: "#e4e7eb" },
    ],
    total: "Total: 3-6 months on average",
  },
};

const W = 700;
const BAR_X = 0;
const BAR_Y = 56;
const BAR_H = 36;
const BAR_W = W;
const H = BAR_Y + BAR_H + 80;

export function LicenceTimelineInfographic({ locale }: { locale: Locale }) {
  const d = DATA[locale];
  let cursor = 0;

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={d.title}
      >
        <text x={W / 2} y={24} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
          {d.title}
        </text>

        {/* Stacked horizontal bar */}
        {d.steps.map((step, i) => {
          const segW = (step.pct / 100) * BAR_W;
          const x = cursor;
          cursor += segW;
          const rx = i === 0 ? 8 : 0;
          const rxRight = i === d.steps.length - 1 ? 8 : 0;
          return (
            <g key={i}>
              <path
                d={`M${x + rx},${BAR_Y} h${segW - rx - rxRight} a${rxRight},${rxRight} 0 0 1 ${rxRight},${rxRight} v${BAR_H - rx - rxRight} a${rx},${rx} 0 0 1 -${rx},${rx} h-${segW - rx - rxRight} a${rx},${rx} 0 0 1 -${rx},-${rx} v-${BAR_H - rx - rxRight} a${rxRight},${rxRight} 0 0 1 ${rxRight},-${rxRight} Z`}
                fill={step.color}
              />
            </g>
          );
        })}

        {/* Labels below each segment */}
        {(() => {
          let c = 0;
          return d.steps.map((step, i) => {
            const segW = (step.pct / 100) * BAR_W;
            const cx = c + segW / 2;
            c += segW;
            const textColor = step.color === "#e4e7eb" ? "#354354" : "#ffffff";
            const labelColor = "#354354";
            return (
              <g key={i}>
                <text x={cx} y={BAR_Y + BAR_H / 2 - 3} textAnchor="middle" fill={textColor} fontSize={9} fontWeight="700" fontFamily="system-ui, sans-serif">
                  {step.pct >= 12 ? step.label.split(" ")[0] : ""}
                </text>
                <text x={cx} y={BAR_Y + BAR_H / 2 + 9} textAnchor="middle" fill={textColor} fontSize={8.5} fontFamily="system-ui, sans-serif">
                  {step.pct >= 12 ? step.weeks : ""}
                </text>
                <text x={cx} y={BAR_Y + BAR_H + 18} textAnchor="middle" fill={labelColor} fontSize={9} fontFamily="system-ui, sans-serif">
                  {step.label}
                </text>
              </g>
            );
          });
        })()}

        <text x={W / 2} y={H - 8} textAnchor="middle" fill="#f74656" fontSize={11} fontWeight="700" fontFamily="system-ui, sans-serif">
          {d.total}
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
