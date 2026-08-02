import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    randomSeeds: "随机种子",
    forwardPrompt: "正向提示词",
    describeThePictureYouWant: "描述你想要的画面…",
    negativePrompt: "负向提示词",
    unwantedElements: "不希望出现的元素",
    lowResolutionWatermark: "低分辨率, 水印…",
    stylePresets: "风格预设",
    referenceDiagram: "参考图",
    current: "当前：",
    model: "模型",
    sampler: "采样器",
    samplingStepsLabel: "采样步数 · {0}",
    cfg: "提示词引导 CFG · {0}",
    dimensionRatio: "尺寸比例",
    magnification: "放大倍数",
    facialRepair: "面部修复",
    videoDurationLabel: "视频时长 · {0}s",
    frameRate: "帧率",
    movementAmplitude: "运动幅度",
    outputType: "输出类型",
    image: "图片",
    video: "视频",
    runToPreviewTheFinalProductHere: "运行后在此预览最终产物。",
    workflowOverview: "工作流概览",
    node: "节点",
    connect: "连线",
    expected: "预计",
    executionOrderTopologicalOrder: "执行顺序（拓扑序）",
    theCanvasIsStillEmptyStartingWithTheNodeLibrary: "画布还是空的，从左侧节点库添加节点开始。",
    tipSelectTheNodeToEditTheParametersDragFrom:
      "提示：选中节点可编辑参数；从节点右侧的圆点拖到下一个节点左侧圆点即可连线；滚轮平移、Ctrl/⌘ + 滚轮缩放。",
    parameters: "· 参数",
    nodeName: "节点名称",
    deleteNode: "删除节点",
  },
  en: {
    randomSeeds: "Random seed",
    forwardPrompt: "Prompt",
    describeThePictureYouWant: "Describe the image you want...",
    negativePrompt: "Negative prompt",
    unwantedElements: "Unwanted elements",
    lowResolutionWatermark: "Low resolution, watermark...",
    stylePresets: "Style preset",
    referenceDiagram: "Reference image",
    current: "Current:",
    model: "Model",
    sampler: "Sampler",
    samplingStepsLabel: "Sampling steps · {0}",
    cfg: "Prompt guidance (CFG) · {0}",
    dimensionRatio: "Aspect ratio",
    magnification: "Upscale factor",
    facialRepair: "Face restoration",
    videoDurationLabel: "Video duration · {0}s",
    frameRate: "Frame rate",
    movementAmplitude: "Motion strength",
    outputType: "Output type",
    image: "Image",
    video: "Video",
    runToPreviewTheFinalProductHere: "Run the workflow to preview the final artifact here.",
    workflowOverview: "Workflow overview",
    node: "Node",
    connect: "Connect",
    expected: "Expected",
    executionOrderTopologicalOrder: "Execution order (topological order)",
    theCanvasIsStillEmptyStartingWithTheNodeLibrary:
      "The canvas is empty. Add a node from the library to get started.",
    tipSelectTheNodeToEditTheParametersDragFrom:
      "Tip: select a node to edit its settings. Drag from its right handle to the next node's left handle to connect them. Scroll to pan; use Ctrl/⌘ + scroll to zoom.",
    parameters: "· Parameters",
    nodeName: "Node name",
    deleteNode: "Delete node",
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
  key: "demo-ai-workflow-components-canvas-inspector",
  content: t(content),
};

export default dictionary;
