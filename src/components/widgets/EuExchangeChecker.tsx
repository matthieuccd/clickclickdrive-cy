"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Μπορείτε να ανταλλάξετε την άδεια ΕΕ χωρίς εξετάσεις;",
    subtitle: "Απαντήστε 3 ερωτήσεις για να δείτε αν πληροίτε τις προϋποθέσεις",
    questions: [
      {
        q: "Είστε πολίτης χώρας ΕΕ ή ΕΟΧ;",
        yes: "Ναι",
        no: "Όχι",
      },
      {
        q: "Έχετε εγκατασταθεί μόνιμα στην Κύπρο;",
        yes: "Ναι, μένω στην Κύπρο",
        no: "Όχι, δεν έχω εγκατασταθεί ακόμα",
      },
      {
        q: "Η ευρωπαϊκή άδειά σας ισχύει και δεν έχει λήξει;",
        yes: "Ναι, ισχύει",
        no: "Έχει λήξει ή δεν ξέρω",
      },
    ],
    results: {
      nonEu: {
        icon: "ℹ️",
        title: "Διαδικασία ΕΕ δεν ισχύει",
        body: "Η ανταλλαγή χωρίς εξετάσεις αφορά μόνο πολίτες ΕΕ/ΕΟΧ. Επικοινωνήστε με το Τμήμα Οδικών Μεταφορών για τις επιλογές σας.",
        color: "#7a8794",
      },
      notResident: {
        icon: "🕐",
        title: "Ανταλλαγή μετά την εγκατάσταση",
        body: "Όταν εγκατασταθείτε μόνιμα στην Κύπρο, θα έχετε ένα χρονικό παράθυρο για να ανταλλάξετε την άδεια ΕΕ χωρίς εξετάσεις. Επιβεβαιώστε την προθεσμία στο ΤΟΜ.",
        color: "#4b5d70",
      },
      expired: {
        icon: "⚠️",
        title: "Λήξασα άδεια — απαιτείται επαλήθευση",
        body: "Η λήξη της άδειας ΕΕ μπορεί να περιπλέξει την ανταλλαγή. Επικοινωνήστε με το Τμήμα Οδικών Μεταφορών για τα επόμενα βήματα.",
        color: "#f59e0b",
      },
      eligible: {
        icon: "✅",
        title: "Πληροίτε τις προϋποθέσεις για ανταλλαγή χωρίς εξετάσεις",
        body: "Ως κάτοικος ΕΕ με ισχύουσα άδεια, μπορείτε να ανταλλάξετε με κυπριακή χωρίς θεωρητική ή πρακτική εξέταση. Επιβεβαιώστε την τρέχουσα προθεσμία στο ΤΟΜ.",
        color: "#22c55e",
      },
    },
    restart: "Ξεκινήστε ξανά",
    note: "Η ανταλλαγή γίνεται εντός προθεσμίας από την ημέρα εγκατάστασης. Επιβεβαιώστε πάντα στο Τμήμα Οδικών Μεταφορών.",
  },
  en: {
    title: "Can you exchange your EU licence without sitting tests?",
    subtitle: "Answer 3 questions to check if you qualify",
    questions: [
      {
        q: "Are you a citizen of an EU or EEA country?",
        yes: "Yes",
        no: "No",
      },
      {
        q: "Have you taken up permanent residence in Cyprus?",
        yes: "Yes, I live in Cyprus",
        no: "No, not yet",
      },
      {
        q: "Is your EU licence currently valid and not expired?",
        yes: "Yes, it is valid",
        no: "It has expired or I am not sure",
      },
    ],
    results: {
      nonEu: {
        icon: "ℹ️",
        title: "EU exchange route does not apply",
        body: "The no-test exchange is only for EU/EEA citizens. Contact the Department of Road Transport for the options available to you.",
        color: "#7a8794",
      },
      notResident: {
        icon: "🕐",
        title: "Exchange once you take up residence",
        body: "Once you take up permanent residence in Cyprus, you will have a window to exchange your EU licence without sitting tests. Confirm the deadline with the DRT.",
        color: "#4b5d70",
      },
      expired: {
        icon: "⚠️",
        title: "Expired licence requires verification",
        body: "An expired EU licence may complicate the exchange. Contact the Department of Road Transport to find out your next steps.",
        color: "#f59e0b",
      },
      eligible: {
        icon: "✅",
        title: "You qualify for a no-test exchange",
        body: "As an EU resident with a valid licence, you can exchange for a Cypriot licence without sitting a theory or practical test. Confirm the current window deadline with the DRT.",
        color: "#22c55e",
      },
    },
    restart: "Start again",
    note: "The exchange must happen within a window after taking up residence. Always confirm the current deadline with the Department of Road Transport.",
  },
};

type ResultKey = "nonEu" | "notResident" | "expired" | "eligible";

export function EuExchangeChecker({ locale }: { locale: "el" | "en" }) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ResultKey | null>(null);
  const t = L[locale];

  function answer(yes: boolean) {
    if (step === 0 && !yes) return setResult("nonEu");
    if (step === 1 && !yes) return setResult("notResident");
    if (step === 2) return setResult(yes ? "eligible" : "expired");
    setStep(step + 1);
  }

  function restart() {
    setStep(0);
    setResult(null);
  }

  const r = result ? t.results[result] : null;

  return (
    <div className="my-8 rounded-2xl border border-[#e4e7eb] bg-white p-6">
      <h3 className="mb-1 text-lg font-bold text-[#354354]">{t.title}</h3>
      <p className="mb-5 text-sm text-[#7a8794]">{t.subtitle}</p>

      {r ? (
        <div>
          <div className="rounded-xl p-5" style={{ backgroundColor: r.color + "15", borderLeft: `4px solid ${r.color}` }}>
            <p className="mb-1 text-2xl">{r.icon}</p>
            <p className="mb-2 font-bold text-[#354354]">{r.title}</p>
            <p className="text-sm leading-relaxed text-[#4b5d70]">{r.body}</p>
          </div>
          <p className="mt-4 text-xs text-[#7a8794]">{t.note}</p>
          <button onClick={restart} className="mt-4 text-sm font-semibold text-[#f74656] hover:underline">
            {t.restart}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex gap-1">
            {t.questions.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i <= step ? "#354354" : "#e4e7eb" }} />
            ))}
          </div>
          <p className="mb-2 text-xs text-[#7a8794]">{locale === "el" ? `Ερώτηση ${step + 1} από 3` : `Question ${step + 1} of 3`}</p>
          <p className="mb-5 text-base font-semibold text-[#354354]">{t.questions[step].q}</p>
          <div className="flex gap-3">
            <button
              onClick={() => answer(true)}
              className="flex-1 rounded-xl border-2 border-[#354354] bg-white px-4 py-3 text-sm font-semibold text-[#354354] transition hover:bg-[#354354] hover:text-white"
            >
              {t.questions[step].yes}
            </button>
            <button
              onClick={() => answer(false)}
              className="flex-1 rounded-xl border-2 border-[#e4e7eb] bg-white px-4 py-3 text-sm font-semibold text-[#7a8794] transition hover:border-[#f74656] hover:text-[#f74656]"
            >
              {t.questions[step].no}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
