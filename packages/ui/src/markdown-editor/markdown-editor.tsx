"use client";
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { cn } from "../lib/cn";
import type { MarkdownEditorProps } from "./markdown-editor.types";

export function MarkdownEditor({
  defaultValue,
  value,
  onChange,
  placeholder,
  minRows = 6,
  className,
  "aria-label": ariaLabel = "Markdown 编辑器",
}: MarkdownEditorProps) {
  void placeholder; // Task 7 接入

  const lastEmitted = useRef<string>(value ?? defaultValue ?? "");

  const editor = useEditor({
    immediatelyRender: false, // Next SSR：防服务端立即渲染导致水合错
    extensions: [
      StarterKit.configure({ link: false }), // StarterKit v3 自带 link，关掉用单独 Link
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown,
    ],
    content: value ?? defaultValue ?? "",
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
      onChange?.(md);
    },
  });

  // 受控 value 外部变更同步进编辑器，防回环：相同内容不 setContent
  useEffect(() => {
    if (!editor || value === undefined || value === lastEmitted.current) return;
    lastEmitted.current = value;
    // TipTap v3 setContent 第二参数为 options 对象；{ emitUpdate: false } 防止触发 onUpdate 回环
    // 若 v3 实际不支持该选项（编译报错），退为无 options，靠 lastEmitted 去重防回环
    editor.commands.setContent(value, { emitUpdate: false } as Parameters<typeof editor.commands.setContent>[1]);
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "w-full rounded-[var(--radius)] border border-border bg-surface text-foreground",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
        className,
      )}
      style={{ ["--mde-min-rows" as string]: String(minRows) }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
