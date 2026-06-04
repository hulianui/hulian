// AI 生图/视频工作流的节点数据模型（SSoT）。
// 节点 = @hulian/ui 的 FlowNode<FlowNodeData>；data 按 kind 区分参数。组件只管画布几何/交互，
// 业务参数与运行态全在这套类型里，由画布页面（消费者）持有并回写。

export type NodeKind = "prompt" | "image-input" | "model" | "upscale" | "i2v" | "output";

/** 单节点运行态。idle=未运行 / queued=排队 / running=生成中 / done=完成 / error=失败。 */
export type NodeStatus = "idle" | "queued" | "running" | "done" | "error";

/** 运行产物：图（程序化渐变 seed）或视频（url + 封面）。 */
export interface NodeResult {
  type: "image" | "video";
  /** 图产物：网格渐变种子（meshGradient(seed)）。 */
  seed?: number;
  /** 视频产物地址。 */
  videoUrl?: string;
  /** 视频封面。 */
  poster?: string;
  /** 角标文案（如「1024×1024」「4s · 24fps」）。 */
  meta?: string;
}

interface BaseNodeData {
  kind: NodeKind;
  /** 节点标题（可被检查器改名）。 */
  title: string;
  status: NodeStatus;
  result?: NodeResult;
}

export interface PromptNodeData extends BaseNodeData {
  kind: "prompt";
  positive: string;
  negative: string;
  /** 风格预设标签。 */
  styles: string[];
}

export interface ImageInputNodeData extends BaseNodeData {
  kind: "image-input";
  fileName: string;
  seed: number;
}

export interface ModelNodeData extends BaseNodeData {
  kind: "model";
  model: string;
  sampler: string;
  steps: number;
  cfg: number;
  ratio: string;
  seed: number;
}

export interface UpscaleNodeData extends BaseNodeData {
  kind: "upscale";
  factor: 2 | 4;
  faceRestore: boolean;
}

export interface I2VNodeData extends BaseNodeData {
  kind: "i2v";
  duration: number;
  fps: number;
  motion: string;
}

export interface OutputNodeData extends BaseNodeData {
  kind: "output";
  format: "image" | "video";
}

export type FlowNodeData =
  | PromptNodeData
  | ImageInputNodeData
  | ModelNodeData
  | UpscaleNodeData
  | I2VNodeData
  | OutputNodeData;

/** 历史产物（产物画廊）。 */
export interface Artifact {
  id: string;
  type: "image" | "video";
  title: string;
  seed?: number;
  videoUrl?: string;
  poster?: string;
  model: string;
  ratio: string;
  workflow: string;
  /** 创建时间展示串（避免 SSR Date 漂移，存定值）。 */
  createdAt: string;
  prompt: string;
}

/** 工作流模板。 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  desc: string;
  category: "文生图" | "图生图" | "文生视频" | "图生视频";
  tags: string[];
  nodes: import("@hulian/ui").FlowNode<FlowNodeData>[];
  edges: import("@hulian/ui").FlowEdge[];
}
