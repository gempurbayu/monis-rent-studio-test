"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import { Coffee, Lamp, Leaf, Monitor, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { PRODUCT_MAP } from "@/data/catalog";
import { DESK_TOP, SIDE_TABLE_TOP } from "@/lib/scene";
import { useWorkspace } from "@/store/workspace-store";
import type { Setup } from "@/types/workspace";

interface SceneHotspotsProps {
  setup: Setup;
}

/**
 * 3D in-scene interactive hotspots.
 * Renders sleek, non-intrusive circular radar pins on empty workspace sockets that expand on hover.
 */
export function SceneHotspots({ setup }: SceneHotspotsProps) {
  const showHotspots = useWorkspace((s) => s.showHotspots);
  const addAccessory = useWorkspace((s) => s.addAccessory);

  if (!showHotspots || !setup.desk) return null;

  const monitorCount = setup.accessories
    .filter((a) => a.productId.startsWith("mon-"))
    .reduce((sum, a) => sum + a.qty, 0);

  const hasLamp = setup.accessories.some((a) => a.productId === "lamp-desk");
  const hasPlant = setup.accessories.some((a) => a.productId === "plant-monstera");
  const hasCoffee = setup.accessories.some(
    (a) => a.productId === "nespresso" || a.productId === "coffee-bosch",
  );

  return (
    <group position={[0, 0, 0]}>
      {/* 2nd Monitor Hotspot */}
      {monitorCount === 1 && (
        <HotspotPin
          position={[0.68, DESK_TOP + 0.38, -0.20]}
          icon={<Monitor className="size-3.5" />}
          label="2nd Monitor"
          price="$11/wk"
          onClick={() => {
            const firstMon = setup.accessories.find((a) =>
              a.productId.startsWith("mon-"),
            );
            addAccessory(firstMon?.productId ?? "mon-24-fhd");
          }}
        />
      )}

      {/* Desk Lamp Hotspot */}
      {!hasLamp && (
        <HotspotPin
          position={[0.48, DESK_TOP + 0.12, 0.18]}
          icon={<Lamp className="size-3.5" />}
          label="Desk Lamp"
          price="$3/wk"
          onClick={() => addAccessory("lamp-desk")}
        />
      )}

      {/* Coffee Station Hotspot on Side Credenza */}
      {!hasCoffee && (
        <HotspotPin
          position={[-0.92, SIDE_TABLE_TOP + 0.22, -0.05]}
          icon={<Coffee className="size-3.5" />}
          label="Coffee Machine"
          price="$6/wk"
          onClick={() => addAccessory("nespresso")}
        />
      )}

      {/* Plant Hotspot */}
      {!hasPlant && (
        <HotspotPin
          position={[1.15, 0.36, 0.14]}
          icon={<Leaf className="size-3.5" />}
          label="Monstera Plant"
          price="$2/wk"
          onClick={() => addAccessory("plant-monstera")}
        />
      )}
    </group>
  );
}

interface HotspotPinProps {
  position: [number, number, number];
  icon: React.ReactNode;
  label: string;
  price: string;
  onClick: () => void;
}

function HotspotPin({ position, icon, label, price, onClick }: HotspotPinProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Html center distanceFactor={5.2} className="pointer-events-auto select-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`group relative flex items-center rounded-full border border-teal-600/90 bg-white/95 p-1 text-xs font-semibold text-teal-950 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-teal-700 hover:bg-teal-700 hover:text-white ${
            hovered ? "pr-2.5 gap-1.5" : "gap-0"
          }`}
        >
          {/* Animated radar ripple */}
          <span className="absolute -inset-1 -z-10 rounded-full bg-teal-400/30 animate-ping opacity-60" />

          {/* Icon circle */}
          <span className="grid size-6 place-items-center rounded-full bg-teal-100 text-teal-800 transition group-hover:bg-white group-hover:text-teal-900">
            {icon}
          </span>

          {/* Expanded label ONLY on hover */}
          {hovered && (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[11px] font-bold">+ {label}</span>
              <span className="rounded bg-teal-100/90 px-1.5 py-0.5 text-[9px] font-extrabold text-teal-900 transition group-hover:bg-white/20 group-hover:text-white">
                {price}
              </span>
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}

interface ObjectInspector3DProps {
  productId: string;
  position: [number, number, number];
  onClose: () => void;
}

/**
 * Floating 3D inspect card that appears directly above an object when clicked in the 3D scene.
 */
export function ObjectInspector3D({ productId, position, onClose }: ObjectInspector3DProps) {
  const product = PRODUCT_MAP[productId];
  const chooseBase = useWorkspace((s) => s.chooseBase);
  const removeAccessory = useWorkspace((s) => s.removeAccessory);
  const setVariant = useWorkspace((s) => s.setVariant);
  const setup = useWorkspace((s) => s.setup);

  if (!product) return null;

  const isDesk = product.slot === "desk";
  const isChair = product.slot === "chair";
  const isAccessory = !isDesk && !isChair;

  // Find alternative base product for fast 1-click swap
  const altBaseId = isDesk
    ? productId === "desk-electric"
      ? "desk-mechanical"
      : "desk-electric"
    : isChair
      ? productId === "chair-ergonomic"
        ? "chair-gaming"
        : "chair-ergonomic"
      : null;

  const altProduct = altBaseId ? PRODUCT_MAP[altBaseId] : null;

  // Active variant
  const activeItem = isDesk
    ? setup.desk
    : isChair
      ? setup.chair
      : setup.accessories.find((a) => a.productId === productId);

  return (
    <group position={[position[0], position[1] + 0.28, position[2]]}>
      <Html center distanceFactor={4.5} className="pointer-events-auto select-none">
        <div className="w-64 rounded-2xl border border-sand-300 bg-white/98 p-3 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-sand-200 pb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{product.glyph}</span>
                <span className="truncate text-xs font-bold text-ink-900">
                  {product.name}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-teal-700">
                ${product.pricePerWeek}/week
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-ink-400 hover:text-ink-700 rounded-full p-1 transition"
              aria-label="Close inspect"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-2.5 space-y-2">
            {/* Swap alternative chair or desk */}
            {altProduct && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  chooseBase(isDesk ? "desk" : "chair", altProduct.id);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sand-300 bg-sand-50/80 px-2.5 py-1.5 text-xs font-medium text-ink-800 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-900"
              >
                <RefreshCw className="size-3 text-teal-600" />
                <span>Switch to {altProduct.name}</span>
              </button>
            )}

            {/* Variant selector if available */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-ink-400 font-medium">Finish:</span>
                <div className="flex gap-1">
                  {product.variants.map((v) => {
                    const isSelected = activeItem?.variantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVariant(productId, v.id);
                        }}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition ${
                          isSelected
                            ? "bg-teal-700 text-white"
                            : "border border-sand-300 bg-white text-ink-700 hover:bg-sand-100"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Remove accessory */}
            {isAccessory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAccessory(productId);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-coral-200 bg-coral-50/60 px-2.5 py-1.5 text-xs font-medium text-coral-700 transition hover:bg-coral-100"
              >
                <Trash2 className="size-3" />
                <span>Remove from setup</span>
              </button>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
