"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { FaReact, FaNodeJs } from "react-icons/fa"
import { SiNextdotjs, SiMongodb, SiTailwindcss } from "react-icons/si"

const FloatingIcon = ({ 
  icon: Icon, 
  delay, 
  size, 
  color, 
  x, 
  y 
}: {
  icon: React.ElementType;
  delay: number;
  size: number;
  color: string;
  x: number[];
  y: number[];
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, x, y }}
    transition={{
      repeat: Infinity,
      repeatType: "mirror",
      duration: 6,
      delay,
      ease: "easeInOut",
    }}
    className="absolute"
    style={{ color }}
  >
    <Icon size={size} />
  </motion.div>
)

const HeroLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="relative mt-10 lg:mt-0 flex justify-center items-center"
    >
      {/* Floating Main Logo */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        
      >
        <Image
          src="/images/3dlogobgrewtx.png"
          alt="hero"
          width={480}
          height={480}
          className="object-cover drop-shadow-2xl"
        />
      </motion.div>

      {/* Blue Glow Behind */}
      <div className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-[#1A14A5]/40 blur-3xl"></div>

      {/* Floating Tech Icons Around */}
      <FloatingIcon
        icon={FaReact}
        delay={0}
        size={40}
        color="#61DAFB"
        x={[0, 60, 0]}
        y={[-160, -180, -160]}
      />
      <FloatingIcon
        icon={SiNextdotjs}
        delay={1}
        size={38}
        color="#000"
        x={[-200, -180, -200]}
        y={[-40, -60, -40]}
      />
      <FloatingIcon
        icon={FaNodeJs}
        delay={2}
        size={42}
        color="#68A063"
        x={[200, 220, 200]}
        y={[20, 40, 20]}
      />
      <FloatingIcon
        icon={SiMongodb}
        delay={3}
        size={38}
        color="#4DB33D"
        x={[-120, -140, -120]}
        y={[160, 180, 160]}
      />
      <FloatingIcon
        icon={SiTailwindcss}
        delay={4}
        size={40}
        color="#38BDF8"
        x={[120, 140, 120]}
        y={[160, 180, 160]}
      />
    </motion.div>
  )
}

export default HeroLogo
