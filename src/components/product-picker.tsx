"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (offset: number) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const products = PRODUCTS.filter((p) => p.slot === activeSlot);
  const meta = SLOT_META[activeSlot];

  return (
    <section aria-label="Product catalog" className="scroll-mt-20">
      <div className="relative flex items-center">
        {/* Left scroll chevron */}
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollTabs(-220)}
          className="hidden sm:grid absolute -left-3 z-10 size-7 place-items-center rounded-full border border-sand-300 bg-white/95 text-ink-700 shadow-sm hover:bg-sand-100 hover:text-ink-950 transition"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Tab row */}
        <div
          ref={tabsRef}
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-2 sm:mx-0 sm:px-1 scroll-smooth"
        >
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
                  "relative flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition shadow-2xs",
                  active
                    ? "border-teal-900 bg-teal-900 text-white shadow-xs"
                    : "border-sand-300 text-ink-700 hover:border-teal-500 hover:bg-teal-50/40 bg-white",
                )}
              >
                <span aria-hidden>{SLOT_META[slot].glyph}</span>
                {SLOT_META[slot].label}
                {count > 0 && (
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-full text-[10px] font-bold",
                      active ? "text-teal-900 bg-white" : "bg-coral-500 text-white",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right scroll chevron */}
        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollTabs(220)}
          className="hidden sm:grid absolute -right-3 z-10 size-7 place-items-center rounded-full border border-sand-300 bg-white/95 text-ink-700 shadow-sm hover:bg-sand-100 hover:text-ink-950 transition"
        >
          <ChevronRight className="size-4" />
        </button>
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
