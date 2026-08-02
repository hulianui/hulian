import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    prompt: "提示词",
    forwardNegativeDescriptionStyle: "正向 / 负向描述 + 风格",
    aMechanicalCatSittingInANeonAlleyRainyNight: "一只机械猫坐在霓虹小巷，雨夜，电影感光影",
    lowResolutionExtraFingersWatermark: "低分辨率, 多余手指, 水印",
    cinematicSense: "电影感",
    cyberpunk: "赛博朋克",
    referenceDiagram: "参考图",
    uploadAnImageAsAGenerativeReference: "上传图作为生成参考",
    rawDiagramModel: "生图模型",
    samplerStepsCFGDimensions: "采样器 / 步数 / CFG / 尺寸",
    highDefinitionMagnification: "高清放大",
    superResolutionFacialRepair: "超分辨率 + 面部修复",
    tucsonVideo: "图生视频",
    durationFrameRateAmplitudeOfMotion: "时长 / 帧率 / 运动幅度",
    output: "输出",
    summarizeTheFinalProduct: "汇总最终产物",
    input: "输入",
  },
  en: {
    prompt: "Prompt",
    forwardNegativeDescriptionStyle: "Prompt / negative prompt + style",
    aMechanicalCatSittingInANeonAlleyRainyNight:
      "A mechanical cat in a neon-lit alley on a rainy night, cinematic photography",
    lowResolutionExtraFingersWatermark: "Low resolution, extra fingers, watermark",
    cinematicSense: "Cinematic",
    cyberpunk: "Cyberpunk",
    referenceDiagram: "Reference image",
    uploadAnImageAsAGenerativeReference: "Upload an image as a generative reference",
    rawDiagramModel: "Image model",
    samplerStepsCFGDimensions: "Sampler / steps / CFG / dimensions",
    highDefinitionMagnification: "HD upscale",
    superResolutionFacialRepair: "Super-resolution + face restoration",
    tucsonVideo: "Image to video",
    durationFrameRateAmplitudeOfMotion: "Duration / frame rate / motion strength",
    output: "Output",
    summarizeTheFinalProduct: "Collect the final artifact",
    input: "Input",
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
  key: "demo-ai-workflow-data-node-kinds",
  content: t(content),
};

export default dictionary;
