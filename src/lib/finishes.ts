/**
 * Per-product material tints.
 *
 * Hunyuan3D's public Space only returns untextured geometry (its texture
 * endpoint is down, and building the CUDA rasteriser locally isn't an option),
 * so every mesh arrives the same clay white. Tinting by product keeps items
 * visually distinct in the scene — you can tell the black mesh chair from the
 * oak desktop from the brushed-aluminium display — without shipping textures.
 *
 * Colours follow each real product's actual finish on monis.rent.
 */

export interface Finish {
  /** Base colour. */
  color: string;
  /** 0 = dielectric, 1 = metal. */
  metalness: number;
  /** 0 = mirror, 1 = fully diffuse. */
  roughness: number;
  /** Emissive colour for screens, so monitors read as switched on. */
  emissive?: string;
  emissiveIntensity?: number;
}

const BLACK_PLASTIC: Finish = {
  color: "#2b3230",
  metalness: 0.15,
  roughness: 0.62,
};

const MESH_FABRIC: Finish = {
  color: "#343c3a",
  metalness: 0.02,
  roughness: 0.92,
};

const ALUMINIUM: Finish = {
  color: "#c4cbc8",
  metalness: 0.78,
  roughness: 0.34,
};

const OAK: Finish = {
  color: "#c08b55",
  metalness: 0.0,
  roughness: 0.72,
};

const DARK_TOP: Finish = {
  color: "#3a3d3b",
  metalness: 0.08,
  roughness: 0.66,
};

export { DARK_TOP };

export const FINISHES: Record<string, Finish> = {
  // Desks — the real Fantech top is dark, but a fully black top swallows the
  // chair silhouette in front of it, so the electric desk gets a lighter
  // graphite top over a pale frame to keep the two readable apart.
  "desk-electric": { color: "#6f7673", metalness: 0.2, roughness: 0.58 },
  "desk-mechanical": OAK,

  // Chair — breathable dark mesh.
  "chair-ergonomic": MESH_FABRIC,
  // Gaming chair — red-accented PU leather.
  "chair-gaming": { color: "#41302f", metalness: 0.1, roughness: 0.58 },

  // Monitors get a faint screen glow so they look powered on.
  "mon-24-fhd": {
    color: "#23282a",
    metalness: 0.3,
    roughness: 0.48,
    emissive: "#2f8672",
    emissiveIntensity: 0.22,
  },
  "mon-27-4k": {
    color: "#23282a",
    metalness: 0.3,
    roughness: 0.48,
    emissive: "#3fa08a",
    emissiveIntensity: 0.26,
  },
  "mon-34-curved": {
    color: "#1f2426",
    metalness: 0.34,
    roughness: 0.44,
    emissive: "#f96f2c",
    emissiveIntensity: 0.3,
  },

  // Desk gear.
  "kb-mx-keys": { color: "#3c4442", metalness: 0.28, roughness: 0.56 },
  "mouse-mx-master": BLACK_PLASTIC,
  "lamp-desk": {
    color: "#e8e4dc",
    metalness: 0.12,
    roughness: 0.5,
    emissive: "#ffd9a8",
    emissiveIntensity: 0.55,
  },

  // Lifestyle.
  nespresso: { color: "#2f3533", metalness: 0.42, roughness: 0.4 },
};

/** Neutral clay for any asset without an explicit finish. */
export const DEFAULT_FINISH: Finish = {
  color: "#d9dcd8",
  metalness: 0.08,
  roughness: 0.7,
};

export function finishFor(productId: string): Finish {
  return FINISHES[productId] ?? DEFAULT_FINISH;
}

export { ALUMINIUM, BLACK_PLASTIC, MESH_FABRIC, OAK };
