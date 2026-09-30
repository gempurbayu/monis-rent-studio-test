"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, MapPin, PartyPopper, Phone, Truck, User } from "lucide-react";
import { PRODUCT_MAP } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { WEEK_OPTIONS, buildQuote, formatUSD, listSavingsPerWeek } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import { StagePanel } from "@/components/stage-panel";
import type { RentalWeeks } from "@/types/workspace";

const BALI_AREAS = [
  "Canggu & Berawa",
  "Pererenan",
  "Seminyak & Kerobokan",
  "Ubud",
  "Uluwatu & Bingin",
  "Sanur",
];

export function CheckoutView() {
  const setup = useWorkspace((s) => s.setup);
  const weeks = useWorkspace((s) => s.weeks);
  const setWeeks = useWorkspace((s) => s.setWeeks);
  const quote = buildQuote(setup, weeks);
  const savings = listSavingsPerWeek(setup);

  const [placed, setPlaced] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState(BALI_AREAS[0]);
  const [deliveryDate, setDeliveryDate] = useState("");

  if (quote.itemCount === 0) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-sand-100 text-ink-500">
          <Truck className="size-8 text-teal-700" />
        </div>
        <p className="text-ink-900 mt-6 text-xl font-bold">
          You haven&apos;t designed a setup yet
        </p>
        <p className="text-ink-600 mt-2 text-sm">
          Head back to the studio, pick a desk and a chair, and make it yours.
        </p>
        <Link
          href="/"
          className="bg-teal-800 hover:bg-teal-900 mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm transition"
        >
          <ArrowLeft className="size-4" />
          Back to the studio
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <OrderConfirmed
        weeks={weeks}
        total={quote.grandTotal}
        name={name}
        area={area}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-ink-600 hover:text-teal-700 inline-flex items-center gap-1.5 text-sm font-medium transition"
      >
        <ArrowLeft className="size-4" />
        Keep editing your setup
      </Link>

      <h1 className="text-ink-900 mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Complete your workspace rental
      </h1>
      <p className="text-ink-600 mt-1.5 text-sm">
        {quote.itemCount} item{quote.itemCount === 1 ? "" : "s"} · White-glove delivery & installation anywhere in Bali.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-6">
          <StagePanel setup={setup} readOnly />

          {/* Delivery Details Form */}
          <div className="rounded-3xl border border-sand-200 bg-white p-5 shadow-xs">
            <h2 className="text-ink-900 text-base font-bold flex items-center gap-2">
              <MapPin className="size-4 text-teal-700" />
              Delivery & Contact Info (Bali)
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-ink-700 block text-xs font-semibold mb-1">
                  Full name
                </label>
                <div className="relative">
                  <User className="text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 size-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Hansen"
                    className="w-full rounded-xl border border-sand-300 py-2 pl-9 pr-3 text-xs text-ink-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-ink-700 block text-xs font-semibold mb-1">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 size-4" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="w-full rounded-xl border border-sand-300 py-2 pl-9 pr-3 text-xs text-ink-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-ink-700 block text-xs font-semibold mb-1">
                  Delivery Area
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl border border-sand-300 bg-white py-2 px-3 text-xs text-ink-900 focus:border-teal-600 focus:outline-hidden"
                >
                  {BALI_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-ink-700 block text-xs font-semibold mb-1">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full rounded-xl border border-sand-300 py-1.5 px-3 text-xs text-ink-900 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Configured Item List */}
          <ul className="border-sand-200 divide-sand-200 divide-y rounded-3xl border bg-white shadow-xs">
            {quote.lines.map((line) => {
              const product = PRODUCT_MAP[line.productId];
              return (
                <li
                  key={line.productId}
                  className="flex items-center gap-3 p-3.5"
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

        {/* Sidebar Summary */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border-sand-200 rounded-3xl border bg-white p-5 shadow-xs">
            <h2 className="text-ink-900 font-bold">Rental duration</h2>

            {/* Duration selector */}
            <div className="bg-sand-100 mt-3 grid grid-cols-4 gap-1 rounded-2xl p-1">
              {WEEK_OPTIONS.map((o) => (
                <button
                  key={o.weeks}
                  type="button"
                  onClick={() => setWeeks(o.weeks)}
                  className={cn(
                    "rounded-xl py-1.5 text-center text-xs font-bold transition",
                    weeks === o.weeks
                      ? "bg-teal-800 text-white shadow-2xs"
                      : "text-ink-700 hover:bg-white",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <dl className="mt-5 space-y-2 text-sm">
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
              <Row label="White-glove setup & delivery" accent>
                Free
              </Row>
              <div className="border-sand-200 border-t pt-2">
                <Row label={`Per week`} bold>
                  {formatUSD(quote.totalPerWeek)}
                </Row>
              </div>
            </dl>

            <div className="bg-sand-50 border border-sand-200 mt-4 rounded-2xl p-3.5">
              <p className="text-ink-600 text-xs font-medium">
                Total for {weeks} week{weeks === 1 ? "" : "s"}
              </p>
              <p className="text-ink-900 text-2xl font-bold tracking-tight">
                {formatUSD(quote.grandTotal)}
              </p>
              {savings > 0 && (
                <p className="text-teal-700 mt-1 text-xs font-semibold">
                  Includes {formatUSD(savings * weeks)} in package deals
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPlaced(true)}
              className="bg-coral-500 hover:bg-coral-600 active:scale-[0.99] mt-4 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgb(249_111_44/0.7)] transition"
            >
              Confirm rental
            </button>

            <ul className="text-ink-600 mt-4 space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Truck className="size-3.5 shrink-0 text-teal-700" />
                Delivered and assembled at your villa/office
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-teal-700" />
                Swap, upgrade or return items any time
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
      <dt className={accent ? "text-teal-700 font-medium" : "text-ink-600"}>{label}</dt>
      <dd
        className={
          bold
            ? "text-ink-900 text-base font-bold tabular-nums"
            : accent
              ? "text-teal-700 font-semibold tabular-nums"
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
  name,
  area,
}: {
  weeks: number;
  total: number;
  name?: string;
  area?: string;
}) {
  const reset = useWorkspace((s) => s.reset);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-lg px-4 py-20 text-center"
    >
      <span className="bg-teal-50 border border-teal-200 text-teal-700 mx-auto grid size-16 place-items-center rounded-3xl shadow-xs">
        <PartyPopper className="size-8" />
      </span>
      <h1 className="text-ink-900 mt-6 text-3xl font-bold tracking-tight">
        Your workspace is booked!
      </h1>
      <p className="text-ink-600 mt-3 text-sm leading-relaxed">
        {name ? `Thank you, ${name}! ` : ""}We received your order of{" "}
        <strong className="text-ink-900">{formatUSD(total)}</strong> for {weeks}{" "}
        week{weeks === 1 ? "" : "s"}
        {area ? ` in ${area}` : ""}.
      </p>
      <p className="text-ink-500 mt-2 text-xs">
        Our team will message your WhatsApp shortly to confirm arrival and white-glove setup.
      </p>
      <Link
        href="/"
        onClick={() => reset()}
        className="bg-teal-800 hover:bg-teal-900 mt-8 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-sm transition"
      >
        Design another workspace
      </Link>
    </motion.div>
  );
}
