"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  layoutStage,
  needsGhostDesk,
  stageWidthPercent,
  type Placement,
} from "@/lib/stage";
import { useWorkspace } from "@/store/workspace-store";
import type { Setup } from "@/types/workspace";

interface WorkspaceStageProps {
  setup: Setup;
  /** Read-only mode for the checkout summary — no remove buttons. */
  readOnly?: boolean;
  className?: string;
}

/**
 * The live preview. Product photography is placed on an elliptical platform
 * with per-item anchors and paint order, so the setup reads as one scene
 * instead of a grid of thumbnails.
 */
export function WorkspaceStage({
  setup,
  readOnly = false,
  className,
}: WorkspaceStageProps) {
  const placements = layoutStage(setup);
  const ghostDesk = needsGhostDesk(setup);
  const isEmpty = placements.length === 0;

  return (
    <div
      className={cn(
        "stage-grain from-sand-100 to-sand-200 relative isolate aspect-[4/3] w-full overflow-hidden rounded-4xl bg-gradient-to-b",
        className,
      )}
    >
      {/* Sun-glow backdrop so the scene has a light source */}
      <div
        aria-hidden
        className="from-coral-400/25 absolute top-[-18%] left-1/2 size-[70%] -translate-x-1/2 rounded-full bg-radial to-transparent blur-2xl"
      />

      {/* Platform the setup stands on */}
      <div
        aria-hidden
        className="border-sand-300/80 bg-sand-100/70 absolute bottom-[8%] left-1/2 h-[26%] w-[82%] -translate-x-1/2 rounded-[50%] border shadow-[0_24px_60px_-30px_rgb(16_35_31/0.35)]"
      />

      {ghostDesk && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-hidden
          className="border-ink-600/30 absolute left-1/2 h-[14%] w-[52%] -translate-x-1/2 rounded-xl border-2 border-dashed"
          style={{ top: "56%" }}
        >
          <span className="text-ink-600/60 absolute inset-0 grid place-items-center text-[10px] font-medium tracking-wide uppercase">
            Add a desk
          </span>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {placements.map((p) => (
          <StageItem key={p.key} placement={p} readOnly={readOnly} />
        ))}
      </AnimatePresence>

      {isEmpty && !ghostDesk && <EmptyStageHint />}
    </div>
  );
}

function StageItem({
  placement,
  readOnly,
}: {
  placement: Placement;
  readOnly: boolean;
}) {
  const { product, x, y, scale, layer, flip, index } = placement;
  const highlight = useWorkspace((s) => s.highlight);
  const removeAccessory = useWorkspace((s) => s.removeAccessory);
  const chooseBase = useWorkspace((s) => s.chooseBase);

  const isHighlighted = highlight?.productId === product.id;
  const isBase = product.slot === "desk" || product.slot === "chair";
  const width = stageWidthPercent(product);

  return (
    // Outer wrapper owns the centring translate. Framer Motion writes its own
    // `transform` on the element it animates, so the two must not share a node.
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        zIndex: Math.round(layer * 10),
      }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: -24, scale: scale * 0.8 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isHighlighted ? scale * 1.07 : scale,
        }}
        exit={{ opacity: 0, scale: scale * 0.7, transition: { duration: 0.18 } }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 24,
          delay: index * 0.05,
        }}
        className="group relative"
      >
        <div
          className={cn(
            "transition-[filter] duration-300",
            isHighlighted && "drop-shadow-[0_8px_24px_rgb(249_111_44/0.45)]",
          )}
          style={{ transform: flip ? "scaleX(-1)" : undefined }}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={420}
            height={420}
            sizes="(max-width: 768px) 40vw, 22vw"
            className="h-auto w-full object-contain drop-shadow-[0_12px_20px_rgb(16_35_31/0.18)]"
          />
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() =>
              isBase
                ? chooseBase(product.slot as "desk" | "chair", product.id)
                : removeAccessory(product.id)
            }
            aria-label={`Remove ${product.name}`}
            className="border-sand-300 text-ink-700 hover:bg-coral-500 hover:border-coral-500 absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border bg-white opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-white focus-visible:opacity-100"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        )}

        {/* Name tag on hover — orientation cue without cluttering the scene */}
        <span className="bg-ink-900/90 pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
          {product.name}
        </span>
      </motion.div>
    </div>
  );
}

function EmptyStageHint() {
  return (
    <div className="absolute inset-0 grid place-items-center px-8 text-center">
      <div>
        <p className="text-ink-900 text-lg font-semibold">
          Your Bali office starts here
        </p>
        <p className="text-ink-600 mx-auto mt-1 max-w-xs text-sm">
          Pick a desk and a chair, then add whatever makes it yours. Or start
          from a preset above.
        </p>
      </div>
    </div>
  );
}
