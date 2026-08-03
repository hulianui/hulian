import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    componentsPropsAndCombinationsOutperformInheritance: "02 组件、Props 与组合优于继承",
    betterCombinationThanInheritancePassInChildrenRenderPropsInstead:
      "**组合优于继承**：用 children / render props 传递，而不是层层 extends。",
    daysAgo: "2 天前",
    justNow: "刚刚",
    uselearnMustBeUsedWithinLearnStoreProvider: "useLearn 必须在 LearnStoreProvider 内使用",
  },
  en: {
    componentsPropsAndCombinationsOutperformInheritance:
      "02 Components, props, and composition over inheritance",
    betterCombinationThanInheritancePassInChildrenRenderPropsInstead:
      "**Prefer composition over inheritance**: pass children or render props instead of extending component layers.",
    daysAgo: "2 days ago",
    justNow: "Just now",
    uselearnMustBeUsedWithinLearnStoreProvider: "useLearn must be used within LearnStoreProvider",
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
  key: "demo-learn-lib-learn-store",
  content: t(content),
};

export default dictionary;
