"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "../lib/cn";
import type { MarkdownEditorProps } from "./markdown-editor.types";
import { MarkdownEditorToolbar } from "./markdown-editor-toolbar";
import { useComponentLocale } from "../config/locale-context";

// 内容区排版：从 prose.tsx proseBase 复制的后代选择器（去掉首尾子元素边距类）
const editorProseClass = cn(
  "leading-7",
  // 标题
  "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground",
  "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground",
  "[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:font-semibold [&_h4]:text-foreground",
  // 段落
  "[&_p]:my-4",
  // 强调
  "[&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic",
  // 链接
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary-hover",
  // 列表
  "[&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal",
  "[&_li]:my-1 [&_li]:marker:text-muted-foreground",
  // 行内代码（排除 pre 内的 code）
  "[&_:not(pre)>code]:rounded-[min(var(--radius),0.375rem)] [&_:not(pre)>code]:bg-surface-hover [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em]",
  // 代码块
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius)] [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:font-mono",
  // 引用
  // 引用不加 italic：中文无真意大利体字形，合成伪斜体会让笔画变形（与 Prose 同一判据）。
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
);

export function MarkdownEditor({
  defaultValue,
  value,
  onChange,
  name,
  placeholder,
  invalid,
  disabled,
  minRows = 6,
  className,
  "aria-label": ariaLabelProp,
  ...rest
}: MarkdownEditorProps) {
  const componentLocale = useComponentLocale();
  const ariaLabel = ariaLabelProp ?? componentLocale.markdownEditor?.editor ?? "Markdown 编辑器";
  const init = value ?? defaultValue ?? "";
  const lastEmitted = useRef<string>(init);
  const [mdValue, setMdValue] = useState(init);

  const editor = useEditor({
    immediatelyRender: false, // Next SSR：防服务端立即渲染导致水合错
    editable: !disabled,
    extensions: [
      StarterKit.configure({ link: false }), // StarterKit v3 自带 link，关掉用单独 Link
      Link.configure({ openOnClick: false, autolink: true }),
      // tiptap-markdown 0.8.x 的类型绑 @tiptap/core v2（peer ^2.0.3），本库用 v3。本包是源码
      // 分发，消费方 tsc 会直接检查本文件——其依赖树里 tiptap-markdown 若挂自己的 v2 core
      // 副本，v2 Extension 进 v3 AnyExtension[] 即类型不匹配（vite 只转译不受影响）。
      // 运行时 v3 兼容已实证，类型在此收口；tiptap-markdown 出 v3 适配版后可去掉。
      Markdown as unknown as AnyExtension,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: init,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": ariaLabel,
        class: cn(
          "min-h-[calc(var(--mde-min-rows)*1.75rem)] w-full px-3 py-2 outline-none",
          editorProseClass,
          // placeholder 空态：Tiptap Placeholder 扩展给空首段加 .is-editor-empty + data-placeholder
          "[&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:h-0 [&_.is-editor-empty]:before:text-muted-foreground [&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const md = (
        editor.storage as unknown as { markdown: { getMarkdown(): string } }
      ).markdown.getMarkdown();
      lastEmitted.current = md;
      setMdValue(md);
      onChange?.(md);
    },
  });

  // 受控 value 外部变更同步进编辑器，防回环：相同内容不 setContent
  useEffect(() => {
    if (!editor || value === undefined || value === lastEmitted.current) return;
    lastEmitted.current = value;
    setMdValue(value);
    // TipTap v3 setContent 第二参数为 options 对象；{ emitUpdate: false } 防止触发 onUpdate 回环
    editor.commands.setContent(value, { emitUpdate: false } as Parameters<
      typeof editor.commands.setContent
    >[1]);
  }, [editor, value]);

  // 响应 disabled 变化：动态切换编辑器可编辑状态（跳过 editor 首次挂载，已由 editable 初值处理）
  const prevDisabled = useRef<boolean | undefined>(disabled);
  useEffect(() => {
    if (!editor) return;
    if (prevDisabled.current === disabled) return; // 初次 editor 就绪时跳过
    prevDisabled.current = disabled;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div
      {...rest}
      {...(invalid && { "data-invalid": "" })}
      className={cn(
        "w-full rounded-[var(--radius)] border border-border bg-surface text-foreground",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
        invalid && "border-danger focus-within:ring-danger",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      style={{ ["--mde-min-rows" as string]: String(minRows) }}
    >
      {!disabled && <MarkdownEditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      {name != null && <input type="hidden" name={name} value={mdValue} readOnly />}
    </div>
  );
}
