import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "题库",
    subtitle: "老师录题：七种题型、公式模板、可视化公式键盘、实时预览与结构校验",
    newQuestion: "新建题目",
    editQuestion: "编辑题目",
    filterAll: "全部",
    typeSingle: "单选",
    typeMultiple: "多选",
    typeJudge: "判断",
    typeBlank: "填空",
    typeSubjective: "主观",
    save: "保存",
    cancel: "取消",
    saved: "题目已保存",
    created: "题目已创建",
    deleted: "题目已删除",
    deleteConfirm: "删除这道题？练习记录一并清除。",
    delete: "删除",
    edit: "编辑",
    emptyTitle: "这个题型还没有题",
    emptyHint: "点「新建题目」录一道",
    fixIssues: "还有校验问题没处理",
    count: "共 {0} 道",
  },
  en: {
    title: "Question bank",
    subtitle: "Authoring for teachers: seven question types, formula templates, a visual formula keyboard, live preview, and structural validation",
    newQuestion: "New question",
    editQuestion: "Edit question",
    filterAll: "All",
    typeSingle: "Single choice",
    typeMultiple: "Multiple choice",
    typeJudge: "True or false",
    typeBlank: "Fill in the blank",
    typeSubjective: "Subjective",
    save: "Save",
    cancel: "Cancel",
    saved: "Question saved",
    created: "Question created",
    deleted: "Question deleted",
    deleteConfirm: "Delete this question? Its practice record is cleared as well.",
    delete: "Delete",
    edit: "Edit",
    emptyTitle: "No questions of this type yet",
    emptyHint: "Use New question to add one",
    fixIssues: "There are validation issues left",
    count: "{0} questions",
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
  key: "demo-learn-components-question-bank-client",
  content: t(content),
};

export default dictionary;
