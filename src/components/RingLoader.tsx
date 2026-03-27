import React from "react";

export function RingLoader({
  size = 48,
  color,
  label = "Loading",
}: {
  size?: number;
  color?: string;
  label?: string;
}) {
  const strokeColor = color ?? "var(--primary)";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        width: size,
        height: size,
        color: strokeColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 240 240"
        width="100%"
        height="100%"
        className="pl"
        aria-hidden="true"
      >
        <circle
          strokeLinecap="round"
          strokeDashoffset="-330"
          strokeDasharray="0 660"
          strokeWidth="20"
          fill="none"
          r="105"
          cy="120"
          cx="120"
          className="pl__ring pl__ring--a"
        />
        <circle
          strokeLinecap="round"
          strokeDashoffset="-110"
          strokeDasharray="0 220"
          strokeWidth="20"
          fill="none"
          r="35"
          cy="120"
          cx="120"
          className="pl__ring pl__ring--b"
        />
        <circle
          strokeLinecap="round"
          strokeDasharray="0 440"
          strokeWidth="20"
          fill="none"
          r="70"
          cy="120"
          cx="85"
          className="pl__ring pl__ring--c"
        />
        <circle
          strokeLinecap="round"
          strokeDasharray="0 440"
          strokeWidth="20"
          fill="none"
          r="70"
          cy="120"
          cx="155"
          className="pl__ring pl__ring--d"
        />
      </svg>
    </div>
  );
}

