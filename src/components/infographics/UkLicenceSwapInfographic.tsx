import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Ανταλλαγή άδειας: τι παραδίδετε, τι παίρνετε",
    caption: "Δεν κρατάτε τη βρετανική άδεια μετά την ανταλλαγή",
    left: {
      heading: "Βρετανική Άδεια",
      sub: ["Παραδίδεται στο ΤΟΜ", "Επιστρέφεται στην DVLA"],
    },
    right: {
      heading: "Κυπριακή Άδεια",
      sub: ["Μορφή ΕΕ", "Ισχύει σε όλη την ΕΕ"],
    },
  },
  en: {
    title: "The exchange: what you hand over, what you get",
    caption: "You do not keep your UK licence after the exchange",
    left: {
      heading: "UK Licence",
      sub: ["Surrendered to TOM", "Returned to the DVLA"],
    },
    right: {
      heading: "Cyprus Licence",
      sub: ["EU format", "Valid across the EU"],
    },
  },
};

const W = 700;
const CARD_W = 270;
const CARD_Y = 42;
const CARD_H = 118;
const LEFT_X = 20;
const RIGHT_X = W - 20 - CARD_W;
const CARD_CY = CARD_Y + CARD_H / 2;
const H = CARD_Y + CARD_H + 20;

const GAP_LEFT_EDGE = LEFT_X + CARD_W;
const GAP_RIGHT_EDGE = RIGHT_X;
const ARROW_Y_TOP = CARD_CY - 14;
const ARROW_Y_BOT = CARD_CY + 14;

export function UkLicenceSwapInfographic({ locale }: { locale: Locale }) {
  const d = DATA[locale];
  const leftCx = LEFT_X + CARD_W / 2;
  const rightCx = RIGHT_X + CARD_W / 2;

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
          @keyframes ukSwapCardIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ukSwapArrowIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>

        <text x={W / 2} y={22} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
          {d.title}
        </text>

        {/* Left card: UK licence surrendered */}
        <g style={{ animation: "ukSwapCardIn 0.45s ease both" }}>
          <rect x={LEFT_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx={14} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
          <text x={leftCx} y={CARD_Y + 36} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="600" fontFamily="system-ui, sans-serif">
            {d.left.heading}
          </text>
          {d.left.sub.map((line, li) => (
            <text key={li} x={leftCx} y={CARD_Y + 62 + li * 20} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
              {line}
            </text>
          ))}
        </g>

        {/* Swap motif: two opposing arrows in the gap */}
        <g style={{ animation: "ukSwapArrowIn 0.5s ease both", animationDelay: "0.3s" }}>
          <line x1={GAP_LEFT_EDGE + 4} y1={ARROW_Y_TOP} x2={GAP_RIGHT_EDGE - 9} y2={ARROW_Y_TOP} stroke="#f74656" strokeWidth={2} />
          <path
            d={`M${GAP_RIGHT_EDGE - 10},${ARROW_Y_TOP - 5} L${GAP_RIGHT_EDGE},${ARROW_Y_TOP} L${GAP_RIGHT_EDGE - 10},${ARROW_Y_TOP + 5} Z`}
            fill="#f74656"
          />
          <line x1={GAP_RIGHT_EDGE - 4} y1={ARROW_Y_BOT} x2={GAP_LEFT_EDGE + 9} y2={ARROW_Y_BOT} stroke="#f74656" strokeWidth={2} />
          <path
            d={`M${GAP_LEFT_EDGE + 10},${ARROW_Y_BOT - 5} L${GAP_LEFT_EDGE},${ARROW_Y_BOT} L${GAP_LEFT_EDGE + 10},${ARROW_Y_BOT + 5} Z`}
            fill="#f74656"
          />
        </g>

        {/* Right card: Cyprus licence received */}
        <g style={{ animation: "ukSwapCardIn 0.45s ease both", animationDelay: "0.15s" }}>
          <rect x={RIGHT_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx={14} fill="#ffffff" stroke="#f74656" strokeWidth={2} />
          <text x={rightCx} y={CARD_Y + 36} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="600" fontFamily="system-ui, sans-serif">
            {d.right.heading}
          </text>
          {d.right.sub.map((line, li) => (
            <text key={li} x={rightCx} y={CARD_Y + 62 + li * 20} textAnchor="middle" fill="#7a8794" fontSize={10} fontFamily="system-ui, sans-serif">
              {line}
            </text>
          ))}
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
