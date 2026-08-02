import { copy } from "./templates.content";
import type { FlowEdge, FlowNode } from "@hulianui/ui";
import type { FlowNodeData, WorkflowTemplate } from "./types";

// 预置工作流模板（固定 seed/位置 → SSR 稳定）。点「使用模板」即把这份 nodes/edges 灌入画布。
// 写成函数返回新副本，避免画布修改污染模板原始数据。

type N = FlowNode<FlowNodeData>;

export const TEMPLATE_CATEGORY_LABELS: Record<WorkflowTemplate["category"], string> = {
  文生图: copy("textToImage"),
  图生图: copy("imageToImage"),
  文生视频: copy("textToVideo"),
  图生视频: copy("imageToVideo"),
};

const t1Nodes: N[] = [
  {
    id: "p1",
    position: { x: 0, y: 80 },
    width: 260,
    data: {
      kind: "prompt",
      title: copy("prompt"),
      status: "idle",
      positive: copy("mountainLakesInTheMorningMistRealisticScenerySoftMorning"),
      negative: copy("noiseOverexposure"),
      styles: [copy("cinematicSense")],
    },
  },
  {
    id: "m1",
    position: { x: 320, y: 40 },
    width: 260,
    data: {
      kind: "model",
      title: copy("rawDiagramModel"),
      status: "idle",
      model: "huapro-xl",
      sampler: "DPM++ 2M Karras",
      steps: 30,
      cfg: 7,
      ratio: "16:9",
      seed: 240118,
    },
  },
  {
    id: "o1",
    position: { x: 660, y: 96 },
    width: 240,
    data: { kind: "output", title: copy("output"), status: "idle", format: "image" },
  },
];
const t1Edges: FlowEdge[] = [
  { id: "e1", source: "p1", target: "m1" },
  { id: "e2", source: "m1", target: "o1" },
];

const t2Nodes: N[] = [
  {
    id: "p1",
    position: { x: 0, y: 80 },
    width: 260,
    data: {
      kind: "prompt",
      title: copy("prompt"),
      status: "idle",
      positive: copy("futureCitySkylineDuskUltraWideAnglePoster"),
      negative: copy("blurDistortion"),
      styles: [copy("cyberpunk"), copy("neon")],
    },
  },
  {
    id: "m1",
    position: { x: 320, y: 40 },
    width: 260,
    data: {
      kind: "model",
      title: copy("rawDiagramModel"),
      status: "idle",
      model: "flux-hl",
      sampler: "UniPC",
      steps: 28,
      cfg: 6,
      ratio: "16:9",
      seed: 771203,
    },
  },
  {
    id: "u1",
    position: { x: 640, y: 56 },
    width: 240,
    data: {
      kind: "upscale",
      title: copy("highDefinitionMagnification"),
      status: "idle",
      factor: 4,
      faceRestore: false,
    },
  },
  {
    id: "o1",
    position: { x: 920, y: 96 },
    width: 240,
    data: { kind: "output", title: copy("output"), status: "idle", format: "image" },
  },
];
const t2Edges: FlowEdge[] = [
  { id: "e1", source: "p1", target: "m1" },
  { id: "e2", source: "m1", target: "u1" },
  { id: "e3", source: "u1", target: "o1" },
];

const t3Nodes: N[] = [
  {
    id: "i1",
    position: { x: 0, y: 0 },
    width: 240,
    data: {
      kind: "image-input",
      title: copy("referenceDiagram"),
      status: "idle",
      fileName: "portrait.png",
      seed: 330921,
    },
  },
  {
    id: "p1",
    position: { x: 0, y: 220 },
    width: 260,
    data: {
      kind: "prompt",
      title: copy("prompt"),
      status: "idle",
      positive: copy("retainCompositionAndTurnToWatercolorIllustrationStyle"),
      negative: copy("realismPhotos"),
      styles: [copy("watercolor")],
    },
  },
  {
    id: "m1",
    position: { x: 340, y: 96 },
    width: 260,
    data: {
      kind: "model",
      title: copy("rawDiagramModel"),
      status: "idle",
      model: "yunhui-anime3",
      sampler: "Euler a",
      steps: 26,
      cfg: 8,
      ratio: "1:1",
      seed: 558014,
    },
  },
  {
    id: "o1",
    position: { x: 680, y: 132 },
    width: 240,
    data: { kind: "output", title: copy("output"), status: "idle", format: "image" },
  },
];
const t3Edges: FlowEdge[] = [
  { id: "e1", source: "i1", target: "m1" },
  { id: "e2", source: "p1", target: "m1" },
  { id: "e3", source: "m1", target: "o1" },
];

const t4Nodes: N[] = [
  {
    id: "p1",
    position: { x: 0, y: 80 },
    width: 260,
    data: {
      kind: "prompt",
      title: copy("prompt"),
      status: "idle",
      positive: copy("whalesRoamingTheStarsDreamySlowShot"),
      negative: copy("jitterNoise"),
      styles: [copy("cinematicSense"), copy("threeDimensionalRendering")],
    },
  },
  {
    id: "m1",
    position: { x: 320, y: 40 },
    width: 260,
    data: {
      kind: "model",
      title: copy("rawDiagramModel"),
      status: "idle",
      model: "huapro-xl",
      sampler: "DPM++ 2M Karras",
      steps: 32,
      cfg: 7,
      ratio: "16:9",
      seed: 902335,
    },
  },
  {
    id: "v1",
    position: { x: 640, y: 56 },
    width: 240,
    data: {
      kind: "i2v",
      title: copy("tucsonVideo"),
      status: "idle",
      duration: 4,
      fps: 24,
      motion: "moderate",
    },
  },
  {
    id: "o1",
    position: { x: 920, y: 96 },
    width: 240,
    data: { kind: "output", title: copy("output"), status: "idle", format: "video" },
  },
];
const t4Edges: FlowEdge[] = [
  { id: "e1", source: "p1", target: "m1" },
  { id: "e2", source: "m1", target: "v1" },
  { id: "e3", source: "v1", target: "o1" },
];

const t5Nodes: N[] = [
  {
    id: "i1",
    position: { x: 0, y: 56 },
    width: 240,
    data: {
      kind: "image-input",
      title: copy("referenceDiagram"),
      status: "idle",
      fileName: "scene.png",
      seed: 140677,
    },
  },
  {
    id: "v1",
    position: { x: 320, y: 56 },
    width: 240,
    data: {
      kind: "i2v",
      title: copy("tucsonVideo"),
      status: "idle",
      duration: 6,
      fps: 30,
      motion: "dynamic",
    },
  },
  {
    id: "o1",
    position: { x: 600, y: 96 },
    width: 240,
    data: { kind: "output", title: copy("output"), status: "idle", format: "video" },
  },
];
const t5Edges: FlowEdge[] = [
  { id: "e1", source: "i1", target: "v1" },
  { id: "e2", source: "v1", target: "o1" },
];

const RAW: WorkflowTemplate[] = [
  {
    id: "t1",
    name: copy("vincentMapsFoundation"),
    desc: copy("promptWordStraightOutAGraphShortestLink"),
    category: "文生图",
    tags: [copy("gettingStarted"), copy("fast")],
    nodes: t1Nodes,
    edges: t1Edges,
  },
  {
    id: "t2",
    name: copy("vincentHighDefinitionEnlargement"),
    desc: copy("afterTheGenerationXSuperPointsWillBeScoredAnd"),
    category: "文生图",
    tags: [copy("poster"), copy("overscores")],
    nodes: t2Nodes,
    edges: t2Edges,
  },
  {
    id: "t3",
    name: copy("tuscanyStyleRedraw"),
    desc: copy("referToFigurePromptWordsKeepCompositionAndChangeStyle"),
    category: "图生图",
    tags: [copy("redraw"), copy("styleMigration")],
    nodes: t3Nodes,
    edges: t3Edges,
  },
  {
    id: "t4",
    name: copy("vincentVideo"),
    desc: copy("textGenerationTutuGenerationVideoOneStop"),
    category: "文生视频",
    tags: [copy("video"), copy("dynamic")],
    nodes: t4Nodes,
    edges: t4Edges,
  },
  {
    id: "t5",
    name: copy("tucsonVideo"),
    desc: copy("uploadAPictureToGetItUpAndRunning"),
    category: "图生视频",
    tags: [copy("video"), copy("runningMirror")],
    nodes: t5Nodes,
    edges: t5Edges,
  },
];

export const TEMPLATES: WorkflowTemplate[] = RAW;

/** 取模板的深拷贝（灌入画布用，避免污染原始定义）。 */
export function instantiateTemplate(id: string): { nodes: N[]; edges: FlowEdge[] } | null {
  const t = RAW.find((x) => x.id === id);
  if (!t) return null;
  return {
    nodes: t.nodes.map((n) => ({
      ...n,
      position: { ...n.position },
      data: { ...n.data } as FlowNodeData,
    })),
    edges: t.edges.map((e) => ({ ...e })),
  };
}
