/**
 * Homepage FAQ content. Extracted out of components/faq.tsx so it has exactly
 * one home: the FAQ section renders it, the FAQPage structured data is built
 * from it, and the site chatbot grounds its answers on it (see
 * lib/chatbot/knowledge.ts). Edit an answer here and all three update.
 */

export interface SiteFaq {
  question: string;
  answer: string;
}

export const SITE_FAQS: SiteFaq[] = [
  {
    question: "What is Business Smart Hub (BSH)?",
    answer:
      "BSH is your one-stop technology partner providing design, marketing, software, AI, and hardware solutions to help businesses grow and thrive in the digital era.",
  },
  {
    question: "Who can benefit from BSH services?",
    answer:
      "Our services are tailored for startups, small businesses, and enterprises who want to scale, innovate, and succeed with smart, future-ready solutions.",
  },
  {
    question: "Do you provide customized solutions?",
    answer:
      "Yes! Every business has unique needs. We create tailored strategies, from branding and web design to AI-driven automation and hardware integration.",
  },
  {
    question: "How can I get started?",
    answer:
      "Simply contact us through our form or email us at info@bshsolutions.net (or sales@bshsolutions.net for project proposals). Our team will schedule a free consultation to understand your needs and recommend the best solutions.",
  },
];
