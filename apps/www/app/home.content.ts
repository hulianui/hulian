import { t, type Dictionary } from "intlayer";

export const homeContent = {
  "zh-CN": {
    brand: "瑚琏",
    tagline: "颜值 + 好用，是软件的第一生产力。",
    origin: "名出《论语》宗庙之玉器——至贵至美，而确有大用。",
    browseComponents: "浏览 {count} 个组件",
    blocks: "区块",
    pages: "页面",
    demos: "模版",
    aiLead: "让 AI 编程助手不再猜 props —— 一行装上 MCP 与使用契约：",
    aiStart: "AI 接入指南",
    browseLabel: "浏览",
    foundations: "站在巨人肩上 · 吸取式聚合",
    declaration: "人不该油头满面地对着丑软件干活。",
    muiBridge: "MUI 桥",
    copy: "复制",
    copied: "已复制",
  },
  en: {
    brand: "Hulian",
    tagline: "Beautiful and practical software makes every team more productive.",
    origin: "Named for a precious ritual vessel: beautiful by design, useful by nature.",
    browseComponents: "Browse {count} components",
    blocks: "Blocks",
    pages: "Pages",
    demos: "Demos",
    aiLead: "Stop making your AI assistant guess props — install the MCP server and usage contract in one line:",
    aiStart: "AI integration guide",
    browseLabel: "Browse",
    foundations: "Built on proven foundations",
    declaration: "People deserve software that is a pleasure to work with.",
    muiBridge: "MUI bridge",
    copy: "Copy",
    copied: "Copied",
  },
} as const;

const dictionary: Dictionary = {
  key: "home",
  content: t(homeContent),
};

export default dictionary;
