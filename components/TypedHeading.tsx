"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Typed from "typed.js";

const TypedHeading: React.FC = () => {
  const typedRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const options = {
      strings: ["BSH SOLUTIONS", "Creative Agency", "Digital Experts", "Automation Experts"],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1200,
      loop: true,
    };

    const typed = new Typed(typedRef.current!, options);

    return () => {
      typed.destroy(); // cleanup on unmount
    };
  }, []);

  return (
    <motion.h1
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A14A5] drop-shadow-sm tracking-tight"
    >
      <span ref={typedRef}></span>
    </motion.h1>
  );
};

export default TypedHeading;
