"use client";

import { useState } from "react";

const L = {
  el:   {
    title: "Τι σχήμα βλέπετε;",
    subtitle: "Επιλέξτε το σχήμα και το χρώμα της πινακίδας",
    options: [
      { key: "redCircle", label: "Κύκλος, κόκκινο περίγραμμα", icon: "⛔" },
      { key: "blueCircle", label: "Κύκλος, μπλε φόντο", icon: "🔵" },
      { key: "triangle", label: "Τρίγωνο, κόκκινο περίγραμμα", icon: "🔺" },
      { key: "rectangle", label: "Ορθογώνιο ή τετράγωνο", icon: "🟦" },
    ],
    results: {
      redCircle: {
        icon: "⛔",
        title: "Υποχρεωτική πινακίδα - Απαγόρευση",
        steps: ["Σας λέει τι ΔΕΝ επιτρέπεται", "Παραδείγματα: απαγόρευση εισόδου, όριο ταχύτητας, απαγόρευση προσπέρασης", "Πρέπει να την υπακούσετε χωρίς εξαίρεση"],
        note: "Οι υποχρεωτικές πινακίδες έχουν το μεγαλύτερο νομικό βάρος.",
        color: "#ef4444",
      },
      blueCircle: {
        icon: "🔵",
        title: "Υποχρεωτική πινακίδα - Εντολή",
        steps: ["Σας λέει τι ΠΡΕΠΕΙ να κάνετε", "Παραδείγματα: στρίψτε αριστερά, κρατήστε δεξιά, ελάχιστη ταχύτητα", "Πρέπει να την υπακούσετε χωρίς εξαίρεση"],
        note: "Μην τις παραβλέπετε εστιάζοντας μόνο στις κόκκινες πινακίδες.",
        color: "#3b82f6",
      },
      triangle: {
        icon: "🔺",
        title: "Προειδοποιητική πινακίδα",
        steps: ["Σας ειδοποιεί για κίνδυνο ή αλλαγή στον δρόμο", "Παραδείγματα: στροφή, ολισθηρό οδόστρωμα, διάβαση πεζών", "Μειώστε ταχύτητα και μείνετε σε ετοιμότητα"],
        note: "Δεν είναι εντολή, είναι πληροφορία που χρειάζεται αντίδραση.",
        color: "#f59e0b",
      },
      rectangle: {
        icon: "🟦",
        title: "Πληροφοριακή πινακίδα",
        steps: ["Δίνει κατευθύνσεις, υπηρεσίες ή σηματοδοτεί ζώνη", "Το χρώμα εξαρτάται από τον τύπο δρόμου: μπλε, πράσινο ή λευκό", "Δεν απαιτεί άμεση ενέργεια, αλλά καθοδηγεί"],
        note: "Οι πινακίδες κατεύθυνσης συχνά εμφανίζονται δίγλωσσες στην Κύπρο.",
        color: "#4b5d70",
      },
    },
    back: "← Πίσω",
  },
  en:   {
    title: "What shape do you see?",
    subtitle: "Select the shape and colour of the sign",
    options: [
      { key: "redCircle", label: "Circle, red border", icon: "⛔" },
      { key: "blueCircle", label: "Circle, blue background", icon: "🔵" },
      { key: "triangle", label: "Triangle, red border", icon: "🔺" },
      { key: "rectangle", label: "Rectangle or square", icon: "🟦" },
    ],
    results: {
      redCircle: {
        icon: "⛔",
        title: "Mandatory sign, Prohibition",
        steps: ["Tells you what you must NOT do", "Examples: no entry, speed limit, no overtaking", "You must obey it, no exceptions"],
        note: "Mandatory signs carry the most legal weight.",
        color: "#ef4444",
      },
      blueCircle: {
        icon: "🔵",
        title: "Mandatory sign, Obligation",
        steps: ["Tells you what you MUST do", "Examples: turn left, keep right, minimum speed", "You must obey it, no exceptions"],
        note: "Do not overlook these while focusing only on red-border signs.",
        color: "#3b82f6",
      },
      triangle: {
        icon: "🔺",
        title: "Warning sign",
        steps: ["Alerts you to a hazard or road change ahead", "Examples: bend, slippery surface, pedestrian crossing", "Reduce speed and stay alert"],
        note: "It is not an order, it is information that needs a response.",
        color: "#f59e0b",
      },
      rectangle: {
        icon: "🟦",
        title: "Informational sign",
        steps: ["Gives directions, facility info, or marks a zone", "Colour depends on road type: blue, green, or white", "Does not demand immediate action, but guides you"],
        note: "Direction signs often appear bilingually in Cyprus.",
        color: "#4b5d70",
      },
    },
    back: "← Back",
  },
};

type OptionKey = "redCircle" | "blueCircle" | "triangle" | "rectangle";

export function SignCategoryChecker({ locale }: { locale: "el" | "en" }) {
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const t = L[locale];
  const r = selected ? t.results[selected] : null;

  return (
    <div className="my-8 rounded-2xl border border-[#e4e7eb] bg-white p-6">
      <h3 className="mb-1 text-lg font-bold text-[#354354]">{t.title}</h3>
      <p className="mb-5 text-sm text-[#7a8794]">{t.subtitle}</p>

      {r ? (
        <div>
          <div className="rounded-xl p-5" style={{ backgroundColor: r.color + "12", borderLeft: `4px solid ${r.color}` }}>
            <p className="mb-2 text-2xl">{r.icon}</p>
            <p className="mb-3 font-bold text-[#354354]">{r.title}</p>
            <ol className="space-y-2">
              {r.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#4b5d70]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: r.color }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-[#7a8794]">{r.note}</p>
          </div>
          <button onClick={() => setSelected(null)} className="mt-4 text-sm font-semibold text-[#f74656] hover:underline">
            {t.back}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {t.options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelected(opt.key as OptionKey)}
              className="flex items-center gap-3 rounded-xl border-2 border-[#e4e7eb] p-4 text-left transition hover:border-[#354354] hover:bg-[#f9f9f9]"
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-sm font-semibold text-[#354354]">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
