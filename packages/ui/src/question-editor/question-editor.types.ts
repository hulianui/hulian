import type { ComponentType, ReactNode } from "react";
import type { FormulaTemplateGroup } from "../math-textarea/formula-editing";
import type { MathFieldLikeProps, MathTextareaProps } from "../math-textarea/math-textarea.types";
import type {
  Question,
  QuestionIssue,
  QuestionType,
  QuestionValidationIssue,
} from "../question/question.types";
import type { QuestionEditorLocale } from "./question-editor.locale";

/** 校验问题能挂到的字段（与 `QuestionValidationIssue.field` 同一集合）。 */
export type EditorField = QuestionValidationIssue["field"];

export interface QuestionEditorProps {
  /** 受控值：规范形（`Question`）。历史变体先用 `fromWire` 归一再喂进来。 */
  value: Question;
  /** 每次编辑回传整份规范形；提交前用 `toWireAnswer` 压平填空单空。 */
  onChange: (next: Question) => void;
  disabled?: boolean;
  /** 题干里 `![](key)` → 可显示 URL。题干有图而没给它时缩略图条只能显示 key，并有开发期告警。 */
  resolveFigure?: (key: string) => string;
  /** 上传一张题图，返回 storage key。**给了才出「插入图片」**；成功后以 `![](key)` 写回题干末尾。 */
  onUploadFigure?: (file: File) => Promise<string>;
  /** 消费方私有字段（学科 / 教材小节 / 考点 …），渲染在题型之后、题干之前。 */
  extra?: ReactNode;
  /** 复核条：有值时顶部列出，每条一个「已处理」。 */
  issues?: QuestionIssue[];
  onResolveIssue?: (label: string) => void;
  /** 覆盖按题型的默认分。切题型时 `score` 若仍等于旧题型默认分则换成新默认分。 */
  defaultScoreByType?: Partial<Record<QuestionType, number>>;
  /** 透传给每个 MathTextarea 的模板组。 */
  templates?: readonly FormulaTemplateGroup[];
  /** 透传给每个 MathTextarea 的可视化编辑器。 */
  visualEditor?: ComponentType<MathFieldLikeProps>;
  /** 透传给每个 MathTextarea 与预览的 KaTeX 宏表。 */
  macros?: Record<string, string>;
  /** 右侧 / 下方 QuestionCard 实时预览（`showAnswer`）。@default true */
  preview?: boolean;
  /**
   * 把 `validateQuestion` 的全部问题立刻挂到字段上。默认只显示**改过的**字段的问题
   * （一张空表单一打开就满屏红字不是校验，是噪音）；页面在用户点提交后把它置 true。
   * @default false
   */
  showAllIssues?: boolean;
  className?: string;
}

/** 分节子件共用的上下文。刻意不以 Props 结尾：内部类型，不进文档、不从 barrel 导出。 */
export interface SectionContext {
  value: Question;
  /** `field` 是这次改动落在哪个校验字段上（用来决定该字段的问题从此可见）。 */
  onChange: (next: Question, field: EditorField) => void;
  disabled: boolean;
  L: QuestionEditorLocale;
  textarea: Pick<MathTextareaProps, "templates" | "visualEditor" | "macros">;
  /** 已经过「是否可见」过滤的字段错误文案。 */
  errors: Partial<Record<EditorField, string>>;
}
