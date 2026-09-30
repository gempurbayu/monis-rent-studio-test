"use client";

import { Laptop, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { PRESETS } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { buildQuote, formatUSD } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import type { Setup } from "@/types/workspace";

const PRESET_ICONS: Record<string, React.ReactNode> = {
  starter: <Laptop className="size-4 text-teal-700" />,
  focus: <Sparkles className="size-4 text-amber-600" />,
  studio: <Monitor className="size-4 text-teal-800" />,
};

function isPresetActive(presetSetup: Setup, currentSetup: Setup): boolean {
  if (presetSetup.desk?.productId !== currentSetup.desk?.productId) return false;
  if (presetSetup.chair?.productId !== currentSetup.chair?.productId) return false;
  if (presetSetup.accessories.length !== currentSetup.accessories.length) return false;
  return presetSetup.accessories.every((pa) =>
    currentSetup.accessories.some(
      (ca) => ca.productId === pa.productId && ca.qty === pa.qty,
    ),
  );
}

/**
 * Jump-start row. An empty configurator is a cold start — one click to a
 * complete, credible setup is the fastest route to "oh, I want this".
 */
export function PresetBar() {
  const applyPreset = useWorkspace((s) => s.applyPreset);
  const reset = useWorkspace((s) => s.reset);
  const weeks = useWorkspace((s) => s.weeks);
  const setup = useWorkspace((s) => s.setup);

  const hasSetup = Boolean(setup.desk || setup.chair || setup.accessories.length);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink-500 mr-1 text-[11px] font-bold tracking-wider uppercase">
        Start with
      </span>

      {PRESETS.map((preset) => {
        const total = buildQuote(preset.setup, weeks).totalPerWeek;
        const isActive = isPresetActive(preset.setup, setup);

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            title={preset.blurb}
            className={cn(
              "group flex items-center gap-2.5 rounded-full border py-1.5 pr-3.5 pl-2.5 text-left transition shadow-xs",
              isActive
                ? "border-teal-600 bg-teal-50/90 ring-2 ring-teal-600/25 font-medium"
                : "border-sand-300 bg-white hover:border-teal-400 hover:bg-teal-50/30",
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full transition",
                isActive ? "bg-teal-100" : "bg-sand-100 group-hover:bg-teal-50",
              )}
            >
              {PRESET_ICONS[preset.id] ?? <Laptop className="size-3.5 text-teal-700" />}
            </span>
            <span className="leading-tight">
              <span className="flex items-center gap-1.5">
                <span className="text-ink-900 block text-xs font-bold">
                  {preset.name}
                </span>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-teal-600" />
                )}
              </span>
              <span className="text-ink-500 block text-[10px]">
                {formatUSD(total)}/week
              </span>
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={reset}
        disabled={!hasSetup}
        className={cn(
          "ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          hasSetup
            ? "text-ink-600 hover:bg-sand-200 hover:text-ink-900"
            : "text-sand-400 cursor-not-allowed opacity-50",
        )}
      >
        <RotateCcw className="size-3.5" />
        Start over
      </button>
    </div>
  );
}
