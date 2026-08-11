"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion, MotionProps } from "framer-motion";
import HeroLogo from "./HeroLogo";
import Image from "next/image";
import TypedHeading from "@/components/TypedHeading";
import Link from "next/link";

// Common floating animation config
const floatingAnimation: MotionProps = {
  initial: { y: 0 },
  animate: { y: [0, -15, 0, 15, 0] },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
const Heros: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-screen flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-10 lg:px-16 bg-[#F4F7FE] overflow-hidden pt-20 lg:pt-32 pb-20">
      {/* Left Content */}

      <div className="max-w-2xl text-center lg:text-left space-y-6 relative z-10 mt-12 lg:mt-0">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A14A5] drop-shadow-sm tracking-tight"
        >
          <TypedHeading />
        </motion.h1>

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

      {/* Right Logo + Floating BG Images */}
      <div className="relative flex-1 flex justify-center items-center mt-10 lg:mt-0 w-full max-w-[600px] sm:max-w-[700px]">
        {/* Floating Images Around Logo */}
        <motion.div
          {...floatingAnimation}
          className="absolute -top-6 sm:-top-10 -right-6 sm:-right-10 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 drop-shadow-[0_10px_25px_rgba(26,20,165,0.5)]"
        >
          <Image
            src="/images/1.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </motion.div>

        <motion.div
          {...floatingAnimation}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-10 sm:-right-16 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 drop-shadow-[0_10px_25px_rgba(26,20,165,0.5)]"
        >
          <Image
            src="/images/2.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </motion.div>

        <motion.div
          {...floatingAnimation}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-0 w-20 sm:w-36 lg:w-44 h-20 sm:h-36 lg:h-44 drop-shadow-[0_10px_25px_rgba(26,20,165,0.5)]"
        >
          <Image
            src="/images/3.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </motion.div>

        <motion.div
          {...floatingAnimation}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-10 left-6 sm:left-10 w-20 sm:w-32 lg:w-44 h-20 sm:h-32 lg:h-44 drop-shadow-[0_10px_25px_rgba(26,20,165,0.5)]"
        >
          <Image
            src="/images/4.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </motion.div>

        <motion.div
          {...floatingAnimation}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-10 sm:left-20 w-16 sm:w-28 lg:w-40 h-16 sm:h-28 lg:h-40 drop-shadow-[0_10px_25px_rgba(26,20,165,0.5)]"
        >
          <Image
            src="/images/5.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </motion.div>

        <motion.div
          {...floatingAnimation}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-0 w-16 sm:w-28 lg:w-40 h-16 sm:h-28 lg:h-40 drop-shadow-[0_10px_25px_rgba(26,20,165,0.5)]"
        >
          <Image
            src="/images/6.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* Center Logo */}
        <HeroLogo />
      </div>
    </section>
  );
};

export default Heros;
