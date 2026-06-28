"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Ποια διαδικασία ισχύει για εσάς;",
    subtitle: "Επιλέξτε την κατάστασή σας για να δείτε τη διαδρομή σας",
    options: [
      { key: "eu", label: "Πολίτης ΕΕ / ΕΟΧ", icon: "🇪🇺" },
      { key: "uk", label: "Βρετανός πολίτης", icon: "🇬🇧" },
      { key: "nonEu", label: "Εκτός ΕΕ με ξένη άδεια", icon: "🌍" },
      { key: "none", label: "Δεν έχω άδεια οδήγησης", icon: "🆕" },
    ],
    results: {
      eu: {
        icon: "🇪🇺",
        title: "Πολίτης ΕΕ: ανταλλαγή χωρίς εξετάσεις",
        steps: ["Ετοιμάστε τα έγγραφα (άδεια ΕΕ, yellow slip, φωτό)", "Επισκεφθείτε το Τμήμα Οδικών Μεταφορών", "Παραλάβετε κυπριακή άδεια χωρίς εξετάσεις"],
        note: "Η ανταλλαγή πρέπει να γίνει εντός προθεσμίας. Επιβεβαιώστε στο ΤΟΜ.",
        color: "#354354",
      },
      uk: {
        icon: "🇬🇧",
        title: "Βρετανός πολίτης: εξαρτάται από τη διμερή συμφωνία",
        steps: ["Επαληθεύστε κατάσταση διμερούς συμφωνίας Κύπρου-ΗΒ στο ΤΟΜ", "Ετοιμάστε άδεια + μετάφραση + διαβατήριο", "Αίτηση στο ΤΟΜ (ανταλλαγή ή εξετάσεις)"],
        note: "Η ακριβής διαδικασία εξαρτάται από την τρέχουσα συμφωνία. Επιβεβαιώστε πάντα στο ΤΟΜ.",
        color: "#4b5d70",
      },
      nonEu: {
        icon: "🌍",
        title: "Εκτός ΕΕ: συνήθως πλήρης διαδικασία",
        steps: ["Εκπαιδευτική άδεια από το ΤΟΜ", "Μαθήματα με αδειούχο εκπαιδευτή", "Θεωρητική εξέταση (ελληνικά ή αγγλικά)", "Πρακτική εξέταση"],
        note: "Ορισμένες χώρες έχουν διμερείς συμφωνίες. Ελέγξτε στο ΤΟΜ.",
        color: "#7a8794",
      },
      none: {
        icon: "🆕",
        title: "Νέος οδηγός: πλήρης διαδικασία",
        steps: ["Εκπαιδευτική άδεια από το ΤΟΜ", "Μαθήματα με αδειούχο εκπαιδευτή (τουλάχιστον 10)", "Θεωρητική εξέταση (ελληνικά ή αγγλικά)", "Πρακτική εξέταση σε δημόσιους δρόμους"],
        note: "Η ελάχιστη ηλικία είναι 18 ετών. Χρειάζεται ιατρικό πιστοποιητικό.",
        color: "#f74656",
      },
    },
    back: "← Πίσω",
  },
  en: {
    title: "Which process applies to you?",
    subtitle: "Select your situation to see your path",
    options: [
      { key: "eu", label: "EU / EEA citizen", icon: "🇪🇺" },
      { key: "uk", label: "UK citizen", icon: "🇬🇧" },
      { key: "nonEu", label: "Non-EU with foreign licence", icon: "🌍" },
      { key: "none", label: "No driving licence yet", icon: "🆕" },
    ],
    results: {
      eu: {
        icon: "🇪🇺",
        title: "EU citizen: exchange without tests",
        steps: ["Gather documents (EU licence, yellow slip, photo)", "Visit the Department of Road Transport", "Receive your Cypriot licence with no tests required"],
        note: "The exchange must happen within a deadline after taking up residence. Confirm with the DRT.",
        color: "#354354",
      },
      uk: {
        icon: "🇬🇧",
        title: "UK citizen: depends on the bilateral agreement",
        steps: ["Verify the Cyprus-UK bilateral agreement status at the DRT", "Prepare your licence, a certified translation, and passport", "Apply at the DRT (exchange or sit tests depending on status)"],
        note: "The exact process depends on the current bilateral agreement. Always confirm with the DRT.",
        color: "#4b5d70",
      },
      nonEu: {
        icon: "🌍",
        title: "Non-EU national: usually the full process",
        steps: ["Apply for a learner's licence at the DRT", "Complete lessons with a licensed instructor", "Sit the theory test (English or Greek)", "Sit the practical test on public roads"],
        note: "Some countries have bilateral agreements. Check your country's status with the DRT.",
        color: "#7a8794",
      },
      none: {
        icon: "🆕",
        title: "New driver: full licence process",
        steps: ["Apply for a learner's licence at the DRT", "Complete lessons with a licensed instructor (at least 10)", "Sit the theory test (English or Greek)", "Sit the practical test on public roads"],
        note: "Minimum age is 18. You will also need a medical certificate from a registered doctor.",
        color: "#f74656",
      },
    },
    back: "← Back",
  },
};

type OptionKey = "eu" | "uk" | "nonEu" | "none";

export function ForeignerPathChecker({ locale }: { locale: "el" | "en" }) {
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
