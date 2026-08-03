"use client";
import { copy } from "./routing-weights-panel.content";

// 智能路由 · 六维权重控制面板：6 个 Slider 调 capability/cost/latency/load/priority/sla，
// 受控持 SixWeights，任一维变更回吐父级（父级据此重算决策回放）。
import { Slider, Tag } from "@hulianui/ui";
import type { SixWeights } from "../_data/types";

/** 六维元数据：键、显示名、语义提示、色调（与决策回放表分项条配色一致）。 */
export const WEIGHT_DIMS: {
  key: keyof SixWeights;
  label: string;
  hint: string;
  tone: string;
}[] = [
  { key: "capability", label: copy("abilityMatching"), hint: copy("coveringTheRequiredCapabilitiesForTasksThe"), tone: "var(--color-chart-1)" },
  { key: "cost", label: copy("cost"), hint: copy("theLowerTheMixedUnitPriceThe"), tone: "var(--color-chart-2)" },
  { key: "latency", label: copy("delay"), hint: copy("theLowerTheEndToEndLatency"), tone: "var(--color-chart-3)" },
  { key: "load", label: copy("load"), hint: copy("theLowerTheCurrentOccupancyRateThe"), tone: "var(--color-chart-4)" },
  { key: "priority", label: copy("priority"), hint: copy("preferredForHighQualityTasksThoseWith"), tone: "var(--color-chart-5)" },
  { key: "sla", label: copy("slaMargin"), hint: copy("theWiderTheRelativeSlaThresholdThe"), tone: "var(--color-primary)" },
];

interface Props {
  weights: SixWeights;
  onChange: (next: SixWeights) => void;
  onReset: () => void;
}

export function RoutingWeightsPanel({ weights, onChange, onReset }: Props) {
  const sum = WEIGHT_DIMS.reduce((acc, d) => acc + weights[d.key], 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">{copy("andAuthorityWasWeightyAndHarmonious")}<span className="font-medium tabular-nums text-foreground">{sum.toFixed(2)}</span>{copy("scoringIsCalculatedByWeightingAndSumming")}</div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-[var(--radius)] border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >{copy("resetsToEqualWeight")}</button>
      </div>

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {WEIGHT_DIMS.map((d) => {
          const v = weights[d.key];
          return (
            <div key={d.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ background: d.tone }}
                  />
                  <span className="text-sm font-medium text-foreground">{d.label}</span>
                </div>
                <Tag size="sm" variant="soft" tone="neutral">
                  {v.toFixed(2)}
                </Tag>
              </div>
              <Slider
                value={v}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  onChange({ ...weights, [d.key]: next });
                }}
                aria-label={copy("valueHeldGreatPower", d.label)}
              />
              <div className="text-xs text-muted">{d.hint}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
