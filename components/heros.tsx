"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import HeroScene from "./HeroScene";
import TypedHeading from "@/components/TypedHeading";
import Link from "next/link";

const Heros: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between lg:gap-10 px-6 sm:px-10 lg:px-16 bg-[#F4F7FE] overflow-hidden pt-20 lg:pt-32 pb-20">
      {/* Interactive 3D backdrop (AI / tech neural core) — sits behind the copy */}
      <HeroScene />

      {/* Left Content */}
      <div className="max-w-2xl text-center lg:text-left space-y-6 relative z-10 mt-12 lg:mt-0">
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
          className="text-sm sm:text-lg text-[#231F20]/80 px-2 sm:px-0"
        >
          A hub for all business tech needs
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="bg-white/40 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-lg border border-white/30"
        >
          <h3 className="text-xs sm:text-md lg:text-lg text-[#231F20] leading-relaxed">
            BSH – Business Smart Hub is your one-stop technology partner,
            helping physical and digital businesses transform, innovate, and
            thrive through smart, scalable, and future-ready solutions.
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
        >
          <Button
            asChild
            className="relative bg-[#1A14A5] hover:bg-[#0e0a7a] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-lg rounded-2xl shadow-lg hover:shadow-2xl transition group overflow-hidden"
          >
            <Link href="/book-consultation">
              <span className="relative z-10">Book Consultation</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1A14A5] to-[#231F20] opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white bg-transparent px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-lg rounded-2xl shadow-sm hover:shadow-lg transition"
          >
            <Link href="/Services">Explore Services</Link>
          </Button>
        </motion.div>
      </div>

      {/* Right: square slot the 3D core centres itself on (like the About hub,
          it sizes to its column, so alignment holds at every screen size).
          On mobile it renders above the copy (the section is flex-col-reverse). */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center lg:justify-center">
        <div
          data-hero-stage
          role="img"
          aria-label="Interactive 3D visual: an AI network core orbited by Web, Apps, Cloud, Data, AI and Automation"
          className="aspect-square w-[min(84vw,400px)] sm:w-[min(70vw,460px)] lg:w-full lg:max-w-[560px]"
        />
      </div>
    </section>
  );
};

export default Heros;
