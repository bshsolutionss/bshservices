import React from "react";
import {
  FaComments,
  FaHandshake,
  FaFileInvoiceDollar,
  FaFileInvoice,
  FaSearch,
  FaMapMarkedAlt,
  FaPhoneVolume,
  FaUsers,
} from "react-icons/fa";
import Reveal from "@/components/Reveal";

const steps = [
  {
    number: "01",
    title: "Customer Query",
    icon: FaComments,
    desc: "We listen carefully to your needs and gather all essential details about your project.",
  },
  {
    number: "02",
    title: "Initial Meeting",
    icon: FaHandshake,
    desc: "We discuss ideas, goals, and vision to understand your expectations clearly.",
  },
  {
    number: "03",
    title: "Quotation",
    icon: FaFileInvoiceDollar,
    desc: "A transparent quote is shared with all cost details and timelines for approval.",
  },
  {
    number: "04",
    title: "Invoicing",
    icon: FaFileInvoice,
    desc: "Once approved, we initiate the formal agreement and send the invoice.",
  },
  {
    number: "05",
    title: "Detailed Analysis",
    icon: FaSearch,
    desc: "Our team analyzes the project scope deeply to build a tailored strategy.",
  },
  {
    number: "06",
    title: "Strategy & Road Map",
    icon: FaMapMarkedAlt,
    desc: "We prepare a clear action plan that defines the entire execution process.",
  },
  {
    number: "07",
    title: "Onboarding Call",
    icon: FaPhoneVolume,
    desc: "We connect with you and align every detail before the work officially begins.",
  },
  {
    number: "08",
    title: "Let's Work Together",
    icon: FaUsers,
    desc: "Your journey begins! We start delivering with full dedication and transparency.",
  },
];

/**
 * Server component — no animation library. Single column with a left rail on
 * mobile; alternating two-column timeline from `md` up. The reveal is a small
 * IntersectionObserver (components/Reveal.tsx).
 */
const ProcessFlow = () => {
  return (
    <section
      id="process"
      className="relative w-full bg-gradient-to-b from-[#F4F7FE] to-white px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A14A5] sm:text-4xl lg:text-5xl">
            Our Work <span className="text-[#231F20]">Process</span>
          </h2>
          <p className="mt-4 text-base text-[#231F20]/70 sm:text-lg">
            From the first message to launch: eight clear steps, so you always know what happens next.
          </p>
        </div>

        <ol className="relative">
          {/* Rail: left on mobile, centred from md */}
          <div
            aria-hidden="true"
            className="absolute bottom-4 top-4 left-5 w-0.5 rounded-full bg-gradient-to-b from-[#1A14A5] via-[#4b35ff] to-[#1A14A5]/20 md:left-1/2 md:-translate-x-1/2"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const left = i % 2 === 0; // desktop: even steps on the left
            return (
              <Reveal as="li" key={step.number} delay={(i % 3) * 80} className="relative pb-8 last:pb-0 md:pb-10">
                <div className="relative grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-2 md:gap-14">
                  {/* Node */}
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-6 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#1A14A5] shadow-[0_0_0_4px_rgba(26,20,165,0.15)] md:left-1/2"
                  />

                  <div
                    className={`col-start-2 rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg sm:p-6 ${
                      left ? "md:col-start-1 md:text-right" : "md:col-start-2"
                    }`}
                  >
                    <div className={`flex items-center gap-4 ${left ? "md:flex-row-reverse" : ""}`}>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1A14A5]/10 text-xl text-[#1A14A5]">
                        <Icon aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-[#4b35ff]">STEP {step.number}</p>
                        <h3 className="text-lg font-bold text-[#231F20] sm:text-xl">{step.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#231F20]/70">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default ProcessFlow;
