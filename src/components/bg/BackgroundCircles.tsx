"use client";

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BackgroundCirclesProps {
  className?: string;
  color?: string;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function BackgroundCircles({ className, color = "#06b6d4" }: BackgroundCirclesProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center overflow-hidden bg-transparent mix-blend-plus-lighter",
        className,
      )}
    >
      {/* Center glow - scales with viewport */}
      <div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: "min(60vw, 60vh)",
          height: "min(60vw, 60vh)",
          backgroundColor: hexToRgba(color, 0.15)
        }}
      />

      {/* Circles container - scales with viewport */}
      <div className="relative h-full w-full opacity-60">
        {/* Circle 1 - smallest with gradient arc */}
        <motion.div
           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
           animate={{ rotate: 360 }}
           transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
           style={{
             width: "min(20vw, 20vh)",
             height: "min(20vw, 20vh)",
             background: `conic-gradient(from 0deg, transparent 0deg, ${hexToRgba(color, 0.5)} 60deg, transparent 120deg, transparent 360deg)`,
             mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))",
             WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))",
           }}
        />

        {/* Circle 2 with dashed effect */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{
            width: "min(35vw, 35vh)",
            height: "min(35vw, 35vh)",
            background: `conic-gradient(from 180deg, ${hexToRgba(color, 0.4)} 0deg, transparent 40deg, transparent 90deg, ${hexToRgba(color, 0.3)} 130deg, transparent 170deg, transparent 270deg, ${hexToRgba(color, 0.2)} 310deg, transparent 350deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))",
          }}
        />

        {/* Circle 3 with arc */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{
            width: "min(50vw, 50vh)",
            height: "min(50vw, 50vh)",
            background: `conic-gradient(from 90deg, transparent 0deg, ${hexToRgba(color, 0.4)} 30deg, ${hexToRgba(color, 0.6)} 60deg, transparent 90deg, transparent 180deg, ${hexToRgba(color, 0.3)} 210deg, transparent 240deg, transparent 360deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))",
          }}
        />

        {/* Circle 4 */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{
            width: "min(65vw, 65vh)",
            height: "min(65vw, 65vh)",
            background: `conic-gradient(from 270deg, ${hexToRgba(color, 0.3)} 0deg, transparent 50deg, transparent 120deg, ${hexToRgba(color, 0.2)} 150deg, transparent 200deg, transparent 300deg, ${hexToRgba(color, 0.25)} 330deg, transparent 360deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 0.5px))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 0.5px))",
          }}
        />

        {/* Circle 5 - largest with subtle arc */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{
            width: "min(80vw, 80vh)",
            height: "min(80vw, 80vh)",
            background: `conic-gradient(from 0deg, ${hexToRgba(color, 0.2)} 0deg, transparent 30deg, transparent 180deg, ${hexToRgba(color, 0.15)} 200deg, transparent 230deg, transparent 360deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 0.5px))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 0.5px))",
          }}
        />
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(3,3,3,0.3) 70%, rgba(3,3,3,0.5) 100%)",
        }}
      />
    </div>
  )
}

export default function BackgroundCirclesDemo() {
  return <BackgroundCircles />
}