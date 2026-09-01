import type { ComponentType, ReactNode } from "react";
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";
import type { Question, QuestionAnswer, QuestionType, StudentAnswer } from "../question/question.types";

/**
 * 学生端拿到的题面：题型、题干、选项与几个展示字段，**没有答案与解析的位置**
 * （没答的题带答案回来等于泄题，类型上就不给这个坑）。
 * `type` 允许库不认识的字符串：后端加了题型而前端还没升级时按主观题只读处理并有开发期告警，不能白屏。
 */
export interface AnswerableQuestion extends Pick<Question, "stem" | "options"> {
  type: QuestionType | (string & {});
  /** 填空题的空数（其余题型忽略）。缺失或不合法时按题干里 `____` 的个数，再不行按 1。 */
  blankCount?: number;
  /** 1–5，渲染成星。 */
  difficulty?: number;
  /** 知识点标签。 */
  topics?: string[];
}

/** 服务端判完回来的结果。`correctAnswer` 用 `answerText` 渲染成文字，`analysis` 走 Formula。 */
export interface QuestionAnswerResult {
  correct: boolean;
  correctAnswer: QuestionAnswer;
  analysis?: string;
}

export interface QuestionAnswerProps {
  question: AnswerableQuestion;
  /**
   * 受控作答：填空为逐空数组（单空也是一项数组），多选为 key 数组，单选 / 判断为字符串
   * （判断是 `"true" | "false"`）。续做时可直接传服务端记的字符串：多空的 JSON 数组字面量会被解开，
   * 多选的 `"A,C"` 会被拆成数组。
   */
  value: StudentAnswer | undefined;
  onChange: (next: StudentAnswer) => void;
  /** 有值 = 已作答：控件锁定、显示正误 / 正确答案 / 解析、提交按钮变「已提交」。 */
  result?: QuestionAnswerResult | null;
  /** 给了才出提交按钮。参数是规范形：填空恒为数组（单空压平交给 `encodeBlanks`），多选为 key 数组。 */
  onSubmit?: (answer: StudentAnswer) => void;
  /** 提交中：按钮转圈、控件锁定。@default false */
  pending?: boolean;
  /** @default false */
  disabled?: boolean;
  /** 自定义题干渲染。缺省与 QuestionCard 同一条路径（`resolveFigure` 切图 + Formula）。 */
  renderStem?: (stem: string) => ReactNode;
  /** 题干里 `![](key)` → 可显示 URL。缺省题干渲染用；给了 `renderStem` 则忽略。 */
  resolveFigure?: (key: string) => string;
  /** 填空的输入控件：`text` 普通输入框；`math` 用 `mathField` 注入的可视化公式编辑器。@default "text" */
  blankInput?: "text" | "math";
  /** `blankInput="math"` 时必给（`@hulianui/ui/math-field` 的 MathField 满足此契约）。没给则回落成文本输入框并有开发期告警。 */
  mathField?: ComponentType<MathFieldLikeProps>;
  /** 顶部标签行右侧的内容（题号 / 出处 / 计时）。 */
  header?: ReactNode;
  /** 题干上方的来源说明行（推荐理由 / 「老师布置的 A 层作业」）。 */
  reason?: ReactNode;
  /** 答对时结果区里那句话（练习说「下次不会再推给你」，作业不说，所以由页面给）。 */
  correctHint?: ReactNode;
  className?: string;
}
