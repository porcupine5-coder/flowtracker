"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

/**
 * Enhanced animated gradient background using conic-gradient
 * Optimized for latte brown color scheme with warm, gentle transitions
 */
export function AnimatedGradientBackground({
  className,
  colors = ["#F5E9DA", "#A67B5B", "#6F4E37", "#D2B48C"],
  speed = 11,
}: AnimatedGradientBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden bg-[#FEFCF9]",
        className
      )}
    >
      {/* Main animated gradient layer */}
      <div
        className="animated-gradient absolute inset-0 h-full w-full"
        style={
          {
            "--gradient-color-1": colors[0],
            "--gradient-color-2": colors[1],
            "--gradient-color-3": colors[2],
            "--gradient-color-4": colors[3],
            "--animation-duration": `${speed}s`,
          } as React.CSSProperties
        }
      />

      {/* Subtle overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(254, 252, 249, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Vignette for soft edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(61, 47, 32, 0.08) 100%)",
        }}
      />

      {/* CSS for the animated gradient */}
      <style>{`
        .animated-gradient {
          background: conic-gradient(
            from 90deg,
            var(--gradient-color-1, #F5E9DA) 0%,
            var(--gradient-color-1, #F5E9DA) 20%,
            var(--gradient-color-2, #A67B5B) 20%,
            var(--gradient-color-2, #A67B5B) 50%,
            var(--gradient-color-3, #6F4E37) 50%,
            var(--gradient-color-3, #6F4E37) 65%,
            var(--gradient-color-4, #D2B48C) 65%,
            var(--gradient-color-4, #D2B48C) 100%
          );
          background-size: 200% 200%;
          animation: animated-gradient-gentle-flow var(--animation-duration, 11s) cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          opacity: 0.6;
        }

        @keyframes animated-gradient-gentle-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Add subtle noise texture for organic feel */
        .animated-gradient::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default AnimatedGradientBackground;
