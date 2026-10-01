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

export interface AssetTransform {
  offsetX: number;
  offsetZ: number;
  rotY: number;
}

interface WorkspaceState {
  setup: Setup;
  weeks: RentalWeeks;
  activeSlot: Slot;
  /** Last item added/changed — drives the stage pop animation. */
  highlight: Highlight | null;
  /** Active item instance clicked in the 3D scene (e.g. "monitor-27-4k-0", "monitor-27-4k-1"). */
  selectedItemKey: string | null;
  /** Active object product ID. */
  selectedProductId: string | null;
  /** Whether 3D in-scene '+ Add' hotspot pins are visible. */
  showHotspots: boolean;
  /** Custom user overrides for position (X/Z) and horizontal rotation (rotY) per item key. */
  transforms: Record<string, AssetTransform>;
  /** Set once the persisted setup has been rehydrated on the client. */
  hydrated: boolean;

  setActiveSlot: (slot: Slot) => void;
  setSelectedProductId: (id: string | null, key?: string | null) => void;
  setSelectedItem: (key: string | null, id: string | null) => void;
  setShowHotspots: (show: boolean) => void;
  toggleHotspots: () => void;
  setWeeks: (weeks: RentalWeeks) => void;

  /** Reposition and horizontal rotation controls per item instance */
  nudgeAsset: (key: string, deltaX: number, deltaZ: number) => void;
  rotateAsset: (key: string, deltaRotY: number) => void;
  resetAssetTransform: (key: string) => void;
  resetAllTransforms: () => void;

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
      selectedItemKey: null,
      selectedProductId: null,
      showHotspots: true,
      transforms: {},
      hydrated: false,

      setActiveSlot: (slot) => set({ activeSlot: slot }),
      setSelectedProductId: (id, key) =>
        set({
          selectedProductId: id,
          selectedItemKey: key ?? (id ? `${id}-0` : null),
        }),
      setSelectedItem: (key, id) =>
        set({
          selectedItemKey: key,
          selectedProductId: id,
        }),
      setShowHotspots: (show) => set({ showHotspots: show }),
      toggleHotspots: () => set((s) => ({ showHotspots: !s.showHotspots })),
      setWeeks: (weeks) => set({ weeks }),

      nudgeAsset: (key, deltaX, deltaZ) =>
        set((s) => {
          const current = s.transforms[key] ?? { offsetX: 0, offsetZ: 0, rotY: 0 };
          const nextX = Math.round((current.offsetX + deltaX) * 100) / 100;
          const nextZ = Math.round((current.offsetZ + deltaZ) * 100) / 100;
          const clampedX = Math.max(-2.0, Math.min(2.0, nextX));
          const clampedZ = Math.max(-2.0, Math.min(2.0, nextZ));

          return {
            transforms: {
              ...s.transforms,
              [key]: {
                ...current,
                offsetX: clampedX,
                offsetZ: clampedZ,
              },
            },
          };
        }),

      rotateAsset: (key, deltaRotY) =>
        set((s) => {
          const current = s.transforms[key] ?? { offsetX: 0, offsetZ: 0, rotY: 0 };
          let nextRot = current.rotY + deltaRotY;
          if (nextRot > Math.PI) nextRot -= Math.PI * 2;
          if (nextRot < -Math.PI) nextRot += Math.PI * 2;

          return {
            transforms: {
              ...s.transforms,
              [key]: {
                ...current,
                rotY: Math.round(nextRot * 1000) / 1000,
              },
            },
          };
        }),

      resetAssetTransform: (key) =>
        set((s) => {
          const next = { ...s.transforms };
          delete next[key];
          // Also clean up by productId if legacy key exists
          if (key.includes("-")) {
            const baseId = key.replace(/-\d+$/, "");
            delete next[baseId];
          }
          return { transforms: next };
        }),

      resetAllTransforms: () => set({ transforms: {} }),

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
          selectedItemKey: null,
          selectedProductId: null,
          transforms: {},
        });
      },

      reset: () =>
        set({
          setup: EMPTY_SETUP,
          highlight: null,
          selectedItemKey: null,
          selectedProductId: null,
          transforms: {},
        }),

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

if (typeof window !== "undefined") {
  (window as any).__WORKSPACE__ = useWorkspace;
}
