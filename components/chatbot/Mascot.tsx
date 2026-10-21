"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Hubi, the chat widget's mascot: a small BSH-navy robot wearing a sales
 * headset. Drawn as inline SVG so it ships no image, stays crisp at every
 * size and can be animated part by part.
 *
 * - idle:     floats, blinks, and its eyes follow the pointer
 * - wave:     waves its right arm (launcher hover, greetings, nudges)
 * - thinking: eyes glance up while a reply is on its way
 * - happy:    smiling eyes, after a lead is captured or a step is finished
 * - point:    arm raised, while guiding the tour
 *
 * Every motion is dropped under prefers-reduced-motion.
 */

export type MascotMood = "idle" | "wave" | "thinking" | "happy" | "point";

const NAVY = "#1A14A5";
const NAVY_DEEP = "#0E0A6B";
const INK = "#231F20";
const GLOW = "#8FE9FF";

interface MascotProps {
  size?: number;
  mood?: MascotMood;
  /** Follow the pointer with the eyes. Off for the small avatars in the
   *  transcript, where a dozen pairs of moving eyes would be unsettling. */
  trackPointer?: boolean;
  float?: boolean;
  className?: string;
}

export default function Mascot({
  size = 64,
  mood = "idle",
  trackPointer = false,
  float = false,
  className = "",
}: MascotProps) {
  const reduceMotion = useReducedMotion();
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [gaze, setGaze] = React.useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = React.useState(false);
  const uid = React.useId().replace(/:/g, "");

  React.useEffect(() => {
    if (!trackPointer || reduceMotion) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height * 0.4);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(distance / 120, 1) * 3.2;
        setGaze({ x: (dx / distance) * reach, y: (dy / distance) * reach });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [trackPointer, reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true);
        timeout = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 140);
      }, 2600 + Math.random() * 2800);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [reduceMotion]);

  const eyeOffset = mood === "thinking" ? { x: 2.5, y: -3 } : mood === "point" ? { x: 0, y: -2 } : gaze;
  const happy = mood === "happy";
  const armRaised = mood === "wave" || mood === "point";

  const armAnimation =
    reduceMotion || !armRaised
      ? { rotate: armRaised ? -120 : 0 }
      : mood === "wave"
        ? { rotate: [-110, -145, -110, -145, -120] }
        : { rotate: -150 };

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 120 132"
      width={size}
      height={(size * 132) / 120}
      className={className}
      aria-hidden="true"
      animate={float && !reduceMotion ? { y: [0, -4, 0] } : undefined}
      transition={float ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${uid}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E4E8F8" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={NAVY} />
          <stop offset="100%" stopColor={NAVY_DEEP} />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="60" cy="127" rx="26" ry="4" fill={INK} opacity="0.12" />

      {/* Antenna, the "hub" node pulses like a live connection */}
      <line x1="60" y1="20" x2="60" y2="9" stroke={NAVY} strokeWidth="3.5" strokeLinecap="round" />
      <motion.circle
        cx="60"
        cy="7"
        r="5"
        fill="#4F7BFF"
        animate={reduceMotion ? undefined : { opacity: [1, 0.45, 1], r: [5, 5.8, 5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Left arm (resting) */}
      <rect x="22" y="88" width="11" height="24" rx="5.5" fill={`url(#${uid}-shell)`} stroke={NAVY} strokeOpacity="0.18" />

      {/* Right arm: waves or points, pivoting at the shoulder */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 8%" }}
        animate={armAnimation}
        transition={
          mood === "wave" && !reduceMotion
            ? { duration: 1.4, ease: "easeInOut" }
            : { type: "spring", stiffness: 160, damping: 14 }
        }
      >
        <rect x="87" y="88" width="11" height="24" rx="5.5" fill={`url(#${uid}-shell)`} stroke={NAVY} strokeOpacity="0.18" />
      </motion.g>

      {/* Body with the BSH badge */}
      <rect x="32" y="84" width="56" height="38" rx="16" fill={`url(#${uid}-shell)`} stroke={NAVY} strokeOpacity="0.15" />
      <rect x="47" y="96" width="26" height="12" rx="6" fill={NAVY} />
      <text
        x="60"
        y="105"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        BSH
      </text>

      {/* Head */}
      <rect x="16" y="20" width="88" height="68" rx="30" fill={`url(#${uid}-shell)`} stroke={NAVY} strokeOpacity="0.15" />

      {/* Headset band and ear cups */}
      <path d="M14 56 C14 18, 106 18, 106 56" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <rect x="8" y="46" width="13" height="24" rx="6.5" fill={INK} />
      <rect x="99" y="46" width="13" height="24" rx="6.5" fill={INK} />
      {/* Mic boom */}
      <path d="M14 68 C16 82, 30 84, 40 80" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="79.5" r="3.6" fill={INK} />

      {/* Visor */}
      <rect x="27" y="32" width="66" height="44" rx="20" fill={`url(#${uid}-visor)`} />
      <path d="M36 38 Q46 34 58 35" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />

      {/* Eyes */}
      <motion.g
        animate={{ x: eyeOffset.x, y: eyeOffset.y }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        {happy ? (
          <>
            <path d="M40 56 Q46 48 52 56" fill="none" stroke={GLOW} strokeWidth="4" strokeLinecap="round" />
            <path d="M68 56 Q74 48 80 56" fill="none" stroke={GLOW} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={{ scaleY: blinking ? 0.1 : 1 }}
            transition={{ duration: 0.07 }}
          >
            <rect x="41" y="46" width="10" height="15" rx="5" fill={GLOW} />
            <rect x="69" y="46" width="10" height="15" rx="5" fill={GLOW} />
            <circle cx="48" cy="50" r="1.8" fill="#FFFFFF" />
            <circle cx="76" cy="50" r="1.8" fill="#FFFFFF" />
          </motion.g>
        )}
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="36" cy="66" rx="4.5" ry="2.6" fill="#FF8FB1" opacity="0.55" />
      <ellipse cx="84" cy="66" rx="4.5" ry="2.6" fill="#FF8FB1" opacity="0.55" />

      {/* Mouth */}
      {mood === "thinking" ? (
        <circle cx="60" cy="68" r="2.4" fill={GLOW} />
      ) : (
        <path
          d={happy ? "M52 65 Q60 73 68 65" : "M54 66 Q60 71 66 66"}
          fill="none"
          stroke={GLOW}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )}
    </motion.svg>
  );
}
