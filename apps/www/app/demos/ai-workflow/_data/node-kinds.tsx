import type { ComponentType } from "react";
import type { FlowHandleSpec } from "@hulianui/ui";
import { Type, ImageIcon, Sparkles, Maximize, Clapperboard, Download } from "lucide-react";
import { randomSeed } from "../_lib/artwork";
import type { FlowNodeData, NodeKind } from "./types";

// 节点类型注册表（SSoT）：驱动左侧节点库、新建默认参数、连接桩、强调色与画布渲染分发。
export type NodeAccent = "brand" | "violet" | "amber" | "cyan" | "rose" | "neutral";

export interface NodeKindMeta {
  kind: NodeKind;
  label: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  accent: NodeAccent;
  group: "输入" | "生成" | "后处理" | "输出";
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
  neutral: { bar: "bg-muted", chip: "bg-muted/15 text-muted", icon: "text-muted" },
};

export const NODE_KINDS: NodeKindMeta[] = [
  {
    kind: "prompt",
    label: "提示词",
    desc: "正向 / 负向描述 + 风格",
    icon: Type,
    accent: "brand",
    group: "输入",
    io: ["out"],
    width: 260,
    makeDefault: () => ({
      kind: "prompt",
      title: "提示词",
      status: "idle",
      positive: "一只机械猫坐在霓虹小巷，雨夜，电影感光影",
      negative: "低分辨率, 多余手指, 水印",
      styles: ["电影感", "赛博朋克"],
    }),
  },
  {
    kind: "image-input",
    label: "参考图",
    desc: "上传图作为生成参考",
    icon: ImageIcon,
    accent: "cyan",
    group: "输入",
    io: ["out"],
    width: 240,
    makeDefault: () => ({
      kind: "image-input",
      title: "参考图",
      status: "idle",
      fileName: "reference.png",
      seed: randomSeed(),
    }),
  },
  {
    kind: "model",
    label: "生图模型",
    desc: "采样器 / 步数 / CFG / 尺寸",
    icon: Sparkles,
    accent: "violet",
    group: "生成",
    io: ["in", "out"],
    width: 260,
    makeDefault: () => ({
      kind: "model",
      title: "生图模型",
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
    label: "高清放大",
    desc: "超分辨率 + 面部修复",
    icon: Maximize,
    accent: "amber",
    group: "后处理",
    io: ["in", "out"],
    width: 240,
    makeDefault: () => ({
      kind: "upscale",
      title: "高清放大",
      status: "idle",
      factor: 2,
      faceRestore: true,
    }),
  },
  {
    kind: "i2v",
    label: "图生视频",
    desc: "时长 / 帧率 / 运动幅度",
    icon: Clapperboard,
    accent: "rose",
    group: "后处理",
    io: ["in", "out"],
    width: 240,
    makeDefault: () => ({
      kind: "i2v",
      title: "图生视频",
      status: "idle",
      duration: 4,
      fps: 24,
      motion: "moderate",
    }),
  },
  {
    kind: "output",
    label: "输出",
    desc: "汇总最终产物",
    icon: Download,
    accent: "neutral",
    group: "输出",
    io: ["in"],
    width: 240,
    makeDefault: () => ({
      kind: "output",
      title: "输出",
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
  if (meta.io.includes("in")) hs.push({ id: "in", type: "target", label: "输入" });
  if (meta.io.includes("out")) hs.push({ id: "out", type: "source", label: "输出" });
  return hs;
}
