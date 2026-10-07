"use client"
import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

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
]

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-[#F4F7FE] px-6 lg:px-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-gray-600">
          Everything you need to know about Business Smart Hub (BSH) and how we can help your business.
        </p>
      </div>

      <div className="mt-12 max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl shadow-sm bg-white"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center p-5 text-left"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 text-gray-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-gray-600">
        Still have questions or need technical assistance? Reach our support team at{" "}
        <a
          href="mailto:support@bshsolutions.net"
          className="text-[#1A14A5] font-semibold hover:underline"
        >
          support@bshsolutions.net
        </a>{" "}
        or general inquiries at{" "}
        <a
          href="mailto:info@bshsolutions.net"
          className="text-[#1A14A5] font-semibold hover:underline"
        >
          info@bshsolutions.net
        </a>
        .
      </div>
    </section>
  )
}

export default Faq
