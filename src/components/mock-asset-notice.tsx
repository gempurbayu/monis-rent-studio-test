"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Info, Sparkles, X } from "lucide-react";
import { PRODUCT_MAP } from "@/data/catalog";
import { hasModel } from "@/lib/scene";
import { useWorkspace } from "@/store/workspace-store";

interface ToastData {
  id: string;
  name: string;
  glyph?: string;
}

/**
 * Toast that fires when a product without a dedicated 3D model is added.
 */
export function MockAssetToast() {
  const highlight = useWorkspace((s) => s.highlight);
  const [toast, setToast] = useState<ToastData | null>(null);
  const lastNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!highlight?.productId) return;
    const productId = highlight.productId;

    // Only notify if product has no 3D model and wasn't just notified
    if (!hasModel(productId)) {
      if (lastNotifiedRef.current === productId) return;
      lastNotifiedRef.current = productId;

      const product = PRODUCT_MAP[productId];
      const name = product?.name ?? productId;
      setToast({ id: `${productId}-${Date.now()}`, name, glyph: product?.glyph });

      const timer = setTimeout(() => {
        setToast(null);
      }, 4800);

      return () => clearTimeout(timer);
    } else {
      lastNotifiedRef.current = null;
    }
  }, [highlight]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.94 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="pointer-events-auto fixed top-5 left-1/2 z-50 flex w-[92%] max-w-md -translate-x-1/2 items-start gap-3.5 rounded-2xl border border-amber-300/90 bg-white/98 p-4 shadow-2xl backdrop-blur-lg"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 shadow-sm">
            {toast.glyph ? (
              <span className="text-base leading-none">{toast.glyph}</span>
            ) : (
              <Box className="size-4.5" />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-ink-900">
                Mock 3D Placeholder Added
              </span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800 uppercase tracking-wider">
                Preview
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-600">
              <strong>{toast.name}</strong> is currently visualized as a placeholder shape. A dedicated 3D asset is in production for a more realistic showroom preview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-ink-400 hover:text-ink-700 -mr-1 -mt-1 p-1.5 transition rounded-full hover:bg-sand-100"
            aria-label="Dismiss toast"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MockAssetDisclaimerProps {
  missingNames: string[];
}

/**
 * Interactive stage disclaimer when one or more mock assets are in the setup.
 */
export function MockAssetDisclaimer({ missingNames }: MockAssetDisclaimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (missingNames.length === 0) return null;

  return (
    <div ref={containerRef} className="absolute top-3 left-3 z-30">
      {/* Disclaimer trigger badge */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex max-w-[280px] items-center gap-2 rounded-full border border-amber-300/80 bg-white/90 px-3 py-1.5 text-left shadow-sm backdrop-blur-md transition hover:border-amber-400 hover:bg-white"
        aria-expanded={isOpen}
      >
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
        </span>
        <Box className="size-3.5 text-amber-600" />
        <span className="truncate text-[11px] font-semibold text-ink-800">
          {missingNames.length} Mock Asset{missingNames.length > 1 ? "s" : ""} Active
        </span>
        <Info className="text-ink-400 group-hover:text-amber-600 ml-auto size-3 transition" />
      </button>

      {/* Expandable disclaimer details card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-2 w-80 rounded-2xl border border-sand-300 bg-white/98 p-4 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2 border-b border-sand-200 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                <Sparkles className="size-3.5 text-coral-500" />
                3D Asset Disclaimer
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-400 hover:text-ink-700 rounded-full p-1 transition"
                aria-label="Close disclaimer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="mt-2.5 space-y-2 text-xs text-ink-600">
              <p className="leading-relaxed">
                Items marked with placeholder shapes{" "}
                <span className="font-semibold text-ink-900">
                  ({missingNames.join(", ")})
                </span>{" "}
                currently use lightweight 3D bounding volumes to preserve spatial layout.
              </p>
              <p className="rounded-xl bg-amber-50/80 p-2 text-[11px] leading-relaxed text-amber-900 border border-amber-200/60">
                💡 <em>Note:</em> We are actively scanning and modeling high-fidelity 3D assets. This setup will look much sharper once proper geometry is plugged in.
              </p>
              <p className="text-[10px] text-ink-400">
                Desk footprint, physical dimensions, and weekly rental pricing remain 100% accurate.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
