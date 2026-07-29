import type { ReactNode } from "react";

/** 题型。判断题单列，因为它既不像选择题有选项，也不像解答题要写过程。 */
export type QuestionKind = "choice" | "fill" | "solution" | "judge";

export interface QuestionOption {
  /** 选项标号 A/B/C/D */
  label: string;
  /** 选项正文，支持 MathText 记号 */
  text: string;
}

/** 质量标记：题目从文档里拆出来时发现的可疑点。 */
export interface QuestionIssue {
  label: string;
  tone?: "warning" | "danger" | "neutral";
}

export interface QuestionCardProps {
  /** 原书题号，如 "12"。 */
  number?: ReactNode;
  kind?: QuestionKind;
  /** 覆盖题型中文名（缺省用内置映射）。 */
  kindLabel?: ReactNode;
  /** 难度/分层标签，如 A 组 / 基础 / 拔高。 */
  difficulty?: ReactNode;
  /** 题干，支持 MathText 记号（\frac{}{} / ^{} / _{} / ____）。 */
  stem: string;
  /** 选择题选项；非选择题传空或省略。 */
  options?: QuestionOption[];
  /** 小问 (1)(2)(3)。 */
  parts?: string[];
  /** 附图。 */
  figure?: { src: string; alt?: string };
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
