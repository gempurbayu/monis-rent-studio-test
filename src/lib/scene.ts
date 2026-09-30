import { PRODUCT_MAP } from "@/data/catalog";
import type { Setup, SetupItem, Slot } from "@/types/workspace";

/**
 * Scene layout in metres.
 *
 * Assets are normalised by the asset pipeline to sit on y=0, centred in x/z,
 * scaled to their real-world height — so placement here is physical
 * measurement, not per-item magic numbers. Desk height is the reference: items
 * that belong on the desktop get y = DESK_TOP.
 */

/**
 * Measured desk-top heights, in metres, from the generated meshes.
 *
 * The scene can't ask the GPU how tall the desk is before deciding where the
 * monitor goes, so these come from the asset pipeline's manifest (the y-extent
 * each mesh was normalised to). Keeping them here means "on the desk" is a
 * measurement rather than a guess, and items re-seat themselves when you swap
 * a desk instead of floating at a fixed height.
 */
const DESK_TOPS: Record<string, number> = {
  "desk-electric": 0.74,
  "desk-mechanical": 0.68,
};

/** Fallback desk height when no desk is chosen or it has no mesh. */
export const DESK_TOP = 0.74;

function deskTopFor(setup: Setup): number {
  const id = setup.desk?.productId;
  if (!id) return 0;
  return DESK_TOPS[id] ?? DESK_TOP;
}

/** Desktop depth available in front of the monitors, in metres. */
const DESK_DEPTH = 0.62;

export interface Placement {
  /** Stable key so React can reconcile individual copies. */
  key: string;
  productId: string;
  /** Model URL, or null when no 3D asset exists for this product. */
  url: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  /** Extra scale on top of the asset's own real-world size. */
  scale: number;
  /** Entry animation stagger, in seconds. */
  delay: number;
}

/** Products with a generated .glb in /public/models. */
const MODELS = new Set([
  "desk-electric",
  "desk-mechanical",
  "chair-ergonomic",
  "chair-gaming",
  "mon-24-fhd",
  "mon-27-4k",
  "mon-34-curved",
  "kb-mx-keys",
  "mouse-mx-master",
  "lamp-desk",
  "nespresso",
]);

export function modelUrl(productId: string): string | null {
  return MODELS.has(productId) ? `/models/${productId}.glb` : null;
}

export function hasModel(productId: string): boolean {
  return MODELS.has(productId);
}

/** Base position per slot, before per-copy spreading. */
const SLOT_LAYOUT: Record<
  Slot,
  { pos: [number, number, number]; spread: number; rotY: number }
> = {
  // Desk and chair define the room. +z is toward the camera, so the chair
  // sits in front of the desk (at positive z), facing the desk and monitors.
  desk: { pos: [0, 0, 0], spread: 0, rotY: 0 },
  chair: { pos: [0, 0, 0.6], spread: 0, rotY: -Math.PI / 2 },
  // On the desktop, back edge.
  monitor: { pos: [0, DESK_TOP, -0.18], spread: 0.62, rotY: 0 },
  // On the desktop, front edge.
  peripheral: { pos: [0, DESK_TOP, 0.16], spread: 0.3, rotY: 0 },
  lighting: { pos: [0.46, DESK_TOP, -0.16], spread: 0.3, rotY: -0.5 },
  audio: { pos: [-0.5, DESK_TOP, -0.12], spread: 0.28, rotY: 0.4 },
  // On the floor, beside the desk.
  comfort: { pos: [0.95, 0, -0.1], spread: 0.45, rotY: 0.3 },
  // Lifestyle items are deliberately off-desk — they're the "outside work"
  // part of the rental — but they sit close enough to read as one setup.
  lifestyle: { pos: [-0.95, 0, -0.1], spread: 0.45, rotY: 0.3 },
};

/** Items that sit on the desktop and must sink to the floor without one. */
const ON_DESK: Slot[] = ["monitor", "peripheral", "lighting", "audio"];

/**
 * Nudges for individual products whose ideal spot differs from its slot
 * default — the keyboard belongs dead centre, the mouse to its right.
 */
const OVERRIDES: Record<string, Partial<{ x: number; z: number; rotY: number }>> = {
  "kb-mx-keys": { x: -0.04, z: 0.16 },
  "mouse-mx-master": { x: 0.3, z: 0.17 },
  // The lamp is 0.38 m wide, so anything past x≈0.41 hangs off a 1.2 m desk.
  "lamp-desk": { x: 0.39, z: -0.1 },
  nespresso: { x: -0.95, z: -0.1, rotY: 0.3 },
};

function placementsFor(item: SetupItem, deskTop: number): Placement[] {
  const product = PRODUCT_MAP[item.productId];
  if (!product) return [];

  const layout = SLOT_LAYOUT[product.slot];
  const qty = Math.max(1, item.qty);
  const override = OVERRIDES[product.id] ?? {};

  // Desktop items sit on whichever desk is chosen, and drop to the floor when
  // there's no desk at all, rather than floating in mid-air.
  const onDesk = ON_DESK.includes(product.slot);
  const baseY = onDesk ? deskTop : layout.pos[1];

  const start = -((qty - 1) / 2) * layout.spread;

  return Array.from({ length: qty }, (_, i) => {
    const offset = start + i * layout.spread;
    const x = (override.x ?? layout.pos[0]) + offset;
    // Fan duplicates slightly forward so they don't hide behind each other.
    const z = (override.z ?? layout.pos[2]) + Math.abs(offset) * 0.12;
    // Angle copies inward, the way people actually arrange dual monitors.
    const rotY = (override.rotY ?? layout.rotY) - offset * 0.45;

    return {
      key: `${product.id}-${i}`,
      productId: product.id,
      url: modelUrl(product.id),
      position: [x, baseY, z] as [number, number, number],
      rotation: [0, rotY, 0] as [number, number, number],
      scale: 1,
      delay: i * 0.06,
    };
  });
}

export function layoutScene(setup: Setup): Placement[] {
  const deskTop = deskTopFor(setup);
  const items: SetupItem[] = [
    setup.desk,
    setup.chair,
    ...setup.accessories,
  ].filter((i): i is SetupItem => Boolean(i));

  return items.flatMap((item) => placementsFor(item, deskTop));
}

/** Widest x-extent of the current setup, so the camera can frame it. */
export function sceneRadius(setup: Setup): number {
  const placements = layoutScene(setup);
  if (placements.length === 0) return 1.6;
  const maxX = Math.max(...placements.map((p) => Math.abs(p.position[0])));
  return Math.max(1.6, maxX + 0.9);
}

export { DESK_DEPTH };
