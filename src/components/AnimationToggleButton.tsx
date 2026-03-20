import React from "react";
import { useBackgroundAnimation } from "./BackgroundAnimationContext";

export function AnimationToggleButton() {
  const { animationMode, toggleAnimation } = useBackgroundAnimation();
  const isAlt = animationMode === "alt";
  const isNone = animationMode === "none";

  let ariaLabel = "Switch to themed background animation";
  let title = "Star-field mode";
  if (isAlt) {
    ariaLabel = "Turn off backgrounds";
    title = "Themed animation mode";
  } else if (isNone) {
    ariaLabel = "Switch to star-field background";
    title = "No background mode";
  }

  return (
    <button
      onClick={toggleAnimation}
      className={`animation-toggle-btn ${isNone ? "opacity-50" : ""}`}
      aria-label={ariaLabel}
      title={title}
    >
      <span className={`toggle-icon ${isAlt ? "toggle-icon-active" : ""}`}>
        {isNone ? (
          // No animation icon (Off)
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ) : isAlt ? (
          // Waves / effect icon
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ) : (
          // Stars icon
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default AnimationToggleButton;
