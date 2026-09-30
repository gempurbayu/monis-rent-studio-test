import { PRODUCT_MAP } from "@/data/catalog";
import type {
  PriceLine,
  Quote,
  RentalWeeks,
  Setup,
  SetupItem,
} from "@/types/workspace";

/** Long-stay discounts — the longer you commit, the cheaper per week. */
export const WEEK_OPTIONS: { weeks: RentalWeeks; label: string }[] = [
  { weeks: 1, label: "1 week" },
  { weeks: 4, label: "1 month" },
  { weeks: 12, label: "3 months" },
  { weeks: 24, label: "6 months" },
];

const DISCOUNT_BY_WEEKS: Record<RentalWeeks, number> = {
  1: 0,
  4: 0.05,
  12: 0.12,
  24: 0.2,
};

export const DELIVERY_FEE = 0;

export function discountRateFor(weeks: RentalWeeks): number {
  return DISCOUNT_BY_WEEKS[weeks] ?? 0;
}

export function unitPrice(item: SetupItem): number {
  const product = PRODUCT_MAP[item.productId];
  if (!product) return 0;
  const variant = product.variants?.find((v) => v.id === item.variantId);
  return product.pricePerWeek + (variant?.priceDelta ?? 0);
}

export function allItems(setup: Setup): SetupItem[] {
  return [setup.desk, setup.chair, ...setup.accessories].filter(
    (i): i is SetupItem => Boolean(i),
  );
}

function toLine(item: SetupItem): PriceLine | null {
  const product = PRODUCT_MAP[item.productId];
  if (!product) return null;
  const variant = product.variants?.find((v) => v.id === item.variantId);
  const unit = unitPrice(item);
  return {
    productId: product.id,
    name: product.name,
    qty: item.qty,
    variantLabel: variant?.label,
    unitPerWeek: unit,
    totalPerWeek: round2(unit * item.qty),
  };
}

export function buildQuote(setup: Setup, weeks: RentalWeeks): Quote {
  const lines = allItems(setup)
    .map(toLine)
    .filter((l): l is PriceLine => Boolean(l));

  const subtotalPerWeek = round2(
    lines.reduce((sum, l) => sum + l.totalPerWeek, 0),
  );
  const discountRate = discountRateFor(weeks);
  const discountPerWeek = round2(subtotalPerWeek * discountRate);
  const totalPerWeek = round2(subtotalPerWeek - discountPerWeek);

  return {
    lines,
    subtotalPerWeek,
    discountRate,
    discountPerWeek,
    totalPerWeek,
    weeks,
    deliveryFee: DELIVERY_FEE,
    grandTotal: round2(totalPerWeek * weeks + DELIVERY_FEE),
    itemCount: lines.reduce((sum, l) => sum + l.qty, 0),
  };
}

/** Savings vs. the undiscounted list prices, used for the "you save" nudge. */
export function listSavingsPerWeek(setup: Setup): number {
  return round2(
    allItems(setup).reduce((sum, item) => {
      const product = PRODUCT_MAP[item.productId];
      if (!product?.listPricePerWeek) return sum;
      return sum + (product.listPricePerWeek - product.pricePerWeek) * item.qty;
    }, 0),
  );
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatUSD(n: number): string {
  const rounded = round2(n);
  return Number.isInteger(rounded)
    ? `$${rounded}`
    : `$${rounded.toFixed(2)}`;
}
