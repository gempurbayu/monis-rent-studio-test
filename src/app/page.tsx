"use client";

import Image from "next/image";
import { PRESETS, PRODUCTS } from "@/data/catalog";
import { buildQuote, formatUSD, WEEK_OPTIONS } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";

/**
 * Temporary scaffold-verification page. Renders the catalog, exercises every
 * store mutation and the quote engine so the foundation is proven before the
 * real configurator UI replaces this.
 */
export default function ScaffoldCheckPage() {
  const setup = useWorkspace((s) => s.setup);
  const weeks = useWorkspace((s) => s.weeks);
  const setWeeks = useWorkspace((s) => s.setWeeks);
  const chooseBase = useWorkspace((s) => s.chooseBase);
  const toggleAccessory = useWorkspace((s) => s.toggleAccessory);
  const applyPreset = useWorkspace((s) => s.applyPreset);
  const reset = useWorkspace((s) => s.reset);

  const quote = buildQuote(setup, weeks);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-ink-900 text-3xl font-semibold tracking-tight">
        Monis Studio — scaffold check
      </h1>
      <p className="text-ink-600 mt-2 text-sm">
        {PRODUCTS.length} products loaded · store + pricing wired
      </p>

      <section className="mt-8 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className="border-sand-300 bg-sand-100 hover:border-coral-500 rounded-full border px-4 py-2 text-sm"
          >
            {p.glyph} {p.name}
          </button>
        ))}
        <button
          onClick={reset}
          className="border-sand-300 rounded-full border px-4 py-2 text-sm"
        >
          Reset
        </button>
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        {WEEK_OPTIONS.map((o) => (
          <button
            key={o.weeks}
            onClick={() => setWeeks(o.weeks)}
            className={
              o.weeks === weeks
                ? "bg-ink-900 rounded-full px-4 py-2 text-sm text-white"
                : "border-sand-300 rounded-full border px-4 py-2 text-sm"
            }
          >
            {o.label}
          </button>
        ))}
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => {
          const isBase = p.slot === "desk" || p.slot === "chair";
          const active =
            setup.desk?.productId === p.id ||
            setup.chair?.productId === p.id ||
            setup.accessories.some((a) => a.productId === p.id);
          return (
            <button
              key={p.id}
              onClick={() =>
                isBase
                  ? chooseBase(p.slot as "desk" | "chair", p.id)
                  : toggleAccessory(p.id)
              }
              className={`flex gap-3 rounded-2xl border p-3 text-left transition ${
                active
                  ? "border-coral-500 bg-coral-400/10"
                  : "border-sand-300 bg-white"
              }`}
            >
              <Image
                src={p.image}
                alt={p.name}
                width={64}
                height={64}
                className="bg-sand-100 size-16 shrink-0 rounded-xl object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {p.name}
                </span>
                <span className="text-ink-600 block text-xs">
                  {p.slot} · {formatUSD(p.pricePerWeek)}/wk
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <section className="border-sand-300 mt-10 rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">
          Quote — {quote.itemCount} items, {quote.weeks} week(s)
        </h2>
        <ul className="mt-3 space-y-1 text-sm">
          {quote.lines.map((l) => (
            <li key={l.productId} className="flex justify-between">
              <span>
                {l.qty}× {l.name}
                {l.variantLabel ? ` (${l.variantLabel})` : ""}
              </span>
              <span className="font-mono">{formatUSD(l.totalPerWeek)}/wk</span>
            </li>
          ))}
          {quote.lines.length === 0 && (
            <li className="text-ink-600">Nothing selected yet.</li>
          )}
        </ul>
        <div className="border-sand-200 mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal / week</span>
            <span className="font-mono">
              {formatUSD(quote.subtotalPerWeek)}
            </span>
          </div>
          <div className="text-teal-500 flex justify-between">
            <span>Long-stay discount ({quote.discountRate * 100}%)</span>
            <span className="font-mono">
              −{formatUSD(quote.discountPerWeek)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total for {quote.weeks} week(s)</span>
            <span className="font-mono">{formatUSD(quote.grandTotal)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
