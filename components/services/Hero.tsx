"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
}

export default function Hero({ title, subtitle, image }: HeroProps) {
  return (
    <section
      className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900"
      aria-label={`${title} Hero Section`}
    >
      
      {/* ====== Background Image ====== */}
      <Image
        src={image}
        alt={`${title} background`}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center brightness-75"
      />

      {/* ====== Overlay (dark gradient) ====== */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

      {/* ====== Animated Content ====== */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
          className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <a
            href="#services"
            className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore Services
          </a>
        </motion.div>
      </motion.div>

      {/* ====== Subtle Parallax Floating Shape (optional aesthetic) ====== */}
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-[#1A14A5]/40 rounded-full blur-3xl"
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
    </section>
  );
}
