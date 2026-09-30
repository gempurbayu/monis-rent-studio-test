"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { PRODUCT_MAP, PRODUCTS, SLOT_META } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/pricing";
import { selectQty, useWorkspace } from "@/store/workspace-store";
import type { Slot } from "@/types/workspace";

/** Slots surfaced as quick-add rails beside the stage, per the sketch. */
const RAIL_SLOTS: Slot[] = ["monitor", "lighting", "comfort", "peripheral"];

/**
 * The sketch's right-hand column: dashed empty slots that fill in as you add
 * things, each with a one-tap "+ Add Monitor!"-style button. Gives the stage a
 * legend and a fast path that doesn't require hunting through tabs.
 */
export function SlotRail() {
  const setup = useWorkspace((s) => s.setup);
  const addAccessory = useWorkspace((s) => s.addAccessory);
  const removeAccessory = useWorkspace((s) => s.removeAccessory);
  const setActiveSlot = useWorkspace((s) => s.setActiveSlot);

  return (
    <div className="space-y-3">
      {RAIL_SLOTS.map((slot) => {
        const meta = SLOT_META[slot];
        const placed = setup.accessories.filter(
          (a) => PRODUCT_MAP[a.productId]?.slot === slot,
        );
        // Cheapest item in the slot — the sensible one-tap default.
        const suggestion = PRODUCTS.filter((p) => p.slot === slot).sort(
          (a, b) => a.pricePerWeek - b.pricePerWeek,
        )[0];

        return (
          <div key={slot}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-ink-700 flex items-center gap-1.5 text-xs font-semibold">
                <span aria-hidden>{meta.glyph}</span>
                {meta.label}
              </span>
              <button
                type="button"
                onClick={() => setActiveSlot(slot)}
                className="text-ink-600 hover:text-coral-600 text-[11px] font-medium underline-offset-2 hover:underline"
              >
                Browse
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {placed.flatMap((item) => {
                  const product = PRODUCT_MAP[item.productId];
                  if (!product) return [];
                  return [
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="group border-coral-500/60 bg-coral-400/5 relative flex items-center gap-1.5 rounded-xl border py-1 pr-2 pl-1"
                    >
                      <Image
                        src={product.image}
                        alt=""
                        width={28}
                        height={28}
                        className="bg-sand-100 size-7 rounded-lg object-cover"
                      />
                      <span className="text-ink-900 max-w-24 truncate text-[11px] font-medium">
                        {product.name}
                      </span>
                      {item.qty > 1 && (
                        <span className="bg-coral-500 rounded-full px-1.5 text-[10px] font-bold text-white">
                          ×{item.qty}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAccessory(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="text-ink-600 hover:text-coral-600 ml-0.5"
                      >
                        <X className="size-3" strokeWidth={3} />
                      </button>
                    </motion.div>,
                  ];
                })}
              </AnimatePresence>

              {suggestion && selectQty(setup, suggestion.id) === 0 && (
                <button
                  type="button"
                  onClick={() => addAccessory(suggestion.id)}
                  className={cn(
                    "border-sand-300 text-ink-600 hover:border-coral-500 hover:text-coral-600 flex items-center gap-1 rounded-xl border border-dashed px-2.5 py-2 text-[11px] font-medium transition",
                  )}
                >
                  <Plus className="size-3" strokeWidth={3} />
                  {meta.emptyHint}
                  <span className="text-ink-600/60">
                    {formatUSD(suggestion.pricePerWeek)}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
