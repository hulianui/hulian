import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    gitTitle: "内容寻址的版本控制：Git 的对象模型、三棵树与历史改写",
    mergeTitle: "三方合并冲突的实证研究：来自 1200 个开源仓库的证据",
    lfsTitle: "大文件存储对克隆性能的影响",
    flakyTitle: "持续集成中不稳定测试的自动识别",
    sparseTitle: "单体仓库的稀疏检出与部分克隆策略",
    reviewTitle: "代码审查延迟与缺陷逃逸率的关系",
    venueHse: "瀚文软件工程年会 HSE 2027",
    venueJos: "《软件学报》",
    venueMsr: "MSR 2027 挖掘软件仓库会议",
    venueIcse: "ICSE 2027 软件工程国际会议",
    authorLin: "林知远",
    authorZhou: "周屿",
    authorChen: "陈思齐",
    authorHe: "何静",
    gitShort: "Git 对象模型",
    mergeShort: "合并冲突实证",
    lfsShort: "大文件存储",
    flakyShort: "不稳定测试",
    sparseShort: "稀疏检出",
    reviewShort: "审查延迟",
  },
  en: {
    gitTitle: "Content-Addressed Version Control: Git's Object Model, Three Trees and History Rewriting",
    mergeTitle: "An Empirical Study of Three-Way Merge Conflicts in 1,200 Open-Source Repositories",
    lfsTitle: "How Large File Storage Affects Clone Performance",
    flakyTitle: "Automatic Detection of Flaky Tests in Continuous Integration",
    sparseTitle: "Sparse Checkout and Partial Clone Strategies for Monorepos",
    reviewTitle: "Code Review Latency and Defect Escape Rates",
    venueHse: "HanWen Software Engineering Conference (HSE 2027)",
    venueJos: "Journal of Software",
    venueMsr: "MSR 2027: Mining Software Repositories",
    venueIcse: "ICSE 2027: International Conference on Software Engineering",
    authorLin: "Zhiyuan Lin",
    authorZhou: "Yu Zhou",
    authorChen: "Siqi Chen",
    authorHe: "Jing He",
    gitShort: "Git internals",
    mergeShort: "Merge conflicts",
    lfsShort: "Large files",
    flakyShort: "Flaky tests",
    sparseShort: "Sparse checkout",
    reviewShort: "Review latency",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-data-papers",
  content: t(content),
};

export default dictionary;
