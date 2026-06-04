"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

interface RevealProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Reveal({ children, style }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 260ms ease, transform 260ms ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
