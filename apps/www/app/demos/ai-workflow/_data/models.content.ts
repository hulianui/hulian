import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    coralReefDrawingXL: "瑚琏绘卷 XL",
    universalRealism: "通用写实",
    balancedRealisticLargeModelSuitableForMostSubjects: "均衡的写实大模型，适配多数题材",
    cloudDrawingAnimeV: "云绘 Anime v3",
    dimensional: "二次元",
    animeIllustrationStyleCleanLinesAndBrightColors: "动漫/插画风，线条干净配色明亮",
    fluxReefEdition: "Flux 瑚琏版",
    highFidelity: "高保真",
    detailAndTextReductionSuitableForPosterCover: "细节与文字还原强，适合海报封面",
    photographyGrade: "摄影级",
    portraitAndTextureCloseToRealPhotography: "人像与材质质感接近真实摄影",
    square: "方图 1:1",
    widescreen: "宽屏 16:9",
    portrait: "竖屏 9:16",
    transverse: "横构 4:3",
    cinematicSense: "电影感",
    cyberpunk: "赛博朋克",
    watercolor: "水彩",
    threeDimensionalRendering: "3D 渲染",
    filmGrain: "胶片颗粒",
    minimalist: "极简",
    guofeng: "国风",
    neon: "霓虹",
    slightMirrorMovement: "轻微运镜",
    moderateDynamic: "中等动态",
    strongExercise: "强烈运动",
  },
  en: {
    coralReefDrawingXL: "Hulian Canvas XL",
    universalRealism: "General photorealism",
    balancedRealisticLargeModelSuitableForMostSubjects:
      "Balanced realistic large model, suitable for most subjects",
    cloudDrawingAnimeV: "Hulian Anime v3",
    dimensional: "Anime",
    animeIllustrationStyleCleanLinesAndBrightColors:
      "Anime/illustration style, clean lines and bright colors",
    fluxReefEdition: "Flux · Hulian Edition",
    highFidelity: "High fidelity",
    detailAndTextReductionSuitableForPosterCover:
      "High detail and strong text rendering for posters and covers",
    photographyGrade: "Photographic",
    portraitAndTextureCloseToRealPhotography: "Natural portrait detail and realistic textures",
    square: "Square 1:1",
    widescreen: "Widescreen 16:9",
    portrait: "Portrait 9:16",
    transverse: "Landscape 4:3",
    cinematicSense: "Cinematic",
    cyberpunk: "Cyberpunk",
    watercolor: "Watercolor",
    threeDimensionalRendering: "3D rendering",
    filmGrain: "Film grain",
    minimalist: "Minimalist",
    guofeng: "Chinese traditional",
    neon: "Neon",
    slightMirrorMovement: "Subtle camera movement",
    moderateDynamic: "Moderate motion",
    strongExercise: "Strong motion",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-ai-workflow-data-models",
  content: t(content),
};

export default dictionary;
