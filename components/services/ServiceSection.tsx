"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import React from "react"; // 👈 required for React.ReactNode

interface ServiceSectionProps {
  id?: string; // ✅ Added this line
  title: string;
  description: string;
  features: string[];
  tech: { name: string; icon: React.ReactNode }[];
  image: string;
  reverse?: boolean;
  cta?: string;
}

export default function ServiceSection({
  id, // ✅ Accepting id prop
  title,
  description,
  features,
  tech,
  image,
  reverse = false,
  cta = "Get Started",
}: ServiceSectionProps) {
  return (
    <section id={id} className="py-20 bg-background border-b border-border"> {/* ✅ Applied id */}
      <div
        className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* ===== IMAGE ===== */}
        <motion.div
          initial={{ opacity: 0, x: reverse ? 100 : -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className="object-cover"
          />
        </motion.div>

        {/* ===== CONTENT ===== */}
        <motion.div
          initial={{ opacity: 0, x: reverse ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>

          {/* ===== FEATURES ===== */}
          <ul className="space-y-3 mb-6">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* ===== CTA BUTTON ===== */}
          <a
            href="#contact"
            className="inline-block bg-[#1A14A5] hover:bg-[#0f0b7a] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {cta}
          </a>
        </motion.div>
      </div>

      {/* ===== TECH WE USE ===== */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-10 text-[#0f0b7a] drop-shadow-[0_0_15px_rgba(0,114,255,0.5)]">
          Tech We Use
        </h3>

        <div className="flex flex-wrap justify-center gap-10">
          {tech.map((t, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl 
                        backdrop-blur-md border shadow-[10px_0px_40px_rgba(0,114,255,0.25)] 
                        hover:shadow-[0_0_40px_rgba(0,114,255,0.5)] hover:-translate-y-2 
                        transition-all duration-300 ease-out"
            >
              <div className="text-5xl text-[#0072ff] drop-shadow-[0_0_10px_rgba(0,114,255,0.4)]">
                {t.icon}
              </div>
              <p className="text-sm text-[#1A14A5] mt-2 font-medium">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
