import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    ariaLabel: "Δομή εξέτασης οδήγησης στην Κύπρο: θεωρητική και πρακτική",
    caption: "Δύο στάδια εξέτασης - Τμήμα Οδικών Μεταφορών Κύπρου",
    passLabel: "PASS",
    panels: [
      {
        title: "Θεωρητική",
        subtitle: "Εξέταση",
        badge: "Στάδιο 1",
        lines: ["Ηλεκτρονική", "Ελ. ή Αγγλικά", "Πινακίδες & κανόνες"],
      },
      {
        title: "Πρακτική",
        subtitle: "Εξέταση",
        badge: "Στάδιο 2",
        lines: ["Δημόσιοι δρόμοι", "Εξεταστής ΤΟΜ", "Αυτοκίνητο σχολής"],
      },
    ],
  },
  en: {
    ariaLabel: "Cyprus driving test structure: theory test and practical test",
    caption: "Two-stage test - Department of Road Transport Cyprus",
    passLabel: "PASS",
    panels: [
      {
        title: "Theory",
        subtitle: "Test",
        badge: "Stage 1",
        lines: ["Computer-based", "Greek or English", "Signs & rules"],
      },
      {
        title: "Practical",
        subtitle: "Test",
        badge: "Stage 2",
        lines: ["Public roads", "DRT examiner", "School car"],
      },
    ],
  },
};

const W = 700;
const H = 180;
const PANEL_W = 240;
const PANEL_H = 140;
const PANEL_Y = (H - PANEL_H) / 2;
const LEFT_X = 60;
const RIGHT_X = W - 60 - PANEL_W;
const MID_X = W / 2;
const MID_Y = H / 2;

export function TestFormatInfographic({ locale }: { locale: Locale }) {
  const d = DATA[locale];

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={d.ariaLabel}
      >
        {d.panels.map((panel, i) => {
          const x = i === 0 ? LEFT_X : RIGHT_X;
          const cx = x + PANEL_W / 2;

          return (
            <g key={i}>
              <rect
                x={x}
                y={PANEL_Y}
                width={PANEL_W}
                height={PANEL_H}
                rx={12}
                fill="#ffffff"
                stroke="#e4e7eb"
                strokeWidth={1.5}
              />
              {/* Badge */}
              <rect
                x={cx - 36}
                y={PANEL_Y + 14}
                width={72}
                height={20}
                rx={10}
                fill="#354354"
              />
              <text
                x={cx}
                y={PANEL_Y + 28}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={10}
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {panel.badge}
              </text>
              {/* Title */}
              <text
                x={cx}
                y={PANEL_Y + 60}
                textAnchor="middle"
                fill="#354354"
                fontSize={15}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {panel.title}
              </text>
              <text
                x={cx}
                y={PANEL_Y + 76}
                textAnchor="middle"
                fill="#354354"
                fontSize={15}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {panel.subtitle}
              </text>
              {/* Detail lines */}
              {panel.lines.map((line, li) => (
                <text
                  key={li}
                  x={cx}
                  y={PANEL_Y + 98 + li * 14}
                  textAnchor="middle"
                  fill="#7a8794"
                  fontSize={10}
                  fontFamily="system-ui, sans-serif"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Arrow + PASS label */}
        <line
          x1={LEFT_X + PANEL_W + 8}
          y1={MID_Y}
          x2={RIGHT_X - 8}
          y2={MID_Y}
          stroke="#f74656"
          strokeWidth={2}
        />
        <path
          d={`M${RIGHT_X - 9},${MID_Y - 5} L${RIGHT_X},${MID_Y} L${RIGHT_X - 9},${MID_Y + 5}Z`}
          fill="#f74656"
        />
        <rect
          x={MID_X - 24}
          y={MID_Y - 11}
          width={48}
          height={22}
          rx={11}
          fill="#f74656"
        />
        <text
          x={MID_X}
          y={MID_Y + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={10}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {d.passLabel}
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
