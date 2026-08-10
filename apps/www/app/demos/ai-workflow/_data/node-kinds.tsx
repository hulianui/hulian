import { copy } from "./node-kinds.content";
import type { ComponentType } from "react";
import type { FlowHandleSpec } from "@hulianui/ui";
import { Type, ImageIcon, Sparkles, Maximize, Clapperboard, Download } from "lucide-react";
import { randomSeed } from "../_lib/artwork";
import type { FlowNodeData, NodeKind } from "./types";

// 节点类型注册表（SSoT）：驱动左侧节点库、新建默认参数、连接桩、强调色与画布渲染分发。
export type NodeAccent = "brand" | "violet" | "amber" | "cyan" | "rose" | "neutral";
export type NodeGroup = "input" | "generate" | "post-processing" | "output";

export interface NodeKindMeta {
  kind: NodeKind;
  label: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  accent: NodeAccent;
  group: NodeGroup;
  /** 连接桩：左 in(target) / 右 out(source)。 */
  io: ("in" | "out")[];
  width: number;
  /** 新建时的默认 data（客户端调用，可用随机 seed）。 */
  makeDefault: () => FlowNodeData;
}

/** 强调色 → 类名（字面查表，Tailwind 只扫字面量）。 */
export const ACCENT: Record<NodeAccent, { bar: string; chip: string; icon: string }> = {
  brand: { bar: "bg-primary", chip: "bg-primary/12 text-primary", icon: "text-primary" },
  violet: { bar: "bg-chart-4", chip: "bg-chart-4/15 text-chart-4", icon: "text-chart-4" },
  amber: { bar: "bg-chart-3", chip: "bg-chart-3/15 text-chart-3", icon: "text-chart-3" },
  cyan: { bar: "bg-chart-2", chip: "bg-chart-2/15 text-chart-2", icon: "text-chart-2" },
  rose: { bar: "bg-chart-5", chip: "bg-chart-5/15 text-chart-5", icon: "text-chart-5" },
  neutral: { bar: "bg-muted-foreground", chip: "bg-subtle text-muted-foreground", icon: "text-muted-foreground" },
};

export const NODE_KINDS: NodeKindMeta[] = [
  {
    kind: "prompt",
    label: copy("prompt"),
    desc: copy("forwardNegativeDescriptionStyle"),
    icon: Type,
    accent: "brand",
    group: "input",
    io: ["out"],
    width: 260,
    makeDefault: () => ({
      kind: "prompt",
      title: copy("prompt"),
      status: "idle",
      positive: copy("aMechanicalCatSittingInANeonAlleyRainyNight"),
      negative: copy("lowResolutionExtraFingersWatermark"),
      styles: [copy("cinematicSense"), copy("cyberpunk")],
    }),
  },
  {
    kind: "image-input",
    label: copy("referenceDiagram"),
    desc: copy("uploadAnImageAsAGenerativeReference"),
    icon: ImageIcon,
    accent: "cyan",
    group: "input",
    io: ["out"],
    width: 240,
    makeDefault: () => ({
      kind: "image-input",
      title: copy("referenceDiagram"),
      status: "idle",
      fileName: "reference.png",
      seed: randomSeed(),
    }),
  },
  {
    kind: "model",
    label: copy("rawDiagramModel"),
    desc: copy("samplerStepsCFGDimensions"),
    icon: Sparkles,
    accent: "violet",
    group: "generate",
    io: ["in", "out"],
    width: 260,
    makeDefault: () => ({
      kind: "model",
      title: copy("rawDiagramModel"),
      status: "idle",
      model: "huapro-xl",
      sampler: "DPM++ 2M Karras",
      steps: 30,
      cfg: 7,
      ratio: "1:1",
      seed: randomSeed(),
    }),
  },
  {
    kind: "upscale",
    label: copy("highDefinitionMagnification"),
    desc: copy("superResolutionFacialRepair"),
    icon: Maximize,
    accent: "amber",
    group: "post-processing",
    io: ["in", "out"],
    width: 240,
    makeDefault: () => ({
      kind: "upscale",
      title: copy("highDefinitionMagnification"),
      status: "idle",
      factor: 2,
      faceRestore: true,
    }),
  },
  {
    kind: "i2v",
    label: copy("tucsonVideo"),
    desc: copy("durationFrameRateAmplitudeOfMotion"),
    icon: Clapperboard,
    accent: "rose",
    group: "post-processing",
    io: ["in", "out"],
    width: 240,
    makeDefault: () => ({
      kind: "i2v",
      title: copy("tucsonVideo"),
      status: "idle",
      duration: 4,
      fps: 24,
      motion: "moderate",
    }),
  },
  {
    kind: "output",
    label: copy("output"),
    desc: copy("summarizeTheFinalProduct"),
    icon: Download,
    accent: "neutral",
    group: "output",
    io: ["in"],
    width: 240,
    makeDefault: () => ({
      kind: "output",
      title: copy("output"),
      status: "idle",
      format: "image",
    }),
  },
];

export const NODE_KIND_MAP: Record<NodeKind, NodeKindMeta> = Object.fromEntries(
  NODE_KINDS.map((k) => [k.kind, k]),
) as Record<NodeKind, NodeKindMeta>;

/** 节点连接桩声明（供 Flow.getHandles）。 */
export function handlesFor(kind: NodeKind): FlowHandleSpec[] {
  const meta = NODE_KIND_MAP[kind];
  const hs: FlowHandleSpec[] = [];
  if (meta.io.includes("in")) hs.push({ id: "in", type: "target", label: copy("input") });
  if (meta.io.includes("out")) hs.push({ id: "out", type: "source", label: copy("output") });
  return hs;
}
