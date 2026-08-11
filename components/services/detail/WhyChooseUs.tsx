import { CheckCircle2 } from "lucide-react";

interface WhyChooseUsProps {
  serviceName: string;
  points: string[];
}

/** Server-rendered differentiators list. */
export default function WhyChooseUs({ serviceName, points }: WhyChooseUsProps) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-3">
          Why Choose BSH Solutions for {serviceName}
        </h2>
        <p className="text-[#231F20]/70 mb-10">
          Real results, transparent process, and a team that treats your project like our own.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-xl bg-[#F4F7FE] border border-[#1A14A5]/10 p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-[#1A14A5] shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-[#231F20]/80">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
