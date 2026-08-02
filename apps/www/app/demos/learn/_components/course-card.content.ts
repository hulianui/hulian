import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    joinedLearning: "已加入学习",
    lessonDurationJoiner: "节 · 约",
    minutes: "分钟",
    learningProgress: "学习进度",
    continueLearning: "继续学习",
    startLearning: "开始学习",
    learnForFree: "免费学习",
    signUpNow: "立即报名",
  },
  en: {
    joinedLearning: "Enrolled",
    lessonDurationJoiner: "lessons · about",
    minutes: "min",
    learningProgress: "Learning progress",
    continueLearning: "Continue learning",
    startLearning: "Start learning",
    learnForFree: "Learn for free",
    signUpNow: "Enroll now",
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
  key: "demo-learn-components-course-card",
  content: t(content),
};

export default dictionary;
