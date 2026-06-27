"use client";

import { useEffect, useState, useCallback } from "react";
import { GLOW_COLORS } from "@/lib/utils";

const DEFAULT_COLOR = GLOW_COLORS.brand;
const INFLUENCE_RADIUS = 200;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Soft cursor glow that shifts color near category-tagged elements */
export function CursorAura() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [active, setActive] = useState(false);

  const handleMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    setActive(true);

    const elements = document.querySelectorAll("[data-glow-color]");
    let r = 0;
    let g = 0;
    let b = 0;
    let weightSum = 0;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      if (dist < INFLUENCE_RADIUS) {
        const weight = Math.pow(1 - dist / INFLUENCE_RADIUS, 2);
        const hex = el.getAttribute("data-glow-color") ?? DEFAULT_COLOR;
        const rgb = hexToRgb(hex);
        r += rgb.r * weight;
        g += rgb.g * weight;
        b += rgb.b * weight;
        weightSum += weight;
      }
    });

    if (weightSum > 0) {
      setColor(
        `rgb(${Math.round(r / weightSum)}, ${Math.round(g / weightSum)}, ${Math.round(b / weightSum)})`
      );
    } else {
      setColor(DEFAULT_COLOR);
    }
  }, []);

  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden>
      {/* Large ambient glow */}
      <div
        className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl transition-[background-color] duration-500 ease-out"
        style={{ left: pos.x, top: pos.y, backgroundColor: color }}
      />
      {/* Tighter core glow */}
      <div
        className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-xl transition-[background-color] duration-300 ease-out"
        style={{ left: pos.x, top: pos.y, backgroundColor: color }}
      />
    </div>
  );
}
