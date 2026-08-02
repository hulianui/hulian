import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    prompt: "提示词",
    mountainLakesInTheMorningMistRealisticScenerySoftMorning:
      "晨雾中的山间湖泊，写实风光，柔和晨光",
    noiseOverexposure: "噪点, 过曝",
    cinematicSense: "电影感",
    rawDiagramModel: "生图模型",
    output: "输出",
    futureCitySkylineDuskUltraWideAnglePoster: "未来城市天际线，黄昏，超广角，海报",
    blurDistortion: "模糊, 畸变",
    cyberpunk: "赛博朋克",
    neon: "霓虹",
    highDefinitionMagnification: "高清放大",
    referenceDiagram: "参考图",
    retainCompositionAndTurnToWatercolorIllustrationStyle: "保留构图，转为水彩插画风",
    realismPhotos: "写实, 照片",
    watercolor: "水彩",
    whalesRoamingTheStarsDreamySlowShot: "鲸鱼在星空中游弋，梦幻，慢镜头",
    jitterNoise: "抖动, 噪点",
    threeDimensionalRendering: "3D 渲染",
    tucsonVideo: "图生视频",
    vincentMapsFoundation: "文生图 · 基础",
    promptWordStraightOutAGraphShortestLink: "提示词直出一张图，最短链路",
    gettingStarted: "入门",
    fast: "快速",
    vincentHighDefinitionEnlargement: "文生图 · 高清放大",
    afterTheGenerationXSuperPointsWillBeScoredAnd: "生成后接 ×4 超分，出海报级大图",
    poster: "海报",
    overscores: "超分",
    tuscanyStyleRedraw: "图生图 · 风格重绘",
    referToFigurePromptWordsKeepCompositionAndChangeStyle: "参考图 + 提示词，保留构图换风格",
    redraw: "重绘",
    styleMigration: "风格迁移",
    vincentVideo: "文生视频",
    textGenerationTutuGenerationVideoOneStop: "文字 → 生图 → 图生视频一条龙",
    video: "视频",
    dynamic: "动态",
    uploadAPictureToGetItUpAndRunning: "上传一张图，直接让它动起来",
    runningMirror: "运镜",
    textToImage: "文生图",
    imageToImage: "图生图",
    textToVideo: "文生视频",
    imageToVideo: "图生视频",
  },
  en: {
    prompt: "Prompt",
    mountainLakesInTheMorningMistRealisticScenerySoftMorning:
      "A mountain lake in morning mist, photorealistic landscape, soft dawn light",
    noiseOverexposure: "Noise, overexposure",
    cinematicSense: "Cinematic",
    rawDiagramModel: "Image model",
    output: "Output",
    futureCitySkylineDuskUltraWideAnglePoster:
      "Futuristic city skyline at dusk, ultra-wide composition, poster design",
    blurDistortion: "Blur, Distortion",
    cyberpunk: "Cyberpunk",
    neon: "Neon",
    highDefinitionMagnification: "HD upscale",
    referenceDiagram: "Reference image",
    retainCompositionAndTurnToWatercolorIllustrationStyle:
      "Keep the composition and restyle it as a watercolor illustration",
    realismPhotos: "Photorealistic",
    watercolor: "Watercolor",
    whalesRoamingTheStarsDreamySlowShot:
      "A whale drifting through a star field, dreamlike, slow camera movement",
    jitterNoise: "Jitter, noise",
    threeDimensionalRendering: "3D rendering",
    tucsonVideo: "Image to Video",
    vincentMapsFoundation: "Text to Image · Basic",
    promptWordStraightOutAGraphShortestLink:
      "Generate one image directly from a prompt using the shortest workflow",
    gettingStarted: "Beginner",
    fast: "Fast",
    vincentHighDefinitionEnlargement: "Text to Image · HD Upscale",
    afterTheGenerationXSuperPointsWillBeScoredAnd:
      "Generate an image, then apply 4x super-resolution for a poster-ready result",
    poster: "Poster",
    overscores: "Upscale",
    tuscanyStyleRedraw: "Image to Image · Style transfer",
    referToFigurePromptWordsKeepCompositionAndChangeStyle:
      "Combine a reference image with a prompt to preserve composition while changing style",
    redraw: "Redraw",
    styleMigration: "Style transfer",
    vincentVideo: "Text to Video",
    textGenerationTutuGenerationVideoOneStop: "Prompt → image → video in one workflow",
    video: "Video",
    dynamic: "Dynamic",
    uploadAPictureToGetItUpAndRunning: "Upload an image and bring it to life",
    runningMirror: "Camera movement",
    textToImage: "Text to image",
    imageToImage: "Image to image",
    textToVideo: "Text to video",
    imageToVideo: "Image to video",
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
  key: "demo-ai-workflow-data-templates",
  content: t(content),
};

export default dictionary;
