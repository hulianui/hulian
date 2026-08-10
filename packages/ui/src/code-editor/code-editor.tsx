"use client";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { splitTokensByLine, tokenizeEditorCode, type CodeTokenType } from "./code-editor-highlight";
import {
  applyEdit,
  autoPairEdit,
  backspacePairEdit,
  getLanguageRules,
  indentEdit,
  newlineEdit,
  outdentEdit,
  toggleCommentEdit,
  type EditorEdit,
  type EditorState,
} from "./code-editor-edit";
import type { CodeEditorProps } from "./code-editor.types";

// ── 方案说明（为什么是 textarea + 高亮层，而不是 CodeMirror/Monaco）──────────────
// 本库是源码分发（package.json 的 exports 指向 ./src/*），任何依赖都会进到所有消费方的
// 模块图里；CodeMirror 6 是 6+ 个包，Monaco 更重。所以走经典的「透明 textarea 压在染色
// <pre> 上」：原生 textarea 白送 undo/redo、IME 组词、选择、无障碍与移动端长按菜单，
// 我们只负责把两层的字体度量逐项对齐并同步滚动。
//
// 对齐清单（改任何一项都必须三层同改，否则光标会和着色错位）：
//   字体族 font-mono ／ 字号 text-[0.875rem] ／ 行高 leading-[var(--hl-ce-line-height)]
//   ／ 内边距 px-3 py-3 ／ white-space: pre（wrap="off"）／ tab-size ／ letter-spacing 默认。
//
// 能力边界：不做代码折叠、自动补全、多光标、语义诊断、真实缩略图。需要这些请外接
// CodeMirror/Monaco，把本组件当皮肤参考而不是引擎（详见 code-editor.md「禁忌 / 坑」）。

// token 着色沿用 code-block 的 --code-* 语义变量（明暗自动跟随），plain 不着色。
const TOKEN_CLASS: Partial<Record<CodeTokenType, string>> = {
  comment: "text-[var(--code-comment)] italic",
  string: "text-[var(--code-string)]",
  keyword: "text-[var(--code-keyword)]",
  number: "text-[var(--code-number)]",
  tag: "text-[var(--code-tag)]",
  attr: "text-[var(--code-attr)]",
  command: "text-[var(--code-keyword)] font-medium",
  flag: "text-[var(--code-attr)]",
};

/** 三层共用的度量类，抽出来是为了「一处改，三处齐」。 */
const METRICS = "font-mono text-[0.875rem] leading-[var(--hl-ce-line-height)]";

function canExecCommand(): boolean {
  return typeof document !== "undefined" && typeof document.execCommand === "function";
}

const readState = (el: HTMLTextAreaElement): EditorState => ({
  value: el.value,
  selectionStart: el.selectionStart,
  selectionEnd: el.selectionEnd,
});

/** 光标所在行下标（0 基） */
const caretLine = (value: string, caret: number) => value.slice(0, caret).split("\n").length - 1;

export function CodeEditor({
  value,
  onChange,
  language = "tsx",
  readOnly = false,
  lineNumbers = true,
  highlightActiveLine = true,
  lineHeight = 1.6,
  tabSize = 2,
  placeholder,
  rows = 12,
  theme,
  ariaLabel,
  className,
  onFocus,
  onBlur,
  ...rest
}: CodeEditorProps) {
  // 优先级：ariaLabel prop > ConfigProvider 的 locale > 内置中文兜底。
  const labels = useComponentLocale().codeEditor ?? {
    editor: (lang?: string) => `代码编辑器${lang ? `（${lang}）` : ""}`,
  };
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  // execCommand 缺席时（jsdom / 老浏览器）走降级路径：onChange 之后由这里补回选区
  const pendingSelection = useRef<[number, number] | null>(null);
  const [activeLine, setActiveLine] = useState(0);
  const [focused, setFocused] = useState(false);

  const rules = useMemo(() => getLanguageRules(language, tabSize), [language, tabSize]);
  const lines = useMemo(
    () => splitTokensByLine(tokenizeEditorCode(value, language)),
    [value, language],
  );

  useLayoutEffect(() => {
    const pending = pendingSelection.current;
    const el = areaRef.current;
    if (!pending || !el) return;
    pendingSelection.current = null;
    el.setSelectionRange(pending[0], pending[1]);
  });

  const syncScroll = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    // 高亮层与行号槽都是 overflow-hidden，靠程序化 scrollTop/scrollLeft 跟随
    // （行号槽只跟纵向，横向滚动时保持钉在左侧）。
    if (preRef.current) {
      preRef.current.scrollTop = el.scrollTop;
      preRef.current.scrollLeft = el.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = el.scrollTop;
  }, []);

  /**
   * 落笔：优先 document.execCommand，这样这次改动进的是 textarea 的原生 undo 栈，
   * Cmd+Z 能一步步撤回；execCommand 触发真实 input 事件，React 的 onChange 照常收到新值。
   * 若直接 setState 覆盖 value（很多同类组件的做法），undo 栈会被清空 → Cmd+Z 失效。
   */
  const runEdit = useCallback(
    (el: HTMLTextAreaElement, edit: EditorEdit) => {
      const noop = edit.text === "" && edit.rangeStart === edit.rangeEnd;
      if (noop) {
        // type-over：只挪光标，不产生编辑（也就不该进 undo 栈）
        el.setSelectionRange(edit.selectionStart, edit.selectionEnd);
        return;
      }
      if (canExecCommand()) {
        el.setSelectionRange(edit.rangeStart, edit.rangeEnd);
        if (edit.text === "") document.execCommand("delete");
        else document.execCommand("insertText", false, edit.text);
        el.setSelectionRange(edit.selectionStart, edit.selectionEnd);
        pendingSelection.current = [edit.selectionStart, edit.selectionEnd];
        return;
      }
      // 降级：整篇回吐 + 下一帧补选区（会丢失原生 undo，仅用于不支持 execCommand 的环境）
      const next = applyEdit(readState(el), edit);
      pendingSelection.current = [next.selectionStart, next.selectionEnd];
      onChange?.(next.value);
    },
    [onChange],
  );

  const updateActiveLine = useCallback((el: HTMLTextAreaElement) => {
    setActiveLine(caretLine(el.value, el.selectionStart));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (readOnly) return;
    const state = readState(el);
    const mod = e.metaKey || e.ctrlKey;

    let edit: EditorEdit | null = null;
    if (e.key === "Tab" && !mod) {
      edit = e.shiftKey ? outdentEdit(state, rules) : indentEdit(state, rules);
      e.preventDefault(); // 无论有没有编辑都别让焦点跳走
    } else if (e.key === "Enter" && !mod && !e.shiftKey) {
      edit = newlineEdit(state, rules);
      e.preventDefault();
    } else if (e.key === "/" && mod) {
      edit = toggleCommentEdit(state, rules);
      e.preventDefault();
    } else if (e.key === "Backspace" && !mod) {
      edit = backspacePairEdit(state, rules);
      if (edit) e.preventDefault();
    } else if (e.key.length === 1 && !mod) {
      edit = autoPairEdit(state, e.key, rules);
      if (edit) e.preventDefault();
    }
    if (!edit) return;
    runEdit(el, edit);
    updateActiveLine(el);
  };

  const gutterWidth = `${Math.max(2, String(lines.length).length)}ch`;

  return (
    <div
      {...rest}
      data-theme={theme}
      data-slot="code-editor"
      className={cn(
        // w-full 不可省：textarea 的 intrinsic 宽度由 HTML 默认 cols(20) 决定，于是整个编辑器的
        // max-content 宽度被锚在 ~20 字符。普通块级上下文里 block-flex 会自然铺满，看不出问题；
        // 一旦作为 flex/grid item（「左树右编辑器」正是它最典型的用法），就会按内容宽塌成一条
        // 窄框，overflow-hidden 还让它可以被压得更窄（#116）。
        "relative flex w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-foreground",
        "focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
      style={
        {
          "--hl-ce-line-height": String(lineHeight),
          "--hl-ce-tab-size": String(tabSize),
          "--hl-ce-gutter": gutterWidth,
        } as CSSProperties
      }
    >
      {lineNumbers && (
        <div
          ref={gutterRef}
          aria-hidden
          data-slot="code-editor-gutter"
          className={cn(
            METRICS,
            "shrink-0 select-none overflow-hidden border-r border-border bg-surface py-3 text-muted-foreground",
          )}
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-[calc(var(--hl-ce-gutter)+1.5rem)] px-3 text-right tabular-nums",
                highlightActiveLine && focused && i === activeLine && "bg-surface-hover text-foreground",
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        {/* 高亮层：只负责染色，永远不接指针事件；滚动由 textarea 驱动 */}
        <pre
          ref={preRef}
          aria-hidden
          data-slot="code-editor-highlight"
          className={cn(
            METRICS,
            "pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-3",
            "[tab-size:var(--hl-ce-tab-size)]",
          )}
        >
          {lines.map((tokens, i) => (
            <div
              key={i}
              // w-max min-w-full：让当前行底色横向铺满「内容宽 / 容器宽」里的较大者，
              // 否则横滚之后底色会在容器右边缘断掉
              className={cn(
                "w-max min-w-full",
                highlightActiveLine && focused && i === activeLine && "bg-surface-hover",
              )}
            >
              {tokens.length === 0
                ? "\u200B" /* 空行也要撑出一个行盒，否则行号与代码行会错位 */
                : tokens.map((t, j) =>
                    t.type === "plain" ? (
                      <span key={j}>{t.value}</span>
                    ) : (
                      <span key={j} className={TOKEN_CLASS[t.type]}>
                        {t.value}
                      </span>
                    ),
                  )}
            </div>
          ))}
        </pre>

        <textarea
          ref={areaRef}
          value={value}
          rows={rows}
          readOnly={readOnly}
          aria-readonly={readOnly || undefined}
          aria-label={ariaLabel ?? labels.editor(language)}
          placeholder={placeholder}
          wrap="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          data-gramm="false"
          data-slot="code-editor-input"
          onChange={(e) => onChange?.(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          onScroll={syncScroll}
          onSelect={(e) => updateActiveLine(e.currentTarget)}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          className={cn(
            METRICS,
            "relative block h-full w-full resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3",
            "[tab-size:var(--hl-ce-tab-size)]",
            // 文字透明只留光标：真正可见的字来自下面的高亮层。
            // 选区底色必须半透明，否则会盖住高亮层的代码（textarea 在上层绘制）。
            "text-transparent caret-foreground outline-none selection:bg-primary/25",
            "placeholder:text-muted-foreground",
          )}
        />
      </div>
    </div>
  );
}
