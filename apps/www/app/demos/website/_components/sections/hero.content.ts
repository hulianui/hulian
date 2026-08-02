import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    version3ElasticComputeScalesToZeroWhenIdle: "新版本 v3 · 弹性算力闲时归零",
    sendTheApplication: "把应用送上",
    globalEdge: "全球边缘",
    justOneGitPush: "只需一次 git push",
    startForFree: "免费开始",
    viewPricing: "查看定价",
    noCreditCardRequiredLaunchYourFirstProjectIn5Minutes: "无需信用卡 · 5 分钟上线第一个项目",
  },
  en: {
    version3ElasticComputeScalesToZeroWhenIdle: "Version 3 · Elastic compute scales to zero when idle",
    sendTheApplication: "Ship your app to the",
    globalEdge: "Global edge",
    justOneGitPush: "Just one git push",
    startForFree: "Start for free",
    viewPricing: "View pricing",
    noCreditCardRequiredLaunchYourFirstProjectIn5Minutes: "No credit card required · Launch your first project in 5 minutes",
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
  key: "demo-website-components-sections-hero",
  content: t(content),
};

export default dictionary;
