import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    all: "全部",
    image: "图片",
    video: "视频",
    loading: "加载中",
    downloaded: "「{0}」已下载",
    deleted: "「{0}」已删除",
    productGallery: "产物画廊",
    picturesAndVideosGeneratedFromPreviousWorkflowRunsClickTo:
      "历次工作流运行生成的图片与视频。点击查看详情与生成参数。",
    productDetails: "产物详情",
    workflow: "工作流",
    prompt: "提示词",
    seeds: "种子",
    generationTime: "生成时间",
    downloadProduct: "下载产物",
    download: "下载",
    downloadLocally: "下载到本地",
    deleteProduct: "删除产物",
    remove: "删除",
    removeFromGallery: "从画廊中删除",
    confirmDeletionOfAreYouSureThisActionCannotBe: "确认删除「{0}」吗？此操作无法撤销。",
    cancel: "取消",
    confirmDelete: "确认删除",
  },
  en: {
    all: "All",
    image: "Image",
    video: "Video",
    loading: "Loading",
    downloaded: 'Downloaded "{0}"',
    deleted: 'Deleted "{0}"',
    productGallery: "Artifact gallery",
    picturesAndVideosGeneratedFromPreviousWorkflowRunsClickTo:
      "Images and videos from previous workflow runs. Select an artifact to inspect its details and generation settings.",
    productDetails: "Artifact details",
    workflow: "Workflow",
    prompt: "Prompt",
    seeds: "Seed",
    generationTime: "Generation time",
    downloadProduct: "Download artifact",
    download: "Download",
    downloadLocally: "Download locally",
    deleteProduct: "Delete artifact",
    remove: "Remove",
    removeFromGallery: "Remove from gallery",
    confirmDeletionOfAreYouSureThisActionCannotBe: 'Delete "{0}"? This action cannot be undone.',
    cancel: "Cancel",
    confirmDelete: "Confirm delete",
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
  key: "demo-ai-workflow-app-gallery-page",
  content: t(content),
};

export default dictionary;
