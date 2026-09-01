// QuestionAnswer 词条。单独成文件的理由与 question/question.locale.ts 相同：@hulianui/ui/math 入口
// 不能拖进 config/locale.ts 那份全库字典。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反向引用本文件。
// 题型名与判断题的「正确 / 错误」不在这里：它们在 question.locale.ts（QuestionCard / QuestionEditor 也用）。

export interface QuestionAnswerLocale {
  /** 选项组的无障碍名（题干就是问题，组本身不另配可见标签）。 */
  singleAria: string;
  multipleAria: string;
  judgeAria: string;
  /** 多空时每空的可见标签，如 (2) → "第 2 空"。单空不显示。 */
  blankLabel: (index: number) => string;
  /** 每空输入框的无障碍名；单空不带空号。 */
  blankAria: (index: number, total: number) => string;
  blankPlaceholder: (index: number, total: number) => string;
  /** 题干附图的 alt，如 (1) → "题目附图 1"。 */
  figureAlt: (index: number) => string;
  /** 难度星的无障碍名，如 (3) → "难度 3 / 5"。 */
  difficulty: (level: number) => string;
  /** 选择题选项没入库时的提示。 */
  unanswerableTitle: string;
  unanswerableBody: string;
  /** 主观题：只读题面下方那句。 */
  subjectiveNotice: string;
  submit: string;
  submitted: string;
  correctTitle: string;
  wrongTitle: string;
  /** 答错时正确答案前缀，如 "正确答案"。 */
  correctAnswer: string;
}

export const QUESTION_ANSWER_LOCALE_ZH: QuestionAnswerLocale = {
  singleAria: "单选作答",
  multipleAria: "多选作答",
  judgeAria: "判断作答",
  blankLabel: (index) => `第 ${index} 空`,
  blankAria: (index, total) => (total === 1 ? "填空作答" : `填空作答第 ${index} 空`),
  blankPlaceholder: (index, total) => (total === 1 ? "答案" : `第 ${index} 空的答案`),
  figureAlt: (index) => `题目附图 ${index}`,
  difficulty: (level) => `难度 ${level} / 5`,
  unanswerableTitle: "这道题暂时没法作答",
  unanswerableBody: "选项尚未录入",
  subjectiveNotice: "此题需教师批阅",
  submit: "提交答案",
  submitted: "已提交",
  correctTitle: "回答正确",
  wrongTitle: "回答错误",
  correctAnswer: "正确答案",
};

export const QUESTION_ANSWER_LOCALE_EN: QuestionAnswerLocale = {
  singleAria: "Single choice answer",
  multipleAria: "Multiple choice answer",
  judgeAria: "True or false answer",
  blankLabel: (index) => `Blank ${index}`,
  blankAria: (index, total) => (total === 1 ? "Blank answer" : `Blank ${index} answer`),
  blankPlaceholder: (index, total) => (total === 1 ? "Answer" : `Answer for blank ${index}`),
  figureAlt: (index) => `Figure ${index}`,
  difficulty: (level) => `Difficulty ${level} of 5`,
  unanswerableTitle: "This question cannot be answered yet",
  unanswerableBody: "Its options have not been entered",
  subjectiveNotice: "Graded by the teacher",
  submit: "Submit answer",
  submitted: "Submitted",
  correctTitle: "Correct",
  wrongTitle: "Incorrect",
  correctAnswer: "Correct answer",
};
