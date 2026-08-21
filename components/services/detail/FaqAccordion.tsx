"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ServiceFaq } from "@/lib/services-data";
import { safeJsonLd } from "@/lib/json-ld";

interface FaqAccordionProps {
  serviceName: string;
  faqs: ServiceFaq[];
}

/**
 * Small client accordion — interactivity (open/close) is the only reason
 * this is a client component. The Q&A text itself is still present in the
 * server-rendered HTML (and in the FAQPage JSON-LD below) either way, so
 * search engines see the full content regardless of JS.
 */
export default function FaqAccordion({ serviceName, faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faqs" className="py-16 px-6 lg:px-12 bg-[#F4F7FE]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-3 text-center">
          {serviceName} FAQs
        </h2>
        <p className="text-[#231F20]/70 text-center mb-10">
          Common questions about our {serviceName.toLowerCase()} service.
        </p>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="border border-[#1A14A5]/10 rounded-xl bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex justify-between items-center gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-[#231F20]">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#1A14A5] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-[#231F20]/70 leading-relaxed">{faq.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
