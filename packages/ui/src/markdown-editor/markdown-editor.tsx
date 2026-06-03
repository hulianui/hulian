"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { cn } from "../lib/cn";
import type { MarkdownEditorProps } from "./markdown-editor.types";
import { MarkdownEditorToolbar } from "./markdown-editor-toolbar";

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
  "aria-label": ariaLabel = "Markdown 编辑器",
}: MarkdownEditorProps) {
  void placeholder; // Task 7 接入

  const init = value ?? defaultValue ?? "";
  const lastEmitted = useRef<string>(init);
  const [mdValue, setMdValue] = useState(init);

  const editor = useEditor({
    immediatelyRender: false, // Next SSR：防服务端立即渲染导致水合错
    editable: !disabled,
    extensions: [
      StarterKit.configure({ link: false }), // StarterKit v3 自带 link，关掉用单独 Link
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown,
    ],
    content: init,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": ariaLabel,
        class: cn("min-h-[calc(var(--mde-min-rows)*1.75rem)] w-full px-3 py-2 outline-none"),
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
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
    editor.commands.setContent(value, { emitUpdate: false } as Parameters<typeof editor.commands.setContent>[1]);
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
