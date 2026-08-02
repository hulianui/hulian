import { t, type Dictionary } from "intlayer";

export const changelogContent = {
  "zh-CN": {
    metadataTitle: "更新日志 · 瑚琏 Hulian",
    metadataDescription: "瑚琏组件与设计令牌逐版本更新记录，包括新功能、修复、破坏性变更及对应提交。",
    eyebrow: "Changelog",
    title: "更新日志",
    description: "两个包独立发版：@hulianui/ui 提供组件，@hulianui/tokens 提供设计令牌 CSS。记录遵循语义化版本并由 changesets 生成。",
    currentVersion: "当前版本",
    versions: "版本",
    recent: "最近 {count} 版",
    all: "全部",
    breakingOnly: "仅破坏性",
    breaking: "破坏性",
    feature: "新功能",
    fix: "修复",
    current: "当前",
    viewLabel: "更新日志视图",
    emptyTitle: "没有破坏性变更",
    emptyDescription: "到目前为止所有版本都是向后兼容的。切回“全部”查看完整记录。",
    older: "还有 {count} 个更早版本，切到“全部”查看。",
  },
  en: {
    metadataTitle: "Changelog · Hulian UI",
    metadataDescription: "Version-by-version changes to Hulian UI components and design tokens, including features, fixes, breaking changes, and source commits.",
    eyebrow: "Changelog",
    title: "Changelog",
    description: "The packages are released independently: @hulianui/ui provides components and @hulianui/tokens provides design-token CSS. Changes follow semantic versioning and are generated from changesets.",
    currentVersion: "Current version",
    versions: "Versions",
    recent: "Latest {count} releases",
    all: "All releases",
    breakingOnly: "Breaking only",
    breaking: "Breaking",
    feature: "Features",
    fix: "Fixes",
    current: "Current",
    viewLabel: "Changelog view",
    emptyTitle: "No breaking changes",
    emptyDescription: "Every release shown here is backward compatible. Switch to All releases for the complete history.",
    older: "There are {count} earlier releases. Switch to All releases to view them.",
  },
} as const;

const dictionary: Dictionary = {
  key: "changelog",
  content: t(changelogContent),
};

export default dictionary;
