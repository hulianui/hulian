import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    courseInformation: "课程信息",
    categories: "分类",
    difficulty: "难度",
    lesson: "课时",
    lessonDurationSummary: "{0} 节 · 约 {1} 分钟",
    learners: "学员",
    rating: "评分",
    ratingSummary: "{0} / 5.0（{1} 人）",
    myProgress: "我的进度",
    learningCompletion: "学习完成度",
    courseIntroduction: "课程简介",
    instructor: "讲师",
    supportingCourseware: "配套课件",
    startDownload: "开始下载",
  },
  en: {
    courseInformation: "Course information",
    categories: "Categories",
    difficulty: "Difficulty",
    lesson: "Lessons",
    lessonDurationSummary: "{0} lessons · about {1} minutes",
    learners: "Learners",
    rating: "Rating",
    ratingSummary: "{0} / 5.0 ({1} ratings)",
    myProgress: "My progress",
    learningCompletion: "Course progress",
    courseIntroduction: "Course introduction",
    instructor: "Instructor",
    supportingCourseware: "Supporting courseware",
    startDownload: "Start download",
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
  key: "demo-learn-components-intro-tab",
  content: t(content),
};

export default dictionary;
