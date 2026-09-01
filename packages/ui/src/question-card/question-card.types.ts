import type { ReactNode } from "react";
import type { QuestionAnswerValue, QuestionIssue, QuestionOption, QuestionType } from "../question/question.types";

/** @deprecated 0.59 起改用 `type`（七型枚举）。映射：choice → single、fill → blank、solution → essay、judge → judge。下一个 minor 移除。 */
export type QuestionKind = "choice" | "fill" | "solution" | "judge";

/** 旧选项形状（`label` 即 `key`），保留一个 minor。 */
export interface LegacyQuestionOption {
  label: string;
  text: string;
}

export type { QuestionIssue, QuestionOption };

export interface QuestionCardProps {
  /** 原书题号，如 "12"。 */
  number?: ReactNode;
  /** 题型（七型枚举）。决定标签文案与语气色。 */
  type?: QuestionType;
  /** @deprecated 改用 `type`。 */
  kind?: QuestionKind;
  /** 覆盖题型标签文案（缺省走 Locale 的 `question.types`）。 */
  typeLabel?: ReactNode;
  /** @deprecated 改用 `typeLabel`。 */
  kindLabel?: ReactNode;
  /** 难度/分层标签，如 A 组 / 基础 / 拔高。 */
  difficulty?: ReactNode;
  /** 题干，支持 LaTeX 记号（`\frac{}{}` / `^{}` / `_{}` / 填空槽 `____`），由 Formula 排版。 */
  stem: string;
  /** 选择题选项；非选择题传空或省略。新形状 `{ key, text }`，旧形状 `{ label, text }` 仍接受一个 minor。 */
  options?: (QuestionOption | LegacyQuestionOption)[];
  /** 小问 (1)(2)(3)。 */
  parts?: string[];
  /** 附图。 */
  figure?: { src: string; alt?: string };
  /**
   * 题干里 `![](key)` 图片引用的解析器：storage key → 可显示的 URL。
   * 给了就先切图再排公式（`splitStemFigures`），图按出现顺序渲染在正文之后；不给则题干原样交给 Formula。
   * QuestionEditor 的实时预览与消费方的题库列表都靠它，两边同一个渲染路径。
   */
  resolveFigure?: (key: string) => string;
  /** 答案（形状见 QuestionAnswerValue）。只有 `showAnswer` 为真才渲染。 */
  answer?: QuestionAnswerValue;
  /** 解析，支持 LaTeX 记号。只有 `showAnswer` 为真才渲染。 */
  analysis?: string;
  /** 渲染答案与解析区（题库详情 / 教师端开；学生作答前必须关）。@default false */
  showAnswer?: boolean;
  /** 出处，如「学能评价 七上 · 第 3 页 · 第 3 题」。 */
  source?: ReactNode;
  /** 章节归属。 */
  chapter?: ReactNode;
  /** 知识点标签。 */
  topics?: string[];
  /**
   * 质量标记。有值时卡片左侧显示警示色边条 ——
   * 拆出来但没把握的题必须一眼可辨，混在正常题里等于骗验收。
   */
  issues?: QuestionIssue[];
  /** 右上角操作区（编辑/删除/加入试卷）。 */
  actions?: ReactNode;
  /** 紧凑模式：隐藏小问与出处，用于长列表。 */
  compact?: boolean;
  className?: string;
}
