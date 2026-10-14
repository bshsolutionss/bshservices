import { safeJsonLd } from "@/lib/json-ld";
import { SITE_FAQS } from "@/lib/faq-data";

export default function Faq() {
  return (
    <section id="faq" className="bg-[#F4F7FE] px-6 py-20 lg:px-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: SITE_FAQS.map((faq) => ({
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
        {SITE_FAQS.map((faq) => (
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
