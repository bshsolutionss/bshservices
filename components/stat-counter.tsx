"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 20, suffix: "+", label: "Happy Clients" },
  { value: 20, suffix: "+", label: "Projects Completed" },
  { value: 3, label: "Years Experience" },
  { value: 100, suffix: "%", label: "Success Rate" },
];

const COUNT_DURATION_MS = 1800;

// Dividers between cells: a 2x2 grid on mobile/tablet, one row on desktop.
const CELL_BORDERS = [
  "border-r border-b lg:border-b-0",
  "border-b lg:border-b-0 lg:border-r",
  "border-r",
  "",
];

// --- Reusable Stat Item Component ---
const StatItem: React.FC<Stat & { index: number }> = ({
  value,
  suffix = "",
  label,
  index,
}) => {
  // Starts at the real final value (not 0) — so the server-rendered HTML,
  // and anything reading the page without running the count-up animation
  // (search/AI crawlers, JS disabled, a slow connection), always shows the
  // actual number. The count-up-from-0 effect below only replays it
  // cosmetically once the element scrolls into view for users who do have
  // JS running; it never removes the real number from the initial markup.
  const [count, setCount] = useState(value);
  const countRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const reduceMotion = useReducedMotion();

  // Observe when the counter enters the viewport
  useEffect(() => {
    const node = countRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Counting animation — eases from 0 up to the real value once in view.
  useEffect(() => {
    if (!isInView || reduceMotion) return;
    let frame: number;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / COUNT_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, reduceMotion, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`flex flex-col items-center justify-center text-center px-3 py-8 sm:px-6 sm:py-12 border-white/15 ${CELL_BORDERS[index]}`}
    >
      <div
        ref={countRef}
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white tabular-nums"
      >
        {count}
        {suffix}
      </div>
      <p className="mt-2 sm:mt-3 text-[13px] sm:text-base font-medium text-white/75">
        {label}
      </p>
    </motion.div>
  );
};

// --- Main Section ---
export const StatCounter: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#F4F7FE] relative overflow-hidden">
      {/* Decorative gradient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8EDFF] via-[#F4F7FE] to-white opacity-70"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A14A5]">
            Our Growth in Numbers
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#231F20]/70 max-w-xl mx-auto">
            Real results for real businesses, and we&apos;re just getting started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#1A14A5] shadow-[0_30px_60px_-20px_rgba(26,20,165,0.55)]"
        >
          {/* Soft light accents so the panel isn't a flat block of blue */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#4F46E5]/40 blur-3xl" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <StatItem key={stat.label} {...stat} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatCounter;
