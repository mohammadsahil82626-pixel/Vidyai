import React from 'react';

interface VidyaLogoOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const VidyaLogoOrb: React.FC<VidyaLogoOrbProps> = ({ size = 'hero' }) => {
  const dimensionClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    hero: 'w-36 h-36 md:w-44 md:h-44',
  }[size];

  return (
    <div className={`relative ${dimensionClass} flex items-center justify-center select-none`}>
      {/* Outer ambient pulsing glow aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/40 via-indigo-500/35 to-cyan-400/30 blur-2xl animate-pulse [animation-duration:3.5s] pointer-events-none" />

      {/* SVG Container containing the 3D Sphere, Orbital Ring, and Graduation Cap */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sphere Radial Glow Gradient */}
          <radialGradient id="sphereCore" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.95" />
            <stop offset="28%" stopColor="#3b82f6" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#1e3a8a" stopOpacity="0.9" />
            <stop offset="90%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
          </radialGradient>

          {/* Neon Ring Gradient */}
          <linearGradient id="ringNeon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#818cf8" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.9" />
          </linearGradient>

          {/* Inner Back Ring Arc */}
          <linearGradient id="backRing" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
          </linearGradient>

          {/* Glass Rim Filter */}
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Back section of the Orbital Rings (behind sphere) */}
        <g transform="rotate(-28 100 100)">
          {/* Outer Back Ring */}
          <ellipse
            cx="100"
            cy="100"
            rx="88"
            ry="28"
            stroke="url(#backRing)"
            strokeWidth="3.5"
            strokeDasharray="140 180"
            strokeDashoffset="145"
            fill="none"
            opacity="0.85"
          />
          {/* Inner Back Ring */}
          <ellipse
            cx="100"
            cy="100"
            rx="78"
            ry="23"
            stroke="url(#backRing)"
            strokeWidth="2"
            strokeDasharray="130 160"
            strokeDashoffset="135"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* 2. Main Central Glowing Planetary Sphere */}
        <circle
          cx="100"
          cy="100"
          r="54"
          fill="url(#sphereCore)"
          stroke="rgba(147, 197, 253, 0.45)"
          strokeWidth="1.5"
        />

        {/* Inner Crescent Highlight for 3D sphere volume */}
        <path
          d="M 60,78 A 54,54 0 0,1 138,58 A 48,48 0 0,0 60,78 Z"
          fill="rgba(255, 255, 255, 0.28)"
          filter="blur(2px)"
        />

        {/* 3. Front section of the Orbital Rings (in front of sphere) */}
        <g transform="rotate(-28 100 100)">
          {/* Outer Neon Ring */}
          <ellipse
            cx="100"
            cy="100"
            rx="88"
            ry="28"
            stroke="url(#ringNeon)"
            strokeWidth="4"
            strokeDasharray="160 160"
            strokeDashoffset="-20"
            fill="none"
            filter="url(#glowFilter)"
          />
          {/* Inner Secondary Ring */}
          <ellipse
            cx="100"
            cy="100"
            rx="78"
            ry="23"
            stroke="url(#ringNeon)"
            strokeWidth="2.2"
            strokeDasharray="140 150"
            strokeDashoffset="-15"
            fill="none"
            opacity="0.9"
          />
          {/* Ring Particle Gleams */}
          <circle cx="16" cy="98" r="2.5" fill="#ffffff" filter="url(#glowFilter)" />
          <circle cx="184" cy="102" r="2" fill="#38bdf8" />
        </g>

        {/* 4. White Graduation Cap (Mortarboard) centered inside sphere */}
        <g transform="translate(100, 100) scale(1.15) translate(-24, -24)">
          {/* Mortarboard Rhombus Top */}
          <polygon
            points="24,10 44,20 24,30 4,20"
            fill="#ffffff"
            filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
          />
          {/* Cap Skull Under-Cap */}
          <path
            d="M 12,24 L 12,32 C 12,37 36,37 36,32 L 36,24"
            fill="#f8fafc"
            opacity="0.95"
          />
          {/* Tassel Button */}
          <circle cx="24" cy="20" r="2" fill="#38bdf8" />
          {/* Tassel Cord & Hanging Ribbon */}
          <path
            d="M 24,20 Q 37,21 39,28 L 39,35"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tassel End Fringe */}
          <circle cx="39" cy="35.5" r="1.5" fill="#38bdf8" />
        </g>

        {/* Ambient sparkle stars */}
        <g opacity="0.8">
          <circle cx="48" cy="46" r="1.5" fill="#ffffff" />
          <circle cx="152" cy="148" r="1.2" fill="#38bdf8" />
          <circle cx="160" cy="56" r="1.5" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
