"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { PRICING_DATA, PricingTier } from "@/lib/pricing-data";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PricingSectionProps {
  region?: "GLOBAL" | "PK";
}

export default function PricingSection({ region = "GLOBAL" }: PricingSectionProps) {
  const router = useRouter();
  const tiers = PRICING_DATA[region];

  return (
    <section id="pricing" className="py-24 px-6 lg:px-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* ====== Section Heading ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A14A5] mb-4">
            Flexible <span className="text-[#231F20]">Pricing Plans</span>
          </h2>
          <p className="text-lg text-[#231F20]/70 max-w-2xl mx-auto">
            Choose the perfect plan for your business growth. We offer tailored solutions for startups and established brands alike.
          </p>
        </motion.div>

        {/* ====== Pricing Grid ====== */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {tiers.map((tier, idx) => (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              index={idx} 
              onCtaClick={() => router.push("/contact")}
            />
          ))}
        </div>

        {/* ====== Bottom CTA ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-[#231F20]/60 mb-4">Need a custom solution?</p>
          <button 
            onClick={() => router.push("/contact")}
            className="text-[#1A14A5] font-bold hover:underline text-lg"
          >
            Contact us for a Custom Quote →
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({ 
  tier, 
  index, 
  onCtaClick 
}: { 
  tier: PricingTier; 
  index: number; 
  onCtaClick: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
        tier.isPopular 
          ? "bg-[#1A14A5] text-white shadow-2xl scale-105 z-10" 
          : "bg-[#F4F7FE] text-[#231F20] hover:shadow-xl border border-transparent hover:border-[#1A14A5]/10"
      }`}
    >
      {tier.isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#231F20] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest flex items-center gap-1.5 shadow-lg">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          MOST POPULAR
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      <div className="mb-8">
        <h3 className={`text-xl font-bold mb-2 ${tier.isPopular ? "text-white" : "text-[#1A14A5]"}`}>
          {tier.name}
        </h3>
        <p className={`text-sm ${tier.isPopular ? "text-white/80" : "text-[#231F20]/60"}`}>
          {tier.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl lg:text-5xl font-extrabold tracking-tight">
            {tier.price}
          </span>
          <span className={`text-sm font-medium ${tier.isPopular ? "text-white/70" : "text-[#231F20]/50"}`}>
            /{tier.period}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-10 flex-grow">
        {tier.features.map((feature, fIdx) => (
          <div key={fIdx} className="flex gap-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              tier.isPopular ? "bg-white/20" : "bg-[#1A14A5]/10"
            }`}>
              <Check className={`w-3 h-3 ${tier.isPopular ? "text-white" : "text-[#1A14A5]"}`} />
            </div>
            <span className={`text-sm leading-tight ${tier.isPopular ? "text-white/90" : "text-[#231F20]/80"}`}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Button
        onClick={onCtaClick}
        className={`w-full py-6 rounded-2xl font-bold transition-all duration-300 ${
          tier.isPopular 
            ? "bg-white text-[#1A14A5] hover:bg-gray-100 shadow-lg" 
            : "bg-[#1A14A5] text-white hover:bg-[#231F20]"
        }`}
      >
        {tier.ctaText || "Select Plan"}
      </Button>
    </motion.div>
  );
}
