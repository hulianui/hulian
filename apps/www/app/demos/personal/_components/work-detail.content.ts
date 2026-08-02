import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    resolvingDependencies: "Resolving dependencies…",
    text: "…",
    allProjects: "所有作品",
    productPreview: "产品预览",
    productStory: "产品故事",
    keyMetrics: "关键指标",
    screenshot: "截图",
    demoVideo: "演示视频",
    livePreview: "演示预览",
    coreFeatures: "核心功能",
    quickInstall: "快速安装",
    projectNavigation: "作品导航",
    previous: "上一个",
    next: "下一个",
    projectNotFound: "作品不存在",
    noProjectFoundWithSlug: "找不到 slug 为 \"",
    text2: "\" 的作品。",
  },
  en: {
    resolvingDependencies: "Resolving dependencies...",
    text: "...",
    allProjects: "All projects",
    productPreview: "Product preview",
    productStory: "Product story",
    keyMetrics: "Key metrics",
    screenshot: "Screenshot",
    demoVideo: "Demo video",
    livePreview: "Live preview",
    coreFeatures: "Core features",
    quickInstall: "Quick install",
    projectNavigation: "Project navigation",
    previous: "Previous",
    next: "Next",
    projectNotFound: "Project not found",
    noProjectFoundWithSlug: "No project found with slug \"",
    text2: "\".",
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
  key: "demo-personal-components-work-detail",
  content: t(content),
};

export default dictionary;
