"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: string;
}

function FAQItem({ question, answer, isOpen, onToggle, delay }: FAQItemProps) {
  return (
    <div
      className="shadow-material-1 animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ animationDelay: delay }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
      >
        <h3 className="pr-4 text-base font-semibold text-gray-900">
          {question}
        </h3>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-6 pb-4 leading-relaxed text-gray-600">{answer}</div>
      </div>
    </div>
  );
}

export function FAQ() {
  const t = useTranslations("home.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: t("q1.question"),
      answer: t("q1.answer"),
    },
    {
      question: t("q2.question"),
      answer: t("q2.answer"),
    },
    {
      question: t("q3.question"),
      answer: t("q3.answer"),
    },
    {
      question: t("q4.question"),
      answer: t("q4.answer"),
    },
    {
      question: t("q5.question"),
      answer: t("q5.answer"),
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        {t("title")}
      </h2>
      {faqItems.map((item, index) => (
        <FAQItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
          delay={`${0.6 + index * 0.1}s`}
        />
      ))}
    </div>
  );
}
