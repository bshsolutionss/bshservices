"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"

// three.js + its loaders + a ~5.5 MB OBJ model are the heaviest things on the
// homepage. They are code-split AND loaded only after the page is idle (and
// only when the device/connection can afford it); until then — and forever on
// Save-Data, slow connections or reduced-motion — a lightweight poster of the
// same mark is shown, so the hero paints immediately and LCP is a small image.
const ModelViewer3D = dynamic(() => import("./ModelViewer3D"), { ssr: false })

type NetworkInfo = { saveData?: boolean; effectiveType?: string }

function canAffordModel(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
  const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection
  if (conn?.saveData) return false
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false
  return true
}

const SIZE = "w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] lg:w-[480px] lg:h-[480px]"

const HeroLogo = () => {
  const [mount3D, setMount3D] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!canAffordModel()) return
    const start = () => setMount3D(true)
    // Wait for the page to finish loading, then give the main thread a beat.
    const schedule = () => {
      const id = window.setTimeout(start, 1200)
      return () => window.clearTimeout(id)
    }
    let cancel: (() => void) | undefined
    if (document.readyState === "complete") cancel = schedule()
    else {
      const onLoad = () => { cancel = schedule() }
      window.addEventListener("load", onLoad, { once: true })
      return () => { window.removeEventListener("load", onLoad); cancel?.() }
    }
    return () => cancel?.()
  }, [])

  return (
    <div className="relative mt-10 flex items-center justify-center lg:mt-0">
      <div className={`relative z-10 ${SIZE}`}>
        {/* Poster: instant, tiny, and what low-power devices keep */}
        <Image
          src="/images/3dlogobgre.png"
          alt="BSH Solutions logo"
          fill
          priority
          sizes="(max-width: 640px) 260px, (max-width: 1024px) 380px, 480px"
          className={`object-contain transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        {mount3D && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <ModelViewer3D onReady={() => setReady(true)} />
          </div>
        )}
      </div>

      {/* Blue glow behind */}
      <div className="pointer-events-none absolute -z-10 h-[300px] w-[300px] rounded-full bg-[#1A14A5]/30 blur-3xl sm:h-[450px] sm:w-[450px]" />
    </div>
  )
}

export default HeroLogo
