/**
 * Domain model for the workspace configurator.
 *
 * A "setup" is one desk + one chair + N accessories, priced per week.
 * Everything the UI renders derives from this shape so the catalog can later
 * be swapped for the real monis.rent CMS without touching components.
 */

export type Slot =
  | "desk"
  | "chair"
  | "monitor"
  | "lighting"
  | "audio"
  | "peripheral"
  | "comfort"
  | "lifestyle";

export type Zone = "workspace" | "lifestyle";

export interface ProductVariant {
  id: string;
  label: string;
  /** Weekly price delta applied on top of the base price, in USD. */
  priceDelta: number;
  /** Live stock note from monis.rent, e.g. "Only 2 left". */
  stock?: string;
}

export interface Product {
  id: string;
  name: string;
  /** Short, human line for cards — not the raw spec dump. */
  tagline: string;
  slot: Slot;
  zone: Zone;
  /** Weekly rental price in USD. */
  pricePerWeek: number;
  /** Original price when discounted, for strike-through display. */
  listPricePerWeek?: number;
  /** Real product photography — catalog cards only. */
  image: string;
  /** Key into the stage art registry (`src/components/art/stage-art.tsx`). */
  art: string;
  badges?: string[];
  variants?: ProductVariant[];
  /** How many of this item a user may stack into one setup. */
  maxQty: number;
  /** Where the item lands on the isometric desk scene. */
  anchor: StageAnchor;
}

/** Placement hint for the isometric stage, in percentages of the stage box. */
export interface StageAnchor {
  x: number;
  y: number;
  scale: number;
  /** Paint order — higher sits in front. */
  layer: number;
}

export interface SetupItem {
  productId: string;
  qty: number;
  variantId?: string;
}

export interface Setup {
  desk: SetupItem | null;
  chair: SetupItem | null;
  accessories: SetupItem[];
}

export type RentalWeeks = 1 | 4 | 12 | 24;

export interface PriceLine {
  productId: string;
  name: string;
  qty: number;
  variantLabel?: string;
  unitPerWeek: number;
  totalPerWeek: number;
}

export interface Quote {
  lines: PriceLine[];
  subtotalPerWeek: number;
  /** Long-stay discount rate, 0–1. */
  discountRate: number;
  discountPerWeek: number;
  totalPerWeek: number;
  weeks: RentalWeeks;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
}

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  glyph: string;
  setup: Setup;
}
