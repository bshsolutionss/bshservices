"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_DATA, type PricingCategory, type PricingTier } from "@/lib/pricing-data";
import { trackEvent } from "@/lib/analytics";

/** What the visitor is building → which lib/pricing-data.ts category its tiers come from. */
const PROJECT_TYPES: { label: string; category: PricingCategory }[] = [
  { label: "A custom website or web app", category: "CUSTOM" },
  { label: "An online store", category: "ECOMMERCE" },
  { label: "A business website (WordPress)", category: "WORDPRESS" },
];

const TIMELINES = ["ASAP (within 2 weeks)", "1–2 months", "Flexible / just exploring"];

/** All three pricing categories here have exactly 3 tiers, cheapest → priciest — this indexes directly into that order. */
const BUDGET_LABELS = ["Starter — keep it lean", "Mid-range — the full package", "Advanced — no compromises"];

type Step = 1 | 2 | 3 | 4;

/**
 * A 4-question qualifier for the bigger-ticket services (custom code,
 * ecommerce, WordPress builds) — ends by handing off to the contact form
 * pre-filled with the recommended tier + answers, rather than collecting
 * contact info itself (that's the form's job, not the quiz's).
 */
export default function QuoteQuiz() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [projectType, setProjectType] = useState<(typeof PROJECT_TYPES)[number] | null>(null);
  const [budgetIndex, setBudgetIndex] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);

  const goTo = (next: Step) => {
    setStep(next);
    trackEvent(`quote_quiz_step_${next}`);
  };

  const recommendedTier: PricingTier | null =
    projectType && budgetIndex !== null ? PRICING_DATA.GLOBAL[projectType.category][budgetIndex] : null;

  const handleGetQuote = () => {
    if (!projectType || !recommendedTier) return;

    trackEvent("quote_quiz_complete", {
      project_type: projectType.category,
      recommended_tier: recommendedTier.name,
    });

    const params = new URLSearchParams({
      category: "Development",
      service: recommendedTier.name,
      details: `Quote quiz: ${projectType.label} · Budget: ${recommendedTier.price}/${recommendedTier.period} · Timeline: ${timeline ?? "n/a"}`,
    });
    router.push(`/contact?${params.toString()}`);
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A14A5]/10 text-[#1A14A5] text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>60-second quote estimator</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#231F20]">
            Not sure what tier fits your project?
          </h2>
          <p className="mt-3 text-[#231F20]/70">Answer a few quick questions and we&apos;ll point you at a starting price.</p>
        </div>

        <div className="bg-[#F4F7FE] rounded-3xl p-6 md:p-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold text-[#1A14A5] mb-1">Question 1 of 3</p>
                <h3 className="text-xl font-bold text-[#231F20] mb-5">What are you building?</h3>
                <div className="space-y-3">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type.label}
                      type="button"
                      onClick={() => {
                        setProjectType(type);
                        goTo(2);
                      }}
                      className="w-full text-left p-4 rounded-2xl bg-white border border-[#1A14A5]/10 hover:border-[#1A14A5] font-medium text-[#231F20] transition"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && projectType && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold text-[#1A14A5] mb-1">Question 2 of 3</p>
                <h3 className="text-xl font-bold text-[#231F20] mb-5">What&apos;s your budget range?</h3>
                <div className="space-y-3">
                  {PRICING_DATA.GLOBAL[projectType.category].map((tier, i) => (
                    <button
                      key={tier.name}
                      type="button"
                      onClick={() => {
                        setBudgetIndex(i);
                        goTo(3);
                      }}
                      className="w-full text-left p-4 rounded-2xl bg-white border border-[#1A14A5]/10 hover:border-[#1A14A5] transition"
                    >
                      <p className="font-semibold text-[#231F20]">{BUDGET_LABELS[i]}</p>
                      <p className="text-sm text-[#1A14A5] font-bold mt-0.5">
                        From {tier.price}/{tier.period}
                      </p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#231F20]/60 hover:text-[#1A14A5]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold text-[#1A14A5] mb-1">Question 3 of 3</p>
                <h3 className="text-xl font-bold text-[#231F20] mb-5">What&apos;s your timeline?</h3>
                <div className="space-y-3">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTimeline(t);
                        goTo(4);
                      }}
                      className="w-full text-left p-4 rounded-2xl bg-white border border-[#1A14A5]/10 hover:border-[#1A14A5] font-medium text-[#231F20] transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#231F20]/60 hover:text-[#1A14A5]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </motion.div>
            )}

            {step === 4 && recommendedTier && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold text-[#1A14A5] mb-1">Your recommended starting point</p>
                <h3 className="text-2xl font-extrabold text-[#231F20] mb-5">{recommendedTier.name}</h3>

                <div className="bg-white rounded-2xl p-6 border border-[#1A14A5]/10">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-[#1A14A5]">{recommendedTier.price}</span>
                    <span className="text-sm text-[#231F20]/50">/{recommendedTier.period}</span>
                  </div>
                  <div className="space-y-2.5">
                    {recommendedTier.features.slice(0, 4).map((f) => (
                      <div key={f} className="flex gap-2.5 items-start text-sm text-[#231F20]/80">
                        <Check className="w-4 h-4 text-[#1A14A5] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGetQuote}
                  className="w-full mt-6 bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  Get This Quote <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-xs text-center text-[#231F20]/50 mt-3">
                  A real, starting estimate — we&apos;ll confirm exact scope on the call.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
