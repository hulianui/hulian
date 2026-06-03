"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { cn } from "../lib/cn";
import type { MarkdownEditorProps } from "./markdown-editor.types";

export function MarkdownEditor({
  defaultValue,
  value,
  placeholder,
  minRows = 6,
  className,
  "aria-label": ariaLabel = "Markdown 编辑器",
}: MarkdownEditorProps) {
  // placeholder 将在 Task 7 接入；此处解构以避免透传到 DOM
  void placeholder;

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
  });

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
