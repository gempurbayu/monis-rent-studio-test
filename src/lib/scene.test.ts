import { describe, expect, it } from "vitest";
import manifest from "../../public/models/manifest.json";
import { PRESETS, PRODUCT_MAP } from "@/data/catalog";
import { layoutScene, hasModel } from "@/lib/scene";
import type { Setup } from "@/types/workspace";

/**
 * Placement regression tests.
 *
 * Every visual bug in this scene so far has been a number bug: an item
 * overhanging the desk edge, a mesh scaled off its real-world size, an item
 * floating because the desk height was hard-coded. Screenshots are a slow and
 * unreliable way to catch those, so the geometry is asserted directly against
 * the asset manifest.
 */

type Extents = readonly [number, number, number];
const EXTENTS = manifest as unknown as Record<string, { extents: Extents }>;

/** Slots whose items must physically fit on the desktop. */
const ON_DESK = new Set(["monitor", "peripheral", "lighting", "audio"]);

function extentsOf(productId: string): Extents | null {
  return EXTENTS[productId]?.extents ?? null;
}

describe("asset manifest", () => {
  it("matches the products that claim to have a mesh", () => {
    for (const product of Object.values(PRODUCT_MAP)) {
      if (product.art) {
        expect(EXTENTS[product.art], `${product.id} declares art`).toBeDefined();
      }
      expect(hasModel(product.id)).toBe(Boolean(product.art));
    }
  });

  it("keeps every mesh at a plausible real-world size", () => {
    for (const [id, { extents }] of Object.entries(EXTENTS)) {
      const longest = Math.max(...extents);
      expect(longest, `${id} too small`).toBeGreaterThan(0.03);
      expect(longest, `${id} too large`).toBeLessThan(2.1);
    }
  });

  it("ships a web-sized payload", () => {
    const total = Object.values(
      manifest as Record<string, { bytes: number }>,
    ).reduce((sum, m) => sum + m.bytes, 0);
    expect(total).toBeLessThan(1_500_000);
  });
});

describe.each(PRESETS.map((p) => [p.name, p.setup] as const))(
  "preset %s",
  (_name, setup: Setup) => {
    const placements = layoutScene(setup);

    it("puts desktop items on top of the desk, not floating or sunk", () => {
      const deskId = setup.desk?.productId;
      const deskExtents = deskId ? extentsOf(deskId) : null;
      if (!deskExtents) return;

      const deskTop = deskExtents[1];

      for (const placement of placements) {
        const product = PRODUCT_MAP[placement.productId];
        if (!ON_DESK.has(product.slot)) continue;
        expect(
          placement.position[1],
          `${product.id} should rest on the desk top`,
        ).toBeCloseTo(deskTop, 2);
      }
    });

    it("keeps desktop items within the desk footprint", () => {
      const deskId = setup.desk?.productId;
      const deskExtents = deskId ? extentsOf(deskId) : null;
      if (!deskExtents) return;

      const halfWidth = deskExtents[0] / 2;
      const halfDepth = deskExtents[2] / 2;

      for (const placement of placements) {
        const product = PRODUCT_MAP[placement.productId];
        if (!ON_DESK.has(product.slot)) continue;
        const extents = extentsOf(placement.productId);
        if (!extents) continue;

        const [x, , z] = placement.position;
        const left = x - extents[0] / 2;
        const right = x + extents[0] / 2;
        const back = z - extents[2] / 2;
        const front = z + extents[2] / 2;

        expect(left, `${product.id} hangs off the left edge`).toBeGreaterThanOrEqual(
          -halfWidth,
        );
        expect(right, `${product.id} hangs off the right edge`).toBeLessThanOrEqual(
          halfWidth,
        );
        expect(back, `${product.id} hangs off the back edge`).toBeGreaterThanOrEqual(
          -halfDepth,
        );
        expect(front, `${product.id} hangs off the front edge`).toBeLessThanOrEqual(
          halfDepth,
        );
      }
    });

    it("never buries an item below the floor", () => {
      for (const placement of placements) {
        expect(placement.position[1]).toBeGreaterThanOrEqual(0);
      }
    });

    it("gives every copy of a stacked item its own position", () => {
      const seen = new Map<string, Set<string>>();
      for (const placement of placements) {
        const key = `${placement.position[0]}|${placement.position[2]}`;
        const set = seen.get(placement.productId) ?? new Set<string>();
        expect(
          set.has(key),
          `${placement.productId} has two copies in the same spot`,
        ).toBe(false);
        set.add(key);
        seen.set(placement.productId, set);
      }
    });
  },
);
