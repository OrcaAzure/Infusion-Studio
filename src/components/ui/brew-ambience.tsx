"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  life: number;
  maxLife: number;
  type: "bubble" | "steam";
  wobble: number;
  wobbleSpeed: number;
}

/** Animated steam wisps and rising bubbles — brewing ambience */
export function BrewAmbience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnBubble = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: 4 + Math.random() * 14,
      speedY: -(0.4 + Math.random() * 1.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0.15 + Math.random() * 0.25,
      life: 0,
      maxLife: 200 + Math.random() * 300,
      type: "bubble",
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    });

    const spawnSteam = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.5 + Math.random() * 0.5),
      size: 30 + Math.random() * 60,
      speedY: -(0.15 + Math.random() * 0.4),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: 0.04 + Math.random() * 0.08,
      life: 0,
      maxLife: 300 + Math.random() * 400,
      type: "steam",
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
    });

    // Seed initial particles
    for (let i = 0; i < 12; i++) particles.push(spawnBubble());
    for (let i = 0; i < 8; i++) {
      const s = spawnSteam();
      s.y = Math.random() * canvas.height;
      particles.push(s);
    }

    let frame = 0;
    let running = true;

    const onVisibility = () => {
      running = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      if (!running) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Spawn new particles periodically
      if (frame % 55 === 0) particles.push(spawnBubble());
      if (frame % 80 === 0) particles.push(spawnSteam());

      particles = particles.filter((p) => p.life < p.maxLife);

      const isDark = document.documentElement.classList.contains("dark");
      const isAlchemy = document.documentElement.classList.contains("theme-alchemy");

      for (const p of particles) {
        p.life++;
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.3;
        p.y += p.speedY;

        const fadeIn = Math.min(p.life / 40, 1);
        const fadeOut = Math.min((p.maxLife - p.life) / 60, 1);
        const alpha = p.opacity * fadeIn * fadeOut;

        if (p.type === "bubble") {
          // Bubble with highlight
          const grad = ctx.createRadialGradient(
            p.x - p.size * 0.3,
            p.y - p.size * 0.3,
            0,
            p.x,
            p.y,
            p.size
          );
          const bubbleColor = isAlchemy
            ? isDark
              ? "180, 210, 190"
              : "64, 145, 108"
            : isDark
              ? "180, 220, 200"
              : "16, 185, 129";
          grad.addColorStop(0, `rgba(${bubbleColor}, ${alpha * 0.6})`);
          grad.addColorStop(0.7, `rgba(${bubbleColor}, ${alpha * 0.2})`);
          grad.addColorStop(1, `rgba(${bubbleColor}, 0)`);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Rim
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${bubbleColor}, ${alpha * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          // Steam wisp
          const steamColor = isAlchemy
            ? isDark
              ? "201, 180, 120"
              : "120, 140, 110"
            : isDark
              ? "200, 210, 205"
              : "120, 140, 130";
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(${steamColor}, ${alpha})`);
          grad.addColorStop(0.5, `rgba(${steamColor}, ${alpha * 0.4})`);
          grad.addColorStop(1, `rgba(${steamColor}, 0)`);

          ctx.beginPath();
          ctx.ellipse(
            p.x + Math.sin(p.wobble) * 10,
            p.y,
            p.size * 0.6,
            p.size,
            0,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70 dark:opacity-50"
      aria-hidden
    />
  );
}
