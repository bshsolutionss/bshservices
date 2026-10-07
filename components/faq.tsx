import { safeJsonLd } from "@/lib/json-ld";

const faqs = [
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

export default function Faq() {
  return (
    <section id="faq" className="bg-[#F4F7FE] px-6 py-20 lg:px-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Frequently Asked Questions</h2>
        <p className="mt-3 text-gray-600">
          Everything you need to know about Business Smart Hub (BSH) and how we can help your business.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="group rounded-lg border border-gray-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-medium text-gray-900">
              {faq.question}
              <span aria-hidden="true" className="text-xl text-gray-500 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-gray-600">{faq.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-gray-600">
        Still have questions or need technical assistance? Reach our support team at{" "}
        <a href="mailto:support@bshsolutions.net" className="font-semibold text-[#1A14A5] hover:underline">
          support@bshsolutions.net
        </a>{" "}
        or general inquiries at{" "}
        <a href="mailto:info@bshsolutions.net" className="font-semibold text-[#1A14A5] hover:underline">
          info@bshsolutions.net
        </a>
        .
      </div>
    </section>
  );
}
