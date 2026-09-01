"use client";
import { Plus, X } from "../_icons";
import { Alert } from "../alert";
import { Button } from "../button";
import { Chip } from "../chip";
import { Field } from "../field";
import { MathTextarea } from "../math-textarea/math-textarea";
import {
  addBlank,
  addBlankWriting,
  alignBlanks,
  blankCells,
  blankMismatch,
  blankWritings,
  removeBlank,
  removeBlankWriting,
  setBlankWriting,
} from "./question-editor.state";
import type { SectionContext } from "./question-editor.types";

/** 填空：每空一行（可多种等价写法）；空数与题干 `____` 数目不一致时提示并一键对齐，不静默截断。 */
export function BlanksSection({ value, onChange, disabled, L, textarea, errors }: SectionContext) {
  const cells = blankCells(value.answer);
  const mismatch = blankMismatch(value);

  return (
    <Field label={L.blankAnswers} description={L.blankAnswersHint} error={errors.answer}>
      <div className="space-y-3">
        {mismatch !== null && (
          <Alert
            tone="warning"
            action={
              <Button
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onChange(alignBlanks(value, mismatch.expected), "answer")}
              >
                {L.alignBlanks(mismatch.expected)}
              </Button>
            }
          >
            {L.blankMismatch(mismatch.expected, mismatch.actual)}
          </Alert>
        )}
        {cells.map((cell, blank) => {
          const writings = blankWritings(cell);
          return (
            <div key={blank} className="space-y-1.5">
              {writings.map((text, writing) => {
                const label =
                  writing === 0 ? L.blankLabel(blank + 1) : L.alternativeLabel(blank + 1, writing + 1);
                return (
                  <div key={writing} className="flex items-start gap-2">
                    <Chip size="sm" tone="neutral" className="mt-1.5 min-w-16 shrink-0 justify-center">
                      {label}
                    </Chip>
                    <MathTextarea
                      compact
                      className="min-w-0 flex-1"
                      aria-label={label}
                      placeholder={L.blankPlaceholder(blank + 1)}
                      value={text}
                      onChange={(next) => onChange(setBlankWriting(value, blank, writing, next), "answer")}
                      disabled={disabled}
                      {...textarea}
                    />
                    {writing === 0 ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        tone="danger"
                        aria-label={L.removeBlank(blank + 1)}
                        disabled={disabled || cells.length <= 1}
                        onClick={() => onChange(removeBlank(value, blank), "answer")}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        tone="danger"
                        aria-label={L.removeAlternative(blank + 1, writing + 1)}
                        disabled={disabled}
                        onClick={() => onChange(removeBlankWriting(value, blank, writing), "answer")}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                );
              })}
              <div className="ps-[4.5rem]">
                <Button
                  size="sm"
                  variant="link"
                  disabled={disabled}
                  aria-label={L.addAlternativeFor(blank + 1)}
                  onClick={() => onChange(addBlankWriting(value, blank), "answer")}
                >
                  <Plus className="size-4" aria-hidden />
                  {L.addAlternative}
                </Button>
              </div>
            </div>
          );
        })}
        <div>
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange(addBlank(value), "answer")}>
            <Plus className="size-4" aria-hidden />
            {L.addBlank}
          </Button>
        </div>
      </div>
    </Field>
  );
}
