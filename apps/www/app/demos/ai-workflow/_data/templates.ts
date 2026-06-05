import type { FlowEdge, FlowNode } from "@hulianui/ui";
import type { FlowNodeData, WorkflowTemplate } from "./types";

// 预置工作流模板（固定 seed/位置 → SSR 稳定）。点「使用模板」即把这份 nodes/edges 灌入画布。
// 写成函数返回新副本，避免画布修改污染模板原始数据。

type N = FlowNode<FlowNodeData>;

const t1Nodes: N[] = [
  { id: "p1", position: { x: 0, y: 80 }, width: 260, data: { kind: "prompt", title: "提示词", status: "idle", positive: "晨雾中的山间湖泊，写实风光，柔和晨光", negative: "噪点, 过曝", styles: ["电影感"] } },
  { id: "m1", position: { x: 320, y: 40 }, width: 260, data: { kind: "model", title: "生图模型", status: "idle", model: "huapro-xl", sampler: "DPM++ 2M Karras", steps: 30, cfg: 7, ratio: "16:9", seed: 240118 } },
  { id: "o1", position: { x: 660, y: 96 }, width: 240, data: { kind: "output", title: "输出", status: "idle", format: "image" } },
];
const t1Edges: FlowEdge[] = [
  { id: "e1", source: "p1", target: "m1" },
  { id: "e2", source: "m1", target: "o1" },
];

const t2Nodes: N[] = [
  { id: "p1", position: { x: 0, y: 80 }, width: 260, data: { kind: "prompt", title: "提示词", status: "idle", positive: "未来城市天际线，黄昏，超广角，海报", negative: "模糊, 畸变", styles: ["赛博朋克", "霓虹"] } },
  { id: "m1", position: { x: 320, y: 40 }, width: 260, data: { kind: "model", title: "生图模型", status: "idle", model: "flux-hl", sampler: "UniPC", steps: 28, cfg: 6, ratio: "16:9", seed: 771203 } },
  { id: "u1", position: { x: 640, y: 56 }, width: 240, data: { kind: "upscale", title: "高清放大", status: "idle", factor: 4, faceRestore: false } },
  { id: "o1", position: { x: 920, y: 96 }, width: 240, data: { kind: "output", title: "输出", status: "idle", format: "image" } },
];
const t2Edges: FlowEdge[] = [
  { id: "e1", source: "p1", target: "m1" },
  { id: "e2", source: "m1", target: "u1" },
  { id: "e3", source: "u1", target: "o1" },
];

const t3Nodes: N[] = [
  { id: "i1", position: { x: 0, y: 0 }, width: 240, data: { kind: "image-input", title: "参考图", status: "idle", fileName: "portrait.png", seed: 330921 } },
  { id: "p1", position: { x: 0, y: 220 }, width: 260, data: { kind: "prompt", title: "提示词", status: "idle", positive: "保留构图，转为水彩插画风", negative: "写实, 照片", styles: ["水彩"] } },
  { id: "m1", position: { x: 340, y: 96 }, width: 260, data: { kind: "model", title: "生图模型", status: "idle", model: "yunhui-anime3", sampler: "Euler a", steps: 26, cfg: 8, ratio: "1:1", seed: 558014 } },
  { id: "o1", position: { x: 680, y: 132 }, width: 240, data: { kind: "output", title: "输出", status: "idle", format: "image" } },
];
const t3Edges: FlowEdge[] = [
  { id: "e1", source: "i1", target: "m1" },
  { id: "e2", source: "p1", target: "m1" },
  { id: "e3", source: "m1", target: "o1" },
];

const t4Nodes: N[] = [
  { id: "p1", position: { x: 0, y: 80 }, width: 260, data: { kind: "prompt", title: "提示词", status: "idle", positive: "鲸鱼在星空中游弋，梦幻，慢镜头", negative: "抖动, 噪点", styles: ["电影感", "3D 渲染"] } },
  { id: "m1", position: { x: 320, y: 40 }, width: 260, data: { kind: "model", title: "生图模型", status: "idle", model: "huapro-xl", sampler: "DPM++ 2M Karras", steps: 32, cfg: 7, ratio: "16:9", seed: 902335 } },
  { id: "v1", position: { x: 640, y: 56 }, width: 240, data: { kind: "i2v", title: "图生视频", status: "idle", duration: 4, fps: 24, motion: "moderate" } },
  { id: "o1", position: { x: 920, y: 96 }, width: 240, data: { kind: "output", title: "输出", status: "idle", format: "video" } },
];
const t4Edges: FlowEdge[] = [
  { id: "e1", source: "p1", target: "m1" },
  { id: "e2", source: "m1", target: "v1" },
  { id: "e3", source: "v1", target: "o1" },
];

const t5Nodes: N[] = [
  { id: "i1", position: { x: 0, y: 56 }, width: 240, data: { kind: "image-input", title: "参考图", status: "idle", fileName: "scene.png", seed: 140677 } },
  { id: "v1", position: { x: 320, y: 56 }, width: 240, data: { kind: "i2v", title: "图生视频", status: "idle", duration: 6, fps: 30, motion: "dynamic" } },
  { id: "o1", position: { x: 600, y: 96 }, width: 240, data: { kind: "output", title: "输出", status: "idle", format: "video" } },
];
const t5Edges: FlowEdge[] = [
  { id: "e1", source: "i1", target: "v1" },
  { id: "e2", source: "v1", target: "o1" },
];

const RAW: WorkflowTemplate[] = [
  { id: "t1", name: "文生图 · 基础", desc: "提示词直出一张图，最短链路", category: "文生图", tags: ["入门", "快速"], nodes: t1Nodes, edges: t1Edges },
  { id: "t2", name: "文生图 · 高清放大", desc: "生成后接 ×4 超分，出海报级大图", category: "文生图", tags: ["海报", "超分"], nodes: t2Nodes, edges: t2Edges },
  { id: "t3", name: "图生图 · 风格重绘", desc: "参考图 + 提示词，保留构图换风格", category: "图生图", tags: ["重绘", "风格迁移"], nodes: t3Nodes, edges: t3Edges },
  { id: "t4", name: "文生视频", desc: "文字 → 生图 → 图生视频一条龙", category: "文生视频", tags: ["视频", "动态"], nodes: t4Nodes, edges: t4Edges },
  { id: "t5", name: "图生视频", desc: "上传一张图，直接让它动起来", category: "图生视频", tags: ["视频", "运镜"], nodes: t5Nodes, edges: t5Edges },
];

export const TEMPLATES: WorkflowTemplate[] = RAW;

/** 取模板的深拷贝（灌入画布用，避免污染原始定义）。 */
export function instantiateTemplate(id: string): { nodes: N[]; edges: FlowEdge[] } | null {
  const t = RAW.find((x) => x.id === id);
  if (!t) return null;
  return {
    nodes: t.nodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } as FlowNodeData })),
    edges: t.edges.map((e) => ({ ...e })),
  };
}
