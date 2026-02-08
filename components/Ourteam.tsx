"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";
import { FileDown } from "lucide-react";

interface TeamProps {
  id?: string;
  name: string;
  role: string;
  about: string;
  tech: { name: string; icon: React.ReactNode }[];
  image: string;
  reverse?: boolean;
  cvLink?: string;
}

export default function OurTeamSection({
  id,
  name,
  role,
  about,
  tech,
  image,
  reverse = false,
  cvLink = "#",
}: TeamProps) {
  return (
    <section id={id} className="py-20 bg-background border-b border-border">
      <div
        className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* ==== IMAGE ==== */}
        <motion.div
          initial={{ opacity: 0, x: reverse ? 100 : -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
          <Image
            src={image}
            alt={name}
            width={600}
            height={500}
            className="object-cover"
          />
        </motion.div>

        {/* ==== CONTENT ==== */}
        <motion.div
          initial={{ opacity: 0, x: reverse ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
          <h2 className="text-4xl font-bold mb-2">{name}</h2>

          <p className="text-lg text-[#1A14A5] font-semibold mb-4">{role}</p>

          <p className="text-muted-foreground mb-6 leading-relaxed">{about}</p>

          {/* ==== CV BUTTON ==== */}
          <a
            href={cvLink}
            download
            className="inline-flex items-center gap-2 bg-[#1A14A5] hover:bg-[#0f0b7a] 
                       text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <FileDown className="w-5 h-5" />
            Download CV
          </a>
        </motion.div>
      </div>

      {/* ==== TECH USED ==== */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-10 text-[#0f0b7a] drop-shadow-[0_0_15px_rgba(0,114,255,0.5)]">
          Technologies Used
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
              <p className="text-sm text-[#1A14A5] mt-2 font-medium">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
