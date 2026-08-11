"use client";

import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Contactform from "@/components/contactform";
import { OurPortfolio } from "@/components/our-portfolio";
import { motion } from "framer-motion";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <Header />
      <main className="pt-24 pb-12">
        {/* Page heading */}
        <section className="px-6 lg:px-12 pt-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-extrabold tracking-tight text-[#1A14A5]"
            >
              Our Client <span className="text-[#231F20]">Projects</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#231F20]/70 text-lg mt-4 max-w-2xl leading-relaxed"
            >
              Real live websites, dashboards, SaaS platforms, and scalable digital
              experiences crafted for our clients worldwide.
            </motion.p>
          </div>
        </section>

        {/* Shared portfolio grid (real client projects) */}
        <OurPortfolio showHeading={false} />
      </main>

      <Contactform />
      <Footer />
    </div>
  );
}
