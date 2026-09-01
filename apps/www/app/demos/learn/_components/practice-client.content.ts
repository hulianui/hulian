import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "练习",
    subtitle: "学生作答：按题型给对的控件，填空用公式键盘，交卷即时判分（字面、归一、CAS 等价三档）",
    progress: "第 {0} / {1} 题",
    next: "下一题",
    finishTitle: "本轮练习完成",
    finishSubtitle: "答对 {0} 题，得 {1} 分",
    again: "再练一次",
    submitted: "已提交",
    correctHint: "下次不会再推给你",
    subjectiveNote: "主观题需老师批阅，这里只展示题面",
    emptyTitle: "题库里还没有题",
    emptyHint: "先去题库录几道",
    reason: "老师布置的课后练习",
  },
  en: {
    title: "Practice",
    subtitle: "Student answering: the right control per question type, a formula keyboard for blanks, and instant grading on submit (literal, normalized, and CAS equivalence tiers)",
    progress: "Question {0} of {1}",
    next: "Next question",
    finishTitle: "Practice round complete",
    finishSubtitle: "{0} correct, {1} points",
    again: "Practice again",
    submitted: "Submitted",
    correctHint: "This one will not be recommended again",
    subjectiveNote: "Subjective questions are graded by the teacher; only the question is shown here",
    emptyTitle: "The question bank is empty",
    emptyHint: "Add a few questions in the bank first",
    reason: "Homework assigned by the teacher",
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
  key: "demo-learn-components-practice-client",
  content: t(content),
};

export default dictionary;
