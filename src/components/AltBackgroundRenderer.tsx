import React, { Component, ReactNode, useEffect, useMemo, useState } from "react";
import { AnimationConfig } from "../lib/backgroundAnimations";

// Import custom background components
import { BackgroundBeamsWithCollision } from "./bg/BackgroundBeamsWithCollision";
import { BackgroundCircles } from "./bg/BackgroundCircles";
import { ConstellationBackground } from "./bg/ConstellationBackground";
import { Meteors } from "./bg/Meteors";
import { RainBackground } from "./bg/RainBackground";
import { ShootingStars } from "./bg/ShootingStars";
import { SnowBackground } from "./bg/SnowBackground";
import SparklesCore from "./bg/SparklesCore";
import { StarfieldBackground } from "./bg/StarfieldBackground";
import { UnderwaterBackground } from "./bg/UnderwaterBackground";
import { AnimatedGradientBackground } from "./bg/AnimatedGradientBackground";

interface AltBackgroundRendererProps {
  config: AnimationConfig;
  reducedMotion: boolean;
}

const STAR_FIELD_WIDTH = 2560;
const STAR_FIELD_HEIGHT = 2560;
const STAR_START_OFFSET = 600;

function createStars(count: number, color: string) {
  let stars = `${Math.floor(Math.random() * STAR_FIELD_WIDTH)}px ${Math.floor(
    Math.random() * STAR_FIELD_HEIGHT,
  )}px ${color}`;
  for (let i = 1; i < count; i++) {
    stars += `, ${Math.floor(Math.random() * STAR_FIELD_WIDTH)}px ${Math.floor(
      Math.random() * STAR_FIELD_HEIGHT,
    )}px ${color}`;
  }
  return stars;
}

function SlateSkyLayer({
  className,
  colors,
  speed,
  shootingCount,
  backgroundBase,
}: {
  className: string;
  colors: [string, string, string];
  speed: number;
  shootingCount: number;
  backgroundBase?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [primary, secondary, accent] = colors;
  const isDarkBase = Boolean(
    backgroundBase &&
      /^#?[0-9a-fA-F]{6}$/.test(backgroundBase) &&
      ((parseInt(backgroundBase.replace("#", "").slice(0, 2), 16) * 0.299) +
        (parseInt(backgroundBase.replace("#", "").slice(2, 4), 16) * 0.587) +
        (parseInt(backgroundBase.replace("#", "").slice(4, 6), 16) * 0.114)) /
        255 <
        0.45,
  );
  const density = isMobile ? 0.4 : 1;
  const starsA = useMemo(
    () => createStars(Math.max(220, Math.round(1200 * density)), "rgba(123, 138, 151, 0.34)"),
    [density],
  );
  const starsB = useMemo(
    () => createStars(Math.max(100, Math.round(500 * density)), "rgba(126, 200, 200, 0.3)"),
    [density],
  );
  const starsC = useMemo(
    () => createStars(Math.max(40, Math.round(140 * density)), "rgba(91, 143, 168, 0.28)"),
    [density],
  );
  const shootingStars = useMemo(() => {
    const effectiveCount = Math.max(2, Math.round(shootingCount * (isMobile ? 0.6 : 1)));
    return Array.from({ length: effectiveCount }, (_, i) => ({
      id: i,
      delay: i * (0.9 / Math.max(1, speed)),
      duration: 4.5 + (i % 3),
      right: `${8 + i * 14}%`,
      bottom: `${-20 - i * 8}px`,
    }));
  }, [shootingCount, speed, isMobile]);

  return (
    <div
      className={className}
      style={{
        background: isDarkBase
          ? "linear-gradient(to bottom, #07090c 0%, #0e0e10 55%, #12151b 100%)"
          : "linear-gradient(to bottom, #eef4f7 0%, #f4f7f9 55%, #e4edf3 100%)",
      }}
    >
      <style>{`
        @keyframes slateAnimStar {
          from { transform: translate3d(0px, 0px, 0); }
          to { transform: translate3d(-${STAR_FIELD_WIDTH}px, -${STAR_FIELD_HEIGHT}px, 0); }
        }
        @keyframes slateAnimShootingStar {
          from {
            transform: translate3d(0px, 0px, 0) rotate(-45deg);
            opacity: 0.9;
            height: 8px;
          }
          to {
            transform: translate3d(-${STAR_FIELD_WIDTH}px, -${STAR_FIELD_HEIGHT}px, 0) rotate(-45deg);
            opacity: 0;
            height: 700px;
          }
        }
      `}</style>

      <div
        className="absolute left-0 top-0 h-px w-px rounded-full"
        style={{
          boxShadow: starsA,
          animation: `slateAnimStar ${110 / Math.max(0.1, speed)}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div className="absolute left-0 h-px w-px rounded-full" style={{ top: `-${STAR_START_OFFSET}px`, boxShadow: starsA }} />
      </div>

      <div
        className="absolute left-0 top-0 h-[2px] w-[2px] rounded-full"
        style={{
          boxShadow: starsB,
          animation: `slateAnimStar ${140 / Math.max(0.1, speed)}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div className="absolute left-0 h-[2px] w-[2px] rounded-full" style={{ top: `-${STAR_START_OFFSET}px`, boxShadow: starsB }} />
      </div>

      <div
        className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full"
        style={{
          boxShadow: starsC,
          animation: `slateAnimStar ${190 / Math.max(0.1, speed)}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div className="absolute left-0 h-[3px] w-[3px] rounded-full" style={{ top: `-${STAR_START_OFFSET}px`, boxShadow: starsC }} />
      </div>

      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute w-[4px] rounded-t-full"
          style={{
            right: star.right,
            bottom: star.bottom,
            background: `linear-gradient(to top, rgba(126, 200, 200, 0), ${accent})`,
            filter: `drop-shadow(0 0 6px ${primary})`,
            animation: `slateAnimShootingStar ${star.duration / Math.max(0.1, speed)}s linear ${star.delay}s infinite`,
            willChange: "transform, opacity, height",
          }}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDarkBase
            ? `radial-gradient(ellipse at 18% 22%, ${secondary}1f 0%, transparent 48%), radial-gradient(ellipse at 75% 68%, ${accent}26 0%, transparent 52%)`
            : `radial-gradient(ellipse at 18% 22%, ${secondary}22 0%, transparent 48%), radial-gradient(ellipse at 75% 68%, ${accent}1c 0%, transparent 52%)`,
        }}
      />
    </div>
  );
}

class BackgroundErrorBoundary extends Component<{children: ReactNode, fallbackColor: string}, {hasError: boolean}> {
  constructor(props: {children: ReactNode, fallbackColor: string}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("Background rendering error:", error);
  }
  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 z-0 opacity-50 transition-opacity" style={{ backgroundColor: this.props.fallbackColor }} />;
    }
    return this.props.children;
  }
}

export const AltBackgroundRenderer = React.memo(function AltBackgroundRenderer({
  config,
  reducedMotion,
}: AltBackgroundRendererProps) {
  // Pass appropriate colors from config
  const color1 = config.colors[0] || "#ffffff";
  const color2 = config.colors[1] || color1;
  const color3 = config.colors[2] || color2;
  const color4 = config.colors[3];

  // Use absolute positioning relative to parent to stay within the crossfade div
  const bgClasses = "absolute inset-0 z-0 bg-transparent";

  // Hide animations if reducedMotion is enabled
  if (reducedMotion) {
    return <div className={`w-full h-full opacity-50 ${bgClasses}`} style={{ backgroundColor: color1 }} />;
  }

  const renderComponent = () => {
    switch (config.type) {
      case "beams":
        return <BackgroundBeamsWithCollision className={bgClasses}>{null}</BackgroundBeamsWithCollision>;
      case "circles":
        return <BackgroundCircles color={color1} className={bgClasses} />;
      case "constellation":
        return <ConstellationBackground nodeColor={color1} lineColor={color2} count={config.count} className={bgClasses} />;
      case "meteors":
        return <Meteors color={color1} tailColor={color2} count={config.count} className={bgClasses} />;
      case "rain":
        return <RainBackground color={color1} count={config.count} className={bgClasses} />;
      case "shooting_stars":
        return <ShootingStars starColor={color1} trailColor={color2} maxSpeed={15 * config.speed} className={bgClasses} />;
      case "slate_sky":
        return (
          <SlateSkyLayer
            className={bgClasses}
            colors={[color1, color2, color3]}
            speed={config.speed}
            shootingCount={config.count}
            backgroundBase={color4}
          />
        );
      case "snow":
        return <SnowBackground color={color1} count={config.count} intensity={config.speed} className={bgClasses} />;
      case "sparkles":
        return (
          <div className={bgClasses}>
            <SparklesCore
              className="w-full h-full"
              background="transparent"
              particleColor={color1}
              particleDensity={config.count}
              speed={config.speed}
              minSize={1}
              maxSize={3}
            />
          </div>
        );
      case "starfield":
        return <StarfieldBackground starColor={color1} count={config.count} speed={config.speed} className={bgClasses} />;
      case "underwater":
        return <UnderwaterBackground intensity={config.opacity} speed={config.speed} className={bgClasses} />;
      case "animated_gradient":
        return <AnimatedGradientBackground className={bgClasses} colors={config.colors} speed={11 / config.speed} />;
      default:
        return null;
    }
  };

  return (
    <BackgroundErrorBoundary fallbackColor={color1}>
      {renderComponent()}
    </BackgroundErrorBoundary>
  );
});

export default AltBackgroundRenderer;
