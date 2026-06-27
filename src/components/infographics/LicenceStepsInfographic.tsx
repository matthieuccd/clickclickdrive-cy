import type { Locale } from "@/lib/types";

const STEPS = {
  el: [
    {
      num: "1",
      title: ["Εκπαιδευτική", "Άδεια"],
      sub: ["Τμήμα Οδικών", "Μεταφορών"],
    },
    {
      num: "2",
      title: ["Μαθήματα", "Οδήγησης"],
      sub: ["Εκπαιδευτής &", "διπλός έλεγχος"],
    },
    {
      num: "3",
      title: ["Θεωρητική", "Εξέταση"],
      sub: ["Ηλεκτρονικά,", "Ελ. ή Αγγλικά"],
    },
    {
      num: "4",
      title: ["Πρακτική", "Εξέταση"],
      sub: ["Πραγματικοί", "δρόμοι"],
    },
  ],
  en: [
    {
      num: "1",
      title: ["Learner's", "Licence"],
      sub: ["Department of", "Road Transport"],
    },
    {
      num: "2",
      title: ["Driving", "Lessons"],
      sub: ["Instructor &", "dual-control car"],
    },
    {
      num: "3",
      title: ["Theory", "Test"],
      sub: ["Computer-based,", "Greek or English"],
    },
    {
      num: "4",
      title: ["Practical", "Test"],
      sub: ["On real public", "roads"],
    },
  ],
};

const W = 700;
const H = 168;
const BOX_W = 132;
const BOX_H = 112;
const GAP = (W - 4 * BOX_W) / 5; // 36
const MID_Y = H / 2;

export function LicenceStepsInfographic({ locale }: { locale: Locale }) {
  const steps = STEPS[locale];

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={
          locale === "el"
            ? "4 βήματα για κυπριακό δίπλωμα οδήγησης"
            : "4 steps to a Cyprus driving licence"
        }
      >
        {steps.map((step, i) => {
          const x = GAP + i * (BOX_W + GAP);
          const y = (H - BOX_H) / 2;
          const cx = x + BOX_W / 2;

          return (
            <g key={i}>
              {/* Card */}
              <rect
                x={x}
                y={y}
                width={BOX_W}
                height={BOX_H}
                rx={10}
                fill="#ffffff"
                stroke="#e4e7eb"
                strokeWidth={1.5}
              />

              {/* Number badge */}
              <circle cx={cx} cy={y + 22} r={14} fill="#f74656" />
              <text
                x={cx}
                y={y + 27}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={13}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {step.num}
              </text>

              {/* Title lines */}
              {step.title.map((line, li) => (
                <text
                  key={li}
                  x={cx}
                  y={y + 52 + li * 16}
                  textAnchor="middle"
                  fill="#354354"
                  fontSize={11}
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {line}
                </text>
              ))}

              {/* Subtitle lines */}
              {step.sub.map((line, li) => (
                <text
                  key={li}
                  x={cx}
                  y={y + 86 + li * 13}
                  textAnchor="middle"
                  fill="#7a8794"
                  fontSize={10}
                  fontFamily="system-ui, sans-serif"
                >
                  {line}
                </text>
              ))}

              {/* Arrow to next step */}
              {i < steps.length - 1 && (
                <g>
                  <line
                    x1={x + BOX_W + 4}
                    y1={MID_Y}
                    x2={x + BOX_W + GAP - 9}
                    y2={MID_Y}
                    stroke="#f74656"
                    strokeWidth={2}
                  />
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
      <p className="mt-2 text-center text-xs text-[#7a8794]">
        {locale === "el"
          ? "Τα 4 βήματα για κυπριακό δίπλωμα - Τμήμα Οδικών Μεταφορών"
          : "The 4 steps to a Cyprus driving licence - Department of Road Transport"}
      </p>
    </figure>
  );
}
