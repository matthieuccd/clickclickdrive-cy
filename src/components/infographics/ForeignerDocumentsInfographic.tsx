import type { Locale } from "@/lib/types";

const DATA = {
  el: {
    title: "Έγγραφα για δίπλωμα οδήγησης στην Κύπρο",
    caption: "Επιβεβαιώστε τη λίστα εγγράφων στο Τμήμα Οδικών Μεταφορών πριν επισκεφθείτε.",
    docs: [
      { icon: "🪪", label: "Διαβατήριο", sub: "ή ταυτότητα σε ισχύ" },
      { icon: "🏠", label: "Απόδειξη κατοικίας", sub: "Yellow slip, συμβόλαιο ή λογαριασμός" },
      { icon: "🩺", label: "Ιατρικό πιστοποιητικό", sub: "Από εγγεγραμμένο γιατρό" },
      { icon: "📷", label: "Πρόσφατη φωτογραφία", sub: "Διαβατηρίου τύπου" },
      { icon: "📄", label: "Έντυπο αίτησης", sub: "Από το ΤΟΜ ή online" },
    ],
  },
  en: {
    title: "Documents needed for a Cyprus driving licence",
    caption: "Confirm the full document list with the Department of Road Transport before your visit.",
    docs: [
      { icon: "🪪", label: "Passport or ID", sub: "Valid, not expired" },
      { icon: "🏠", label: "Proof of residence", sub: "Yellow slip, contract, or utility bill" },
      { icon: "🩺", label: "Medical certificate", sub: "From a registered doctor" },
      { icon: "📷", label: "Recent photograph", sub: "Passport-style" },
      { icon: "📄", label: "Application form", sub: "From the DRT office or online" },
    ],
  },
};

const W = 700;
const COLS = 5;
const CARD_W = 112;
const CARD_H = 120;
const GAP = (W - COLS * CARD_W) / (COLS + 1);
const TOP = 44;
const H = TOP + CARD_H + 36;

export function ForeignerDocumentsInfographic({ locale }: { locale: Locale }) {
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
        <text x={W / 2} y={24} textAnchor="middle" fill="#354354" fontSize={13} fontWeight="700" fontFamily="system-ui, sans-serif">
          {d.title}
        </text>

        {d.docs.map((doc, i) => {
          const x = GAP + i * (CARD_W + GAP);
          const cx = x + CARD_W / 2;
          return (
            <g key={i}>
              <rect x={x} y={TOP} width={CARD_W} height={CARD_H} rx={10} fill="#ffffff" stroke="#e4e7eb" strokeWidth={1.5} />
              <text x={cx} y={TOP + 32} textAnchor="middle" fontSize={24} fontFamily="system-ui, sans-serif">{doc.icon}</text>
              <text x={cx} y={TOP + 58} textAnchor="middle" fill="#354354" fontSize={10.5} fontWeight="700" fontFamily="system-ui, sans-serif">{doc.label}</text>
              {doc.sub.split(" ").reduce<string[][]>((lines, word) => {
                const last = lines[lines.length - 1];
                if (!last || (last.join(" ") + " " + word).length > 18) lines.push([word]);
                else last.push(word);
                return lines;
              }, []).map((line, li) => (
                <text key={li} x={cx} y={TOP + 74 + li * 13} textAnchor="middle" fill="#7a8794" fontSize={9.5} fontFamily="system-ui, sans-serif">
                  {line.join(" ")}
                </text>
              ))}
              {/* Checkmark */}
              <circle cx={x + CARD_W - 10} cy={TOP + 10} r={8} fill="#f74656" />
              <text x={x + CARD_W - 10} y={TOP + 14} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight="700" fontFamily="system-ui, sans-serif">✓</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[#7a8794]">{d.caption}</p>
    </figure>
  );
}
