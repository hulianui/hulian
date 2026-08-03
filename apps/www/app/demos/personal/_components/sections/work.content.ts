import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    viewProject: "查看作品",
    featuredWork: "精选作品",
    sixProductsIUseEveryDay: "六个我每天都在用的东西",
    everyProductBeganWithARealProblemThatBotheredMeOpenAnyProjectForTheFullStoryScreenshotsAndKeyImp: "每一个产品都源于一个我自己被折磨的真实问题。点开任意一个看完整故事、截图与关键实现。",
    browseMoreDemos: "浏览更多示例",
  },
  en: {
    viewProject: "View project",
    featuredWork: "Featured work",
    sixProductsIUseEveryDay: "Six products I use every day",
    everyProductBeganWithARealProblemThatBotheredMeOpenAnyProjectForTheFullStoryScreenshotsAndKeyImp: "Every product began with a real problem that bothered me. Open any project for the full story, screenshots, and key implementation details.",
    browseMoreDemos: "Browse more demos",
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
  key: "demo-personal-components-sections-work",
  content: t(content),
};

export default dictionary;
