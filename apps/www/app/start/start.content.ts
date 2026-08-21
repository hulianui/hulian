import { t, type Dictionary } from "intlayer";

export const startContent = {
  "zh-CN": {
    metadataTitle: "快速开始 · AI 接入 · 瑚琏 Hulian",
    metadataDescription: "把这份文档复制给 AI 编程助手，即可正确地用瑚琏 @hulianui/ui 搭界面。",
    title: "快速开始 · AI 接入",
    description: "这一整页本身就是一篇 Markdown —— 复制给 AI 编程助手，它即可正确地用瑚琏搭界面。",
    copy: "复制全文",
    onThisPage: "本页",
  },
  en: {
    metadataTitle: "Quick Start · AI Integration · Hulian UI",
    metadataDescription: "Give this guide to an AI coding assistant so it can build interfaces correctly with @hulianui/ui.",
    title: "Quick Start · AI Integration",
    description: "This page is a complete Markdown guide. Copy it into your AI coding assistant to start building correctly with Hulian UI.",
    copy: "Copy guide",
    onThisPage: "On this page",
  },
} as const;

const dictionary: Dictionary = {
  key: "start",
  content: t(startContent),
};

export default dictionary;
