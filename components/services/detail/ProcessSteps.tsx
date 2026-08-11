import type { ProcessStep } from "@/lib/services-content";

interface ProcessStepsProps {
  steps: ProcessStep[];
}

/**
 * Lightweight "how we work" timeline. Deliberately CSS-only (no GSAP/framer)
 * so this doesn't add client JS weight across 30 pages — the homepage's
 * animated ProcessFlow already covers that experience site-wide.
 */
export default function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-[#F4F7FE]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-10 text-center">
          How We Work
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl bg-white border border-[#1A14A5]/10 p-6 hover:border-[#1A14A5]/30 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-3xl font-extrabold text-[#1A14A5]/20">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-bold text-[#231F20] mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-[#231F20]/70 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
