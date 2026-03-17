import React, { useMemo } from 'react';

export interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  isDarkMode?: boolean;
  centerContent?: boolean;
  allowScroll?: boolean;
  density?: "low" | "medium" | "high";
  disableAnimation?: boolean;
}

// Helper to generate random box shadows
const generateBoxShadows = (n: number, isDarkMode: boolean) => {
  const color = isDarkMode ? "rgba(255, 255, 255, 0.75)" : "var(--accent)";
  let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px ${color}`;
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px ${color}`;
  }
  return value;
};

export function ParallaxBackground({
  children,
  className = "",
  speed = 1,
  isDarkMode = false,
  centerContent = true,
  allowScroll = false,
  density = "high",
  disableAnimation = false
}: ParallaxBackgroundProps) {
  const starCounts = {
    low: { small: 180, medium: 60, big: 30 },
    medium: { small: 360, medium: 120, big: 60 },
    high: { small: 700, medium: 200, big: 100 },
  }[density];

  // Memoize shadows so they don't regenerate on re-renders
  const shadowsSmall = useMemo(() => generateBoxShadows(starCounts.small, isDarkMode), [starCounts.small, isDarkMode]);
  const shadowsMedium = useMemo(() => generateBoxShadows(starCounts.medium, isDarkMode), [starCounts.medium, isDarkMode]);
  const shadowsBig = useMemo(() => generateBoxShadows(starCounts.big, isDarkMode), [starCounts.big, isDarkMode]);

  const wrapperClasses = `relative w-full ${
    allowScroll ? "h-screen overflow-y-auto overflow-x-hidden" : "h-screen overflow-hidden"
  } font-sans ${className}`;
  const animationPlayState = disableAnimation ? "paused" : "running";

  return (
    <div 
      className={wrapperClasses} 
      style={{ 
        background: "radial-gradient(ellipse at bottom, var(--surface) 0%, var(--bg) 70%)",
        transition: "background 0.8s ease-in-out"
      }}
    >
      
      {/* Inline styles for animations */}
      <style>{`
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        .parallax-star {
          animation: animStar linear infinite;
        }
      `}</style>

      {/* Stars Layer 1 (Small) - Fastest */}
      <div 
        className="absolute left-0 top-0 w-[1px] h-[1px] bg-transparent z-10 parallax-star"
        style={{ 
          boxShadow: shadowsSmall,
          animationDuration: `${50 / speed}s`,
          animationPlayState,
          willChange: "transform"
        }}
      >
        <div 
          className="absolute top-[2000px] w-[1px] h-[1px] bg-transparent"
          style={{ boxShadow: shadowsSmall }}
        />
      </div>

      {/* Stars Layer 2 (Medium) */}
      <div 
        className="absolute left-0 top-0 w-[2px] h-[2px] bg-transparent z-10 parallax-star"
        style={{ 
          boxShadow: shadowsMedium,
          animationDuration: `${100 / speed}s`,
          animationPlayState,
          willChange: "transform"
        }}
      >
        <div 
          className="absolute top-[2000px] w-[2px] h-[2px] bg-transparent"
          style={{ boxShadow: shadowsMedium }}
        />
      </div>

      {/* Stars Layer 3 (Big) - Slowest */}
      <div 
        className="absolute left-0 top-0 w-[3px] h-[3px] bg-transparent z-10 parallax-star"
        style={{ 
          boxShadow: shadowsBig,
          animationDuration: `${150 / speed}s`,
          animationPlayState,
          willChange: "transform"
        }}
      >
        <div 
          className="absolute top-[2000px] w-[3px] h-[3px] bg-transparent"
          style={{ boxShadow: shadowsBig }}
        />
      </div>

      {/* Content Container */}
      {centerContent ? (
        <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
          {children}
        </div>
      ) : (
        <div className="relative z-20">
          {children}
        </div>
      )}
    </div>
  );
}

export default ParallaxBackground;
