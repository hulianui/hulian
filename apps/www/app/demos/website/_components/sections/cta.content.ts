import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    deployYourFirstProjectOnHancloudIn5Minutes: "5 分钟，把你的第一个项目送上瀚云",
    startFreeWithNoCreditCardTalkToOurTeamWhenYouNeedHelpWithScaleOrCompliance: "免费开始，无需信用卡。需要规模化与合规支持时，我们的团队随时在线。",
    startForFree: "免费开始",
    comparePlans: "对比套餐",
  },
  en: {
    deployYourFirstProjectOnHancloudIn5Minutes: "Deploy your first project on HanCloud in 5 minutes",
    startFreeWithNoCreditCardTalkToOurTeamWhenYouNeedHelpWithScaleOrCompliance: "Start free with no credit card. Talk to our team when you need help with scale or compliance.",
    startForFree: "Start for free",
    comparePlans: "Compare plans",
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
  key: "demo-website-components-sections-cta",
  content: t(content),
};

export default dictionary;
