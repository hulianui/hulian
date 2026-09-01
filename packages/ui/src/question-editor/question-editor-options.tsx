"use client";
import { ChevronDown, ChevronUp, Plus, X } from "../_icons";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { CheckboxGroup } from "../checkbox-group";
import { Chip } from "../chip";
import { Field } from "../field";
import { MathTextarea } from "../math-textarea/math-textarea";
import { MAX_OPTIONS } from "../question/question-shape";
import { Segmented } from "../segmented";
import {
  addOption,
  moveOption,
  optionCaption,
  removeOption,
  setOptionText,
} from "./question-editor.state";
import type { SectionContext } from "./question-editor.types";

/** 单选 / 多选：选项行（增删上下移，字母按下标自动编号）+ 正确答案。 */
export function OptionsSection({ value, onChange, disabled, L, textarea, errors }: SectionContext) {
  const options = value.options ?? [];
  const last = options.length - 1;

  return (
    <>
      <Field label={L.options} description={L.optionsHint(2, MAX_OPTIONS)} error={errors.options}>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.key} className="flex items-start gap-2">
              <Chip size="sm" tone="neutral" className="mt-1.5 shrink-0">
                {option.key}
              </Chip>
              <MathTextarea
                compact
                className="min-w-0 flex-1"
                aria-label={L.optionLabel(option.key)}
                placeholder={L.optionPlaceholder(option.key)}
                value={option.text}
                onChange={(text) => onChange(setOptionText(value, index, text), "options")}
                disabled={disabled}
                {...textarea}
              />
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={L.moveOptionUp(option.key)}
                  disabled={disabled || index === 0}
                  onClick={() => onChange(moveOption(value, index, index - 1), "options")}
                >
                  <ChevronUp className="size-4" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={L.moveOptionDown(option.key)}
                  disabled={disabled || index === last}
                  onClick={() => onChange(moveOption(value, index, index + 1), "options")}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  tone="danger"
                  aria-label={L.removeOption(option.key)}
                  disabled={disabled || options.length <= 2}
                  onClick={() => onChange(removeOption(value, index), "options")}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled || options.length >= MAX_OPTIONS}
              onClick={() => onChange(addOption(value), "options")}
            >
              <Plus className="size-4" aria-hidden />
              {L.addOption}
            </Button>
          </div>
        </div>
      </Field>

      <Field
        label={L.answer}
        description={value.type === "single" ? L.singleAnswerHint : L.multipleAnswerHint}
        error={errors.answer}
      >
        {value.type === "single" ? (
          // 单选用 Segmented 而不是 RadioGroup：消费方实测 Radio 的 label 关联对读屏无效（docs/hulian-gaps/task-16.md）。
          <Segmented
            tone="brand"
            aria-label={L.answer}
            disabled={disabled}
            items={options.map((o) => ({ value: o.key, label: optionCaption(o.key, o.text) }))}
            value={typeof value.answer === "string" ? value.answer : ""}
            onValueChange={(key) => onChange({ ...value, answer: key }, "answer")}
          />
        ) : (
          <CheckboxGroup
            aria-label={L.answer}
            disabled={disabled}
            value={Array.isArray(value.answer) ? (value.answer as string[]) : []}
            onValueChange={(keys) => onChange({ ...value, answer: [...keys].sort() }, "answer")}
          >
            {options.map((o) => (
              <Checkbox key={o.key} value={o.key} label={optionCaption(o.key, o.text)} />
            ))}
          </CheckboxGroup>
        )}
      </Field>
    </>
  );
}
