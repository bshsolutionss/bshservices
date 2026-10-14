"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import HeroScene from "./HeroScene";
import TypedHeading from "@/components/TypedHeading";
import Link from "next/link";

/**
 * Hero layout. The copy is split into two groups so the 3D stage can sit
 * between them on mobile (heading → sub-heading → 3D → description → buttons)
 * while still reading as one left column on desktop:
 *
 *   mobile: flex column, DOM order            desktop: 2-col grid
 *   ┌───────────────┐                         ┌─────────┬─────────┐
 *   │ heading group │                         │ heading │         │
 *   │  3D stage     │                         ├─────────┤  stage  │
 *   │ copy + CTAs   │                         │ copy    │         │
 *   └───────────────┘                         └─────────┴─────────┘
 */
const Heros: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center gap-6 lg:grid lg:min-h-screen lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-10 lg:gap-y-6 px-5 sm:px-10 lg:px-16 bg-[#F4F7FE] pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20">
      {/* Interactive 3D backdrop (AI / tech neural core) — sits behind the copy */}
      <HeroScene />

      {/* 1 — Heading + sub-heading */}
      <div className="relative z-10 w-full max-w-2xl space-y-3 text-center sm:space-y-4 lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left">
        <TypedHeading />

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="text-lg sm:text-2xl lg:text-3xl font-semibold text-[#231F20]"
        >
          Business Smart Hub
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-sm sm:text-lg text-[#231F20]/80"
        >
          A hub for all business tech needs
        </motion.p>
      </div>

      {/* 2 — Square slot the 3D core centres itself on (it sizes to its column,
          so alignment holds at every screen size). On mobile it falls between
          the sub-heading and the description; on desktop it spans both rows of
          the right-hand column. */}
      <div className="relative z-10 flex w-full items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div
          data-hero-stage
          role="img"
          aria-label="Interactive 3D visual: an AI network core orbited by Web, Apps, Cloud, Data, AI and Automation"
          className="aspect-square w-[min(80vw,340px)] sm:w-[min(64vw,420px)] lg:w-full lg:max-w-[560px]"
        />
      </div>

      {/* 3 — Description + CTAs */}
      <div className="relative z-10 w-full max-w-2xl space-y-4 text-center sm:space-y-6 lg:col-start-1 lg:row-start-2 lg:self-start lg:text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="bg-white/40 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-lg border border-white/30"
        >
          <h3 className="text-sm sm:text-md lg:text-lg text-[#231F20] leading-relaxed">
            BSH – Business Smart Hub is your one-stop technology partner,
            helping physical and digital businesses transform, innovate, and
            thrive through smart, scalable, and future-ready solutions.
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4"
        >
          <Button
            asChild
            className="relative w-full sm:w-auto bg-[#1A14A5] hover:bg-[#0e0a7a] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-lg rounded-2xl shadow-lg hover:shadow-2xl transition group overflow-hidden"
          >
            <Link href="/book-consultation">
              <span className="relative z-10">Book Consultation</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1A14A5] to-[#231F20] opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-2 border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white bg-transparent px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-lg rounded-2xl shadow-sm hover:shadow-lg transition"
          >
            <Link href="/Services">Explore Services</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Heros;
