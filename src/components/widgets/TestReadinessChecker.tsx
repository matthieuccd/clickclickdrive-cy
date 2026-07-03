"use client";

import { useState } from "react";

const L = {
  el: {
    title: "Είστε έτοιμοι για την εξέταση;",
    subtitle: "Απαντήστε 3 ερωτήσεις για να το μάθετε",
    questions: [
      {
        q: "Πόσα μαθήματα οδήγησης έχετε κάνει;",
        yes: "15 ή περισσότερα",
        no: "Λιγότερα από 15",
      },
      {
        q: "Περνάτε τα δοκιμαστικά τεστ θεωρίας με 90% ή παραπάνω;",
        yes: "Ναι, σταθερά",
        no: "Όχι, χρειάζομαι εξάσκηση",
      },
      {
        q: "Ο εκπαιδευτής σας σάς έχει προτείνει για την πρακτική εξέταση;",
        yes: "Ναι",
        no: "Όχι ακόμα",
      },
    ],
    results: {
      needsLessons: {
        icon: "🚗",
        title: "Συνεχίστε τα μαθήματα",
        body: "15 μαθήματα είναι το σύνηθες ελάχιστο πριν την εξέταση. Συνεχίστε και μιλήστε με τον εκπαιδευτή σας για πότε θα είστε έτοιμοι.",
        color: "#ef4444",
      },
      theoryWork: {
        icon: "📖",
        title: "Εξασκηθείτε στη θεωρία πρώτα",
        body: "Η θεωρητική εξέταση χρειάζεται στέρεη βάση. Κάντε περισσότερα δοκιμαστικά τεστ πριν κλείσετε ραντεβού.",
        color: "#f59e0b",
      },
      instructorSays: {
        icon: "📋",
        title: "Σχεδόν έτοιμοι",
        body: "Η θεωρία σας είναι δυνατή. Ρωτήστε τον εκπαιδευτή σας τι ακόμα χρειάζεται βελτίωση στην πρακτική πριν κλείσετε εξέταση.",
        color: "#4b5d70",
      },
      bookIt: {
        icon: "✅",
        title: "Κλείστε ραντεβού!",
        body: "Έχετε τα μαθήματα, η θεωρία σας είναι καλή, και ο εκπαιδευτής σας δίνει το πράσινο φως. Μιλήστε με τη σχολή σας για να κλείσετε ημερομηνία.",
        color: "#22c55e",
      },
    },
    restart: "Ξεκινήστε ξανά",
    note: "Αυτό το εργαλείο είναι ενδεικτικό. Ο εκπαιδευτής σας γνωρίζει καλύτερα πότε είστε έτοιμοι.",
  },
  en: {
    title: "Are you ready for the test?",
    subtitle: "Answer 3 questions to find out",
    questions: [
      {
        q: "How many driving lessons have you completed?",
        yes: "15 or more",
        no: "Fewer than 15",
      },
      {
        q: "Are you passing mock theory tests with 90% or higher?",
        yes: "Yes, consistently",
        no: "No, still practising",
      },
      {
        q: "Has your instructor recommended you for the practical test?",
        yes: "Yes",
        no: "Not yet",
      },
    ],
    results: {
      needsLessons: {
        icon: "🚗",
        title: "Keep building your hours",
        body: "15 lessons is a typical minimum before the test. Keep going and ask your instructor when they think you will be ready.",
        color: "#ef4444",
      },
      theoryWork: {
        icon: "📖",
        title: "Brush up on theory first",
        body: "The theory test requires a solid foundation. Do more practice tests before booking your slot.",
        color: "#f59e0b",
      },
      instructorSays: {
        icon: "📋",
        title: "Almost there",
        body: "Your theory is strong. Ask your instructor what still needs work on the practical side before booking.",
        color: "#4b5d70",
      },
      bookIt: {
        icon: "✅",
        title: "Go ahead and book!",
        body: "You have the lessons, your theory is solid, and your instructor is giving the green light. Talk to your school to set a date.",
        color: "#22c55e",
      },
    },
    restart: "Start again",
    note: "This tool is a guide only. Your instructor knows best when you are ready.",
  },
};

type ResultKey = "needsLessons" | "theoryWork" | "instructorSays" | "bookIt";

export function TestReadinessChecker({ locale }: { locale: "el" | "en" }) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ResultKey | null>(null);
  const t = L[locale];

  function answer(yes: boolean) {
    if (step === 0 && !yes) return setResult("needsLessons");
    if (step === 1 && !yes) return setResult("theoryWork");
    if (step === 2) return setResult(yes ? "bookIt" : "instructorSays");
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
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor: i <= step ? "#f74656" : "#e4e7eb",
                  opacity: i < step ? 0.5 : 1,
                }}
              />
            ))}
          </div>
          <p className="mb-2 text-xs text-[#7a8794]">
            {locale === "el" ? `Ερώτηση ${step + 1} από 3` : `Question ${step + 1} of 3`}
          </p>
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
