"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { TableKit } from "@tiptap/extension-table";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { RichTextEditorToolbar } from "./rich-text-editor-toolbar";
import { sanitizePastedHtml } from "./rich-text-editor.sanitize";
import type { RichTextEditorProps, RichTextToolbarItem } from "./rich-text-editor.types";

/** 完整一档：中后台内容管理最常见的那组按钮。 */
const DEFAULT_TOOLBAR: RichTextToolbarItem[] = [
  "bold",
  "italic",
  "underline",
  "strike",
  "divider",
  "heading",
  "fontSize",
  "color",
  "divider",
  "align",
  "divider",
  "bulletList",
  "orderedList",
  "blockquote",
  "divider",
  "link",
  "image",
  "table",
  "divider",
  "clear",
];

// 内容区排版：与 MarkdownEditor 同一套后代选择器，另加表格与图片
// —— 存量 HTML 里 <table> / <img> 是常客，不给样式的话编辑态看着和前台完全两样。
const editorProseClass = cn(
  "leading-7",
  "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground",
  "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground",
  "[&_p]:my-3",
  "[&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_u]:underline [&_s]:line-through",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-3 [&_ol]:ml-6 [&_ol]:list-decimal",
  "[&_li]:my-1 [&_li]:marker:text-muted-foreground",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-[var(--radius)]",
  "[&_table]:my-3 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse",
  "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:align-top",
  "[&_th]:border [&_th]:border-border [&_th]:bg-surface-hover [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold",
  // 选中的表格单元格（ProseMirror 的 .selectedCell）
  "[&_.selectedCell]:bg-primary/10",
);

/**
 * HTML 富文本编辑器：值进出都是 **HTML 片段串**。
 *
 * 与 MarkdownEditor 的分野不在皮肤而在**值契约**：存量数据库里躺的是 HTML、前台
 * （`v-html` / 小程序 `rich-text`）也直接吃 HTML 时，用「存的时候 md→html、读的时候 html→md」
 * 绕不过去 —— html→md 是有损的，`<span style="color">`、`<p style="text-align:center">`、
 * `<table>` 在 markdown 语法里没有对应表达，一次往返就把运营攒了几年的排版洗掉了。
 */
export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  name,
  placeholder,
  invalid,
  disabled,
  minRows = 8,
  toolbar = DEFAULT_TOOLBAR,
  onUploadImage,
  sanitizePaste = true,
  extensions: extraExtensions,
  className,
  "aria-label": ariaLabelProp,
  ...rest
}: RichTextEditorProps) {
  const componentLocale = useComponentLocale();
  const ariaLabel = ariaLabelProp ?? componentLocale.richTextEditor?.editor ?? "富文本编辑器";
  const init = value ?? defaultValue ?? "";
  const lastEmitted = useRef<string>(init);
  const [htmlValue, setHtmlValue] = useState(init);

  // 工具栏裁剪同时决定装哪些扩展：没给表格按钮就别装表格扩展（省体积），
  // 但这也意味着**存量内容里的 <table> 会在载入时被 schema 丢掉** —— 文档里写死了这条。
  const enabled = useMemo(() => new Set(toolbar), [toolbar]);
  const extensions = useMemo<AnyExtension[]>(() => {
    const list: AnyExtension[] = [
      StarterKit.configure({ link: false }), // StarterKit v3 自带 link，关掉用单独 Link（配置不同）
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ];
    // TextStyle 是 color / fontSize 的载体，两者任一开启都要带上它。
    if (enabled.has("color") || enabled.has("fontSize")) list.push(TextStyle);
    if (enabled.has("color")) list.push(Color);
    if (enabled.has("fontSize")) list.push(FontSize);
    if (enabled.has("align"))
      list.push(TextAlign.configure({ types: ["heading", "paragraph"] }));
    if (enabled.has("image")) list.push(Image.configure({ inline: false }));
    if (enabled.has("table")) list.push(TableKit.configure({ table: { resizable: false } }));
    return extraExtensions ? [...list, ...extraExtensions] : list;
    // placeholder 变更不重建编辑器（会丢选区）；它只在挂载时取一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, extraExtensions]);

  const editor = useEditor({
    immediatelyRender: false, // Next SSR：防服务端立即渲染导致水合错
    editable: !disabled,
    extensions,
    content: init,
    editorProps: {
      // 粘贴净化在 ProseMirror 解析之前跑：等它解析完再洗就晚了（class 已经进了节点属性）。
      transformPastedHTML: sanitizePaste ? (html: string) => sanitizePastedHtml(html) : undefined,
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": ariaLabel,
        class: cn(
          "min-h-[calc(var(--rte-min-rows)*1.75rem)] w-full px-3 py-2 outline-none",
          editorProseClass,
          "[&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:h-0 [&_.is-editor-empty]:before:text-muted-foreground [&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmitted.current = html;
      setHtmlValue(html);
      onChange?.(html);
    },
  });

  // 受控 value 外部变更同步进编辑器，防回环：相同内容不 setContent
  useEffect(() => {
    if (!editor || value === undefined || value === lastEmitted.current) return;
    lastEmitted.current = value;
    setHtmlValue(value);
    editor.commands.setContent(value, { emitUpdate: false } as Parameters<
      typeof editor.commands.setContent
    >[1]);
  }, [editor, value]);

  // 响应 disabled 变化（跳过首次挂载，已由 editable 初值处理）
  const prevDisabled = useRef<boolean | undefined>(disabled);
  useEffect(() => {
    if (!editor) return;
    if (prevDisabled.current === disabled) return;
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
      style={{ ["--rte-min-rows" as string]: String(minRows) }}
    >
      {!disabled && toolbar.length > 0 && (
        <RichTextEditorToolbar editor={editor} items={toolbar} onUploadImage={onUploadImage} />
      )}
      <EditorContent editor={editor} />
      {name != null && <input type="hidden" name={name} value={htmlValue} readOnly />}
    </div>
  );
}
