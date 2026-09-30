"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Box, Loader2, RotateCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { hasModel } from "@/lib/scene";
import { PRODUCT_MAP } from "@/data/catalog";
import { useWorkspace } from "@/store/workspace-store";
import type { Setup } from "@/types/workspace";
import { MockAssetDisclaimer } from "@/components/mock-asset-notice";

/**
 * Wrapper around the 3D canvas.
 *
 * three.js is loaded client-side only and lazily — it's the heaviest thing on
 * the page and nothing above the fold needs it to render, so the shell paints
 * first and the scene fades in.
 */
const WorkspaceScene = dynamic(
  () => import("@/components/workspace-scene").then((m) => m.WorkspaceScene),
  {
    ssr: false,
    loading: () => <SceneSkeleton />,
  },
);

interface StagePanelProps {
  setup: Setup;
  readOnly?: boolean;
  className?: string;
}

export function StagePanel({ setup, readOnly, className }: StagePanelProps) {
  const [remounts, setRemounts] = useState(0);
  const itemCount =
    (setup.desk ? 1 : 0) + (setup.chair ? 1 : 0) + setup.accessories.length;
  const isEmpty = itemCount === 0;

  // Catalog items with no generated mesh appear as ghost volumes; say so
  // rather than letting the user wonder what the grey box is.
  const missing = [setup.desk, setup.chair, ...setup.accessories]
    .filter((i) => i && !hasModel(i.productId))
    .map((i) => PRODUCT_MAP[i!.productId]?.name)
    .filter(Boolean);

  return (
    <div
      className={cn(
        "from-sand-100 to-sand-200 relative isolate aspect-4/3 w-full overflow-hidden rounded-4xl bg-gradient-to-b",
        className,
      )}
    >
      <WorkspaceScene key={remounts} setup={setup} readOnly={readOnly} />

      {isEmpty && <EmptyOverlay />}

      {!readOnly && !isEmpty && (
        <>
          <span className="text-ink-600/80 pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-medium">
            Drag to orbit · scroll to zoom
          </span>

          <button
            type="button"
            onClick={() => setRemounts((n) => n + 1)}
            title="Reset the camera"
            className="border-sand-300 text-ink-700 hover:border-coral-500 hover:text-coral-600 absolute top-3 right-3 grid size-8 place-items-center rounded-full border bg-white/90 backdrop-blur transition"
          >
            <RotateCw className="size-3.5" />
          </button>
        </>
      )}

      {!isEmpty && <MockAssetDisclaimer missingNames={missing} />}
    </div>
  );
}

function SceneSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="text-ink-600 flex flex-col items-center gap-2">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-xs font-medium">Building your workspace…</span>
      </div>
    </div>
  );
}

function EmptyOverlay() {
  const setActiveSlot = useWorkspace((s) => s.setActiveSlot);
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center">
      <div className="pointer-events-auto">
        <span className="bg-ink-900/5 text-ink-700 mx-auto grid size-12 place-items-center rounded-2xl">
          <Box className="size-6" />
        </span>
        <p className="text-ink-900 mt-3 text-lg font-semibold">
          Your Bali office starts here
        </p>
        <p className="text-ink-600 mx-auto mt-1 max-w-xs text-sm">
          Pick a desk and a chair, then add whatever makes it yours — it all
          shows up here in 3D.
        </p>
        <button
          type="button"
          onClick={() => setActiveSlot("desk")}
          className="bg-ink-900 mt-4 rounded-full px-4 py-2 text-xs font-bold text-white"
        >
          Choose a desk
        </button>
      </div>
    </div>
  );
}
