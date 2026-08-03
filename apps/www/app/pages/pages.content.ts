import { t, type Dictionary } from "intlayer";

export const pagesContent = {
  "zh-CN": {
    index: {
      metadataTitle: "页面 Pages · 瑚琏 Hulian",
      title: "页面 Pages",
      description: "由多个区块组成的完整整页，展示如何把区块组合成可上线页面。代码就是组合方式，复制后可替换区块或调整顺序。",
      loading: "加载中…",
      searchPlaceholder: "搜索页面：名称、组成区块，或直接描述要做的事…",
      all: "全部",
      emptyTitle: "没有匹配“{query}”的页面",
      emptyDescription: "这里只搜索当前货架。使用全站搜索还能找到组件、模版和指南。",
      clear: "清除筛选",
      searchAll: "去全站搜索",
    },
    detail: {
      back: "返回页面",
      preview: "预览",
      code: "代码",
      fullPreview: "全屏预览",
      copyCode: "复制代码",
      copied: "已复制",
      previewTitle: "{name} 页面预览",
      notFound: "找不到这个页面",
      metadataFallback: "页面 · 瑚琏 Hulian",
      metadataTitle: "{name} · 页面 · 瑚琏 Hulian",
      metadataDescription: "{description} —— 瑚琏完整页面模版，由多个区块组成，可复制源码。",
      fileNote: "本页",
      dependencyNote: "依赖 · {title}",
    },
  },
  en: {
    index: {
      metadataTitle: "Pages · Hulian UI",
      title: "Pages",
      description: "Complete pages composed from several blocks. They show how to assemble production-ready layouts; copy the composition, replace blocks, or reorder them for your product.",
      loading: "Loading...",
      searchPlaceholder: "Search pages by name, included blocks, or the task you want to complete...",
      all: "All",
      emptyTitle: "No matching pages for \"{query}\"",
      emptyDescription: "This search covers only the current gallery. Search all documentation to include components, demos, and guides.",
      clear: "Clear filters",
      searchAll: "Search all documentation",
    },
    detail: {
      back: "Back to pages",
      preview: "Preview",
      code: "Code",
      fullPreview: "Open full-screen preview",
      copyCode: "Copy code",
      copied: "Copied",
      previewTitle: "{name} page preview",
      notFound: "Page not found",
      metadataFallback: "Page · Hulian UI",
      metadataTitle: "{name} · Page · Hulian UI",
      metadataDescription: "{description} A complete Hulian UI page composed from reusable blocks, with source ready to copy.",
      fileNote: "This page",
      dependencyNote: "Dependency: {title}",
    },
  },
} as const;

const dictionary: Dictionary = {
  key: "pages",
  content: t(pagesContent),
};

export default dictionary;
