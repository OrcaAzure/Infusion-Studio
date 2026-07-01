"use client";

import { useEffect, useRef } from "react";
import { GLOW_COLORS } from "@/lib/utils";

const DEFAULT_COLOR = GLOW_COLORS.brand;
const INFLUENCE_RADIUS = 200;
const COLOR_INTERVAL_MS = 100;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function pickGlowColor(clientX: number, clientY: number, elements: Element[]) {
  let r = 0;
  let g = 0;
  let b = 0;
  let weightSum = 0;

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(clientX - cx, clientY - cy);

    if (dist < INFLUENCE_RADIUS) {
      const weight = Math.pow(1 - dist / INFLUENCE_RADIUS, 2);
      const hex = el.getAttribute("data-glow-color") ?? DEFAULT_COLOR;
      const rgb = hexToRgb(hex);
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
      weightSum += weight;
    }
  }

  if (weightSum > 0) {
    return `rgb(${Math.round(r / weightSum)}, ${Math.round(g / weightSum)}, ${Math.round(b / weightSum)})`;
  }
  return DEFAULT_COLOR;
}

/** Soft pointer glow — rAF + transform only (no per-frame React state). */
export function CursorAura() {
  const rootRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const raf = useRef<number | null>(null);
  const glowEls = useRef<Element[]>([]);
  const lastColorAt = useRef(0);
  const frame = useRef(0);
  const visible = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const refreshEls = () => {
      glowEls.current = Array.from(document.querySelectorAll("[data-glow-color]"));
    };
    refreshEls();

    const applyPosition = () => {
      const { x, y } = pos.current;
      const transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (outerRef.current) outerRef.current.style.transform = transform;
      if (innerRef.current) innerRef.current.style.transform = transform;
    };

    const schedule = () => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        frame.current += 1;

        if (!visible.current && rootRef.current) {
          visible.current = true;
          rootRef.current.style.opacity = "1";
        }

        if (frame.current % 90 === 0) refreshEls();

        applyPosition();

        const now = performance.now();
        if (now - lastColorAt.current >= COLOR_INTERVAL_MS) {
          lastColorAt.current = now;
          const color = pickGlowColor(pos.current.x, pos.current.y, glowEls.current);
          if (outerRef.current) outerRef.current.style.backgroundColor = color;
          if (innerRef.current) innerRef.current.style.backgroundColor = color;
        }
      });
    };

    const onPointer = (x: number, y: number) => {
      pos.current = { x, y };
      schedule();
    };

    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) onPointer(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden opacity-0 transition-opacity duration-300"
      aria-hidden
    >
      <div
        ref={outerRef}
        className="absolute left-0 top-0 h-72 w-72 rounded-full opacity-30 blur-3xl will-change-transform"
        style={{
          backgroundColor: DEFAULT_COLOR,
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        }}
      />
      <div
        ref={innerRef}
        className="absolute left-0 top-0 h-16 w-16 rounded-full opacity-55 blur-xl will-change-transform transition-[background-color] duration-150"
        style={{
          backgroundColor: DEFAULT_COLOR,
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
