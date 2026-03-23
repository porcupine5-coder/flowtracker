import React from "react";

export function HoneycombLoader({
  size = 24,
  color,
  label = "Loading",
}: {
  size?: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      className="honeycomb"
      role="status"
      aria-live="polite"
      aria-label={label}
      style={
        {
          ["--hc-size" as any]: `${size}px`,
          color: color ?? "var(--primary)",
        } as React.CSSProperties
      }
    >
      {/* 7 cells create the honeycomb pulse */}
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

