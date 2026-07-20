"use client";

import { useState } from "react";

const L = {
  el:   {
    title: "Ποια κατηγορία χρειάζεστε;",
    subtitle: "Επιλέξτε τι θέλετε να οδηγείτε",
    options: [
      { key: "moped", label: "Μοτοποδήλατο / σκούτερ", icon: "🛵" },
      { key: "motorcycle", label: "Μοτοσυκλέτα", icon: "🏍️" },
      { key: "car", label: "Αυτοκίνητο", icon: "🚗" },
      { key: "truck", label: "Φορτηγό / λεωφορείο", icon: "🚛" },
    ],
    results: {
      moped: {
        icon: "🛵",
        title: "Κατηγορία AM",
        steps: ["Ελάχιστη ηλικία 16 ετών", "Καλύπτει μοτοποδήλατα έως 45 km/h", "Ισχύει και για ελαφριά τετράκυκλα"],
        note: "Ελέγξτε τις τρέχουσες προϋποθέσεις στο ΤΟΜ.",
        color: "#22c55e",
      },
      motorcycle: {
        icon: "🏍️",
        title: "Κατηγορίες A1, A2 ή A",
        steps: ["A1: έως 125cc, ηλικία 16", "A2: έως 35 kW, ηλικία 18", "A: απεριόριστη ισχύς, ηλικία 20 (προοδευτική) ή 24 (άμεση)"],
        note: "Η προοδευτική πρόσβαση χτίζει δεξιότητες σταδιακά.",
        color: "#f59e0b",
      },
      car: {
        icon: "🚗",
        title: "Κατηγορία B (ή BE για ρυμούλκηση)",
        steps: ["Ελάχιστη ηλικία 18", "Καλύπτει έως 3.500 kg και 8 επιβάτες", "BE χρειάζεται όταν το ρυμουλκούμενο ξεπερνά τα 750 kg"],
        note: "Η πλειονότητα των οδηγών στην Κύπρο χρειάζεται μόνο Κατηγορία B.",
        color: "#354354",
      },
      truck: {
        icon: "🚛",
        title: "Κατηγορίες C ή D (επαγγελματικές)",
        steps: ["Απαιτείται προηγουμένως Κατηγορία B", "C: φορτηγά άνω των 3.500 kg", "D: λεωφορεία με 9+ θέσεις", "Απαιτείται ιατρική εξέταση, ισχύς 5 έτη"],
        note: "Ελέγξτε τις απαιτήσεις CPC για επαγγελματίες οδηγούς.",
        color: "#7a8794",
      },
    },
    back: "← Πίσω",
  },
  en:   {
    title: "Which category do you need?",
    subtitle: "Select what you want to drive",
    options: [
      { key: "moped", label: "Moped / scooter", icon: "🛵" },
      { key: "motorcycle", label: "Motorcycle", icon: "🏍️" },
      { key: "car", label: "Car", icon: "🚗" },
      { key: "truck", label: "Truck / bus", icon: "🚛" },
    ],
    results: {
      moped: {
        icon: "🛵",
        title: "Category AM",
        steps: ["Minimum age 16", "Covers mopeds up to 45 km/h", "Also covers light quadricycles"],
        note: "Check current requirements with the Department of Road Transport.",
        color: "#22c55e",
      },
      motorcycle: {
        icon: "🏍️",
        title: "Category A1, A2, or A",
        steps: ["A1: up to 125cc, age 16", "A2: up to 35 kW, age 18", "A: unrestricted power, age 20 (progressive) or 24 (direct)"],
        note: "Progressive access builds rider skill over time.",
        color: "#f59e0b",
      },
      car: {
        icon: "🚗",
        title: "Category B (or BE for towing)",
        steps: ["Minimum age 18", "Covers up to 3,500 kg and 8 passengers", "BE needed when the trailer exceeds 750 kg"],
        note: "Most drivers in Cyprus only ever need Category B.",
        color: "#354354",
      },
      truck: {
        icon: "🚛",
        title: "Category C or D (professional)",
        steps: ["Requires holding Category B first", "C: lorries over 3,500 kg", "D: buses with 9+ seats", "Requires a medical exam, valid for 5 years"],
        note: "Check CPC requirements if you plan to drive professionally.",
        color: "#7a8794",
      },
    },
    back: "← Back",
  },
};

type OptionKey = "moped" | "motorcycle" | "car" | "truck";

export function CategoryFinder({ locale }: { locale: "el" | "en" }) {
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
