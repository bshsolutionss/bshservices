"use client"

import React from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

// three.js + its OBJ/MTL loaders + OrbitControls are a heavy dependency
// (a few hundred KB gzipped) that only this one component needs — code-split
// it into its own chunk instead of bundling it into the homepage's main JS.
// ssr:false because WebGL only exists in the browser anyway (the component
// already does all its real work inside a useEffect/canvas ref).
const ModelViewer3D = dynamic(() => import("./ModelViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-2 border-[#1A14A5]/30 border-t-[#1A14A5] animate-spin" />
        <div className="absolute w-12 h-12 rounded-full bg-[#1A14A5]/20 backdrop-blur-md animate-pulse" />
      </div>
    </div>
  ),
})

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
