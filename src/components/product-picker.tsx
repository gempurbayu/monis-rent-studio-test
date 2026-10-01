"use client";

import { motion } from "framer-motion";
import { PRODUCTS, SLOT_META, WORKSPACE_SLOTS } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { selectQty, useWorkspace } from "@/store/workspace-store";
import { ProductCard } from "@/components/product-card";

/**
 * The sketch's tabbed catalog panel. Tabs carry a count badge so users can see
 * at a glance what they've already placed without scrolling back.
 */
export function ProductPicker() {
  const activeSlot = useWorkspace((s) => s.activeSlot);
  const setActiveSlot = useWorkspace((s) => s.setActiveSlot);
  const setup = useWorkspace((s) => s.setup);

  const products = PRODUCTS.filter((p) => p.slot === activeSlot);
  const meta = SLOT_META[activeSlot];

  return (
    <section aria-label="Product catalog" className="scroll-mt-20">
      {/* Category Tabs: fits all 8 categories seamlessly in 1 line on desktop, smooth horizontal swipe on mobile */}
      <div className="no-scrollbar -mx-4 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {WORKSPACE_SLOTS.map((slot) => {
          const count = PRODUCTS.filter((p) => p.slot === slot).reduce(
            (sum, p) => sum + selectQty(setup, p.id),
            0,
          );
          const active = slot === activeSlot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => setActiveSlot(slot)}
              aria-current={active}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition shadow-2xs",
                active
                  ? "border-ink-900 bg-ink-900 text-white shadow-xs"
                  : "border-sand-300 text-ink-700 hover:border-ink-700 hover:bg-sand-100 bg-white",
              )}
            >
              <span aria-hidden>{SLOT_META[slot].glyph}</span>
              {SLOT_META[slot].label}
              {count > 0 && (
                <span
                  className={cn(
                    "grid size-4 place-items-center rounded-full text-[10px] font-bold",
                    active ? "text-ink-900 bg-white" : "bg-coral-500 text-white",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeSlot}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="mt-4"
      >
        <p className="text-ink-600 mb-3 text-sm">
          {meta.label} ·{" "}
          {activeSlot === "desk" || activeSlot === "chair"
            ? "choose one"
            : "add as many as you like"}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              qty={selectQty(setup, product.id)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
