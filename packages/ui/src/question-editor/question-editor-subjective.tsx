"use client";
import { Plus, X } from "../_icons";
import { Button } from "../button";
import { Field } from "../field";
import { MathTextarea } from "../math-textarea/math-textarea";
import { NumberField } from "../number-field";
import { Switch } from "../switch";
import { Text } from "../text";
import type { SubjectiveType } from "./question-editor.locale";
import {
  addRubricPoint,
  disableRubric,
  enableRubric,
  isRubric,
  referenceText,
  removeRubricPoint,
  rubricTotal,
  setReference,
  setRubricPoint,
} from "./question-editor.state";
import type { SectionContext } from "./question-editor.types";

/** 简答 / 计算 / 解答：参考答案（可空）；计算与解答可切「分步给分」编辑得分点，合计与题目分值并排。 */
export function SubjectiveSection({ value, onChange, disabled, L, textarea, errors }: SectionContext) {
  // 调用方只在三种主观题时渲染本件；Record 索引让「后端加题型」在这里 tsc 当场红。
  const type = value.type as SubjectiveType;
  const copy = L.referenceCopy[type];
  const rubric = isRubric(value.answer) ? value.answer : null;
  const canRubric = type === "calculation" || type === "essay";
  const total = rubricTotal(value.answer);

  return (
    <>
      <Field label={L.reference} description={copy.hint} error={errors.answer}>
        <MathTextarea
          multiline
          rows={3}
          aria-label={L.reference}
          placeholder={copy.placeholder}
          value={referenceText(value.answer)}
          onChange={(text) => onChange(setReference(value, text), "answer")}
          disabled={disabled}
          {...textarea}
        />
      </Field>

      {canRubric && (
        <Field label={L.rubric} description={L.rubricHint}>
          <div className="space-y-2">
            <Switch
              aria-label={L.rubric}
              checked={rubric !== null}
              disabled={disabled}
              onCheckedChange={(on) => onChange(on ? enableRubric(value) : disableRubric(value), "answer")}
            />
            {rubric !== null && (
              <div className="space-y-2">
                {rubric.rubric.map((row, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <MathTextarea
                      compact
                      className="min-w-0 flex-1"
                      aria-label={L.rubricPoint(index + 1)}
                      placeholder={L.rubricPointPlaceholder}
                      value={row.point}
                      onChange={(point) => onChange(setRubricPoint(value, index, { point }), "answer")}
                      disabled={disabled}
                      {...textarea}
                    />
                    <NumberField
                      aria-label={L.rubricScore(index + 1)}
                      className="w-24 shrink-0"
                      min={0}
                      value={row.score ?? null}
                      onValueChange={(score) =>
                        onChange(setRubricPoint(value, index, { score: score ?? undefined }), "answer")
                      }
                      disabled={disabled}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      tone="danger"
                      aria-label={L.removeRubricPoint(index + 1)}
                      disabled={disabled || rubric.rubric.length <= 1}
                      onClick={() => onChange(removeRubricPoint(value, index), "answer")}
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onChange(addRubricPoint(value), "answer")}
                  >
                    <Plus className="size-4" aria-hidden />
                    {L.addRubricPoint}
                  </Button>
                  <Text size="xs" tone={total === value.score ? "muted" : "warning"}>
                    {L.rubricTotal(total, value.score)}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Field>
      )}
    </>
  );
}
