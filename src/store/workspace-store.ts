"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRESETS, PRODUCT_MAP } from "@/data/catalog";
import type {
  RentalWeeks,
  Setup,
  SetupItem,
  Slot,
} from "@/types/workspace";

const EMPTY_SETUP: Setup = { desk: null, chair: null, accessories: [] };

/** Ephemeral "just changed" marker so the stage can pulse the new item. */
export interface Highlight {
  productId: string;
  at: number;
}

interface WorkspaceState {
  setup: Setup;
  weeks: RentalWeeks;
  activeSlot: Slot;
  /** Last item added/changed — drives the stage pop animation. */
  highlight: Highlight | null;
  /** Active object clicked in the 3D scene to show floating contextual controls. */
  selectedProductId: string | null;
  /** Whether 3D in-scene '+ Add' hotspot pins are visible. */
  showHotspots: boolean;
  /** Set once the persisted setup has been rehydrated on the client. */
  hydrated: boolean;

  setActiveSlot: (slot: Slot) => void;
  setSelectedProductId: (id: string | null) => void;
  setShowHotspots: (show: boolean) => void;
  toggleHotspots: () => void;
  setWeeks: (weeks: RentalWeeks) => void;

  /** Select (or deselect) the single desk / chair. */
  chooseBase: (slot: "desk" | "chair", productId: string) => void;
  setVariant: (productId: string, variantId: string) => void;

  addAccessory: (productId: string) => void;
  removeAccessory: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  toggleAccessory: (productId: string) => void;

  applyPreset: (presetId: string) => void;
  reset: () => void;
  loadSetup: (setup: Setup, weeks?: RentalWeeks) => void;
}

function clampQty(productId: string, qty: number): number {
  const max = PRODUCT_MAP[productId]?.maxQty ?? 1;
  return Math.max(0, Math.min(qty, max));
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      setup: EMPTY_SETUP,
      weeks: 4,
      activeSlot: "desk",
      highlight: null,
      selectedProductId: null,
      showHotspots: true,
      hydrated: false,

      setActiveSlot: (slot) => set({ activeSlot: slot }),
      setSelectedProductId: (id) => set({ selectedProductId: id }),
      setShowHotspots: (show) => set({ showHotspots: show }),
      toggleHotspots: () => set((s) => ({ showHotspots: !s.showHotspots })),
      setWeeks: (weeks) => set({ weeks }),

      chooseBase: (slot, productId) => {
        const current = get().setup[slot];
        // Clicking the selected desk/chair again clears it.
        if (current?.productId === productId) {
          set((s) => ({ setup: { ...s.setup, [slot]: null }, highlight: null }));
          return;
        }
        const product = PRODUCT_MAP[productId];
        set((s) => ({
          setup: {
            ...s.setup,
            [slot]: {
              productId,
              qty: 1,
              variantId: product?.variants?.[0]?.id,
            },
          },
          highlight: { productId, at: Date.now() },
        }));
      },

      setVariant: (productId, variantId) =>
        set((s) => {
          const patch = (item: SetupItem | null) =>
            item && item.productId === productId ? { ...item, variantId } : item;
          return {
            setup: {
              desk: patch(s.setup.desk),
              chair: patch(s.setup.chair),
              accessories: s.setup.accessories.map(
                (a) => patch(a) as SetupItem,
              ),
            },
            highlight: { productId, at: Date.now() },
          };
        }),

      addAccessory: (productId) =>
        set((s) => {
          const existing = s.setup.accessories.find(
            (a) => a.productId === productId,
          );
          const product = PRODUCT_MAP[productId];
          if (!product) return s;

          if (existing) {
            const next = clampQty(productId, existing.qty + 1);
            if (next === existing.qty) return s; // at max, no-op
            return {
              setup: {
                ...s.setup,
                accessories: s.setup.accessories.map((a) =>
                  a.productId === productId ? { ...a, qty: next } : a,
                ),
              },
              highlight: { productId, at: Date.now() },
            };
          }

          return {
            setup: {
              ...s.setup,
              accessories: [
                ...s.setup.accessories,
                {
                  productId,
                  qty: 1,
                  variantId: product.variants?.[0]?.id,
                },
              ],
            },
            highlight: { productId, at: Date.now() },
          };
        }),

      removeAccessory: (productId) =>
        set((s) => ({
          setup: {
            ...s.setup,
            accessories: s.setup.accessories.filter(
              (a) => a.productId !== productId,
            ),
          },
          highlight: null,
        })),

      setQty: (productId, qty) =>
        set((s) => {
          const next = clampQty(productId, qty);
          if (next <= 0) {
            return {
              setup: {
                ...s.setup,
                accessories: s.setup.accessories.filter(
                  (a) => a.productId !== productId,
                ),
              },
              highlight: null,
            };
          }
          return {
            setup: {
              ...s.setup,
              accessories: s.setup.accessories.map((a) =>
                a.productId === productId ? { ...a, qty: next } : a,
              ),
            },
            highlight: { productId, at: Date.now() },
          };
        }),

      toggleAccessory: (productId) => {
        const has = get().setup.accessories.some(
          (a) => a.productId === productId,
        );
        if (has) get().removeAccessory(productId);
        else get().addAccessory(productId);
      },

      applyPreset: (presetId) => {
        const preset = PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        set({
          setup: {
            desk: preset.setup.desk ? { ...preset.setup.desk } : null,
            chair: preset.setup.chair ? { ...preset.setup.chair } : null,
            accessories: preset.setup.accessories.map((a) => ({ ...a })),
          },
          highlight: { productId: preset.setup.desk?.productId ?? "", at: Date.now() },
          selectedProductId: null,
        });
      },

      reset: () => set({ setup: EMPTY_SETUP, highlight: null, selectedProductId: null }),

      loadSetup: (setup, weeks) =>
        set((s) => ({
          setup,
          weeks: weeks ?? s.weeks,
          highlight: null,
        })),
    }),
    {
      name: "monis-setup-v1",
      partialize: (s) => ({ setup: s.setup, weeks: s.weeks }),
      onRehydrateStorage: () => (state) => {
        state?.loadSetup(state.setup, state.weeks);
        useWorkspace.setState({ hydrated: true });
      },
    },
  ),
);

/** Selector helpers — keep components free of setup-shape knowledge. */
export function selectQty(setup: Setup, productId: string): number {
  if (setup.desk?.productId === productId) return setup.desk.qty;
  if (setup.chair?.productId === productId) return setup.chair.qty;
  return setup.accessories.find((a) => a.productId === productId)?.qty ?? 0;
}
