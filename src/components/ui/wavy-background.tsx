"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { createNoise3D } from "simplex-noise";

type WavyBackgroundProps = {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
};

const DEFAULT_COLORS = ["#1b4332", "#2d6a4f", "#40916c", "#52b788", "#c9a227"];

function getSpeed(speed: "slow" | "fast") {
  return speed === "fast" ? 0.002 : 0.001;
}

/** Aceternity WavyBackground — canvas + simplex noise, blur on a wrapper (not ctx.filter). */
export function WavyBackground({
  children,
  className,
  containerClassName,
  colors = DEFAULT_COLORS,
  waveWidth = 50,
  backgroundFill = "#000000",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
}: WavyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = createNoise3D();
    let w = 0;
    let h = 0;
    let nt = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawWave = (count: number) => {
      nt += getSpeed(speed);
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth;
        ctx.strokeStyle = colors[i % colors.length]!;
        ctx.globalAlpha = waveOpacity;
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, w, h);
      drawWave(5);
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    render();

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    window.addEventListener("resize", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [backgroundFill, colors, speed, waveOpacity, waveWidth]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden",
        containerClassName
      )}
      style={{ backgroundColor: backgroundFill }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
        style={{
          filter: `blur(${blur}px)`,
          WebkitFilter: `blur(${blur}px)`,
          transform: "translateZ(0)",
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      </div>
      <div className={cn("relative z-10 w-full", className)}>{children}</div>
    </div>
  );
}
