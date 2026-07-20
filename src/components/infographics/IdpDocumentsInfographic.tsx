import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    items: [
      { icon: "🪪", label: "Κυπριακή Άδεια Οδήγησης", sub: "Υποχρεωτική, πρέπει να ισχύει" },
      { icon: "📘", label: "Διαβατήριο ή Ταυτότητα", sub: "Έγκυρο επίσημο έγγραφο" },
      { icon: "📷", label: "Πρόσφατη Φωτογραφία", sub: "Μεγέθους διαβατηρίου" },
      { icon: "💳", label: "Πληρωμή Τέλους", sub: "Ελέγξτε το τρέχον ποσό στο ΤΟΜ" },
    ],
  },
  en: {
    items: [
      { icon: "🪪", label: "Cyprus Driving Licence", sub: "Mandatory, must be valid" },
      { icon: "📘", label: "Passport or ID Card", sub: "Valid official document" },
      { icon: "📷", label: "Recent Photograph", sub: "Passport-size format" },
      { icon: "💳", label: "Fee Payment", sub: "Check current amount with TOM" },
    ],
  },
};

const W = 700;
const LEFT_MARGIN = 20;
const ICON_R = 16;
const ICON_CX = LEFT_MARGIN + ICON_R;
const TEXT_X = ICON_CX + ICON_R + 16;
const RIGHT_MARGIN = 20;
const TOP_Y = 16;
const ROW_H = 52;
const H = TOP_Y + 4 * ROW_H + 16;

export function IdpDocumentsInfographic({ locale }: { locale: Locale }) {
  const items = DATA[locale].items;

  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#f3f3f3] p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label={
          locale === "el"
            ? "Egграφα για αίτηση Διεθνούς Άδειας Οδήγησης"
            : "Documents needed to apply for an International Driving Permit"
        }
      >
        {items.map((item, i) => {
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
      <p className="mt-2 text-center text-xs text-[#7a8794]">
        {locale === "el"
          ? "Ελέγξτε τα πριν επισκεφθείτε το ΤΟΜ"
          : "Check these before you visit the Department of Road Transport"}
      </p>
    </figure>
  );
}
