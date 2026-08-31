"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Sigma } from "../_icons";
import { Button } from "../button";
import { useComponentLocale } from "../config/locale-context";
import { Input } from "../input";
import { cn } from "../lib/cn";
import { Formula } from "../math/math";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../tabs";
import { Text } from "../text";
import { Textarea } from "../textarea";
import {
  applyFormulaTemplate,
  FORMULA_TEMPLATE_GROUPS,
  isInsideMath,
  validateFormulaSyntax,
  wrapSelectionInMath,
  type FormulaTemplate,
  type FormulaTemplateGroup,
} from "./formula-editing";
import { katexErrorAt } from "./katex-error";
import { MATH_TEXTAREA_LOCALE_ZH, type MathTextareaLocale } from "./math-textarea.locale";
import type { MathTextareaProps } from "./math-textarea.types";

/**
 * 带公式工具栏与实时预览的 LaTeX 输入框。
 *
 * 题干 / 选项 / 答案 / 解析都是「含 `$…$` 的普通字符串」，普通输入框写着「可含公式」却没有
 * 任何地方说明那指的是什么，也没法在提交前确认排出来长什么样。老师要么去外面复制粘贴，
 * 要么把平方直接打成 `x2`，存进去之后题库详情、组卷预览、学生端、导出四个地方一起错，且没人报错。
 *
 * 三件事缺一不可：模板插在光标处（`applyFormulaTemplate`）、实时预览用消费端同一个 `Formula`
 * （预览对了实际就对）、提交前自检只查能确定说错的两件事并报行列（`validateFormulaSyntax`），
 * 命令拼错这类要靠 KaTeX 才知道的交给 `katexErrorAt` 定位。存储格式一个字节不变。
 *
 * 受控件。插入之后要把光标放回去：受控重渲染会把光标推到末尾，不还原的话连点两次模板，
 * 第二次就插到了整段文字的最后面（消费方踩过的坑）。
 */
type EditableElement = HTMLTextAreaElement | HTMLInputElement;
type EditorTab = "source" | "visual";

function templateLabel(item: FormulaTemplate, L: MathTextareaLocale): string {
  return item.label ?? (L.templates as Record<string, string | undefined>)[item.id] ?? item.id;
}

function groupTitle(group: FormulaTemplateGroup, L: MathTextareaLocale): string {
  return (
    group.title ?? (L.templateGroups as Record<string, string | undefined>)[group.id] ?? group.id
  );
}

export function MathTextarea({
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  disabled = false,
  compact = false,
  templates = FORMULA_TEMPLATE_GROUPS,
  renderPreview,
  visualEditor: VisualEditor,
  macros,
  "aria-label": ariaLabel,
  className,
}: MathTextareaProps) {
  const L = useComponentLocale().mathTextarea ?? MATH_TEXTAREA_LOCALE_ZH;
  const editorRef = useRef<EditableElement | null>(null);
  // 切到可视化页签后源码输入框会卸载，选区靠这份快照；插入时读它而不是「插在末尾」。
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<EditorTab>("source");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const caret = pendingCaret.current;
    const el = editorRef.current;
    if (caret === null || el === null) return;
    pendingCaret.current = null;
    el.focus();
    el.setSelectionRange(caret, caret);
  });

  const attachEditor = (el: EditableElement | null) => {
    editorRef.current = el;
  };

  const rememberSelection = () => {
    const el = editorRef.current;
    if (el === null || el.selectionStart === null || el.selectionEnd === null) return;
    selectionRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  const selection = () => {
    const el = editorRef.current;
    if (el !== null && el.selectionStart !== null && el.selectionEnd !== null) {
      return { start: el.selectionStart, end: el.selectionEnd };
    }
    return selectionRef.current ?? { start: value.length, end: value.length };
  };

  const commit = (next: { text: string; caret: number }) => {
    pendingCaret.current = next.caret;
    selectionRef.current = { start: next.caret, end: next.caret };
    onChange(next.text);
  };

  const insertLatex = (latex: string) => {
    const { start, end } = selection();
    commit(
      applyFormulaTemplate({
        text: value,
        selectionStart: start,
        selectionEnd: end,
        latex,
        // 已经在公式里就不能再套一层 `$`：套出来的 `$x$$y$` 会把中间那段变成正文。
        wrapInMath: !isInsideMath(value, start),
      }),
    );
  };

  const insertTemplate = (latex: string) => {
    insertLatex(latex);
    setPanelOpen(false);
  };

  const wrapMath = (display: boolean) => {
    const { start, end } = selection();
    commit(wrapSelectionInMath({ text: value, selectionStart: start, selectionEnd: end, display }));
    setPanelOpen(false);
  };

  const insertVisual = (latex: string = draft) => {
    const trimmed = latex.trim();
    if (trimmed === "") return;
    setTab("source");
    setDraft("");
    insertLatex(trimmed);
  };

  const issue = validateFormulaSyntax(value);
  const hasMath = value.includes("$");
  const showPreview = hasMath && issue === null;
  const parseIssue = showPreview ? katexErrorAt(value, { macros }) : null;

  const editorProps = {
    className: "w-full",
    placeholder,
    value,
    disabled,
    "aria-label": ariaLabel,
    onChange: (e: ChangeEvent<EditableElement>) => onChange(e.target.value),
    onSelect: rememberSelection,
    onKeyUp: rememberSelection,
    onBlur: rememberSelection,
  };

  const editor = multiline ? (
    <Textarea ref={attachEditor} autoResize rows={rows} {...editorProps} />
  ) : (
    <Input ref={attachEditor} {...editorProps} />
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={panelOpen} onOpenChange={(open) => setPanelOpen(open)}>
        <PopoverTrigger
          render={
            <Button size="sm" variant="outline" disabled={disabled}>
              <Sigma className="size-4" aria-hidden />
              {L.insertFormula}
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className="w-[min(92vw,26rem)]"
          title={L.panelTitle}
          description={L.panelDescription}
        >
          <div className="space-y-3">
            <div>
              <Text size="xs" tone="muted" className="block">
                {L.wrapHeading}
              </Text>
              {/* 比任何模板都常用：老师已经打好了 x^2，缺的只是那对 `$`。这两个按钮就是那句说明。 */}
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={() => wrapMath(false)}>
                  {L.wrapInline}
                </Button>
                <Button size="sm" variant="outline" onClick={() => wrapMath(true)}>
                  {L.wrapDisplay}
                </Button>
              </div>
            </div>
            {templates.map((group) => (
              <div key={group.id}>
                <Text size="xs" tone="muted" className="block">
                  {groupTitle(group, L)}
                </Text>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant="ghost"
                      onClick={() => insertTemplate(item.latex)}
                      // 无障碍名带上模板名：读屏只念排版结果说不清插进去的是什么。
                      aria-label={L.insertTemplate(templateLabel(item, L))}
                    >
                      <Formula>{item.sample}</Formula>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {!hasMath && (
        <Text size="xs" tone="muted">
          {L.hint}
        </Text>
      )}
    </div>
  );

  const sourcePane = (
    <div className="space-y-2">
      {editor}
      {toolbar}
    </div>
  );

  const body = VisualEditor ? (
    <Tabs value={tab} onValueChange={(next) => setTab(next as EditorTab)}>
      <TabsList size="sm">
        <TabsTab value="source">{L.sourceTab}</TabsTab>
        <TabsTab value="visual">{L.visualTab}</TabsTab>
      </TabsList>
      <TabsPanel value="source" className="pt-2">
        {sourcePane}
      </TabsPanel>
      <TabsPanel value="visual" className="space-y-2 pt-2">
        <VisualEditor
          value={draft}
          onChange={setDraft}
          onSubmit={insertVisual}
          aria-label={L.visualTab}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => insertVisual()}
            disabled={disabled || draft.trim() === ""}
          >
            {L.visualInsert}
          </Button>
          <Text size="xs" tone="muted">
            {L.visualHint}
          </Text>
        </div>
      </TabsPanel>
    </Tabs>
  ) : (
    sourcePane
  );

  return (
    <div data-slot="math-textarea" className={cn("space-y-2", className)}>
      {body}

      {issue !== null && (
        <div data-slot="math-textarea-error">
          <Text size="xs" tone="danger">
            {L.position(issue.line, issue.column)}
            {L.syntax[issue.code]}
          </Text>
        </div>
      )}

      {showPreview && (
        <div
          data-slot="math-textarea-preview"
          className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2"
        >
          {!compact && (
            <Text size="xs" tone="muted" className="block">
              {L.previewLabel}
            </Text>
          )}
          <div className={cn(!compact && "mt-1", compact && "truncate")}>
            {renderPreview ? (
              renderPreview(value)
            ) : (
              <Text size="sm" className="block whitespace-pre-wrap">
                <Formula macros={macros}>{value}</Formula>
              </Text>
            )}
          </div>
          {/* KaTeX 解析不了时 Formula 把原文标红显示（throwOnError:false），不说明的话老师只会觉得「预览坏了」。 */}
          {parseIssue !== null ? (
            <div data-slot="math-textarea-katex-error" className="mt-1">
              <Text size="xs" tone="danger">
                {L.katexError(parseIssue.index + 1, parseIssue.message)}
              </Text>
            </div>
          ) : (
            !compact && (
              <Text size="xs" tone="muted" className="mt-1 block">
                {L.previewNote}
              </Text>
            )
          )}
        </div>
      )}
    </div>
  );
}
