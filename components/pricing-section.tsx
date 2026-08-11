"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star } from "lucide-react";
import { PRICING_DATA, PricingTier, PricingCategory } from "@/lib/pricing-data";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PricingSectionProps {
  region?: "GLOBAL" | "PK";
}

const CATEGORIES: { id: PricingCategory; label: string }[] = [
  { id: "RETAINER", label: "Monthly Retainers" },
  { id: "WORDPRESS", label: "WordPress Web" },
  { id: "ECOMMERCE", label: "eCommerce" },
  { id: "CUSTOM", label: "Custom Code" },
];

export default function PricingSection({ region = "GLOBAL" }: PricingSectionProps) {
  const [activeCategory, setActiveCategory] = React.useState<PricingCategory>("RETAINER");
  const router = useRouter();
  const tiers = PRICING_DATA[region][activeCategory];

  return (
    <section id="pricing" className="py-24 px-6 lg:px-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* ====== Section Heading ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A14A5] mb-4">
            Flexible <span className="text-[#231F20]">Pricing Plans</span>
          </h2>
          <p className="text-lg text-[#231F20]/70 max-w-2xl mx-auto mb-10">
            Choose the perfect plan for your business growth. We offer tailored solutions for startups and established brands alike.
          </p>

          {/* ====== Category Tabs ====== */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-[#1A14A5] text-white shadow-lg scale-105"
                    : "bg-[#F4F7FE] text-[#231F20] hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ====== Pricing Grid ====== */}
        <div className="grid md:grid-cols-3 gap-8 relative mb-24">
          <AnimatePresence mode="wait">
            {tiers.map((tier, idx) => (
              <PricingCard 
                key={`${activeCategory}-${tier.name}`} 
                tier={tier} 
                index={idx} 
                onCtaClick={() => router.push("/contact")}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ====== Comparison Table ====== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-[#F4F7FE] rounded-3xl p-8 lg:p-12 mb-24"
        >
          <h3 className="text-2xl lg:text-3xl font-extrabold text-[#231F20] mb-8 text-center">
            Which platform is right for you?
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A14A5]/10">
                  <th className="py-4 px-4 font-bold text-[#1A14A5]">FEATURE</th>
                  <th className="py-4 px-4 font-bold text-[#1A14A5]">WORDPRESS</th>
                  <th className="py-4 px-4 font-bold text-[#1A14A5]">NEXT.JS / REACT</th>
                </tr>
              </thead>
              <tbody className="text-[#231F20]/80">
                <tr className="border-b border-[#1A14A5]/5">
                  <td className="py-4 px-4 font-semibold">Best For</td>
                  <td className="py-4 px-4">Blogs, business sites, eCommerce</td>
                  <td className="py-4 px-4">Custom apps, SaaS, high-performance</td>
                </tr>
                <tr className="border-b border-[#1A14A5]/5">
                  <td className="py-4 px-4 font-semibold">Build Time</td>
                  <td className="py-4 px-4">3–7 working days</td>
                  <td className="py-4 px-4">7–21 working days</td>
                </tr>
                <tr className="border-b border-[#1A14A5]/5">
                  <td className="py-4 px-4 font-semibold">Client Editing</td>
                  <td className="py-4 px-4">Easy (drag & drop)</td>
                  <td className="py-4 px-4">Via CMS or developer</td>
                </tr>
                <tr className="border-b border-[#1A14A5]/5">
                  <td className="py-4 px-4 font-semibold">Performance</td>
                  <td className="py-4 px-4">Good (optimized)</td>
                  <td className="py-4 px-4">Excellent (99+ Lighthouse)</td>
                </tr>
                <tr className="border-b border-[#1A14A5]/5">
                  <td className="py-4 px-4 font-semibold">Scalability</td>
                  <td className="py-4 px-4">Moderate</td>
                  <td className="py-4 px-4">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ====== Service Lineup ====== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl lg:text-3xl font-extrabold text-[#231F20] mb-12">
            Our Complete Service Lineup
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { s: "Marketing", d: "Digital campaigns, audience targeting, performance ads & growth strategies." },
              { s: "Graphic Designing", d: "Social posts, banners, ads, infographics & branded creative assets." },
              { s: "Branding", d: "Logo, brand identity, color palette, typography & brand guidelines." },
              { s: "Social Media Mgmt", d: "Content strategy, scheduling & community management." },
              { s: "Video Editing", d: "Reels, ad videos, product showcases — optimized for every platform." },
              { s: "WordPress Website", d: "Business sites, blogs & WooCommerce stores — fast & mobile-ready." },
              { s: "Custom Website", d: "High-performance, fully coded websites built for speed & scalability." },
              { s: "SEO", d: "Keyword research, on-page optimization, technical SEO & backlink building." },
            ].map((service, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#F4F7FE] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-[#1A14A5]/10">
                <h4 className="font-bold text-[#1A14A5] mb-2">{service.s}</h4>
                <p className="text-sm text-[#231F20]/70 leading-relaxed">{service.d}</p>
              </div>
            ))}
          </div>
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
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-2 ${tier.isPopular ? "text-white" : "text-[#1A14A5]"}`}>
          {tier.name}
        </h3>
        <p className={`text-sm leading-relaxed ${tier.isPopular ? "text-white/80" : "text-[#231F20]/60"}`}>
          {tier.description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl lg:text-5xl font-extrabold tracking-tight">
            {tier.price}
          </span>
          <span className={`text-sm font-medium ${tier.isPopular ? "text-white/70" : "text-[#231F20]/50"}`}>
            /{tier.period}
          </span>
        </div>
        {tier.idealFor && (
          <p className={`text-xs mt-2 font-medium ${tier.isPopular ? "text-white/60" : "text-[#1A14A5]/60"}`}>
            Ideal for: {tier.idealFor}
          </p>
        )}
      </div>

      <div className="space-y-4 mb-8 flex-grow">
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
