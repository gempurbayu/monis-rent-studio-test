"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatUSD, listSavingsPerWeek, WEEK_OPTIONS } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import type { Quote, Setup } from "@/types/workspace";

interface SummaryPanelProps {
  setup: Setup;
  quote: Quote;
}

/**
 * Running total beside the stage. Duration lives here rather than at checkout:
 * in a rental, "how long" is part of designing the setup, not an afterthought.
 */
export function SummaryPanel({ setup, quote }: SummaryPanelProps) {
  const weeks = useWorkspace((s) => s.weeks);
  const setWeeks = useWorkspace((s) => s.setWeeks);

  const savings = listSavingsPerWeek(setup);
  const missingBase = !setup.desk || !setup.chair;
  const ready = quote.itemCount > 0 && !missingBase;

  return (
    <div className="border-sand-200 rounded-3xl border bg-white p-4 shadow-[0_18px_40px_-32px_rgb(16_35_31/0.45)]">
      <div>
        <p className="text-ink-600 text-xs font-semibold tracking-wide uppercase">
          Rental length
        </p>
        <div className="bg-sand-100 mt-2 grid grid-cols-4 gap-1 rounded-2xl p-1">
          {WEEK_OPTIONS.map((o) => (
            <button
              key={o.weeks}
              type="button"
              onClick={() => setWeeks(o.weeks)}
              aria-pressed={o.weeks === weeks}
              className={cn(
                "rounded-xl px-1 py-2 text-[11px] font-semibold transition",
                o.weeks === weeks
                  ? "bg-ink-900 text-white shadow"
                  : "text-ink-700 hover:bg-white",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {quote.discountRate > 0 && quote.itemCount > 0 && (
          <p className="text-teal-700 mt-1.5 text-[11px] font-semibold flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-teal-600" />
            Long-stay discount {Math.round(quote.discountRate * 100)}% applied
          </p>
        )}
      </div>

      <div className="border-sand-200 mt-4 border-t pt-4">
        <div className="flex items-end justify-between">
          <div>
            <motion.p
              key={quote.totalPerWeek}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-ink-900 text-3xl font-bold tracking-tight"
            >
              {formatUSD(quote.totalPerWeek)}
              <span className="text-ink-600 text-sm font-medium"> /week</span>
            </motion.p>
            <p className="text-ink-600 text-xs">
              {quote.itemCount} item{quote.itemCount === 1 ? "" : "s"} ·{" "}
              {formatUSD(quote.grandTotal)} for {weeks} week
              {weeks === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {savings > 0 && quote.itemCount > 0 && (
          <p className="bg-teal-50 border border-teal-200/80 text-teal-800 mt-3 rounded-xl px-3 py-2 text-xs font-semibold">
            You&apos;re saving {formatUSD(savings)}/week on current deals
          </p>
        )}

        <p className="text-ink-600 mt-3 flex items-center gap-1.5 text-[11px]">
          <Truck className="size-3.5 shrink-0 text-teal-700" />
          Free delivery, setup and pickup across Bali
        </p>
      </div>

      <div className="mt-4">
        {ready ? (
          <Link
            href="/checkout"
            className="bg-coral-500 hover:bg-coral-600 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgb(249_111_44/0.7)] transition active:scale-[0.99]"
          >
            Rent your setup
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        ) : (
          <div>
            <button
              type="button"
              disabled
              className="bg-sand-100 border border-sand-300 text-ink-400 w-full cursor-not-allowed rounded-2xl px-4 py-3.5 text-sm font-bold"
            >
              Rent your setup
            </button>
            <p className="text-ink-500 mt-2 text-center text-[11px]">
              {quote.itemCount === 0
                ? "Add a desk and a chair to continue"
                : !setup.desk
                  ? "Pick a desk to continue"
                  : "Pick a chair to continue"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
