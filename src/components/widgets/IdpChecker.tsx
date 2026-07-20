"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Χρειάζεστε Διεθνή Άδεια Οδήγησης;",
    subtitle: "Επιλέξτε πού ταξιδεύετε",
    options: [
      { key: "eu", label: "Ταξιδεύω εντός ΕΕ ή ΕΟΧ", icon: "🇪🇺" },
      { key: "vienna", label: "Ταξιδεύω σε χώρα της Σύμβασης Βιέννης 1968", icon: "🌍" },
      { key: "geneva", label: "Ταξιδεύω σε ΗΠΑ, Αυστραλία ή Νέα Ζηλανδία", icon: "🗽" },
      { key: "checkValidity", label: "Θέλω να ελέγξω πόσο ισχύει η ΔΑΟ μου", icon: "📅" },
    ],
    results: {
      eu: {
        icon: "✅",
        title: "Δεν χρειάζεστε ΔΑΟ",
        steps: ["Η κυπριακή σας άδεια αναγνωρίζεται σε όλα τα κράτη μέλη ΕΕ και ΕΟΧ", "Δεν χρειάζεται καμία επιπλέον διαδικασία"],
        note: "Ορισμένες εταιρείες ενοικίασης μπορεί να ζητήσουν ΔΑΟ ως δική τους πολιτική.",
        color: "#22c55e",
      },
      vienna: {
        icon: "📄",
        title: "Κάντε αίτηση για κυπριακή ΔΑΟ",
        steps: ["Επισκεφθείτε αυτοπροσώπως γραφείο ΤΟΜ", "Φέρτε άδεια, ταυτότητα, φωτογραφία και το τέλος", "Η ΔΑΟ συνήθως εκδίδεται την ίδια μέρα"],
        note: "Η ΔΑΟ ισχύει έως 3 χρόνια, αλλά όχι πέρα από τη λήξη της άδειάς σας.",
        color: "#354354",
      },
      geneva: {
        icon: "⚠️",
        title: "Ελέγξτε τους διμερείς κανόνες με το ΤΟΜ",
        steps: ["Αυτές οι χώρες δεν συμμετέχουν στη Σύμβαση Βιέννης 1968", "Χρησιμοποιούν τη Σύμβαση της Γενεύης 1949", "Οι κανόνες διαφέρουν ανά πολιτεία και εταιρεία ενοικίασης"],
        note: "Επικοινωνήστε με το ΤΟΜ και την εταιρεία ενοικίασης πριν ταξιδέψετε.",
        color: "#f59e0b",
      },
      checkValidity: {
        icon: "⏳",
        title: "Η ισχύς περιορίζεται από την άδειά σας",
        steps: ["Η ΔΑΟ ισχύει έως 3 χρόνια από την έκδοση", "Ποτέ δεν ισχύει πέρα από τη λήξη της κυπριακής άδειάς σας", "Αν η άδειά σας λήγει σε 18 μήνες, τόσο θα ισχύει και η ΔΑΟ"],
        note: "Ανανεώστε πρώτα την άδειά σας για ΔΑΟ μεγαλύτερης διάρκειας.",
        color: "#4b5d70",
      },
    },
    back: "← Πίσω",
  },
  en: {
    title: "Do you need an International Driving Permit?",
    subtitle: "Select where you are travelling",
    options: [
      { key: "eu", label: "Travelling within the EU or EEA", icon: "🇪🇺" },
      { key: "vienna", label: "Travelling to a 1968 Vienna Convention country", icon: "🌍" },
      { key: "geneva", label: "Travelling to the US, Australia, or New Zealand", icon: "🗽" },
      { key: "checkValidity", label: "I want to check how long my IDP is valid", icon: "📅" },
    ],
    results: {
      eu: {
        icon: "✅",
        title: "You do not need an IDP",
        steps: ["Your Cyprus licence is recognised across all EU and EEA member states", "No extra paperwork needed"],
        note: "Some rental companies may still ask for an IDP as their own policy.",
        color: "#22c55e",
      },
      vienna: {
        icon: "📄",
        title: "Apply for a Cyprus IDP",
        steps: ["Visit a TOM office in person", "Bring your licence, ID, photo, and the fee", "The permit is usually issued the same day"],
        note: "The IDP is valid for up to 3 years, but never beyond your licence expiry date.",
        color: "#354354",
      },
      geneva: {
        icon: "⚠️",
        title: "Check bilateral rules with TOM",
        steps: ["These countries are not party to the 1968 Vienna Convention", "They use the 1949 Geneva Convention instead", "Rules vary by state and rental company"],
        note: "Contact TOM and your rental company before you travel.",
        color: "#f59e0b",
      },
      checkValidity: {
        icon: "⏳",
        title: "Validity is capped by your licence",
        steps: ["The IDP is valid for up to 3 years from issue", "It never outlasts your Cyprus licence expiry date", "If your licence expires in 18 months, so does your IDP"],
        note: "Renew your licence first if you want a longer-lasting IDP.",
        color: "#4b5d70",
      },
    },
    back: "← Back",
  },
};

type OptionKey = "eu" | "vienna" | "geneva" | "checkValidity";

export function IdpChecker({ locale }: { locale: "el" | "en" }) {
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
