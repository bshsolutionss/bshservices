"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Code, Award, BarChart } from "lucide-react";
import { motion } from "framer-motion";

// --- Reusable Stat Item Component ---
interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
  suffix?: string;
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  value,
  label,
  delay,
  suffix = "",
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Observe when the counter enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.2 },
    );

    const node = countRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  // Counting animation
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      setCount(Math.min(Math.floor(start), end));
      if (start >= end) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 hover:shadow-xl hover:scale-105 transition-all"
    >
      <div className="p-3 sm:p-4 rounded-full bg-[#1A14A5]/10 mb-3 sm:mb-4">
        {icon}
      </div>
      <div
        ref={countRef}
        className="text-2xl sm:text-4xl font-extrabold text-[#1A14A5]"
      >
        {count}
        {suffix}
      </div>
      <p className="text-[#231F20]/80 text-sm sm:text-base font-medium mt-2">
        {label}
      </p>
    </motion.div>
  );
};

// --- Main Section ---
export const StatCounter: React.FC = () => {
  return (
    <section className="py-24 bg-[#F4F7FE] relative overflow-hidden">
      {/* Decorative gradient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8EDFF] via-[#F4F7FE] to-white opacity-70"></div>

      <div className="relative z-10 container mx-auto px-6 sm:px-10">
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-4xl font-extrabold text-center text-[#1A14A5] mb-10 sm:mb-16"
        >
          Our Growth in Numbers
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-10">
          <StatItem
            icon={<Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#1A14A5]" />}
            value={9}
            label="Happy Clients"
            delay={0.1}
            suffix="+"
          />
          <StatItem
            icon={<Code className="h-6 w-6 sm:h-8 sm:w-8 text-[#1A14A5]" />}
            value={9}
            label="Projects Completed"
            delay={0.2}
            suffix="+"
          />
          <StatItem
            icon={<Award className="h-6 w-6 sm:h-8 sm:w-8 text-[#1A14A5]" />}
            value={1}
            label="Years Experience"
            delay={0.1}
          />
          <StatItem
            icon={<BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-[#1A14A5]" />}
            value={99}
            label="Success Rate"
            delay={0.4}
            suffix="%"
          />
        </div>
      </div>
    </section>
  );
};

export default StatCounter;
