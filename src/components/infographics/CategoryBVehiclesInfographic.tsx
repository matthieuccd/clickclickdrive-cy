import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Τι μπορείτε να οδηγείτε με κατηγορία Β;",
    caption: "Κατηγορία Β: οχήματα έως 3.500 kg, έως 8 επιβάτες. Ισχύει σε όλη την ΕΕ.",
    allowed: [
      { icon: "🚗", label: "Επιβατικά αυτοκίνητα", sub: "έως 3.500 kg" },
      { icon: "🚐", label: "Μικρά βανάκια", sub: "έως 3.500 kg" },
      { icon: "🚙", label: "SUV / 4x4", sub: "έως 3.500 kg" },
      { icon: "🚛", label: "Μικρό ρυμουλκό", sub: "εντός ορίου βάρους" },
    ],
    notAllowed: [
      { icon: "🏍️", label: "Μοτοσυκλέτες", sub: "χρειάζεται κατ. Α" },
      { icon: "🚚", label: "Φορτηγά", sub: "χρειάζεται κατ. C" },
      { icon: "🚌", label: "Λεωφορεία", sub: "χρειάζεται κατ. D" },
    ],
    yesLabel: "ΕΠΙΤΡΕΠΕΤΑΙ",
    noLabel: "ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ",
  },
  en: {
    title: "What can you drive with a Category B licence?",
    caption: "Category B: vehicles up to 3,500 kg, up to 8 passengers. Valid across all EU states.",
    allowed: [
      { icon: "🚗", label: "Passenger cars", sub: "up to 3,500 kg" },
      { icon: "🚐", label: "Small vans", sub: "up to 3,500 kg" },
      { icon: "🚙", label: "SUVs / 4x4s", sub: "up to 3,500 kg" },
      { icon: "🚛", label: "Light trailer", sub: "within weight limits" },
    ],
    notAllowed: [
      { icon: "🏍️", label: "Motorcycles", sub: "needs Category A" },
      { icon: "🚚", label: "Trucks / lorries", sub: "needs Category C" },
      { icon: "🚌", label: "Buses / coaches", sub: "needs Category D" },
    ],
    yesLabel: "ALLOWED",
    noLabel: "NOT ALLOWED",
  },
};

const W = 700;
const H = 220;
const CARDS_TOP = 58;
const CARD_H = 100;
const CARD_GAP = 8;
// Available width per side (half minus a small margin so cards don't crowd the centre line)
const SECTION_W = W / 2 - 20;

export function CategoryBVehiclesInfographic({ locale }: { locale: Locale }) {
  const d = DATA[locale];

  // Compute card widths to fill each section without overlap
  const aCW = Math.floor((SECTION_W - (d.allowed.length + 1) * CARD_GAP) / d.allowed.length);
  const nCW = Math.floor((SECTION_W - (d.notAllowed.length + 1) * CARD_GAP) / d.notAllowed.length);

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

        {/* Dividing line */}
        <line x1={W / 2} y1={32} x2={W / 2} y2={H - 10} stroke="#e4e7eb" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Allowed label */}
        <rect x={8} y={32} width={90} height={18} rx={9} fill="#22c55e" />
        <text x={53} y={44} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight="700" fontFamily="system-ui, sans-serif">{d.yesLabel}</text>

        {/* Not allowed label */}
        <rect x={W / 2 + 8} y={32} width={110} height={18} rx={9} fill="#ef4444" />
        <text x={W / 2 + 63} y={44} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight="700" fontFamily="system-ui, sans-serif">{d.noLabel}</text>

        {/* Allowed cards */}
        {d.allowed.map((item, i) => {
          const x = CARD_GAP + i * (aCW + CARD_GAP);
          const cx = x + aCW / 2;
          return (
            <g key={i}>
              <rect x={x} y={CARDS_TOP} width={aCW} height={CARD_H} rx={8} fill="#ffffff" stroke="#22c55e" strokeWidth={1.5} />
              <text x={cx} y={CARDS_TOP + 28} textAnchor="middle" fontSize={20} fontFamily="system-ui, sans-serif">{item.icon}</text>
              <text x={cx} y={CARDS_TOP + 50} textAnchor="middle" fill="#354354" fontSize={9} fontWeight="600" fontFamily="system-ui, sans-serif">{item.label}</text>
              <text x={cx} y={CARDS_TOP + 64} textAnchor="middle" fill="#7a8794" fontSize={8} fontFamily="system-ui, sans-serif">{item.sub}</text>
            </g>
          );
        })}

        {/* Not allowed cards */}
        {d.notAllowed.map((item, i) => {
          const x = W / 2 + CARD_GAP + i * (nCW + CARD_GAP);
          const cx = x + nCW / 2;
          return (
            <g key={i}>
              <rect x={x} y={CARDS_TOP} width={nCW} height={CARD_H} rx={8} fill="#ffffff" stroke="#ef4444" strokeWidth={1.5} />
              <text x={cx} y={CARDS_TOP + 28} textAnchor="middle" fontSize={20} fontFamily="system-ui, sans-serif">{item.icon}</text>
              <text x={cx} y={CARDS_TOP + 50} textAnchor="middle" fill="#354354" fontSize={9} fontWeight="600" fontFamily="system-ui, sans-serif">{item.label}</text>
              <text x={cx} y={CARDS_TOP + 64} textAnchor="middle" fill="#7a8794" fontSize={8} fontFamily="system-ui, sans-serif">{item.sub}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
