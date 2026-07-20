"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Πληρείτε τις προϋποθέσεις;",
    subtitle: "Απαντήστε στις ερωτήσεις για να δείτε τι ισχύει για εσάς",
    questions: [
      { q: "Είστε νόμιμος κάτοικος της Κύπρου;", yes: "Ναι", no: "Όχι" },
      { q: "Είστε 18 ετών ή μεγαλύτεροι;", yes: "Ναι", no: "Όχι, αλλά είμαι 17" },
      { q: "Είστε τουλάχιστον 17 ετών;", yes: "Ναι", no: "Όχι" },
    ],
    results: {
      notResident: {
        icon: "📋",
        title: "Πρέπει πρώτα να γίνετε νόμιμος κάτοικος",
        body: "Η Κύπρος εκδίδει άδειες μόνο σε νόμιμους κατοίκους. Πολίτες ΕΕ χρειάζονται πιστοποιητικό εγγραφής ΕΕ, ενώ υπήκοοι εκτός ΕΕ χρειάζονται άδεια παραμονής από το Τμήμα Μετανάστευσης.",
        color: "#ef4444",
      },
      full: {
        icon: "✅",
        title: "Δικαιούστε πλήρη άδεια Κατηγορίας B",
        body: "Μπορείτε να ξεκινήσετε την τυπική διαδικασία: ιατρικό πιστοποιητικό, έγγραφα, θεωρητική εξέταση, μαθήματα και πρακτική εξέταση.",
        color: "#22c55e",
      },
      provisional: {
        icon: "📝",
        title: "Δικαιούστε εκπαιδευτική άδεια",
        body: "Στα 17 μπορείτε να βγάλετε εκπαιδευτική άδεια και να οδηγείτε με επίβλεψη ενήλικου κατόχου πλήρους άδειας μέχρι να κλείσετε τα 18.",
        color: "#f59e0b",
      },
      tooYoung: {
        icon: "⏳",
        title: "Πρέπει να περιμένετε λίγο ακόμα",
        body: "Η ελάχιστη ηλικία για εκπαιδευτική άδεια στην Κύπρο είναι 17 ετών. Δεν μπορείτε ακόμα να ξεκινήσετε τη διαδικασία.",
        color: "#7a8794",
      },
    },
    restart: "Ξεκινήστε ξανά",
    note: "Οι ακριβείς όροι μπορεί να αλλάξουν. Επιβεβαιώστε πάντα στο ΤΟΜ.",
  },
  en: {
    title: "Do you meet the requirements?",
    subtitle: "Answer the questions to see what applies to you",
    questions: [
      { q: "Are you a legal resident of Cyprus?", yes: "Yes", no: "No" },
      { q: "Are you 18 or older?", yes: "Yes", no: "No, but I am 17" },
      { q: "Are you at least 17?", yes: "Yes", no: "No" },
    ],
    results: {
      notResident: {
        icon: "📋",
        title: "You need legal residency first",
        body: "Cyprus only issues licences to legal residents. EU citizens need an EU registration certificate; non-EU nationals need a residence permit from the Migration Department.",
        color: "#ef4444",
      },
      full: {
        icon: "✅",
        title: "You are eligible for a full Category B licence",
        body: "You can start the standard process: medical certificate, documents, theory test, lessons, and practical test.",
        color: "#22c55e",
      },
      provisional: {
        icon: "📝",
        title: "You are eligible for a provisional licence",
        body: "At 17 you can get a provisional licence and drive under supervision of a full licence holder until you turn 18.",
        color: "#f59e0b",
      },
      tooYoung: {
        icon: "⏳",
        title: "You need to wait a little longer",
        body: "The minimum age for a provisional licence in Cyprus is 17. You cannot start the process yet.",
        color: "#7a8794",
      },
    },
    restart: "Start again",
    note: "Exact conditions can change. Always confirm with the Department of Road Transport.",
  },
};

type ResultKey = "notResident" | "full" | "provisional" | "tooYoung";

export function EligibilityChecker({ locale }: { locale: "el" | "en" }) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ResultKey | null>(null);
  const t = L[locale];

  function answer(yes: boolean) {
    if (step === 0) {
      if (!yes) return setResult("notResident");
      setStep(1);
      return;
    }
    if (step === 1) {
      if (yes) return setResult("full");
      setStep(2);
      return;
    }
    setResult(yes ? "provisional" : "tooYoung");
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
