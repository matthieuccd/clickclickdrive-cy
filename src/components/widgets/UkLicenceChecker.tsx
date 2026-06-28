"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Χρειάζεστε εξετάσεις στην Κύπρο;",
    subtitle: "Απαντήστε 3 ερωτήσεις για να μάθετε τι ισχύει για εσάς",
    questions: [
      {
        q: "Έχετε πλήρη βρετανική άδεια οδήγησης (όχι προσωρινή);",
        yes: "Ναι, πλήρης άδεια",
        no: "Όχι, προσωρινή / δεν έχω",
      },
      {
        q: "Η άδειά σας ισχύει και δεν έχει λήξει;",
        yes: "Ναι, ισχύει",
        no: "Όχι, έχει λήξει",
      },
      {
        q: "Πότε εγκατασταθήκατε μόνιμα στην Κύπρο;",
        yes: "Μετά τον Ιανουάριο 2021",
        no: "Πριν από τον Ιανουάριο 2021",
      },
    ],
    results: {
      noLicence: {
        icon: "📋",
        title: "Χρειάζεστε την πλήρη διαδικασία",
        body: "Χωρίς πλήρη βρετανική άδεια, πρέπει να ξεκινήσετε από την αρχή: εκπαιδευτική άδεια, μαθήματα, θεωρητική και πρακτική εξέταση.",
        color: "#ef4444",
      },
      expired: {
        icon: "⚠️",
        title: "Λήξασα άδεια — επικοινωνήστε με το ΤΟΜ",
        body: "Η λήξη της άδειάς σας περιπλέκει τη διαδικασία. Επικοινωνήστε με το Τμήμα Οδικών Μεταφορών για να μάθετε τις επιλογές σας.",
        color: "#f59e0b",
      },
      preBrexit: {
        icon: "✅",
        title: "Πιθανή ανταλλαγή χωρίς εξετάσεις",
        body: "Εγκαταστηθήκατε πριν το Brexit. Υπάρχει πιθανότητα ανταλλαγής χωρίς εξετάσεις. Επικοινωνήστε με το ΤΟΜ για να επιβεβαιώσετε.",
        color: "#22c55e",
      },
      postBrexit: {
        icon: "📝",
        title: "Πιθανόν χρειάζονται εξετάσεις",
        body: "Μετά το Brexit, η ανταλλαγή βρετανικής άδειας στην Κύπρο ενδέχεται να απαιτεί εξετάσεις. Επαληθεύστε την τρέχουσα κατάσταση στο Τμήμα Οδικών Μεταφορών.",
        color: "#4b5d70",
      },
    },
    restart: "Ξεκινήστε ξανά",
    drtNote: "Η ακριβής διαδικασία εξαρτάται από την τρέχουσα διμερή συμφωνία Κύπρου-Ηνωμένου Βασιλείου. Επιβεβαιώστε πάντα στο ΤΟΜ.",
  },
  en: {
    title: "Do you need to sit a test in Cyprus?",
    subtitle: "Answer 3 questions to find out what applies to you",
    questions: [
      {
        q: "Do you hold a full UK driving licence (not provisional)?",
        yes: "Yes, full licence",
        no: "No, provisional / no licence",
      },
      {
        q: "Is your licence currently valid and not expired?",
        yes: "Yes, it is valid",
        no: "No, it has expired",
      },
      {
        q: "When did you take up permanent residence in Cyprus?",
        yes: "After January 2021",
        no: "Before January 2021",
      },
    ],
    results: {
      noLicence: {
        icon: "📋",
        title: "You need the full process",
        body: "Without a full UK licence, you must go through the standard process: learner's licence, lessons, theory test, and practical test.",
        color: "#ef4444",
      },
      expired: {
        icon: "⚠️",
        title: "Expired licence — contact the DRT",
        body: "An expired licence complicates the exchange process. Contact the Department of Road Transport to understand your options.",
        color: "#f59e0b",
      },
      preBrexit: {
        icon: "✅",
        title: "Exchange without tests may be possible",
        body: "You took up residence before Brexit. There is a chance you can exchange without sitting tests. Confirm the current rules with the DRT.",
        color: "#22c55e",
      },
      postBrexit: {
        icon: "📝",
        title: "Tests likely required",
        body: "After Brexit, exchanging a UK licence in Cyprus may require sitting one or both tests. Verify the current bilateral agreement status with the Department of Road Transport.",
        color: "#4b5d70",
      },
    },
    restart: "Start again",
    drtNote: "The exact process depends on the current Cyprus-UK bilateral agreement. Always confirm with the DRT before applying.",
  },
};

type ResultKey = "noLicence" | "expired" | "preBrexit" | "postBrexit";

export function UkLicenceChecker({ locale }: { locale: "el" | "en" }) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ResultKey | null>(null);
  const t = L[locale];

  function answer(yes: boolean) {
    if (step === 0 && !yes) return setResult("noLicence");
    if (step === 1 && !yes) return setResult("expired");
    if (step === 2) return setResult(yes ? "postBrexit" : "preBrexit");
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
          <p className="mt-4 text-xs text-[#7a8794]">{t.drtNote}</p>
          <button
            onClick={restart}
            className="mt-4 text-sm font-semibold text-[#f74656] hover:underline"
          >
            {t.restart}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex gap-1">
            {t.questions.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i < step ? "#f74656" : i === step ? "#f74656" : "#e4e7eb", opacity: i === step ? 1 : i < step ? 0.5 : 1 }} />
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
