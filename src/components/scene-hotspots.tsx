"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Coffee,
  Lamp,
  Leaf,
  Monitor,
  Move,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
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

interface ObjectInspectorDockProps {
  itemKey: string;
  productId: string;
  onClose: () => void;
}

/**
 * Sleek glassmorphic inspector dock anchored at the bottom-left of the stage canvas.
 * Positioned cleanly out of the camera's focal point so the selected object
 * remains 100% visible while moving and rotating in real time.
 */
export function ObjectInspectorDock({
  itemKey,
  productId,
  onClose,
}: ObjectInspectorDockProps) {
  const product = PRODUCT_MAP[productId];
  const chooseBase = useWorkspace((s) => s.chooseBase);
  const removeAccessory = useWorkspace((s) => s.removeAccessory);
  const setVariant = useWorkspace((s) => s.setVariant);
  const setup = useWorkspace((s) => s.setup);

  const nudgeAsset = useWorkspace((s) => s.nudgeAsset);
  const rotateAsset = useWorkspace((s) => s.rotateAsset);
  const resetAssetTransform = useWorkspace((s) => s.resetAssetTransform);
  const transforms = useWorkspace((s) => s.transforms);
  const tf =
    transforms[itemKey] ??
    transforms[productId] ?? { offsetX: 0, offsetZ: 0, rotY: 0 };
  const hasCustomTransform = Boolean(
    tf.offsetX !== 0 || tf.offsetZ !== 0 || tf.rotY !== 0,
  );

  if (!product) return null;

  const isDesk = product.slot === "desk";
  const isChair = product.slot === "chair";
  const isAccessory = !isDesk && !isChair;

  // Instance label for multi-item accessories (such as dual monitors)
  const indexMatch = itemKey.match(/-(\d+)$/);
  const instanceIndex = indexMatch ? parseInt(indexMatch[1], 10) : 0;
  const accessoryItem = setup.accessories.find((a) => a.productId === productId);
  const isMultiInstance = (accessoryItem?.qty ?? 1) > 1;
  const displayName = isMultiInstance
    ? `${product.name} (Screen ${instanceIndex + 1})`
    : product.name;

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
      : accessoryItem;

  return (
    <div className="absolute bottom-3 left-3 z-30 w-72 rounded-2xl border border-sand-300/90 bg-white/95 p-2.5 shadow-xl backdrop-blur-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sand-200 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{product.glyph}</span>
          {isMultiInstance && (
            <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-900 shrink-0">
              Screen {instanceIndex + 1}
            </span>
          )}
          <span className="truncate text-xs font-bold text-ink-900">
            {product.name}
          </span>
          <span className="text-[10px] font-semibold text-teal-700 shrink-0">
            ${product.pricePerWeek}/wk
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasCustomTransform && (
            <button
              type="button"
              onClick={() => resetAssetTransform(itemKey)}
              className="text-[10px] text-teal-700 hover:underline font-semibold mr-1"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 rounded-full p-0.5 transition"
            aria-label="Close inspector"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Move & Rotate Compact Toolbar */}
      <div className="mt-2 rounded-xl border border-sand-200 bg-sand-50/80 p-1.5 text-ink-900">
        <div className="flex items-center justify-between gap-1 text-xs">
          {/* Move D-Pad inline */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-ink-500 uppercase mr-0.5">Move</span>
            <button
              type="button"
              title="Move left"
              onClick={() => nudgeAsset(itemKey, -0.05, 0)}
              className="grid size-6 place-items-center rounded-md border border-sand-300 bg-white text-ink-700 hover:bg-teal-50 hover:border-teal-500 active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="size-3" />
            </button>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                title="Move away (back)"
                onClick={() => nudgeAsset(itemKey, 0, -0.05)}
                className="grid size-3.5 place-items-center rounded border border-sand-300 bg-white text-ink-700 hover:bg-teal-50 hover:border-teal-500 active:scale-95 shadow-2xs"
              >
                <ArrowUp className="size-2.5" />
              </button>
              <button
                type="button"
                title="Move forward"
                onClick={() => nudgeAsset(itemKey, 0, 0.05)}
                className="grid size-3.5 place-items-center rounded border border-sand-300 bg-white text-ink-700 hover:bg-teal-50 hover:border-teal-500 active:scale-95 shadow-2xs"
              >
                <ArrowDown className="size-2.5" />
              </button>
            </div>
            <button
              type="button"
              title="Move right"
              onClick={() => nudgeAsset(itemKey, 0.05, 0)}
              className="grid size-6 place-items-center rounded-md border border-sand-300 bg-white text-ink-700 hover:bg-teal-50 hover:border-teal-500 active:scale-95 shadow-2xs"
            >
              <ArrowRight className="size-3" />
            </button>
          </div>

          <div className="h-6 w-px bg-sand-200" />

          {/* Rotate inline */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-ink-500 uppercase mr-0.5">Rot</span>
            <button
              type="button"
              title="Rotate left -15°"
              onClick={() => rotateAsset(itemKey, -Math.PI / 12)}
              className="grid size-6 place-items-center rounded-md border border-sand-300 bg-white text-ink-700 hover:bg-teal-50 hover:border-teal-500 active:scale-95 shadow-2xs"
            >
              <RotateCcw className="size-3" />
            </button>
            <button
              type="button"
              title="Rotate right +15°"
              onClick={() => rotateAsset(itemKey, Math.PI / 12)}
              className="grid size-6 place-items-center rounded-md border border-sand-300 bg-white text-ink-700 hover:bg-teal-50 hover:border-teal-500 active:scale-95 shadow-2xs"
            >
              <RotateCw className="size-3" />
            </button>
            <span className="text-[9px] font-mono font-bold text-ink-600 min-w-[24px] text-right">
              {Math.round(((tf.rotY * 180) / Math.PI) % 360)}°
            </span>
          </div>
        </div>
      </div>

      {/* Actions footer */}
      <div className="mt-2 space-y-1.5">
        {altProduct && (
          <button
            type="button"
            onClick={() => {
              chooseBase(isDesk ? "desk" : "chair", altProduct.id);
            }}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-sand-300 bg-white py-1 px-2 text-[11px] font-semibold text-ink-800 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-900 shadow-2xs transition"
          >
            <RefreshCw className="size-2.5 text-teal-700" />
            <span>Switch to {altProduct.name}</span>
          </button>
        )}

        {product.variants && product.variants.length > 1 && (
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-[9px] text-ink-500 font-medium">Finish:</span>
            <div className="flex gap-1 flex-1">
              {product.variants.map((v) => {
                const isSelected = activeItem?.variantId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(productId, v.id)}
                    className={`flex-1 rounded-md py-0.5 text-[9px] font-semibold transition ${
                      isSelected
                        ? "bg-teal-800 text-white"
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

        {isAccessory && (
          <button
            type="button"
            onClick={() => {
              if (isMultiInstance) {
                const currentQty = accessoryItem?.qty ?? 1;
                useWorkspace.getState().setQty(productId, currentQty - 1);
              } else {
                removeAccessory(productId);
              }
              onClose();
            }}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-coral-200 bg-coral-50/60 py-1 text-[11px] font-semibold text-coral-700 hover:bg-coral-100 transition"
          >
            <Trash2 className="size-2.5" />
            <span>{isMultiInstance ? "Remove this screen" : "Remove from setup"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
