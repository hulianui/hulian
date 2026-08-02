import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    queued: "排队中",
    completed: "已完成",
    failed: "失败",
    notRunning: "未运行",
    videoProduct: "视频产物",
    emptyPrompt: "（空提示词）",
    step: "步",
    overscores: "超分",
    facialRepair: "面部修复",
    slightMirrorMovement: "轻微运镜",
    strongExercise: "强烈运动",
    moderateDynamic: "中等动态",
    video: "视频",
    image: "图片",
  },
  en: {
    queued: "Queued",
    completed: "Completed",
    failed: "Failed",
    notRunning: "Not run",
    videoProduct: "Video artifact",
    emptyPrompt: "(empty prompt)",
    step: "Step",
    overscores: "Upscale",
    facialRepair: "Face restoration",
    slightMirrorMovement: "Subtle camera movement",
    strongExercise: "Strong motion",
    moderateDynamic: "Moderate motion",
    video: "Video",
    image: "Image",
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
  key: "demo-ai-workflow-components-canvas-node-card",
  content: t(content),
};

export default dictionary;
