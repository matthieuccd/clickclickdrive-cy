"use client";

import { useState } from "react";

const THEORY_FEE = 35;
const PRACTICAL_FEE = 65;
const LEARNER_FEE = 10;

const L = {
  el: {
    title: "Υπολογιστής Κόστους Διπλώματος",
    lessonsLabel: "Αριθμός μαθημάτων",
    priceLabel: "Τιμή ανά μάθημα",
    lessonLine: (n: number, p: number) => `${n} μαθήματα × €${p}`,
    theoryLine: "Θεωρητική εξέταση (εκτίμηση)",
    practicalLine: "Πρακτική εξέταση (εκτίμηση)",
    learnerLine: "Εκπαιδευτική άδεια (εκτίμηση)",
    totalLabel: "Εκτιμώμενο συνολικό κόστος",
    disclaimer:
      "Εκτιμήσεις μόνο. Οι τρέχουσες χρεώσεις ορίζονται από το Τμήμα Οδικών Μεταφορών και αλλάζουν.",
  },
  en: {
    title: "Driving Licence Cost Calculator",
    lessonsLabel: "Number of lessons",
    priceLabel: "Price per lesson",
    lessonLine: (n: number, p: number) => `${n} lessons × €${p}`,
    theoryLine: "Theory test fee (estimate)",
    practicalLine: "Practical test fee (estimate)",
    learnerLine: "Learner's licence fee (estimate)",
    totalLabel: "Estimated total cost",
    disclaimer:
      "Estimates only. Current fees are set by the Department of Road Transport and may change.",
  },
};

export function PriceCalculator({ locale }: { locale: "el" | "en" }) {
  const [lessons, setLessons] = useState(20);
  const [pricePerLesson, setPricePerLesson] = useState(40);

  const lessonTotal = lessons * pricePerLesson;
  const total = lessonTotal + THEORY_FEE + PRACTICAL_FEE + LEARNER_FEE;
  const t = L[locale];

  return (
    <div className="my-8 rounded-2xl border border-[#e4e7eb] bg-white p-6">
      <h3 className="mb-5 text-lg font-bold text-[#354354]">{t.title}</h3>

      <div className="space-y-5">
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#4b5d70]">
              {t.lessonsLabel}
            </span>
            <span className="text-base font-bold text-[#354354]">{lessons}</span>
          </div>
          <input
            type="range"
            min={10}
            max={40}
            value={lessons}
            onChange={(e) => setLessons(Number(e.target.value))}
            className="w-full accent-[#f74656]"
          />
          <div className="mt-0.5 flex justify-between text-xs text-[#7a8794]">
            <span>10</span>
            <span>40</span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#4b5d70]">
              {t.priceLabel}
            </span>
            <span className="text-base font-bold text-[#354354]">
              €{pricePerLesson}
            </span>
          </div>
          <input
            type="range"
            min={25}
            max={60}
            value={pricePerLesson}
            onChange={(e) => setPricePerLesson(Number(e.target.value))}
            className="w-full accent-[#f74656]"
          />
          <div className="mt-0.5 flex justify-between text-xs text-[#7a8794]">
            <span>€25</span>
            <span>€60</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-[#e4e7eb] pt-4">
        <div className="flex justify-between text-sm text-[#4b5d70]">
          <span>{t.lessonLine(lessons, pricePerLesson)}</span>
          <span className="font-medium">€{lessonTotal}</span>
        </div>
        <div className="flex justify-between text-sm text-[#7a8794]">
          <span>{t.theoryLine}</span>
          <span>≈ €{THEORY_FEE}</span>
        </div>
        <div className="flex justify-between text-sm text-[#7a8794]">
          <span>{t.practicalLine}</span>
          <span>≈ €{PRACTICAL_FEE}</span>
        </div>
        <div className="flex justify-between text-sm text-[#7a8794]">
          <span>{t.learnerLine}</span>
          <span>≈ €{LEARNER_FEE}</span>
        </div>
        <div className="flex justify-between border-t border-[#e4e7eb] pt-3 text-base font-bold">
          <span className="text-[#354354]">{t.totalLabel}</span>
          <span className="text-[#f74656]">≈ €{total}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#7a8794]">{t.disclaimer}</p>
    </div>
  );
}
