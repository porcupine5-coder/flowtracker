import React, { Component, ReactNode, useMemo } from "react";
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

interface AltBackgroundRendererProps {
  config: AnimationConfig;
  reducedMotion: boolean;
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
