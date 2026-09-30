"use client";

import { RotateCcw } from "lucide-react";
import { PRESETS } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { buildQuote, formatUSD } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";

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
      <span className="text-ink-600 mr-1 text-xs font-semibold tracking-wide uppercase">
        Start from
      </span>

      {PRESETS.map((preset) => {
        const total = buildQuote(preset.setup, weeks).totalPerWeek;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            title={preset.blurb}
            className="border-sand-300 hover:border-coral-500 hover:bg-coral-400/5 group flex items-center gap-2 rounded-full border bg-white py-1.5 pr-3 pl-2 text-left transition"
          >
            <span aria-hidden className="text-lg leading-none">
              {preset.glyph}
            </span>
            <span className="leading-tight">
              <span className="text-ink-900 block text-sm font-semibold">
                {preset.name}
              </span>
              <span className="text-ink-600 block text-[11px]">
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
          "text-ink-600 ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition",
          hasSetup ? "hover:bg-sand-200" : "opacity-40",
        )}
      >
        <RotateCcw className="size-3.5" />
        Start over
      </button>
    </div>
  );
}
