import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Ποια διαδρομή ισχύει για εσάς;",
    caption: "Επιβεβαιώστε τη διαδρομή σας στο Τμήμα Οδικών Μεταφορών.",
    paths: [
      {
        label: "Νέος οδηγός",
        color: "#f74656",
        steps: ["Εκπ. άδεια", "Μαθήματα", "Θεωρητική", "Πρακτική"],
      },
      {
        label: "Πολίτης ΕΕ",
        color: "#354354",
        steps: ["Έγγραφα", "Αίτηση ΤΟΜ", "Κυπριακή άδεια"],
      },
      {
        label: "Βρετανός",
        color: "#4b5d70",
        steps: ["Μτφρ. άδειας", "Αίτηση ΤΟΜ", "Εξέταση ή ανταλλαγή"],
      },
      {
        label: "Εκτός ΕΕ",
        color: "#7a8794",
        steps: ["Εκπ. άδεια", "Μαθήματα", "Θεωρητική", "Πρακτική"],
      },
    ],
  },
  en: {
    title: "Which path applies to you?",
    caption: "Confirm your exact path with the Department of Road Transport.",
    paths: [
      {
        label: "New driver",
        color: "#f74656",
        steps: ["Learner's licence", "Lessons", "Theory test", "Practical test"],
      },
      {
        label: "EU citizen",
        color: "#354354",
        steps: ["Gather documents", "Apply at DRT", "Get Cypriot licence"],
      },
      {
        label: "UK citizen",
        color: "#4b5d70",
        steps: ["Translate licence", "Apply at DRT", "Exchange or sit tests"],
      },
      {
        label: "Non-EU national",
        color: "#7a8794",
        steps: ["Learner's licence", "Lessons", "Theory test", "Practical test"],
      },
    ],
  },
};

const W = 700;
const COL_W = 155;
const GAP = (W - 4 * COL_W) / 5;
const STEP_H = 32;
const TOP = 52;
const H = TOP + 4 * STEP_H + 4 * 8 + 30;

export function LicencePathsInfographic({ locale }: { locale: Locale }) {
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
        <text x={W / 2} y={22} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
          {d.title}
        </text>

        {d.paths.map((path, col) => {
          const x = GAP + col * (COL_W + GAP);
          const cx = x + COL_W / 2;
          return (
            <g key={col}>
              {/* Column header */}
              <rect x={x} y={30} width={COL_W} height={20} rx={10} fill={path.color} />
              <text x={cx} y={43} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="700" fontFamily="system-ui, sans-serif">
                {path.label}
              </text>

              {/* Steps */}
              {path.steps.map((step, row) => (
                <g key={row}>
                  <rect x={x} y={TOP + row * (STEP_H + 8)} width={COL_W} height={STEP_H} rx={6} fill="#ffffff" stroke={path.color} strokeWidth={1.5} />
                  <text x={cx} y={TOP + row * (STEP_H + 8) + STEP_H / 2 + 4} textAnchor="middle" fill="#354354" fontSize={9.5} fontWeight="600" fontFamily="system-ui, sans-serif">
                    {step}
                  </text>
                  {row < path.steps.length - 1 && (
                    <path
                      d={`M${cx},${TOP + row * (STEP_H + 8) + STEP_H + 1} L${cx - 4},${TOP + row * (STEP_H + 8) + STEP_H + 6} L${cx + 4},${TOP + row * (STEP_H + 8) + STEP_H + 6} Z`}
                      fill={path.color}
                    />
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
