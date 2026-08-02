import { t, type Dictionary } from "intlayer";

export const previewContent = {
  "zh-CN": {
    exit: "退出预览",
    blockLabel: "区块预览",
    pageLabel: "页面预览",
    missingBlock: "找不到这个区块",
    missingPage: "找不到这个页面",
    openSource: "查看源码",
    preview: "预览",
    code: "代码",
    files: "文件",
    desktop: "桌面宽度",
    tablet: "平板宽度 768px",
    mobile: "手机宽度 390px",
    viewport: "预览视口",
    refresh: "刷新预览",
    openWindow: "在新窗口打开",
    frameTitle: "{title} 预览",
    blockFile: "本区块",
    pageFile: "本页",
    dependencyFile: "依赖 · {title}",
    metadataTitle: "{name} · 预览 · 瑚琏 Hulian",
    metadataFallback: "预览 · 瑚琏 Hulian",
  },
  en: {
    exit: "Exit preview",
    blockLabel: "Block preview",
    pageLabel: "Page preview",
    missingBlock: "Block not found",
    missingPage: "Page not found",
    openSource: "View source",
    preview: "Preview",
    code: "Code",
    files: "Files",
    desktop: "Desktop width",
    tablet: "Tablet width, 768px",
    mobile: "Mobile width, 390px",
    viewport: "Preview viewport",
    refresh: "Refresh preview",
    openWindow: "Open in a new window",
    frameTitle: "{title} preview",
    blockFile: "This block",
    pageFile: "This page",
    dependencyFile: "Dependency: {title}",
    metadataTitle: "{name} · Preview · Hulian UI",
    metadataFallback: "Preview · Hulian UI",
  },
} as const;

const dictionary: Dictionary = {
  key: "preview",
  content: t(previewContent),
};

export default dictionary;
