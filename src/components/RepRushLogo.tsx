/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from 'react';

interface RepRushLogoProps {
  className?: string;
  size?: number;
  showBadge?: boolean;
}

export const RepRushLogo: React.FC<RepRushLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showBadge = true,
}) => {
  const uniqueId = useId().replace(/:/g, '');

  const redGradId = `rr-red-${uniqueId}`;
  const blueGradId = `rr-blue-${uniqueId}`;
  const darkGradId = `rr-dark-${uniqueId}`;
  const badgeShadowId = `rr-shadow-${uniqueId}`;

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="reprush logo"
    >
      <defs>
        {/* Fiery Red Gradient for 'rep' */}
        <linearGradient id={redGradId} x1="60" y1="80" x2="280" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2E3E" />
          <stop offset="50%" stopColor="#EE1122" />
          <stop offset="100%" stopColor="#B8000E" />
        </linearGradient>

        {/* Electric Cobalt/Cyan Gradient for 'rush' */}
        <linearGradient id={blueGradId} x1="240" y1="80" x2="450" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="35%" stopColor="#0077FF" />
          <stop offset="100%" stopColor="#0044CC" />
        </linearGradient>

        {/* Athletic Obsidian Gradient for Badge Interior */}
        <linearGradient id={darkGradId} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Badge Drop Shadow */}
        <filter id={badgeShadowId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.16" />
        </filter>
      </defs>

      {/* 1. App Icon Squircle Container */}
      {showBadge && (
        <rect
          x="20"
          y="20"
          width="472"
          height="472"
          rx="112"
          fill={`url(#${darkGradId})`}
          stroke="#1E293B"
          strokeWidth="4"
          filter={`url(#${badgeShadowId})`}
        />
      )}

      {/* 2. Athletic Speed Slash Background Accents */}
      <g opacity="0.18">
        <path d="M 120 70 L 170 70 L 90 440 L 40 440 Z" fill="#FFFFFF" />
        <path d="M 440 70 L 490 70 L 410 440 L 360 440 Z" fill="#FFFFFF" />
      </g>

      {/* 3. Central Dual Kinetic 'rr' Athletic Lettermark */}
      <g transform="skewX(-8) translate(30, 0)">
        {/* Left 'r' (Red Clash Side) */}
        <path
          d="M 128 140
             C 128 128 138 120 150 120
             L 210 120
             C 246 120 270 144 266 182
             C 262 216 236 234 204 238
             L 248 318
             C 254 328 248 340 234 340
             L 194 340
             C 186 340 180 334 176 326
             L 142 254
             L 142 328
             C 142 334 136 340 130 340
             L 110 340
             C 104 340 98 334 98 328
             L 98 152
             C 98 144 104 140 112 140
             Z
             M 142 162
             L 142 214
             L 194 214
             C 214 214 226 204 228 188
             C 230 172 218 162 198 162
             Z"
          fill={`url(#${redGradId})`}
        />

        {/* Central Dynamic Energy Lightning Slash */}
        <path
          d="M 270 120
             L 240 226
             L 272 226
             L 236 340
             L 282 238
             L 252 238
             L 288 120
             Z"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* Right 'r' (Blue Clash Side) */}
        <path
          d="M 288 140
             C 288 128 298 120 310 120
             L 370 120
             C 406 120 430 144 426 182
             C 422 216 396 234 364 238
             L 408 318
             C 414 328 408 340 394 340
             L 354 340
             C 346 340 340 334 336 326
             L 302 254
             L 302 328
             C 302 334 296 340 290 340
             L 270 340
             C 264 340 258 334 258 328
             L 258 152
             C 258 144 264 140 272 140
             Z
             M 302 162
             L 302 214
             L 354 214
             C 374 214 386 204 388 188
             C 390 172 378 162 358 162
             Z"
          fill={`url(#${blueGradId})`}
        />
      </g>

      {/* 4. Lower Lettermark (reprush) */}
      <g transform="skewX(-6) translate(14, 0)">
        <text
          x="248"
          y="418"
          textAnchor="middle"
          style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '66px',
            fontWeight: 900,
            letterSpacing: '-2px',
          }}
        >
          <tspan fill={`url(#${redGradId})`}>rep</tspan>
          <tspan fill={`url(#${blueGradId})`}>rush</tspan>
        </text>
      </g>

      {/* 5. Electric Dot Glow Accent */}
      <circle cx="418" cy="382" r="5" fill="#00E5FF" />
    </svg>
  );
};
