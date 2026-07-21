"use client";

import { useEffect, useRef } from "react";

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; r: number; dx: number; dy: number; opacity: number; color: string }[] = [];
    const colors = ["rgba(34,211,238,", "rgba(96,165,250,", "rgba(167,139,250,", "rgba(255,255,255,"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.7 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${p.color}0.5)`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* Base */}
      <div className="absolute inset-0 bg-[#020810]" />

      {/* Deep gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(59,130,246,0.3),transparent_50%),radial-gradient(ellipse_at_100%_0%,rgba(99,102,241,0.2),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(34,211,238,0.15),transparent_50%)]" />

      {/* Large ambient glow - left */}
      <div className="absolute -left-[400px] top-[-200px] h-[900px] w-[900px] rounded-full bg-blue-600/20 blur-[120px]" />

      {/* Large ambient glow - right */}
      <div className="absolute -right-[300px] bottom-[-200px] h-[800px] w-[800px] rounded-full bg-violet-600/20 blur-[120px]" />

      {/* Center glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[150px]" />

      {/* Horizontal light beam */}
      <div className="absolute left-0 top-[35%] h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
      <div className="absolute left-0 top-[65%] h-[1px] w-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />

      {/* Vertical light beam */}
      <div className="absolute left-[30%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent" />
      <div className="absolute right-[30%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-violet-400/10 to-transparent" />

      {/* Glowing orbs */}
      <div className="absolute left-[10%] top-[20%] h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_20px_6px_rgba(34,211,238,0.8)]" />
      <div className="absolute right-[15%] top-[15%] h-1 w-1 animate-pulse rounded-full bg-blue-300 shadow-[0_0_15px_4px_rgba(96,165,250,0.8)]" style={{animationDelay: "0.5s"}} />
      <div className="absolute left-[60%] top-[70%] h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300 shadow-[0_0_20px_6px_rgba(167,139,250,0.8)]" style={{animationDelay: "1s"}} />
      <div className="absolute left-[25%] bottom-[25%] h-1 w-1 animate-pulse rounded-full bg-white shadow-[0_0_15px_4px_rgba(255,255,255,0.6)]" style={{animationDelay: "1.5s"}} />
      <div className="absolute right-[35%] top-[45%] h-1 w-1 animate-pulse rounded-full bg-cyan-200 shadow-[0_0_15px_4px_rgba(34,211,238,0.6)]" style={{animationDelay: "0.8s"}} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* Animated particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />

      {/* Top vignette */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020810] to-transparent" />

      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020810] to-transparent" />
    </>
  );
}