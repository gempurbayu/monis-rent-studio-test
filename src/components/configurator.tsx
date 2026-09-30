"use client";

import { buildQuote } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import { PresetBar } from "@/components/preset-bar";
import { ProductPicker } from "@/components/product-picker";
import { SlotRail } from "@/components/slot-rail";
import { SummaryPanel } from "@/components/summary-panel";
import { StagePanel } from "@/components/stage-panel";

/**
 * The configurator. Layout puts the stage and the running total in a sticky
 * column so the preview never scrolls out of view while you browse — the whole
 * point is watching the setup change as you pick.
 */
export function Configurator() {
  const setup = useWorkspace((s) => s.setup);
  const weeks = useWorkspace((s) => s.weeks);
  const quote = buildQuote(setup, weeks);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Stage + catalog */}
        <div className="min-w-0">
          <PresetBar />

          <div className="mt-4">
            <StagePanel setup={setup} />
          </div>

          {/* Quick-add rails — mobile shows them under the stage */}
          <div className="border-sand-200 mt-5 rounded-3xl border bg-white p-4 lg:hidden">
            <SlotRail />
          </div>

          <div className="mt-8">
            <ProductPicker />
          </div>
        </div>

        {/* Sticky side column */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4">
            <SummaryPanel setup={setup} quote={quote} />

            <div className="border-sand-200 hidden rounded-3xl border bg-white p-4 lg:block">
              <p className="text-ink-600 mb-3 text-xs font-semibold tracking-wide uppercase">
                Quick add
              </p>
              <SlotRail />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
