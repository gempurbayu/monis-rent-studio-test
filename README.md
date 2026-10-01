# Monis Studio — design your Bali workspace

An interactive 3D workspace configurator for [monis.rent](https://www.monis.rent),
which rents office equipment to digital nomads and startups in Bali. Pick a
desk, pick a chair, pile on monitors, lamps, plants and a coffee machine, watch
the setup come together in real-time 3D, then rent it by the week.

Built for the Desent Solutions developer challenge.

- **Live URL:** _pending deploy_
- **Stack:** Next.js 16 (App Router) · React 19 · Three.js · React Three Fiber · TypeScript · Tailwind CSS v4 · Zustand · Vitest

---

## Status

Fully functional and verified — `vitest`, `tsc`, `eslint` and `next build` (Turbopack) all clean, smoke-tested in a live browser.

| Layer | File | State |
| --- | --- | --- |
| Domain model | `src/types/workspace.ts` | done |
| Catalog (real monis.rent data) | `src/data/catalog.ts` | done — 34 products, 3 presets |
| Pricing engine | `src/lib/pricing.ts` | done — variants, long-stay discounts |
| State store | `src/store/workspace-store.ts` | done — Zustand + localStorage persist |
| 3D Scene & Layout engine | `src/lib/scene.ts`, `src/lib/finishes.ts` | done — physical meter layout, finishes |
| Interactive 3D Stage | `src/components/workspace-scene.tsx`, `stage-panel.tsx` | done — R3F, OrbitControls, dynamic SideTable |
| Configurator & Checkout UI | `src/components/configurator.tsx`, `checkout-view.tsx` | done |
| Regression test suite | `src/lib/scene.test.ts` | done — 15 passing tests |

---

## Approach

The brief's real point is in one line: _"the user doesn't want to just click
through a boring product catalog."_ The product decisions came first and the
architecture follows from them.

**Interactive 3D Stage, always visible.** The setup renders as an interactive, real-time 3D scene using Three.js and React Three Fiber. Users can orbit, zoom, and inspect every angle of their desk setup. Every item has physical meter-based placement coordinates (`x`, `y`, `z`) and rotation (`rotY`), anchored to the desk's physical height (`DESK_TOP`).

**Ergonomic & Realistic Workspace Staging.** The workstation layout reflects genuine ergonomic practices:
- **Chair placement:** The chair sits cleanly in front of the desk facing the workstation and monitors, with correct ground alignment and seat tuck.
- **Dedicated Side Credenza (`SideTable`):** Lifestyle gear (such as the Nespresso machine) sits on a dedicated side table beside the main desk at `SIDE_TABLE_TOP = 0.58m`, rather than on the floor. Its top surface dynamically syncs with the active desk finish (warm oak wood or graphite).
- **Default Camera View:** Elevated front-view perspective positioned behind the chair looking across the desk towards the displays, giving an immediate sense of sitting down to work.
- **Architectural Studio Room Environment (`StudioRoomEnvironment`):** Replaced the generic flat platform circle with a full architectural studio room ambiance — seamless microcement flooring, woven office area rug under the desk and chair, plaster back feature wall with skirting trim, acoustic vertical oak slat wall, and framed abstract art.
- **Multi-Item Collision Avoidance & Sub-Slot Mapping:** Resolved object overlap/stacking when multiple items share the same slot or surface. Known accessories are mapped to dedicated physical zones (desk surface, side credenza, floor corners, monitor top), and a dynamic collision avoidance loop automatically offsets any multi-item placement by radial clearance without clipping.
- **Above-the-Fold UI Optimization:** Compacted the hero section and typography so the 3D studio stage is immediately prominent on all standard screen sizes without vertical cutoff.
- **Interactive Product Cards & Seamless Category Navigation:** Refined the category bar so all 8 categories fit in a single, responsive row without awkward scroll slicing or overlapping buttons. Product cards feature explicit selection actions, variant pickers, and quantity steppers.
- **Complete Bali Delivery Checkout:** Added rental duration controls and a dedicated Bali contact & delivery details form (Canggu, Seminyak, Ubud, Uluwatu) with instant booking confirmation.
- **Mechanical Keyboard Upgrade:** Equipped with a dedicated high-fidelity mechanical keyboard model with sculpted keycaps, PBR textures, and per-key RGB backlighting, auto-grounded flush to the desktop.
- **Potted Plant Asset Upgrade:** Added a photorealistic potted pothos plant on wooden legs with WebP textures and Draco compression (320 KB, replacing the placeholder cube).
- **3D In-Scene Hotspot Pins (`SceneHotspots`):** Interactive floating radar pins anchored directly to empty sockets in the 3D space (`+ 2nd Monitor`, `+ Desk Lamp`, `+ Coffee Machine`, `+ Place Plant`) with 1-click add and live price badges.
- **Click-to-Inspect & Direct 3D Editing (`ObjectInspector3D`):** Clicking any furniture or accessory in the 3D scene opens a floating HUD directly in 3D space to swap models (e.g. Ergonomic ↔ Gaming chair, Standing ↔ Oak desk), toggle variants, or remove items.
- **Hotspots Visibility Toggle:** A top-stage control lets users toggle between guided configuration mode and clean studio presentation mode.

**Presets over empty state.** A first-time visitor lands on a complete,
good-looking setup in one click (The Lean Nomad / The Deep Worker / The Dual Screen)
instead of a blank canvas. Much faster path to "get excited and hit Rent".

**Real inventory, rewritten copy.** Products, weekly prices, discounts and
photography come from the live monis.rent Bali catalog. Descriptions are rewritten into concise, engaging copy instead of dry spec sheets.

**Rent-by-the-week pricing is a first-class concept.** Rentals aren't
e-commerce. Duration is part of the configuration, not a checkout afterthought,
so the price updates dynamically as you move 1 week → 6 months (0% / 5% / 12% / 20%
long-stay discount). `buildQuote()` is pure and takes `(setup, weeks)`, making it trivially testable.

---

## Tech choices

| Choice | Why |
| --- | --- |
| **Next.js 16 App Router** | Required. Static shell plus client islands: the 3D stage and configurator are client-side interactive, while layout and headers remain static. |
| **Three.js & React Three Fiber (@react-three/fiber + @react-three/drei)** | Real-time 3D canvas with PBR shading, soft contact shadows, directional bounce lighting, and smooth OrbitControls navigation. |
| **TypeScript, strict** | The setup shape (desk + chair + N accessories with variants and quantities) is where bugs live. Strict types make illegal states impossible. |
| **Tailwind CSS v4** | Design tokens live in `@theme` inside `globals.css` — one brand palette (Bali sand, deep teal, coral), with zero config files. |
| **Zustand + `persist`** | Shared application state accessed by the 3D stage, product picker, and checkout at once. Context would re-render the stage on every hover; `persist` ensures setups survive page reloads. |
| **Framer Motion** | Smooth UI transitions and toast highlights when items are added or modified. |
| **Vitest** | Fast unit and regression testing for 3D placement geometry, manifest extents, desk bounds, and pricing. |

---

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm test        # run Vitest regression suite
npm run build   # production build (Turbopack)
npx tsc --noEmit
npx eslint src
```

Product images are remote (`strapi.monis.rent`), allow-listed in
`next.config.ts` under `images.remotePatterns`.

---

## What I'd improve with more time

- **Freeform Drag & Drop placement** — let users drag accessories anywhere on the desk surface using raycasting and persist custom coordinates.
- **Shareable setup URLs** — encode the setup state into URL search params or hash so nomads can share setups with co-founders.
- **Live inventory sync** — connect to live stock APIs ("Only 2 left in Canggu") with estimated delivery dates.
- **Room environments** — toggleable background presets (Bali villa, bamboo open-air coworking, modern loft) for different ambiances.

---

Inventory data and product photography © monis.rent, used here to build this demonstration.
