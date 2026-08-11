import { Sparkles } from "lucide-react";
import type { ServiceBenefit } from "@/lib/services-data";

interface BenefitsProps {
  title: string;
  benefits: ServiceBenefit[];
}

/** Server-rendered "why it matters" section — no client JS required. */
export default function Benefits({ title, benefits }: BenefitsProps) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-10 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-[#1A14A5]/10 bg-[#F4F7FE] p-6 hover:border-[#1A14A5]/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A14A5]/10 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-[#1A14A5]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#231F20] mb-2">{benefit.title}</h3>
              <p className="text-[#231F20]/70 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
