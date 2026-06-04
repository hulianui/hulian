// mock 模型与可选项清单（生图模型节点 / 检查器消费）。纯数据，无真实服务。

export interface ModelMeta {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

export const MODELS: ModelMeta[] = [
  { id: "huapro-xl", name: "瑚琏绘卷 XL", tag: "通用写实", desc: "均衡的写实大模型，适配多数题材" },
  { id: "yunhui-anime3", name: "云绘 Anime v3", tag: "二次元", desc: "动漫/插画风，线条干净配色明亮" },
  { id: "flux-hl", name: "Flux 瑚琏版", tag: "高保真", desc: "细节与文字还原强，适合海报封面" },
  { id: "realvis-5", name: "RealVis 5", tag: "摄影级", desc: "人像与材质质感接近真实摄影" },
];

export const SAMPLERS = ["Euler a", "DPM++ 2M Karras", "DDIM", "UniPC"] as const;

export const RATIOS = [
  { value: "1:1", label: "方图 1:1", w: 1024, h: 1024 },
  { value: "16:9", label: "宽屏 16:9", w: 1280, h: 720 },
  { value: "9:16", label: "竖屏 9:16", w: 720, h: 1280 },
  { value: "4:3", label: "横构 4:3", w: 1024, h: 768 },
] as const;

export const STYLE_PRESETS = ["电影感", "赛博朋克", "水彩", "3D 渲染", "胶片颗粒", "极简", "国风", "霓虹"];

export const MOTION_LEVELS = [
  { value: "subtle", label: "轻微运镜" },
  { value: "moderate", label: "中等动态" },
  { value: "dynamic", label: "强烈运动" },
];

export function modelName(id: string): string {
  return MODELS.find((m) => m.id === id)?.name ?? id;
}

export function ratioMeta(value: string) {
  return RATIOS.find((r) => r.value === value) ?? RATIOS[0];
}
