import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Η διαδικασία για Βρετανούς οδηγούς στην Κύπρο",
    caption: "Βάσει της διμερούς συμφωνίας Κύπρου-Ηνωμένου Βασιλείου. Επιβεβαιώστε την ισχύουσα κατάσταση στο ΤΟΜ.",
    steps: [
      {
        num: "1",
        title: ["Ελέγξτε", "την άδειά σας"],
        sub: ["Ισχύει στην Κύπρο;", "Έχει λήξει;"],
      },
      {
        num: "2",
        title: ["Ετοιμάστε", "τα έγγραφα"],
        sub: ["Άδεια + μτφρ.", "Διαβατήριο + φωτό"],
      },
      {
        num: "3",
        title: ["Επισκεφθείτε", "το ΤΟΜ"],
        sub: ["Αίτηση ανταλλαγής", "ή εξετάσεων"],
      },
      {
        num: "4",
        title: ["Κυπριακή", "Άδεια"],
        sub: ["Ισχύει σε", "όλη την ΕΕ"],
      },
    ],
  },
  en: {
    title: "The process for UK drivers in Cyprus",
    caption: "Based on the Cyprus-UK bilateral agreement. Confirm current status with the Department of Road Transport.",
    steps: [
      {
        num: "1",
        title: ["Check your", "licence"],
        sub: ["Valid in Cyprus?", "Expired?"],
      },
      {
        num: "2",
        title: ["Prepare", "documents"],
        sub: ["Licence + translation", "Passport + photo"],
      },
      {
        num: "3",
        title: ["Visit the", "DRT"],
        sub: ["Apply to exchange", "or sit tests"],
      },
      {
        num: "4",
        title: ["Cyprus", "Licence"],
        sub: ["Valid across", "all EU states"],
      },
    ],
  },
};

const W = 700;
const H = 168;
const BOX_W = 132;
const BOX_H = 112;
const GAP = (W - 4 * BOX_W) / 5;
const MID_Y = H / 2;

export function UkExchangeInfographic({ locale }: { locale: Locale }) {
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
        <style>{`
          @keyframes ukStepIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {d.steps.map((step, i) => {
          const x = GAP + i * (BOX_W + GAP);
          const y = (H - BOX_H) / 2;
          const cx = x + BOX_W / 2;

          return (
            <g
              key={i}
              style={{
                animation: "ukStepIn 0.45s ease both",
                animationDelay: `${i * 0.18}s`,
              }}
            >
              <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={10} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
              <circle cx={cx} cy={y + 22} r={14} fill="#f74656" />
              <text x={cx} y={y + 27} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
                {step.num}
              </text>
              {step.title.map((line, li) => (
                <text key={li} x={cx} y={y + 52 + li * 16} textAnchor="middle" fill="#354354" fontSize={11} fontWeight="600" fontFamily="system-ui, sans-serif">
                  {line}
                </text>
              ))}
              {step.sub.map((line, li) => (
                <text key={li} x={cx} y={y + 86 + li * 13} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
                  {line}
                </text>
              ))}
              {i < d.steps.length - 1 && (
                <g>
                  <line x1={x + BOX_W + 4} y1={MID_Y} x2={x + BOX_W + GAP - 9} y2={MID_Y} stroke="#f74656" strokeWidth={2} />
                  <path d={`M${x + BOX_W + GAP - 10},${MID_Y - 5} L${x + BOX_W + GAP},${MID_Y} L${x + BOX_W + GAP - 10},${MID_Y + 5}Z`} fill="#f74656" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
