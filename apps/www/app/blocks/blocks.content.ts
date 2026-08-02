import { t, type Dictionary } from "intlayer";

export const blocksContent = {
  "zh-CN": {
    index: {
      metadataTitle: "区块 Blocks · 瑚琏 Hulian",
      title: "区块 Blocks",
      description: "自包含的页面区块，复制源码即可放进项目运行。数据内联且不依赖业务路由，是介于组件与整页之间的复用单元。",
      loading: "加载中…",
      searchPlaceholder: "搜索区块：名称、能力标签，或直接描述要做的事…",
      all: "全部",
      emptyTitle: "没有匹配“{query}”的区块",
      emptyDescription: "这里只搜索当前货架。使用全站搜索还能找到组件、模版和指南。",
      clear: "清除筛选",
      searchAll: "去全站搜索",
    },
    detail: {
      back: "返回区块",
      preview: "预览",
      code: "代码",
      fullPreview: "全屏预览",
      copyCode: "复制代码",
      copied: "已复制",
      previewTitle: "{name} 区块预览",
      notFound: "找不到这个区块",
      metadataFallback: "区块 · 瑚琏 Hulian",
      metadataTitle: "{name} · 区块 · 瑚琏 Hulian",
      metadataDescription: "{description} —— 瑚琏现成区块，可直接复制源码接入。",
      fileNote: "本区块",
    },
  },
  en: {
    index: {
      metadataTitle: "Blocks · Hulian UI",
      title: "Blocks",
      description: "Self-contained page sections you can copy directly into a project. Each block includes its sample data and avoids business-route dependencies, sitting between a component and a complete page.",
      loading: "Loading...",
      searchPlaceholder: "Search blocks by name, capability, or the task you want to complete...",
      all: "All",
      emptyTitle: "No matching blocks for \"{query}\"",
      emptyDescription: "This search covers only the current gallery. Search all documentation to include components, demos, and guides.",
      clear: "Clear filters",
      searchAll: "Search all documentation",
    },
    detail: {
      back: "Back to blocks",
      preview: "Preview",
      code: "Code",
      fullPreview: "Open full-screen preview",
      copyCode: "Copy code",
      copied: "Copied",
      previewTitle: "{name} block preview",
      notFound: "Block not found",
      metadataFallback: "Block · Hulian UI",
      metadataTitle: "{name} · Block · Hulian UI",
      metadataDescription: "{description} A ready-to-use Hulian UI block with source you can copy into your project.",
      fileNote: "This block",
    },
  },
} as const;

const dictionary: Dictionary = {
  key: "blocks",
  content: t(blocksContent),
};

export default dictionary;
