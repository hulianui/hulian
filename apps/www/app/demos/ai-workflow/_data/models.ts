import { copy } from "./models.content";
// mock 模型与可选项清单（生图模型节点 / 检查器消费）。纯数据，无真实服务。

export interface ModelMeta {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

export const MODELS: ModelMeta[] = [
  {
    id: "huapro-xl",
    name: copy("coralReefDrawingXL"),
    tag: copy("universalRealism"),
    desc: copy("balancedRealisticLargeModelSuitableForMostSubjects"),
  },
  {
    id: "yunhui-anime3",
    name: copy("cloudDrawingAnimeV"),
    tag: copy("dimensional"),
    desc: copy("animeIllustrationStyleCleanLinesAndBrightColors"),
  },
  {
    id: "flux-hl",
    name: copy("fluxReefEdition"),
    tag: copy("highFidelity"),
    desc: copy("detailAndTextReductionSuitableForPosterCover"),
  },
  {
    id: "realvis-5",
    name: "RealVis 5",
    tag: copy("photographyGrade"),
    desc: copy("portraitAndTextureCloseToRealPhotography"),
  },
];

export const SAMPLERS = ["Euler a", "DPM++ 2M Karras", "DDIM", "UniPC"] as const;

export const RATIOS = [
  { value: "1:1", label: copy("square"), w: 1024, h: 1024 },
  { value: "16:9", label: copy("widescreen"), w: 1280, h: 720 },
  { value: "9:16", label: copy("portrait"), w: 720, h: 1280 },
  { value: "4:3", label: copy("transverse"), w: 1024, h: 768 },
] as const;

export const STYLE_PRESETS = [
  copy("cinematicSense"),
  copy("cyberpunk"),
  copy("watercolor"),
  copy("threeDimensionalRendering"),
  copy("filmGrain"),
  copy("minimalist"),
  copy("guofeng"),
  copy("neon"),
];

export const MOTION_LEVELS = [
  { value: "subtle", label: copy("slightMirrorMovement") },
  { value: "moderate", label: copy("moderateDynamic") },
  { value: "dynamic", label: copy("strongExercise") },
];

export function modelName(id: string): string {
  return MODELS.find((m) => m.id === id)?.name ?? id;
}

export function ratioMeta(value: string) {
  return RATIOS.find((r) => r.value === value) ?? RATIOS[0];
}
