"use client"

import React from "react"
import { motion } from "framer-motion"
import ModelViewer3D from "./ModelViewer3D"

const HeroLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="relative mt-10 lg:mt-0 flex justify-center items-center"
    >
      {/* 3D Interactive Main Logo */}
      <div className="relative z-10">
        <ModelViewer3D />
      </div>

      {/* Blue Glow Behind */}
      <div className="absolute -z-10 w-[450px] h-[450px] rounded-full bg-[#1A14A5]/30 blur-3xl pointer-events-none"></div>
    </motion.div>
  )
}

export default HeroLogo

