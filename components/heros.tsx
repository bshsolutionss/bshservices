"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import HeroLogo from "./HeroLogo";
import TypedHeading from "@/components/TypedHeading";
import Link from "next/link";

const Heros: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-10 lg:px-16 bg-[#F4F7FE] overflow-hidden pt-20 lg:pt-32 pb-20">
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
        >
          <Button
            asChild
            className="relative bg-[#1A14A5] hover:bg-[#0e0a7a] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-lg rounded-2xl shadow-lg hover:shadow-2xl transition group overflow-hidden"
          >
            <Link href="/contact">
              <span className="relative z-10">🚀 Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1A14A5] to-[#231F20] opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Right 3D Logo */}
      <div className="relative flex-1 flex justify-center items-center mt-10 lg:mt-0 w-full max-w-[600px] sm:max-w-[700px]">
        <HeroLogo />
      </div>
    </section>
  );
};

export default Heros;
