import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο:χωρίς εξετάσεις",
    caption: "Επιβεβαιώστε την τρέχουσα προθεσμία ανταλλαγής στο Τμήμα Οδικών Μεταφορών",
    steps: [
      {
        num: "1",
        title: ["Ελέγξτε", "προθεσμία"],
        sub: ["Εντός παραθύρου;", "Επιβεβαιώστε στο ΤΟΜ"],
      },
      {
        num: "2",
        title: ["Μαζέψτε", "έγγραφα"],
        sub: ["Άδεια ΕΕ", "Yellow slip + φωτό"],
      },
      {
        num: "3",
        title: ["Επισκεφθείτε", "το ΤΟΜ"],
        sub: ["Χωρίς εξετάσεις,", "μόνο έγγραφα"],
      },
    ],
    badge: "✓ Χωρίς εξετάσεις",
  },
  en: {
    title: "Exchanging an EU licence in Cyprus:no tests required",
    caption: "Confirm the current exchange window with the Department of Road Transport",
    steps: [
      {
        num: "1",
        title: ["Check the", "deadline"],
        sub: ["Within the window?", "Confirm with DRT"],
      },
      {
        num: "2",
        title: ["Gather", "documents"],
        sub: ["EU licence", "Yellow slip + photo"],
      },
      {
        num: "3",
        title: ["Visit", "the DRT"],
        sub: ["No tests needed,", "documents only"],
      },
    ],
    badge: "✓ No tests required",
  },
};

const W = 700;
const H = 200;
const BOX_W = 160;
const BOX_H = 112;
const GAP = (W - 3 * BOX_W) / 4;
const MID_Y = H / 2;

export function EuExchangeInfographic({ locale }: { locale: Locale }) {
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
        {d.steps.map((step, i) => {
          const x = GAP + i * (BOX_W + GAP);
          const y = (H - BOX_H) / 2;
          const cx = x + BOX_W / 2;

          return (
            <g key={i}>
              <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={10} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
              <circle cx={cx} cy={y + 22} r={14} fill="#354354" />
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
                  <line x1={x + BOX_W + 4} y1={MID_Y} x2={x + BOX_W + GAP - 9} y2={MID_Y} stroke="#354354" strokeWidth={2} />
                  <path d={`M${x + BOX_W + GAP - 10},${MID_Y - 5} L${x + BOX_W + GAP},${MID_Y} L${x + BOX_W + GAP - 10},${MID_Y + 5}Z`} fill="#354354" />
                </g>
              )}
            </g>
          );
        })}

        {/* No-tests badge */}
        <rect x={W - 148} y={H - 32} width={142} height={22} rx={11} fill="#f74656" />
        <text x={W - 77} y={H - 17} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="700" fontFamily="system-ui, sans-serif">
          {d.badge}
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
