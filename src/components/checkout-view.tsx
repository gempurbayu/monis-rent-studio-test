"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, PartyPopper, Truck } from "lucide-react";
import { PRODUCT_MAP } from "@/data/catalog";
import { buildQuote, formatUSD, listSavingsPerWeek } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import { StagePanel } from "@/components/stage-panel";

/**
 * Checkout / summary. Keeps the stage visible next to the line items — the
 * setup you designed is the thing you're buying, so it shouldn't vanish behind
 * a table of SKUs at the last step.
 */
export function CheckoutView() {
  const setup = useWorkspace((s) => s.setup);
  const weeks = useWorkspace((s) => s.weeks);
  const hydrated = useWorkspace((s) => s.hydrated);
  const quote = buildQuote(setup, weeks);
  const savings = listSavingsPerWeek(setup);

  const [placed, setPlaced] = useState(false);

  if (hydrated && quote.itemCount === 0) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-24 text-center">
        <p className="text-ink-900 text-xl font-bold">
          You haven&apos;t designed a setup yet
        </p>
        <p className="text-ink-600 mt-2 text-sm">
          Head back to the studio, pick a desk and a chair, and make it yours.
        </p>
        <Link
          href="/"
          className="bg-ink-900 mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft className="size-4" />
          Back to the studio
        </Link>
      </div>
    );
  }

  if (placed) {
    return <OrderConfirmed weeks={weeks} total={quote.grandTotal} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-ink-600 hover:text-coral-600 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft className="size-4" />
        Keep editing your setup
      </Link>

      <h1 className="text-ink-900 mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Your setup
      </h1>
      <p className="text-ink-600 mt-2 text-sm">
        {quote.itemCount} item{quote.itemCount === 1 ? "" : "s"}, delivered and
        installed in Bali. Cancel or swap anything any time.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <StagePanel setup={setup} readOnly />

          <ul className="border-sand-200 mt-6 divide-sand-200 divide-y rounded-3xl border bg-white">
            {quote.lines.map((line) => {
              const product = PRODUCT_MAP[line.productId];
              return (
                <li
                  key={line.productId}
                  className="flex items-center gap-3 p-3"
                >
                  {product && (
                    <Image
                      src={product.image}
                      alt=""
                      width={56}
                      height={56}
                      className="bg-sand-100 size-14 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-ink-900 truncate text-sm font-semibold">
                      {line.name}
                    </p>
                    <p className="text-ink-600 text-xs">
                      {line.variantLabel ? `${line.variantLabel} · ` : ""}
                      {formatUSD(line.unitPerWeek)}/week
                      {line.qty > 1 ? ` × ${line.qty}` : ""}
                    </p>
                  </div>
                  <p className="text-ink-900 text-sm font-semibold tabular-nums">
                    {formatUSD(line.totalPerWeek)}
                    <span className="text-ink-600 text-xs font-normal">
                      /wk
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border-sand-200 rounded-3xl border bg-white p-5">
            <h2 className="text-ink-900 font-bold">Order summary</h2>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal / week">
                {formatUSD(quote.subtotalPerWeek)}
              </Row>
              {quote.discountRate > 0 && (
                <Row
                  label={`Long-stay discount (${Math.round(quote.discountRate * 100)}%)`}
                  accent
                >
                  −{formatUSD(quote.discountPerWeek)}
                </Row>
              )}
              <Row label="Delivery, setup & pickup" accent>
                Free
              </Row>
              <div className="border-sand-200 border-t pt-2">
                <Row label={`Per week`} bold>
                  {formatUSD(quote.totalPerWeek)}
                </Row>
              </div>
            </dl>

            <div className="bg-sand-100 mt-4 rounded-2xl p-3">
              <p className="text-ink-600 text-xs">
                Total for {weeks} week{weeks === 1 ? "" : "s"}
              </p>
              <p className="text-ink-900 text-2xl font-bold tracking-tight">
                {formatUSD(quote.grandTotal)}
              </p>
              {savings > 0 && (
                <p className="text-teal-500 mt-1 text-xs font-semibold">
                  Includes {formatUSD(savings * weeks)} of current deals
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPlaced(true)}
              className="bg-coral-500 hover:bg-coral-600 mt-4 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgb(249_111_44/0.7)] transition"
            >
              Confirm rental
            </button>

            <ul className="text-ink-600 mt-4 space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Truck className="size-3.5 shrink-0" />
                Delivered and installed by the Monis team
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0" />
                Swap or return items any time
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  accent,
  bold,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={accent ? "text-teal-500" : "text-ink-600"}>{label}</dt>
      <dd
        className={
          bold
            ? "text-ink-900 text-base font-bold tabular-nums"
            : accent
              ? "text-teal-500 font-semibold tabular-nums"
              : "text-ink-900 font-medium tabular-nums"
        }
      >
        {children}
      </dd>
    </div>
  );
}

function OrderConfirmed({
  weeks,
  total,
}: {
  weeks: number;
  total: number;
}) {
  const reset = useWorkspace((s) => s.reset);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-lg px-4 py-24 text-center"
    >
      <span className="bg-teal-400/15 text-teal-500 mx-auto grid size-16 place-items-center rounded-3xl">
        <PartyPopper className="size-8" />
      </span>
      <h1 className="text-ink-900 mt-6 text-3xl font-bold tracking-tight">
        Your office is on its way
      </h1>
      <p className="text-ink-600 mt-3 text-sm">
        {formatUSD(total)} for {weeks} week{weeks === 1 ? "" : "s"}. The Monis
        team will message you to agree a delivery slot — usually same day in
        Canggu, Ubud and Seminyak.
      </p>
      <Link
        href="/"
        onClick={() => reset()}
        className="bg-ink-900 mt-8 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white"
      >
        Design another setup
      </Link>
    </motion.div>
  );
}
