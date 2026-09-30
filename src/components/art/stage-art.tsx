"use client";

import type { ComponentType } from "react";

/**
 * Stage artwork.
 *
 * The real monis.rent product photos are studio JPEGs on white (and several are
 * marketing infographics with baked-in text). Compositing them into one scene
 * produces floating white rectangles, so the stage uses purpose-drawn SVG
 * instead. Photos stay where they belong — on the catalog cards.
 *
 * Shared conventions so the scene reads as one place:
 *   • 3/4 view, light from the upper left, shadow to the lower right
 *   • 100×100 viewBox, object sitting on the y≈92 ground line
 *   • brand palette only, via the tokens below
 */

const INK = "#17322C";
const INK_DARK = "#10231F";
const STEEL = "#8A9A95";
const STEEL_LIGHT = "#B9C6C1";
const WOOD = "#C98F5A";
const WOOD_LIGHT = "#E0AE7C";
const WOOD_DARK = "#A46F41";
const SCREEN = "#2C5F52";
const SCREEN_GLOW = "#3FA08A";
const CORAL = "#F96F2C";
const LEAF = "#3E8E63";
const LEAF_DARK = "#2E6B4A";
const WHITE = "#FDFBF7";

export type ArtProps = { className?: string };
export type Art = ComponentType<ArtProps>;

/** Soft contact shadow every object shares, so nothing floats. */
function Shadow({ cx = 50, rx = 30, cy = 93 }: { cx?: number; rx?: number; cy?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill={INK_DARK} opacity={0.14} />;
}

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      {children}
    </svg>
  );
}

/* ─────────────────────────────── Desks ─────────────────────────────── */

export const DeskElectric: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={34} />
    {/* legs */}
    <rect x="18" y="52" width="5" height="40" rx="1.6" fill={STEEL} />
    <rect x="77" y="52" width="5" height="40" rx="1.6" fill={STEEL} />
    <rect x="16" y="88" width="9" height="4" rx="1.6" fill={INK} />
    <rect x="75" y="88" width="9" height="4" rx="1.6" fill={INK} />
    {/* cross beam */}
    <rect x="22" y="60" width="56" height="3" rx="1.5" fill={STEEL_LIGHT} />
    {/* top: front face then surface, so it reads as thickness */}
    <path d="M8 50h84v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill={WOOD_DARK} />
    <path d="M12 44h76l4 6H8z" fill={WOOD} />
    <path d="M12 44h76l1.6 2.4H10.4z" fill={WOOD_LIGHT} />
    {/* control panel */}
    <rect x="62" y="51.5" width="12" height="4" rx="1" fill={INK_DARK} />
    <rect x="64" y="52.8" width="4" height="1.4" rx="0.7" fill={SCREEN_GLOW} />
  </Svg>
);

export const DeskMechanical: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={32} />
    <rect x="20" y="52" width="4" height="40" rx="1.4" fill={INK} />
    <rect x="76" y="52" width="4" height="40" rx="1.4" fill={INK} />
    <path d="M20 90h60v3H20z" fill={INK_DARK} opacity={0.8} />
    <rect x="24" y="66" width="52" height="2.6" rx="1.3" fill={INK} opacity={0.75} />
    <path d="M10 50h80v6a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z" fill="#8E6244" />
    <path d="M14 44h72l4 6H10z" fill="#B07A4F" />
    <path d="M14 44h72l1.6 2.4H12.4z" fill="#CE9668" />
    {/* hand crank */}
    <path d="M80 60h7v1.8h-7z" fill={STEEL} />
    <circle cx="88" cy="60.9" r="2.2" fill={STEEL_LIGHT} />
  </Svg>
);

/* ─────────────────────────────── Chairs ────────────────────────────── */

export const ChairErgonomic: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={22} />
    {/* headrest */}
    <rect x="36" y="8" width="28" height="9" rx="4.5" fill={INK} />
    <rect x="47" y="16" width="6" height="5" fill={INK} />
    {/* mesh back */}
    <path d="M34 20h32a3 3 0 0 1 3 3v26a4 4 0 0 1-4 4H35a4 4 0 0 1-4-4V23a3 3 0 0 1 3-3z" fill={INK} />
    <path d="M34 22h32v24H34z" fill={STEEL} opacity={0.35} />
    {[26, 31, 36, 41].map((y) => (
      <line key={y} x1="35" y1={y} x2="65" y2={y} stroke={STEEL_LIGHT} strokeWidth="0.7" opacity={0.5} />
    ))}
    {/* lumbar */}
    <rect x="38" y="42" width="24" height="5" rx="2.5" fill={CORAL} opacity={0.85} />
    {/* seat */}
    <path d="M30 53h40a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H30a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z" fill={INK_DARK} />
    {/* armrests */}
    <path d="M26 46h6v3h-6zM68 46h6v3h-6z" fill={INK} />
    <path d="M27 49h3v5h-3zM70 49h3v5h-3z" fill={STEEL} />
    {/* gas lift + base */}
    <rect x="47" y="64" width="6" height="14" fill={STEEL} />
    <path d="M32 84l18-6 18 6" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M50 78v6" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    {[32, 50, 68].map((cx) => (
      <circle key={cx} cx={cx} cy={87} r="3" fill={INK_DARK} />
    ))}
  </Svg>
);

export const ChairTask: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={20} />
    <path d="M36 22h28a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H36a3 3 0 0 1-3-3V25a3 3 0 0 1 3-3z" fill={SCREEN} />
    <path d="M36 24h28v18H36z" fill={SCREEN_GLOW} opacity={0.3} />
    <path d="M32 50h36a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H32a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z" fill={SCREEN} />
    <rect x="47" y="61" width="6" height="16" fill={STEEL} />
    <path d="M34 84l16-7 16 7" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M50 77v7" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    {[34, 50, 66].map((cx) => (
      <circle key={cx} cx={cx} cy={86.5} r="2.6" fill={INK_DARK} />
    ))}
  </Svg>
);

export const ChairLounge: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={24} />
    {/* rattan shell */}
    <path d="M22 60c0-22 12-36 28-36s28 14 28 36z" fill={WOOD} />
    <path d="M26 60c0-19 10-32 24-32s24 13 24 32z" fill={WOOD_LIGHT} />
    {[34, 42, 50].map((y) => (
      <path key={y} d={`M${28 + (50 - y) * 0.1} ${y}q22 -5 ${44 - (50 - y) * 0.2} 0`} stroke={WOOD_DARK} strokeWidth="0.8" fill="none" opacity={0.55} />
    ))}
    {/* cushion */}
    <path d="M28 56h44a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4z" fill={WHITE} />
    <path d="M28 58h44v4H28z" fill={STEEL_LIGHT} opacity={0.4} />
    {/* legs */}
    <path d="M32 70l-4 16M68 70l4 16" stroke={WOOD_DARK} strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

/* ────────────────────────────── Monitors ───────────────────────────── */

function monitor(width: number, curved: boolean, accent: string) {
  const x = 50 - width / 2;
  return function MonitorArt({ className }: ArtProps) {
    return (
      <Svg className={className}>
        <Shadow rx={width * 0.34} />
        {/* stand */}
        <rect x="46" y="72" width="8" height="12" fill={STEEL} />
        <path d="M36 86h28a2 2 0 0 1 0 4H36a2 2 0 0 1 0-4z" fill={INK} />
        {/* bezel */}
        <path
          d={
            curved
              ? `M${x} 22q${width / 2} -7 ${width} 0v46q-${width / 2} 6 -${width} 0z`
              : `M${x} 20h${width}a3 3 0 0 1 3 3v45a3 3 0 0 1-3 3H${x}a3 3 0 0 1-3-3V23a3 3 0 0 1 3-3z`
          }
          fill={INK_DARK}
        />
        {/* screen */}
        <path
          d={
            curved
              ? `M${x + 3} 26q${width / 2} -6 ${width - 6} 0v38q-${width / 2} 5 -${width - 6} 0z`
              : `M${x + 3} 24h${width - 6}v42H${x + 3}z`
          }
          fill={SCREEN}
        />
        <path
          d={
            curved
              ? `M${x + 3} 26q${width / 2} -6 ${width - 6} 0v14q-${width / 2} 5 -${width - 6} 0z`
              : `M${x + 3} 24h${width - 6}v16H${x + 3}z`
          }
          fill={accent}
          opacity={0.45}
        />
        {/* content bars — a hint of a workspace, not a wallpaper */}
        <rect x={x + 7} y={46} width={width * 0.42} height="2.4" rx="1.2" fill={WHITE} opacity={0.5} />
        <rect x={x + 7} y={52} width={width * 0.6} height="2.4" rx="1.2" fill={WHITE} opacity={0.3} />
        <rect x={x + 7} y={58} width={width * 0.3} height="2.4" rx="1.2" fill={WHITE} opacity={0.3} />
      </Svg>
    );
  };
}

export const Monitor24 = monitor(38, false, SCREEN_GLOW);
export const Monitor27 = monitor(46, false, SCREEN_GLOW);
export const MonitorUltrawide = monitor(66, true, CORAL);
export const MonitorStudio = monitor(46, false, STEEL_LIGHT);

/* ────────────────────────────── Lighting ───────────────────────────── */

export const DeskLamp: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={40} rx={16} />
    <ellipse cx="40" cy="88" rx="16" ry="3.4" fill={INK} />
    <path d="M40 88V34" stroke={STEEL} strokeWidth="4" strokeLinecap="round" />
    <path d="M40 34h30" stroke={STEEL} strokeWidth="4" strokeLinecap="round" />
    <rect x="52" y="34" width="26" height="4" rx="2" fill={INK} />
    {/* light cone */}
    <path d="M54 38h22l14 34H40z" fill={CORAL} opacity={0.14} />
  </Svg>
);

export const GradientLamp: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={14} />
    <ellipse cx="50" cy="88" rx="13" ry="3" fill={INK} />
    <defs>
      <linearGradient id="hue" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={CORAL} />
        <stop offset="55%" stopColor="#B95BD8" />
        <stop offset="100%" stopColor={SCREEN_GLOW} />
      </linearGradient>
    </defs>
    <rect x="46" y="14" width="8" height="74" rx="4" fill="url(#hue)" />
    <rect x="46" y="14" width="3" height="74" rx="1.5" fill={WHITE} opacity={0.35} />
  </Svg>
);

/* ───────────────────────────── Peripherals ─────────────────────────── */

export const Keyboard: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={30} cy={86} />
    <path d="M14 66h72a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V70a4 4 0 0 1 4-4z" fill={INK_DARK} />
    <path d="M14 66h72a4 4 0 0 1 4 4v2H10v-2a4 4 0 0 1 4-4z" fill={STEEL} opacity={0.4} />
    {[0, 1, 2].map((r) =>
      Array.from({ length: 12 }, (_, c) => (
        <rect key={`${r}-${c}`} x={15 + c * 6.2} y={71 + r * 4.4} width="4.6" height="3.2" rx="0.8" fill={STEEL_LIGHT} opacity={0.5} />
      )),
    )}
  </Svg>
);

export const Mouse: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={18} cy={88} />
    <path d="M50 34c14 0 22 12 22 30s-8 22-22 22-22-4-22-22 8-30 22-30z" fill={INK_DARK} />
    <path d="M50 34c7 0 12 4 16 12-4 3-9 5-16 5s-12-2-16-5c4-8 9-12 16-12z" fill={STEEL} opacity={0.45} />
    <rect x="48" y="40" width="4" height="10" rx="2" fill={CORAL} opacity={0.8} />
  </Svg>
);

export const LaptopStand: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={26} />
    <path d="M18 84h64l-8-40H26z" fill={STEEL_LIGHT} opacity={0.5} />
    <path d="M26 44h48l6 30H20z" fill={STEEL} />
    {/* laptop */}
    <path d="M28 42l8-28h28l8 28z" fill={INK} />
    <path d="M32 40l7-23h22l7 23z" fill={SCREEN} />
    <path d="M32 40l7-23h22l2 6H34z" fill={SCREEN_GLOW} opacity={0.35} />
  </Svg>
);

export const Dock: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={26} cy={88} />
    <path d="M16 62h68a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5V67a5 5 0 0 1 5-5z" fill={INK_DARK} />
    <path d="M16 62h68a5 5 0 0 1 5 5v2H11v-2a5 5 0 0 1 5-5z" fill={STEEL} opacity={0.4} />
    {[20, 32, 44, 56, 68].map((x) => (
      <rect key={x} x={x} y={72} width="9" height="4" rx="2" fill={STEEL_LIGHT} opacity={0.6} />
    ))}
    <circle cx="82" cy="74" r="2.4" fill={SCREEN_GLOW} />
  </Svg>
);

export const Webcam: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={14} cy={86} />
    <rect x="30" y="72" width="40" height="6" rx="3" fill={INK} />
    <rect x="34" y="34" width="32" height="20" rx="9" fill={INK_DARK} />
    <circle cx="50" cy="44" r="7" fill={SCREEN} />
    <circle cx="50" cy="44" r="3" fill={SCREEN_GLOW} />
    <circle cx="47.5" cy="41.5" r="1.2" fill={WHITE} opacity={0.8} />
    <path d="M50 54v18" stroke={STEEL} strokeWidth="3" />
  </Svg>
);

export const PowerStrip: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={30} cy={88} />
    <path d="M12 70h76a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6v-6a6 6 0 0 1 6-6z" fill={WHITE} />
    <path d="M12 70h76a6 6 0 0 1 6 6H6a6 6 0 0 1 6-6z" fill={STEEL_LIGHT} opacity={0.5} />
    {[16, 34, 52, 70].map((x) => (
      <rect key={x} x={x} y={76} width="12" height="9" rx="2" fill={INK_DARK} opacity={0.75} />
    ))}
    <circle cx="90" cy="80.5" r="2.4" fill={CORAL} />
  </Svg>
);

export const Starlink: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={20} />
    <path d="M40 86h20l-4-30h-12z" fill={STEEL} />
    <ellipse cx="50" cy="86" rx="20" ry="4.4" fill={INK} />
    <path d="M18 44q32 -22 64 0l-6 12q-26 -16 -52 0z" fill={WHITE} />
    <path d="M18 44q32 -22 64 0l-2 4q-30 -19 -60 0z" fill={STEEL_LIGHT} opacity={0.6} />
    <circle cx="50" cy="40" r="3" fill={SCREEN_GLOW} />
  </Svg>
);

/* ─────────────────────────────── Audio ─────────────────────────────── */

export const Microphone: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={16} />
    <ellipse cx="50" cy="88" rx="16" ry="3.6" fill={INK} />
    <path d="M50 88V56" stroke={STEEL} strokeWidth="3.4" />
    <path d="M50 56h-16" stroke={STEEL} strokeWidth="3.4" strokeLinecap="round" />
    <rect x="26" y="20" width="18" height="38" rx="9" fill={INK_DARK} />
    <rect x="29" y="24" width="12" height="26" rx="6" fill={STEEL} opacity={0.5} />
    {[28, 33, 38, 43].map((y) => (
      <line key={y} x1="30" y1={y} x2="40" y2={y} stroke={INK} strokeWidth="1" opacity={0.6} />
    ))}
    <circle cx="35" cy="54" r="1.6" fill={CORAL} />
  </Svg>
);

export const Speaker: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={24} />
    <path d="M22 28h56a4 4 0 0 1 4 4v52a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4z" fill={INK_DARK} />
    <path d="M24 34h52v40H24z" fill="#3A2B22" />
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1="24" y1={36 + i * 4.4} x2="76" y2={36 + i * 4.4} stroke={WOOD_DARK} strokeWidth="1.2" opacity={0.45} />
    ))}
    <rect x="34" y="78" width="32" height="4" rx="2" fill={WOOD} />
    <circle cx="70" cy="80" r="2" fill={CORAL} />
  </Svg>
);

export const SmartSpeaker: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={17} />
    <path d="M34 36h32a4 4 0 0 1 4 4v42a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V40a4 4 0 0 1 4-4z" fill={STEEL} />
    <path d="M34 36h32a4 4 0 0 1 4 4v6H30v-6a4 4 0 0 1 4-4z" fill={STEEL_LIGHT} />
    <ellipse cx="50" cy="40" rx="20" ry="5" fill={STEEL_LIGHT} />
    <ellipse cx="50" cy="40" rx="13" ry="3.2" fill={SCREEN_GLOW} opacity={0.5} />
  </Svg>
);

/* ────────────────────────── Comfort / climate ──────────────────────── */

export const Plant: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={18} />
    <path d="M36 62h28l-4 26a3 3 0 0 1-3 2.6H43a3 3 0 0 1-3-2.6z" fill={WOOD} />
    <path d="M36 62h28l-0.7 5H36.7z" fill={WOOD_LIGHT} />
    {/* monstera leaves */}
    <path d="M50 62c0-14-10-22-20-22 0 14 8 22 20 22z" fill={LEAF_DARK} />
    <path d="M50 62c0-16 10-26 22-26 0 16-9 26-22 26z" fill={LEAF} />
    <path d="M50 62c0-20 4-32 4-32s5 14 2 32z" fill={LEAF_DARK} opacity={0.85} />
    <path d="M40 48q6 4 10 12M62 44q-8 6 -12 18" stroke={WHITE} strokeWidth="0.9" opacity={0.35} fill="none" />
  </Svg>
);

export const AirPurifier: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={19} />
    <path d="M32 30h36a5 5 0 0 1 5 5v50a5 5 0 0 1-5 5H32a5 5 0 0 1-5-5V35a5 5 0 0 1 5-5z" fill={WHITE} />
    <path d="M32 30h36a5 5 0 0 1 5 5v4H27v-4a5 5 0 0 1 5-5z" fill={STEEL_LIGHT} opacity={0.6} />
    <rect x="34" y="44" width="32" height="14" rx="3" fill={INK_DARK} opacity={0.85} />
    <text x="50" y="54" textAnchor="middle" fontSize="8" fill={SCREEN_GLOW} fontFamily="monospace">
      12
    </text>
    {[64, 70, 76, 82].map((y) => (
      <line key={y} x1="35" y1={y} x2="65" y2={y} stroke={STEEL} strokeWidth="1.4" opacity={0.45} />
    ))}
  </Svg>
);

export const Dehumidifier: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={18} />
    <path d="M32 38h36a5 5 0 0 1 5 5v42a5 5 0 0 1-5 5H32a5 5 0 0 1-5-5V43a5 5 0 0 1 5-5z" fill={STEEL_LIGHT} />
    <path d="M32 38h36a5 5 0 0 1 5 5v3H27v-3a5 5 0 0 1 5-5z" fill={WHITE} />
    <circle cx="50" cy="56" r="9" fill={SCREEN} opacity={0.25} />
    <path d="M50 50c3 4 5 6 5 8.6a5 5 0 0 1-10 0c0-2.6 2-4.6 5-8.6z" fill={SCREEN_GLOW} />
    <rect x="36" y="74" width="28" height="8" rx="2" fill={INK} opacity={0.2} />
  </Svg>
);

export const Whiteboard: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={24} />
    <path d="M28 84l-6 6M72 84l6 6" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />
    <path d="M14 12h72a3 3 0 0 1 3 3v66a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z" fill={STEEL} />
    <rect x="15" y="16" width="70" height="62" fill={WHITE} />
    <path d="M24 30h34M24 40h44M24 50h26" stroke={SCREEN_GLOW} strokeWidth="2.4" strokeLinecap="round" opacity={0.7} />
    <path d="M24 62h20" stroke={CORAL} strokeWidth="2.4" strokeLinecap="round" opacity={0.8} />
  </Svg>
);

export const MonitorStand: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={26} cy={88} />
    <path d="M16 64h68a4 4 0 0 1 4 4v4H12v-4a4 4 0 0 1 4-4z" fill={WOOD} />
    <path d="M16 64h68a4 4 0 0 1 4 4H12a4 4 0 0 1 4-4z" fill={WOOD_LIGHT} />
    <rect x="18" y="72" width="6" height="16" fill={WOOD_DARK} />
    <rect x="76" y="72" width="6" height="16" fill={WOOD_DARK} />
  </Svg>
);

/* ───────────────────────── Lifestyle / off-clock ───────────────────── */

export const CoffeeMachine: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={19} />
    <path d="M32 20h30a6 6 0 0 1 6 6v58a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6z" fill={INK_DARK} />
    <path d="M32 20h30a6 6 0 0 1 6 6v4H26v-4a6 6 0 0 1 6-6z" fill={STEEL} opacity={0.4} />
    <rect x="34" y="36" width="26" height="4" rx="2" fill={CORAL} />
    {/* cup nook */}
    <path d="M34 58h26v16H34z" fill={WHITE} opacity={0.12} />
    <path d="M40 62h12a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3h-10a3 3 0 0 1-3-3v-6a2 2 0 0 1 2-2z" fill={WHITE} />
    <path d="M54 64h3a3 3 0 0 1 0 6h-3z" fill={WHITE} opacity={0.7} />
    <path d="M44 52v6M50 52v6" stroke={WOOD_DARK} strokeWidth="1.6" opacity={0.6} />
  </Svg>
);

export const FilterCoffee: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={20} />
    <path d="M28 18h20a4 4 0 0 1 4 4v18H24V22a4 4 0 0 1 4-4z" fill={INK_DARK} />
    <path d="M24 40h48a4 4 0 0 1 4 4v42a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4z" fill={INK} />
    <path d="M36 52h30a3 3 0 0 1 3 3v22a5 5 0 0 1-5 5H38a3 3 0 0 1-3-3z" fill={WHITE} opacity={0.85} />
    <path d="M38 60h28v18H38z" fill="#6B4327" opacity={0.7} />
    <path d="M69 58h4a4 4 0 0 1 0 8h-4z" fill={WHITE} opacity={0.7} />
  </Svg>
);

export const WalkingPad: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={34} cy={90} />
    <path d="M10 70h80a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5z" fill={INK_DARK} />
    <rect x="12" y="73" width="76" height="9" rx="2" fill={STEEL} opacity={0.45} />
    {Array.from({ length: 14 }, (_, i) => (
      <line key={i} x1={14 + i * 5.4} y1="73" x2={14 + i * 5.4} y2="82" stroke={INK} strokeWidth="1" opacity={0.5} />
    ))}
    <rect x="36" y="62" width="28" height="7" rx="3" fill={STEEL_LIGHT} />
    <rect x="44" y="64" width="12" height="3" rx="1.5" fill={SCREEN_GLOW} />
  </Svg>
);

export const Projector: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={20} cy={88} />
    <path d="M28 56h44a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6V62a6 6 0 0 1 6-6z" fill={WHITE} />
    <path d="M28 56h44a6 6 0 0 1 6 6H22a6 6 0 0 1 6-6z" fill={STEEL_LIGHT} opacity={0.6} />
    <circle cx="38" cy="71" r="7" fill={INK_DARK} />
    <circle cx="38" cy="71" r="3.4" fill={SCREEN_GLOW} />
    {/* projection beam */}
    <path d="M45 66l32-20v50L45 76z" fill={CORAL} opacity={0.13} />
    <rect x="60" y="66" width="12" height="3" rx="1.5" fill={STEEL} opacity={0.5} />
  </Svg>
);

export const GameConsole: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={18} />
    <path d="M38 16h24a4 4 0 0 1 4 4v62a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z" fill={WHITE} />
    <path d="M44 16h12v70H44z" fill={INK_DARK} />
    <rect x="46" y="24" width="8" height="2.4" rx="1.2" fill={SCREEN_GLOW} />
    {/* controller */}
    <path d="M18 74h14a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z" fill={STEEL_LIGHT} />
    <circle cx="20" cy="80" r="1.8" fill={INK} />
    <circle cx="30" cy="80" r="1.8" fill={INK} />
  </Svg>
);

export const SpinBike: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow rx={28} />
    <path d="M22 88h24M56 88h22" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <path d="M34 86L44 40h12l10 46" stroke={INK} strokeWidth="4" fill="none" strokeLinejoin="round" />
    <path d="M44 40l-8-14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <path d="M28 24h16" stroke={INK_DARK} strokeWidth="4.4" strokeLinecap="round" />
    <path d="M50 34h14a3 3 0 0 1 0 6H50z" fill={INK_DARK} />
    <circle cx="46" cy="66" r="10" fill="none" stroke={STEEL} strokeWidth="3.4" />
    <circle cx="46" cy="66" r="3" fill={CORAL} />
  </Svg>
);

export const Padel: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={16} cy={90} />
    <path d="M50 10c16 0 26 12 26 28s-10 26-26 26-26-10-26-26 10-28 26-28z" fill={SCREEN} />
    <path d="M50 14c13 0 22 10 22 24s-9 22-22 22-22-8-22-22 9-24 22-24z" fill={SCREEN_GLOW} opacity={0.45} />
    {[36, 44, 52, 60].map((x) => (
      <circle key={x} cx={x} cy={38} r="2" fill={SCREEN} opacity={0.5} />
    ))}
    <path d="M46 64h8l2 24h-12z" fill={INK_DARK} />
    <circle cx="74" cy="82" r="8" fill={CORAL} opacity={0.85} />
    <path d="M68 78q6 4 12 0" stroke={WHITE} strokeWidth="1.2" fill="none" opacity={0.7} />
  </Svg>
);

export const MassageGun: Art = ({ className }) => (
  <Svg className={className}>
    <Shadow cx={50} rx={16} cy={88} />
    <path d="M42 46h16a4 4 0 0 1 4 4v34a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4V50a4 4 0 0 1 4-4z" fill={INK_DARK} />
    <path d="M38 34h24a4 4 0 0 1 4 4v10H34V38a4 4 0 0 1 4-4z" fill={STEEL} />
    <circle cx="50" cy="26" r="9" fill={STEEL_LIGHT} />
    <rect x="44" y="60" width="12" height="4" rx="2" fill={SCREEN_GLOW} />
  </Svg>
);

/** Registry — `Product.art` keys into this. */
export const ART: Record<string, Art> = {
  deskElectric: DeskElectric,
  deskMechanical: DeskMechanical,
  chairErgonomic: ChairErgonomic,
  chairTask: ChairTask,
  chairLounge: ChairLounge,
  monitor24: Monitor24,
  monitor27: Monitor27,
  monitorUltrawide: MonitorUltrawide,
  monitorStudio: MonitorStudio,
  deskLamp: DeskLamp,
  gradientLamp: GradientLamp,
  keyboard: Keyboard,
  mouse: Mouse,
  laptopStand: LaptopStand,
  dock: Dock,
  webcam: Webcam,
  powerStrip: PowerStrip,
  starlink: Starlink,
  microphone: Microphone,
  speaker: Speaker,
  smartSpeaker: SmartSpeaker,
  plant: Plant,
  airPurifier: AirPurifier,
  dehumidifier: Dehumidifier,
  whiteboard: Whiteboard,
  monitorStand: MonitorStand,
  coffeeMachine: CoffeeMachine,
  filterCoffee: FilterCoffee,
  walkingPad: WalkingPad,
  projector: Projector,
  gameConsole: GameConsole,
  spinBike: SpinBike,
  padel: Padel,
  massageGun: MassageGun,
};

export type ArtKey = keyof typeof ART;
