"use client";

import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

const TypedHeading: React.FC = () => {
  const typedRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const options = {
      strings: ["Creative Agency", "Digital Experts", "Automation Experts"],
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
    <h1
      className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A14A5] drop-shadow-sm tracking-tight"
    >
      BSH SOLUTIONS
      <span ref={typedRef} className="block min-h-[1.2em] text-[#231F20]">
        Creative Agency
      </span>
    </h1>
  );
};

export default TypedHeading;
