"use client";
import type { ReactNode } from "react";
import { useComponentLocale } from "../config/locale-context";
import { Formula } from "../math/math";
import { answerText } from "../question/answer-format";
import { QUESTION_LOCALE_ZH } from "../question/question.locale";
import type { QuestionAnswer, QuestionType } from "../question/question.types";
import { Tag } from "../tag";
import { Text } from "../text";

// QuestionCard 本体刻意保持 RSC 安全（无 hook）。题型标签与「答案 / 解析」两个标题要走
// Locale SSOT，而那是 React context——拆成 client 叶子，题库页面里几十张卡不必整卡进客户端。

const TYPE_TONE: Record<QuestionType, "brand" | "success" | "warning" | "neutral"> = {
  single: "brand",
  multiple: "brand",
  judge: "neutral",
  blank: "success",
  short_answer: "warning",
  calculation: "warning",
  essay: "warning",
};

export function QuestionTypeTag({ type, label }: { type: QuestionType; label?: ReactNode }) {
  const L = useComponentLocale().question ?? QUESTION_LOCALE_ZH;
  return (
    <Tag size="sm" tone={TYPE_TONE[type]} variant="soft">
      {label ?? L.types[type]}
    </Tag>
  );
}

export function QuestionAnswerSection({
  type,
  answer,
  analysis,
}: {
  type: QuestionType | undefined;
  answer: QuestionAnswer | undefined;
  analysis: string | undefined;
}) {
  const L = useComponentLocale().question ?? QUESTION_LOCALE_ZH;
  const hasAnswer = answer !== undefined;
  const hasAnalysis = analysis !== undefined && analysis.trim() !== "";
  if (!hasAnswer && !hasAnalysis) return null;
  return (
    <div className="space-y-1 border-t border-border pt-2.5" data-slot="question-answer">
      {hasAnswer && (
        <Text as="p" size="sm">
          <Text as="span" tone="muted" className="me-2">
            {L.answer}
          </Text>
          <Formula>{answerText(answer, type, L)}</Formula>
        </Text>
      )}
      {hasAnalysis && (
        <Text as="p" size="sm">
          <Text as="span" tone="muted" className="me-2">
            {L.analysis}
          </Text>
          <Formula>{analysis!}</Formula>
        </Text>
      )}
    </div>
  );
}
