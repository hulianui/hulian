import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    hanxue: "瀚学",
    turnEveryLearningIntoVisibleProgress: "把每一次学习，都变成可见的进步",
    courseCatalog: "课程目录",
    myLearning: "我的学习",
  },
  en: {
    hanxue: "HanLearn",
    turnEveryLearningIntoVisibleProgress: "Turn learning into visible progress",
    courseCatalog: "Course catalog",
    myLearning: "My learning",
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
  key: "demo-learn-components-nav-config",
  content: t(content),
};

export default dictionary;
