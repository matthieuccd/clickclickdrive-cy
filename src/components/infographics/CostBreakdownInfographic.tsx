import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Κατανομή κόστους διπλώματος οδήγησης στην Κύπρο",
    caption: "Ενδεικτική κατανομή — τα ακριβή ποσά διαφέρουν ανά σχολή και πόλη",
    items: [
      { label: "Μαθήματα οδήγησης", sublabel: "10–20 μαθήματα (45 λεπτά)", pct: 60, color: "#f74656" },
      { label: "Επίσημα τέλη ΤΟΜ", sublabel: "Αίτηση, εξετάσεις, δίπλωμα", pct: 22, color: "#354354" },
      { label: "Ιατρικό πιστοποιητικό", sublabel: "Γιατρός εγγεγραμμένος", pct: 10, color: "#4b5d70" },
      { label: "Επιπλέον κόστη", sublabel: "Επανεξέταση, μεταφράσεις", pct: 8, color: "#7a8794" },
    ],
  },
  en: {
    title: "Driving licence cost breakdown in Cyprus",
    caption: "Indicative split — exact amounts vary by school and city",
    items: [
      { label: "Driving lessons", sublabel: "10–20 lessons (45 min each)", pct: 60, color: "#f74656" },
      { label: "Official DRT fees", sublabel: "Application, tests, licence", pct: 22, color: "#354354" },
      { label: "Medical certificate", sublabel: "Registered doctor", pct: 10, color: "#4b5d70" },
      { label: "Extra costs", sublabel: "Retakes, translations", pct: 8, color: "#7a8794" },
    ],
  },
};

const W = 700;
const BAR_H = 28;
const BAR_Y_START = 60;
const ROW_GAP = 52;
const LABEL_W = 220;
const BAR_X = LABEL_W + 10;
const BAR_MAX_W = W - BAR_X - 60;
const H = BAR_Y_START + DATA.en.items.length * ROW_GAP + 20;

export function CostBreakdownInfographic({ locale }: { locale: Locale }) {
  const d = DATA[locale];

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={d.title}
      >
        {/* Title */}
        <text
          x={W / 2}
          y={28}
          textAnchor="middle"
          fill="#354354"
          fontSize={13}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {d.title}
        </text>

        {d.items.map((item, i) => {
          const y = BAR_Y_START + i * ROW_GAP;
          const barW = (item.pct / 100) * BAR_MAX_W;

          return (
            <g key={i}>
              {/* Label */}
              <text
                x={0}
                y={y + BAR_H / 2 - 4}
                fill="#354354"
                fontSize={11}
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {item.label}
              </text>
              <text
                x={0}
                y={y + BAR_H / 2 + 10}
                fill="#7a8794"
                fontSize={9.5}
                fontFamily="system-ui, sans-serif"
              >
                {item.sublabel}
              </text>

              {/* Background track */}
              <rect
                x={BAR_X}
                y={y}
                width={BAR_MAX_W}
                height={BAR_H}
                rx={6}
                fill="#e4e7eb"
              />

              {/* Filled bar */}
              <rect
                x={BAR_X}
                y={y}
                width={barW}
                height={BAR_H}
                rx={6}
                fill={item.color}
              />

              {/* Percentage */}
              <text
                x={BAR_X + barW + 8}
                y={y + BAR_H / 2 + 5}
                fill="#354354"
                fontSize={11}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {item.pct}%
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
