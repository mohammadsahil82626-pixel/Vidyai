import React, { useEffect, useRef } from 'react';

interface CosmicBackgroundProps {
  isDarkMode: boolean;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definition
    const PARTICLE_COUNT = Math.min(width < 768 ? 24 : 45, 50);
    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
    }

    const darkColors = [
      'rgba(56, 189, 248, ', // sky blue
      'rgba(99, 102, 241, ', // indigo
      'rgba(168, 85, 247, ', // purple
      'rgba(14, 165, 233, ', // cyan
    ];

    const lightColors = [
      'rgba(96, 165, 250, ',
      'rgba(129, 140, 248, ',
      'rgba(192, 132, 252, ',
    ];

    const particles: Particle[] = [];
    const colors = isDarkMode ? darkColors : lightColors;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1, // float gently upwards
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing cosmic ambient nebula orbs
      if (isDarkMode) {
        // Deep top-center electric blue/cyan nebula glow
        const topNebula = ctx.createRadialGradient(
          width * 0.5,
          height * 0.25,
          10,
          width * 0.5,
          height * 0.25,
          width * 0.55
        );
        topNebula.addColorStop(0, 'rgba(30, 58, 138, 0.28)'); // blue-900 glow
        topNebula.addColorStop(0.5, 'rgba(49, 46, 129, 0.18)'); // indigo-900 glow
        topNebula.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = topNebula;
        ctx.fillRect(0, 0, width, height);

        // Subtle violet side glow
        const sideNebula = ctx.createRadialGradient(
          width * 0.85,
          height * 0.6,
          20,
          width * 0.85,
          height * 0.6,
          width * 0.45
        );
        sideNebula.addColorStop(0, 'rgba(109, 40, 217, 0.15)'); // violet-700
        sideNebula.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = sideNebula;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Light mode gentle radiant background
        const lightGlow = ctx.createRadialGradient(
          width * 0.5,
          height * 0.3,
          20,
          width * 0.5,
          height * 0.3,
          width * 0.6
        );
        lightGlow.addColorStop(0, 'rgba(219, 234, 254, 0.6)');
        lightGlow.addColorStop(0.6, 'rgba(238, 242, 255, 0.3)');
        lightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = lightGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw soft flowing aurora wave ribbons
      const waveCount = 2;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const baseOffsetY = height * (0.35 + w * 0.22);
        const waveSpeed = time * (0.8 + w * 0.3);
        const amplitude = 35 + w * 20;

        ctx.moveTo(0, height);
        ctx.lineTo(0, baseOffsetY + Math.sin(waveSpeed) * amplitude);

        for (let x = 0; x <= width; x += 25) {
          const y =
            baseOffsetY +
            Math.sin(x * 0.003 + waveSpeed) * amplitude +
            Math.cos(x * 0.0015 - waveSpeed * 0.6) * (amplitude * 0.7);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseOffsetY - amplitude, width, baseOffsetY + amplitude * 2);
        if (isDarkMode) {
          if (w === 0) {
            waveGrad.addColorStop(0, 'rgba(14, 165, 233, 0.07)'); // cyan
            waveGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)'); // indigo
            waveGrad.addColorStop(1, 'rgba(168, 85, 247, 0.04)'); // purple
          } else {
            waveGrad.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
            waveGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.06)');
            waveGrad.addColorStop(1, 'rgba(56, 189, 248, 0.03)');
          }
        } else {
          waveGrad.addColorStop(0, 'rgba(186, 230, 253, 0.2)');
          waveGrad.addColorStop(0.5, 'rgba(199, 210, 254, 0.25)');
          waveGrad.addColorStop(1, 'rgba(233, 213, 255, 0.15)');
        }

        ctx.fillStyle = waveGrad;
        ctx.fill();
      }

      // 3. Draw & update stardust particles
      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha += p.alphaSpeed;

          if (p.alpha > 0.8) {
            p.alpha = 0.8;
            p.alphaSpeed = -Math.abs(p.alphaSpeed);
          } else if (p.alpha < 0.15) {
            p.alpha = 0.15;
            p.alphaSpeed = Math.abs(p.alphaSpeed);
          }

          // Wrap edges
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }

        // Draw particle with gentle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = p.color + '0.6)';
        ctx.shadowBlur = p.radius * 3;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Initial render
    render();

    // If reduced motion is requested, just render once as a still backdrop
    if (prefersReducedMotion) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDarkMode]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base deep background layer */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDarkMode
            ? 'bg-[#050816] bg-gradient-to-b from-[#040714] via-[#060b24] to-[#030612]'
            : 'bg-gradient-to-b from-slate-50 via-blue-50/40 to-indigo-50/30'
        }`}
      />

      {/* Canvas for animated waves and floating glowing particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90 transition-opacity duration-700"
      />

      {/* Subtle vignette layer for contrast and legibility */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDarkMode
            ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.4)_100%)]'
            : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(241,245,249,0.3)_100%)]'
        }`}
      />
    </div>
  );
};
