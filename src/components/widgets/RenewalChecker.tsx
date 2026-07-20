"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Πότε πρέπει να ανανεώσετε;",
    subtitle: "Απαντήστε 3 ερωτήσεις για να μάθετε τι ισχύει για εσάς",
    questions: [
      {
        q: "Είστε 65 ετών ή μεγαλύτεροι;",
        yes: "Ναι",
        no: "Όχι",
      },
      {
        q: "Κατέχετε άδεια Κατηγορίας Γ ή Δ (επαγγελματική);",
        yes: "Ναι",
        no: "Όχι, Κατηγορία Β",
      },
      {
        q: "Έχει ήδη λήξει η άδειά σας;",
        yes: "Ναι, έχει λήξει",
        no: "Όχι, ισχύει ακόμα",
      },
    ],
    results: {
      senior: {
        icon: "🩺",
        title: "Χρειάζεστε ιατρικό πιστοποιητικό",
        body: "Στα 65+ ανανεώνετε συχνότερα και χρειάζεστε ιατρικό πιστοποιητικό από εγκεκριμένο γιατρό του ΤΟΜ κάθε φορά.",
        color: "#f59e0b",
      },
      professional: {
        icon: "🚛",
        title: "Ξεχωριστοί κανόνες για επαγγελματικές άδειες",
        body: "Οι κατηγορίες Γ και Δ έχουν διαφορετική περίοδο ισχύος και υποχρεωτικό ιατρικό πιστοποιητικό, ανεξαρτήτως ηλικίας. Ελέγξτε τους όρους με το ΤΟΜ.",
        color: "#4b5d70",
      },
      expired: {
        icon: "⚠️",
        title: "Η άδειά σας έχει λήξει - προχωρήστε άμεσα",
        body: "Η οδήγηση με ληγμένη άδεια είναι τροχαία παράβαση. Η διαδικασία ανανέωσης είναι ίδια, αλλά μην οδηγήσετε μόνοι σας μέχρι το ΤΟΜ.",
        color: "#ef4444",
      },
      standard: {
        icon: "✅",
        title: "Τυπική ανανέωση Κατηγορίας Β",
        body: "Η άδειά σας Κατηγορίας Β ισχύει συνήθως για 15 χρόνια. Δεν χρειάζεστε συνήθως ιατρικό πιστοποιητικό. Πηγαίνετε στο ΤΟΜ με τα έγγραφά σας.",
        color: "#22c55e",
      },
    },
    restart: "Ξεκινήστε ξανά",
    drtNote: "Η ακριβής περίοδος ισχύος και οι απαιτήσεις μπορεί να αλλάξουν. Επιβεβαιώστε πάντα στο ΤΟΜ.",
  },
  en: {
    title: "When do you need to renew?",
    subtitle: "Answer 3 questions to find out what applies to you",
    questions: [
      {
        q: "Are you 65 or older?",
        yes: "Yes",
        no: "No",
      },
      {
        q: "Do you hold a Category C or D (professional) licence?",
        yes: "Yes",
        no: "No, Category B",
      },
      {
        q: "Has your licence already expired?",
        yes: "Yes, it has expired",
        no: "No, still valid",
      },
    ],
    results: {
      senior: {
        icon: "🩺",
        title: "You need a medical certificate",
        body: "At 65+, you renew more often and need a medical certificate from a TOM-approved doctor each time.",
        color: "#f59e0b",
      },
      professional: {
        icon: "🚛",
        title: "Separate rules for professional licences",
        body: "Categories C and D follow separate validity periods and mandatory medical checks, regardless of age. Confirm your specific requirements with the Department of Road Transport.",
        color: "#4b5d70",
      },
      expired: {
        icon: "⚠️",
        title: "Your licence has expired - act now",
        body: "Driving with an expired licence is a traffic offence. The renewal process is the same, but do not drive yourself to the office until it is renewed.",
        color: "#ef4444",
      },
      standard: {
        icon: "✅",
        title: "Standard Category B renewal",
        body: "Your Category B licence is generally valid for 15 years. You typically do not need a medical certificate. Visit TOM with your documents.",
        color: "#22c55e",
      },
    },
    restart: "Start again",
    drtNote: "The exact validity period and requirements can change. Always confirm with the Department of Road Transport.",
  },
};

type ResultKey = "senior" | "professional" | "expired" | "standard";

export function RenewalChecker({ locale }: { locale: "el" | "en" }) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ResultKey | null>(null);
  const t = L[locale];

  function answer(yes: boolean) {
    if (step === 0 && yes) return setResult("senior");
    if (step === 1 && yes) return setResult("professional");
    if (step === 2) return setResult(yes ? "expired" : "standard");
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
