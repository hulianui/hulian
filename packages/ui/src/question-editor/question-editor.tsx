"use client";
import { useMemo, useState } from "react";
import { Alert } from "../alert";
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "../alert-dialog";
import { Button } from "../button";
import { useComponentLocale } from "../config/locale-context";
import { Field } from "../field";
import { cn } from "../lib/cn";
import { MathTextarea } from "../math-textarea/math-textarea";
import { NumberField } from "../number-field";
import { QuestionCard } from "../question-card/question-card";
import { QuestionStemBlock } from "../question-card/question-stem-block";
import { stemFigureKeys } from "../question/question-stem";
import { validateQuestion } from "../question/question-shape";
import { QUESTION_LOCALE_ZH } from "../question/question.locale";
import { QUESTION_TYPES, type Question, type QuestionType } from "../question/question.types";
import { Rating } from "../rating";
import { Segmented } from "../segmented";
import { Text } from "../text";
import { BlanksSection } from "./question-editor-blanks";
import { FiguresStrip } from "./question-editor-figures";
import { OptionsSection } from "./question-editor-options";
import { SubjectiveSection } from "./question-editor-subjective";
import { QUESTION_EDITOR_LOCALE_ZH } from "./question-editor.locale";
import {
  addStemFigure,
  issuesByField,
  moveStemFigure,
  removeStemFigure,
  scoreDefaults,
  setEstimatedMinutes,
  setStemBody,
  shapeIsDirty,
  stemBody,
  stemFigures,
  switchType,
} from "./question-editor.state";
import type { EditorField, QuestionEditorProps, SectionContext } from "./question-editor.types";

/**
 * 出题 / 复核编辑器：一道题的全部结构化字段（题型、题干 + 题图、选项 / 判断 / 填空 / 主观题答案、
 * 解析、难度 / 分值 / 用时）+ 右侧 QuestionCard 实时预览。**不带提交按钮**：提交与私有字段是页面的事。
 *
 * 只认规范形 `Question`（阶段 1 类型）。切题型时 options 与 answer 同时重置成新题型的空形状
 * （否则会造出「judge 带 options」这类被后端 422 的值），有内容时先确认。校验用 `validateQuestion`
 * 就地挂到 Field.error，默认只显示改过的字段，页面点提交后置 `showAllIssues`。
 * 题干输入框只见正文，题图以 `![](key)` 块写回题干末尾，预览与展示端同一条 `resolveFigure` 路径。
 * 哪些引用算题图由 `figureFilter` 说了算（不给 = 全部）：行内公式图这类「位置就是语义」的引用
 * 划到题图之外，就原样留在题干正文里，编辑器不挪它、也不动它的 alt。
 */
/** 度量行的列数：Tailwind 扫的是源码里写全的类名，拼不出来，只能查表。 */
const METRIC_COLUMNS: Record<number, string> = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" };

export function QuestionEditor({
  value,
  onChange,
  disabled = false,
  resolveFigure,
  onUploadFigure,
  figureFilter,
  extra,
  issues,
  onResolveIssue,
  defaultScoreByType,
  templates,
  visualEditor,
  macros,
  hiddenFields,
  preview = true,
  showAllIssues = false,
  className,
}: QuestionEditorProps) {
  const locale = useComponentLocale();
  const L = locale.questionEditor ?? QUESTION_EDITOR_LOCALE_ZH;
  const Q = locale.question ?? QUESTION_LOCALE_ZH;
  const [pendingType, setPendingType] = useState<QuestionType | null>(null);
  const [touched, setTouched] = useState<ReadonlySet<EditorField>>(() => new Set());
  const defaults = useMemo(() => scoreDefaults(defaultScoreByType), [defaultScoreByType]);

  const commit = (next: Question, field?: EditorField) => {
    if (field !== undefined && !touched.has(field)) setTouched(new Set([...touched, field]));
    onChange(next);
  };

  const grouped = issuesByField(validateQuestion(value));
  const message = (field: EditorField): string | undefined => {
    const issue = grouped[field];
    if (issue === undefined || !(showAllIssues || touched.has(field))) return undefined;
    return L.validation[issue.code](issue.detail);
  };
  const errors: SectionContext["errors"] = {
    stem: message("stem"),
    options: message("options"),
    answer: message("answer"),
    difficulty: message("difficulty"),
    score: message("score"),
  };

  const hidden = useMemo(() => new Set(hiddenFields ?? []), [hiddenFields]);
  // 关掉的字段编辑器一个字都不写：切题型原本会按默认分表换算 `score`，而分值那一档关着时
  // 用户既看不见也改不了它——照写就是静默改数据（#358）。
  const retype = (type: QuestionType): Question => {
    const next = switchType(value, type, defaults);
    return hidden.has("score") ? { ...next, score: value.score } : next;
  };

  const pickType = (raw: string) => {
    const type = raw as QuestionType;
    if (type === value.type) return;
    if (shapeIsDirty(value)) {
      setPendingType(type);
      return;
    }
    commit(retype(type));
  };
  const confirmType = () => {
    if (pendingType !== null) commit(retype(pendingType));
    setPendingType(null);
  };

  const textarea = { templates, visualEditor, macros };
  // 题干输入框底下那块预览。默认预览是 `<Formula>`，它不认 markdown 图片语法：`figureFilter`
  // 划出去、原样留在正文里的行内公式图（`![7x+5<5x+1](import/formula/….png)`）会被整段印成源码。
  // 这里改走库内题干渲染的**同一条路**（QuestionStemBlock，QuestionCard / QuestionAnswer 共用），
  // 老师在输入框底下看到的就是展示端会画出来的东西。刻意不新开 `renderStemPreview` 这类透传口：
  // 「题干怎么渲染」只能有一个真源，多一个口子就多一种和学生端不一样的可能。
  // 没给 resolveFigure 就不接管——那条路一样解析不出图，退回默认预览即可。
  const renderStemPreview = resolveFigure
    ? (body: string) => {
        // 既没公式也没图，预览就与输入框里的字一模一样，那个框纯属噪音：返回 null 让 MathTextarea 收起它。
        if (!body.includes("$") && stemFigureKeys(body).length === 0) return null;
        // 换行是老师排的版（默认预览也保着它），whitespace 继承给里面的正文。
        return (
          <div className="whitespace-pre-wrap">
            <QuestionStemBlock
              stem={body}
              resolveFigure={resolveFigure}
              figureAlt={L.figureAlt}
              macros={macros}
            />
          </div>
        );
      }
    : undefined;
  const section: SectionContext = { value, onChange: commit, disabled, L, textarea, errors };
  const figures = stemFigures(value.stem, figureFilter);
  const subjective =
    value.type === "short_answer" || value.type === "calculation" || value.type === "essay";

  const metrics = [
    hidden.has("difficulty") ? null : (
      <Field key="difficulty" label={L.difficulty} description={L.difficultyHint} error={errors.difficulty}>
        <Rating
          max={5}
          value={value.difficulty}
          disabled={disabled}
          onValueChange={(v) => commit({ ...value, difficulty: v ?? 1 }, "difficulty")}
        />
      </Field>
    ),
    hidden.has("score") ? null : (
      <Field key="score" label={L.score} error={errors.score}>
        <NumberField
          aria-label={L.score}
          min={0}
          value={value.score}
          onValueChange={(v) => commit({ ...value, score: v ?? 0 }, "score")}
          disabled={disabled}
        />
      </Field>
    ),
    hidden.has("estimatedMinutes") ? null : (
      <Field key="estimatedMinutes" label={L.estimatedMinutes}>
        <NumberField
          aria-label={L.estimatedMinutes}
          min={0}
          value={value.estimatedMinutes ?? null}
          onValueChange={(v) => commit(setEstimatedMinutes(value, v))}
          disabled={disabled}
        />
      </Field>
    ),
  ].filter((node) => node !== null);

  const editor = (
    <div data-slot="question-editor-form" className="space-y-5">
      {issues !== undefined && issues.length > 0 && (
        <Alert tone="warning" title={L.issues}>
          <ul className="space-y-1">
            {issues.map((issue) => (
              <li key={issue.label} className="flex flex-wrap items-center justify-between gap-2">
                <span>{issue.label}</span>
                {onResolveIssue && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onResolveIssue(issue.label)}
                  >
                    {L.resolveIssue}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <Field label={L.type} description={L.typeHint}>
        <Segmented
          tone="brand"
          aria-label={L.type}
          items={QUESTION_TYPES.map((t) => ({ value: t, label: Q.types[t] }))}
          value={value.type}
          onValueChange={pickType}
          disabled={disabled}
        />
      </Field>

      {extra}

      <Field label={L.stem} description={L.stemHint} error={errors.stem}>
        <div className="space-y-2">
          <MathTextarea
            multiline
            rows={3}
            aria-label={L.stem}
            placeholder={L.stemPlaceholder}
            value={stemBody(value.stem, figureFilter)}
            onChange={(body) => commit(setStemBody(value, body, figureFilter), "stem")}
            disabled={disabled}
            {...textarea}
            renderPreview={renderStemPreview}
          />
          <FiguresStrip
            keys={figures}
            disabled={disabled}
            resolveFigure={resolveFigure}
            onUploadFigure={onUploadFigure}
            onAdd={(key) => commit(addStemFigure(value, key, figureFilter), "stem")}
            onRemove={(key) => commit(removeStemFigure(value, key, figureFilter), "stem")}
            onMove={(from, to) => commit(moveStemFigure(value, from, to, figureFilter), "stem")}
            L={L}
          />
        </div>
      </Field>

      {(value.type === "single" || value.type === "multiple") && <OptionsSection {...section} />}

      {value.type === "judge" && (
        <Field label={L.answer} error={errors.answer}>
          <Segmented
            tone="brand"
            aria-label={L.answer}
            disabled={disabled}
            items={[
              { value: "true", label: Q.judgeTrue },
              { value: "false", label: Q.judgeFalse },
            ]}
            value={value.answer === false ? "false" : "true"}
            onValueChange={(v) => commit({ ...value, answer: v === "true" }, "answer")}
          />
        </Field>
      )}

      {value.type === "blank" && <BlanksSection {...section} />}

      {subjective && <SubjectiveSection {...section} />}

      <Field label={L.analysis}>
        <MathTextarea
          multiline
          rows={2}
          aria-label={L.analysis}
          placeholder={L.analysisPlaceholder}
          value={value.analysis}
          onChange={(analysis) => commit({ ...value, analysis })}
          disabled={disabled}
          {...textarea}
        />
      </Field>

      {metrics.length > 0 && (
        // 列数跟着**实际渲染的**字段走：关掉一个还写死三列，难度会孤零零占三分之一。
        // Tailwind 只认写全的类名，所以查表而不是拼 `sm:grid-cols-${n}`。
        <div className={cn("grid grid-cols-1 gap-4", METRIC_COLUMNS[metrics.length])}>{metrics}</div>
      )}
    </div>
  );

  const previewNode = preview ? (
    <div data-slot="question-editor-preview" className="space-y-2 lg:sticky lg:top-4 lg:self-start">
      <Text size="xs" tone="muted" className="block">
        {L.preview}
      </Text>
      {value.stem.trim() === "" ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border px-4 py-8 text-center">
          <Text size="sm" tone="muted">
            {L.previewEmpty}
          </Text>
        </div>
      ) : (
        <QuestionCard
          type={value.type}
          // 没给 resolveFigure 时把图块摘掉：让 QuestionCard 渲染一串 `![](key)` 源码不是预览。
          // 这里刻意**不**过 figureFilter：留下的行内引用一样解析不出图，只会印成源码。
          stem={resolveFigure ? value.stem : stemBody(value.stem)}
          resolveFigure={resolveFigure}
          // 预览里的附图 alt 跟编辑器 locale 走：QuestionCard 无 hook 读不到 Locale，缺省会落回中文。
          figureAlt={L.figureAlt}
          options={value.options ?? undefined}
          answer={value.answer}
          analysis={value.analysis}
          showAnswer
        />
      )}
    </div>
  ) : null;

  return (
    <div
      data-slot="question-editor"
      className={cn(
        "grid grid-cols-1 gap-6",
        preview && "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
        className,
      )}
    >
      {editor}
      {previewNode}

      <AlertDialog open={pendingType !== null} onOpenChange={(open) => !open && setPendingType(null)}>
        <AlertDialogContent title={L.switchTypeTitle} description={L.switchTypeDescription}>
          <AlertDialogClose render={<Button variant="outline">{L.cancel}</Button>} />
          <Button tone="danger" onClick={confirmType}>
            {L.switchTypeConfirm}
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
