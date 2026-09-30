"use client";

import Image from "next/image";
import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import type { Product } from "@/types/workspace";

interface ProductCardProps {
  product: Product;
  qty: number;
}

/**
 * One catalog item. Desks and chairs behave as a single-choice radio (the
 * sketch's tabbed left panel); everything else is a quantity stepper, because
 * "two monitors" is a real thing people want.
 */
export function ProductCard({ product, qty }: ProductCardProps) {
  const chooseBase = useWorkspace((s) => s.chooseBase);
  const addAccessory = useWorkspace((s) => s.addAccessory);
  const setQty = useWorkspace((s) => s.setQty);
  const setVariant = useWorkspace((s) => s.setVariant);
  const setup = useWorkspace((s) => s.setup);

  const isBase = product.slot === "desk" || product.slot === "chair";
  const selected = qty > 0;
  const atMax = qty >= product.maxQty;

  const activeVariantId = isBase
    ? setup[product.slot as "desk" | "chair"]?.variantId
    : setup.accessories.find((a) => a.productId === product.id)?.variantId;

  function primaryAction() {
    if (isBase) chooseBase(product.slot as "desk" | "chair", product.id);
    else if (!atMax) addAccessory(product.id);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition",
        selected
          ? "border-coral-500 shadow-[0_0_0_3px_rgb(249_111_44/0.15)]"
          : "border-sand-200 hover:border-sand-300 hover:shadow-md",
      )}
    >
      <button
        type="button"
        onClick={primaryAction}
        disabled={!isBase && atMax}
        aria-pressed={selected}
        className="focus-visible:ring-coral-500 flex flex-1 flex-col text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none disabled:cursor-default"
      >
        <div className="bg-sand-100 relative aspect-4/3 w-full overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                    b.startsWith("-")
                      ? "bg-coral-500 text-white"
                      : "text-ink-800 bg-white/90",
                  )}
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          {selected && (
            <span className="bg-coral-500 absolute top-2 right-2 grid size-6 place-items-center rounded-full text-white shadow">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <p className="text-ink-900 text-sm leading-snug font-semibold">
            {product.name}
          </p>
          <p className="text-ink-600 mt-1 line-clamp-2 flex-1 text-xs">
            {product.tagline}
          </p>

          <p className="mt-2 flex items-baseline gap-1.5">
            {product.listPricePerWeek && (
              <span className="text-ink-600/60 text-xs line-through">
                {formatUSD(product.listPricePerWeek)}
              </span>
            )}
            <span className="text-ink-900 text-base font-bold">
              {formatUSD(product.pricePerWeek)}
            </span>
            <span className="text-ink-600 text-xs">/week</span>
          </p>
        </div>
      </button>

      {/* Size / variant picker */}
      {selected && product.variants && (
        <div className="border-sand-200 flex gap-1 border-t px-3 py-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(product.id, v.id)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1 text-[11px] font-medium transition",
                v.id === activeVariantId
                  ? "bg-ink-900 text-white"
                  : "bg-sand-100 text-ink-700 hover:bg-sand-200",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Quantity stepper for stackable accessories */}
      {selected && !isBase && product.maxQty > 1 && (
        <div className="border-sand-200 flex items-center justify-between border-t px-3 py-2">
          <span className="text-ink-600 text-xs font-medium">Quantity</span>
          <div className="flex items-center gap-1">
            <StepBtn
              label={`Remove one ${product.name}`}
              onClick={() => setQty(product.id, qty - 1)}
            >
              <Minus className="size-3.5" strokeWidth={2.5} />
            </StepBtn>
            <span className="text-ink-900 w-5 text-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
            <StepBtn
              label={`Add one ${product.name}`}
              disabled={atMax}
              onClick={() => setQty(product.id, qty + 1)}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
            </StepBtn>
          </div>
        </div>
      )}

      {selected && !isBase && product.maxQty === 1 && (
        <button
          type="button"
          onClick={() => setQty(product.id, 0)}
          className="border-sand-200 text-ink-600 hover:text-coral-600 border-t px-3 py-2 text-xs font-medium"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function StepBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="border-sand-300 text-ink-700 hover:border-ink-900 hover:bg-ink-900 grid size-6 place-items-center rounded-full border transition hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
    >
      {children}
    </button>
  );
}
