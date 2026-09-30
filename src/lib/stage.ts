import { PRODUCT_MAP } from "@/data/catalog";
import type { Product, Setup, SetupItem, Slot } from "@/types/workspace";

/**
 * Turns a setup into concrete placements on the isometric stage.
 *
 * Quantities matter visually: two monitors must stand side by side, three
 * plants must fan out — otherwise they stack on one pixel and the preview lies
 * about what you're renting.
 */

export interface Placement {
  /** Stable key so Framer Motion can animate individual copies. */
  key: string;
  product: Product;
  x: number;
  y: number;
  scale: number;
  layer: number;
  /** Mirror the artwork so duplicated items don't look copy-pasted. */
  flip: boolean;
  /** Index within its own product group, used to stagger entry. */
  index: number;
}

/** Width of an item as a percentage of the stage width, before its own scale. */
const BASE_WIDTH: Record<Slot, number> = {
  desk: 58,
  chair: 21,
  monitor: 26,
  lighting: 13,
  peripheral: 17,
  audio: 13,
  comfort: 17,
  lifestyle: 16,
};

/** How far apart duplicated copies sit, in stage-width percent. */
const SPREAD: Record<Slot, number> = {
  desk: 0,
  chair: 0,
  monitor: 22,
  lighting: 18,
  peripheral: 12,
  audio: 14,
  comfort: 11,
  lifestyle: 12,
};

export function stageWidthPercent(product: Product): number {
  return BASE_WIDTH[product.slot] * product.anchor.scale;
}

function placementsFor(item: SetupItem): Placement[] {
  const product = PRODUCT_MAP[item.productId];
  if (!product) return [];

  const { anchor } = product;
  const spread = SPREAD[product.slot];
  const qty = Math.max(1, item.qty);

  // Centre the group on the anchor: one item sits dead on it, two straddle it.
  const start = -((qty - 1) / 2) * spread;

  return Array.from({ length: qty }, (_, i) => {
    const offset = start + i * spread;
    return {
      key: `${product.id}-${i}`,
      product,
      x: clamp(anchor.x + offset, 4, 96),
      // Nudge outer copies back so the group reads as depth, not a flat row.
      y: anchor.y - Math.abs(offset) * 0.06,
      scale: anchor.scale * (1 - Math.abs(offset) * 0.004),
      // Items further from centre sit behind the middle one.
      layer: anchor.layer - Math.abs(offset) * 0.01,
      flip: qty > 1 && i % 2 === 1,
      index: i,
    };
  });
}

export function layoutStage(setup: Setup): Placement[] {
  const items: SetupItem[] = [
    setup.desk,
    setup.chair,
    ...setup.accessories,
  ].filter((i): i is SetupItem => Boolean(i));

  return items
    .flatMap(placementsFor)
    .sort((a, b) => a.layer - b.layer);
}

/**
 * Anything that physically rests on the desktop. Used to show a ghost desk so
 * monitors and keyboards don't float in mid-air before a desk is chosen.
 */
const ON_DESK: Slot[] = ["monitor", "peripheral", "lighting", "audio"];

export function needsGhostDesk(setup: Setup): boolean {
  if (setup.desk) return false;
  return setup.accessories.some((a) =>
    ON_DESK.includes(PRODUCT_MAP[a.productId]?.slot),
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
