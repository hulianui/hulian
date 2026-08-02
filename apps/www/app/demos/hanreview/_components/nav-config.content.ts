import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "overview": "概览",
    "codeHealthOverview": "代码健康总览",
    "review": "审查",
    "queueReview": "审查队列",
    "theCoreOfTheProblem": "问题中心",
    "strategy": "策略",
    "qualityAccessControl": "质量门禁",
    "intelligentRouting": "智能路由",
    "system": "系统",
    "setup": "设置",
    "codeHealthOverview2": "代码健康总览",
    "queueReview2": "审查队列",
    "theCoreOfTheProblem2": "问题中心",
    "qualityAccessControl2": "质量门禁",
    "intelligentRouting2": "智能路由",
    "setup2": "设置",
    "codeHealthOverview3": "代码健康总览",
    "overview2": "总览",
    "reviewTheDetails": "审查详情",
    "codeHealthOverview4": "代码健康总览",
    "reviewTheDetails2": "审查详情",
    "codeHealthOverview5": "代码健康总览",
  },
  en: {
    "overview": "Overview",
    "codeHealthOverview": "Code health overview",
    "review": "Review",
    "queueReview": "Review queue",
    "theCoreOfTheProblem": "Findings",
    "strategy": "Strategy",
    "qualityAccessControl": "Quality gate",
    "intelligentRouting": "Intelligent routing",
    "system": "System",
    "setup": "Settings",
    "codeHealthOverview2": "Code health overview",
    "queueReview2": "Review queue",
    "theCoreOfTheProblem2": "Findings",
    "qualityAccessControl2": "Quality gate",
    "intelligentRouting2": "Intelligent routing",
    "setup2": "Settings",
    "codeHealthOverview3": "Code health overview",
    "overview2": "Overview",
    "reviewTheDetails": "Review details",
    "codeHealthOverview4": "Code health overview",
    "reviewTheDetails2": "Review details",
    "codeHealthOverview5": "Code health overview",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-components-nav-config",
  content: t(content),
};

export default dictionary;
