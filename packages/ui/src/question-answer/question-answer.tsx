"use client";
import type { ReactNode } from "react";
import { Info } from "../_icons";
import { Alert } from "../alert";
import { Button } from "../button";
import { Card, CardBody } from "../card";
import { Checkbox } from "../checkbox";
import { CheckboxGroup } from "../checkbox-group";
import { useComponentLocale } from "../config/locale-context";
import { Field } from "../field";
import { Input } from "../input";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Formula } from "../math/math";
import { QuestionTypeTag } from "../question-card/question-card.client";
import { QuestionStemBlock } from "../question-card/question-stem-block";
import { answerText } from "../question/answer-format";
import { normalizeOptions } from "../question/question-shape";
import { QUESTION_LOCALE_ZH } from "../question/question.locale";
import type { QuestionType } from "../question/question.types";
import { Radio, RadioGroup } from "../radio";
import { Tag } from "../tag";
import { Text } from "../text";
import { QUESTION_ANSWER_LOCALE_ZH } from "./question-answer.locale";
import {
  answerKind,
  blankValues,
  canSubmit,
  choiceKey,
  choiceKeys,
  currentAnswer,
  isKnownQuestionType,
  resolveBlankCount,
  setBlank,
} from "./question-answer.state";
import type { QuestionAnswerProps } from "./question-answer.types";

/**
 * 学生端「一道题」的作答卡：按题型给对的控件（单选 / 多选 / 判断 / 逐空填空），选项缺失明说做不了，
 * 主观题只读；`canSubmit` 门禁，`onSubmit` 给了才出提交按钮；`result` 有值即锁定并显示正误 / 正确答案 / 解析。
 * 题干与 QuestionCard 走同一个 `QuestionStemBlock`（`resolveFigure` 切图 + Formula），两端看到的题面一致。
 *
 * 判分不在这里：即时反馈由页面调 `gradeObjective`（或等服务端）再把 `result` 传回来。**服务端才是判分 SSOT。**
 */
export function QuestionAnswer({
  question,
  value,
  onChange,
  result = null,
  onSubmit,
  pending = false,
  disabled = false,
  renderStem,
  resolveFigure,
  blankInput = "text",
  mathField,
  header,
  reason,
  correctHint,
  className,
}: QuestionAnswerProps) {
  const locale = useComponentLocale();
  const L = locale.questionAnswer ?? QUESTION_ANSWER_LOCALE_ZH;
  const Q = locale.question ?? QUESTION_LOCALE_ZH;

  const known = isKnownQuestionType(question.type);
  if (!known) {
    warnOnce(
      "question-answer:unknown-type",
      "[瑚琏] QuestionAnswer：不认识的题型，按主观题只读处理（七型见 QuestionType）。",
    );
  }
  if (blankInput === "math" && mathField === undefined) {
    warnOnce(
      "question-answer:math-field-missing",
      '[瑚琏] QuestionAnswer：blankInput="math" 需要 mathField（@hulianui/ui/math-field 的 MathField），已回落为文本输入框。',
    );
  }
  // 给了 mathField 且要 math 才用；其余一律文本框。
  const MathInput = blankInput === "math" ? mathField : undefined;

  const type: QuestionType | undefined = known ? (question.type as QuestionType) : undefined;
  const kind = answerKind(question);
  const blanks = kind === "blank" ? resolveBlankCount(question) : 1;
  const answered = result !== null && result !== undefined;
  const locked = disabled || answered || pending;
  const current = currentAnswer(kind, value, blanks);
  const options = normalizeOptions(question.options);
  const difficulty =
    question.difficulty !== undefined ? Math.max(1, Math.min(5, Math.round(question.difficulty))) : undefined;

  let controls: ReactNode;
  if (kind === "single") {
    controls = (
      <RadioGroup aria-label={L.singleAria} value={choiceKey(value)} onValueChange={onChange} disabled={locked}>
        {options.map((option) => (
          <Radio key={option.key} value={option.key} label={<Formula>{`${option.key}. ${option.text}`}</Formula>} />
        ))}
      </RadioGroup>
    );
  } else if (kind === "multiple") {
    controls = (
      <CheckboxGroup
        aria-label={L.multipleAria}
        value={choiceKeys(value)}
        onValueChange={(keys) => onChange([...keys].sort())}
        disabled={locked}
      >
        {options.map((option) => (
          <Checkbox key={option.key} value={option.key} label={<Formula>{`${option.key}. ${option.text}`}</Formula>} />
        ))}
      </CheckboxGroup>
    );
  } else if (kind === "judge") {
    // 两个选项是题型自带的，题库里 options 是 null。值交 "true" / "false"：判分那侧按布尔归一，最省一次翻译。
    controls = (
      <RadioGroup aria-label={L.judgeAria} value={choiceKey(value)} onValueChange={onChange} disabled={locked}>
        <Radio value="true" label={Q.judgeTrue} />
        <Radio value="false" label={Q.judgeFalse} />
      </RadioGroup>
    );
  } else if (kind === "blank") {
    const values = blankValues(value, blanks);
    controls = (
      <div data-slot="question-answer-blanks" className="space-y-2">
        {values.map((text, index) => {
          const aria = L.blankAria(index + 1, blanks);
          const update = (next: string) => onChange(setBlank(values, index, next));
          const control = MathInput ? (
            <MathInput value={text} onChange={update} aria-label={aria} disabled={locked} />
          ) : (
            <Input
              value={text}
              onChange={(event) => update(event.target.value)}
              placeholder={L.blankPlaceholder(index + 1, blanks)}
              aria-label={blanks === 1 ? aria : undefined}
              disabled={locked}
            />
          );
          // 单空不标空号：只有一个空还写「第 1 空」是在制造不存在的复杂度。
          if (blanks === 1) return <div key={index}>{control}</div>;
          if (MathInput) {
            return (
              <div key={index} className="space-y-1">
                <Text as="span" size="sm" tone="muted">
                  {L.blankLabel(index + 1)}
                </Text>
                {control}
              </div>
            );
          }
          return (
            <Field key={index} label={L.blankLabel(index + 1)}>
              {control}
            </Field>
          );
        })}
      </div>
    );
  } else if (kind === "unanswerable") {
    controls = (
      <Alert tone="warning" title={L.unanswerableTitle}>
        {L.unanswerableBody}
      </Alert>
    );
  } else {
    controls = (
      <Text as="p" size="sm" tone="muted">
        {L.subjectiveNotice}
      </Text>
    );
  }

  const submittable = onSubmit !== undefined && kind !== "unanswerable" && kind !== "subjective";
  const hasHeaderRow =
    type !== undefined || (question.topics?.length ?? 0) > 0 || difficulty !== undefined || header !== undefined;

  return (
    <Card data-slot="question-answer" className={cn("overflow-hidden", className)}>
      <CardBody className="space-y-3">
        {hasHeaderRow && (
          <div className="flex flex-wrap items-center gap-2">
            {type && <QuestionTypeTag type={type} />}
            {question.topics?.map((topic) => (
              <Tag key={topic} size="sm" tone="brand" variant="soft">
                {topic}
              </Tag>
            ))}
            {difficulty !== undefined && (
              <span role="img" aria-label={L.difficulty(difficulty)} className="text-xs text-muted-foreground">
                {"★".repeat(difficulty)}
              </span>
            )}
            {header !== undefined && <div className="ms-auto flex items-center gap-1">{header}</div>}
          </div>
        )}

        {reason !== undefined && reason !== null && (
          <div className="flex items-center gap-2">
            <Info className="size-4 shrink-0 text-primary" aria-hidden />
            <Text as="span" size="xs" tone="muted">
              {reason}
            </Text>
          </div>
        )}

        {renderStem ? (
          renderStem(question.stem)
        ) : (
          <QuestionStemBlock stem={question.stem} resolveFigure={resolveFigure} figureAlt={L.figureAlt} />
        )}

        {controls}

        {answered && result && (
          <Alert tone={result.correct ? "success" : "danger"} title={result.correct ? L.correctTitle : L.wrongTitle}>
            <div className="space-y-1">
              {result.correct ? (
                correctHint
              ) : (
                // 答错时这段是学生唯一拿到的讲解；答案本身可能整段是公式
                <div>
                  <Formula>{`${L.correctAnswer} ${answerText(result.correctAnswer, type, Q)}`}</Formula>
                </div>
              )}
              {result.analysis ? (
                <div>
                  <Formula>{result.analysis}</Formula>
                </div>
              ) : null}
            </div>
          </Alert>
        )}

        {submittable && (
          <Button
            loading={pending}
            disabled={disabled || answered || !canSubmit(current)}
            onClick={() => onSubmit(current)}
          >
            {answered ? L.submitted : L.submit}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
