# Monis Studio — design your Bali workspace

An interactive workspace configurator for [monis.rent](https://www.monis.rent),
which rents office equipment to digital nomads and startups in Bali. Pick a
desk, pick a chair, pile on monitors, lamps, plants and a coffee machine, watch
the setup come together, then rent it by the week.

Built for the Desent Solutions developer challenge.

- **Live URL:** _pending deploy_
- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Vercel

---

## Status

Foundation is in place and verified — `tsc`, `eslint` and `next build` all
clean, smoke-tested in a real browser. The configurator UI is next.

| Layer | File | State |
| --- | --- | --- |
| Domain model | `src/types/workspace.ts` | done |
| Catalog (real monis.rent data) | `src/data/catalog.ts` | done — 34 products, 3 presets |
| Pricing engine | `src/lib/pricing.ts` | done — variants, long-stay discounts |
| State store | `src/store/workspace-store.ts` | done — Zustand + localStorage persist |
| Isometric stage / picker / checkout | `src/components/*` | in progress |

`src/app/page.tsx` currently holds a scaffold-check page that exercises the
catalog, every store mutation and the quote engine. It gets replaced by the real
configurator.

## Approach

The brief's real point is in one line: _"the user doesn't want to just click
through a boring product catalog."_ So the product decisions came first and the
architecture follows from them.

**One stage, always visible.** The setup renders as a layered isometric scene,
not a cart. Every product carries a `StageAnchor` (`x`, `y`, `scale`, `layer`),
so adding a monitor puts a monitor on the desk rather than a row in a table. A
`highlight` field in the store marks the item you just touched so the stage can
pop it — the feedback loop that makes the thing feel alive.

**Presets over empty state.** A first-time visitor lands on a complete,
good-looking setup in one click (The Lean Nomad / The Deep Worker / The Creator
Studio) instead of a blank canvas. Much faster path to "get excited and hit
Rent".

**Real inventory, rewritten copy.** Products, weekly prices, discounts and
photography come from the live monis.rent Bali catalog. The descriptions do not:
the real site ships full spec sheets ("99% sRGB, 8-bit (6-bit + FRC), 6 ms
response time…"), which is exactly the spreadsheet experience this tool
replaces. Each item gets one human line instead.

**Rent-by-the-week pricing is a first-class concept.** Rentals aren't
e-commerce. Duration is part of the configuration, not a checkout afterthought,
so the price changes as you move 1 week → 6 months (0% / 5% / 12% / 20%
long-stay discount). `buildQuote()` is pure and takes `(setup, weeks)`, which
makes it trivially testable.

## Tech choices

| Choice | Why |
| --- | --- |
| **Next.js 16 App Router** | Required. Static shell plus client islands: the stage is heavily interactive, the marketing frame isn't. |
| **TypeScript, strict** | The setup shape (desk + chair + N accessories with variants and quantities) is where bugs live. Types make illegal states hard to build. |
| **Tailwind CSS v4** | Required. Design tokens live in `@theme` inside `globals.css` — one brand palette (Bali sand, deep teal, coral), no config file. |
| **Zustand + `persist`** | The whole app is one piece of shared state read by the stage, the picker and the checkout at once. Context would re-render the stage on every hover. `persist` means a refresh doesn't lose the setup you spent five minutes building. |
| **Framer Motion** | Layout animations on the stage. Items should land, not appear. |
| **dnd-kit** | For drag-to-place accessories on the desk — keyboard-accessible, unlike most DnD libraries. |
| **CSS/DOM isometric scene, not three.js** | A 3D engine is ~500 KB and a week of asset work for this. Layered, anchored product photography gets ~90% of the "my setup!" feeling at a fraction of the budget, works on a phone, and stays accessible. |

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # production build (Turbopack)
npx tsc --noEmit
npx eslint src
```

Product images are remote (`strapi.monis.rent`), allow-listed in
`next.config.ts` under `images.remotePatterns`.

## What I'd improve with more time

- **Real drag & drop placement** — let users move a lamp or plant anywhere on
  the desk and persist those coordinates, instead of fixed anchors per product.
- **Shareable setups** — encode the setup in the URL so people can send their
  dream office to a co-founder. The store shape is already serialisable.
- **Availability and delivery dates** — monis.rent shows live stock ("Only 3
  left") and same-day delivery. Wiring that in turns a nice toy into something
  you'd actually transact on.
- **Backend for the catalog** — the data layer is deliberately one module behind
  a typed interface, so swapping the hardcoded array for the Strapi API is a
  single-file change.
- **Tests** — `buildQuote()` and the store reducers are pure and deserve unit
  tests, plus a Playwright pass over "land → preset → tweak → checkout".
- **Room styles** — villa / co-working / balcony backdrops for the stage, the
  cheapest way to make the result feel personal.

---

Inventory data and product photography © monis.rent, used here to build this
demonstration.
