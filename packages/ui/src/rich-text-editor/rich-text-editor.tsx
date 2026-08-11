"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { BackgroundColor, Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { TableKit } from "@tiptap/extension-table";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { RichTextEditorToolbar } from "./rich-text-editor-toolbar";
import { filterStyleDeclarations, sanitizePastedHtml } from "./rich-text-editor.sanitize";
import { normalizeLegacyHtml } from "./rich-text-editor.legacy";
import type {
  LegacyHtmlOptions,
  RichTextEditorProps,
  RichTextToolbarItem,
} from "./rich-text-editor.types";

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

/**
 * `<img style>` 里放行的 CSS 属性。微信编辑器给每张图带的是 `max-width: 100%`，
 * 丢了图片在前台会撑破容器 —— 但也仅此一档：`position` / `z-index` / `float` 这类
 * 能把图片从文档流里拔出去盖住宿主 UI 的属性不进白名单。
 */
const LEGACY_IMG_STYLE_PROPS: ReadonlySet<string> = new Set(["max-width", "width", "height"]);

/** 粘贴路径上跟着 `legacyHtml` 一起放宽的 CSS 属性（默认口径见 sanitize 模块）。 */
const LEGACY_FONT_STYLE_PROPS = ["font-family"] as const;
const LEGACY_IMG_PASTE_STYLE_PROPS = ["max-width"] as const;

/**
 * `<img>` 带 style 的一档。schema 里没有的属性在**解析那一刻**就没了，
 * 所以这件事纯函数救不了，必须是扩展。
 */
const LegacyImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          filterStyleDeclarations(element.getAttribute("style") ?? "", LEGACY_IMG_STYLE_PROPS) ||
          null,
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.style ? { style: attributes.style as string } : {},
      },
    };
  },
});

/** `legacyHtml` 三档归一：`true` 全开，对象则只开写明的那几档。 */
function resolveLegacyHtml(value: boolean | LegacyHtmlOptions | undefined): LegacyHtmlOptions | null {
  if (!value) return null;
  if (value === true) return { font: true, imgStyle: true, align: true };
  if (!value.font && !value.imgStyle && !value.align) return null;
  return value;
}

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
  legacyHtml,
  extensions: extraExtensions,
  className,
  "aria-label": ariaLabelProp,
  ...rest
}: RichTextEditorProps) {
  const componentLocale = useComponentLocale();
  const ariaLabel = ariaLabelProp ?? componentLocale.richTextEditor?.editor ?? "富文本编辑器";

  // 对象字面量每次渲染都是新引用，所以拆成三个布尔再进 useMemo 依赖，不然 extensions 白重算。
  const legacy = resolveLegacyHtml(legacyHtml);
  const legacyFont = legacy?.font === true;
  const legacyImgStyle = legacy?.imgStyle === true;
  const legacyAlign = legacy?.align === true;

  // 灌进编辑器之前先归一（`<font>` → span、对齐下推）；对外的值口径仍是消费方给的原串。
  // `imgStyle` 不在这里 —— 那一档纯粹是 schema 属性，归一函数无从下手。
  const toEditorHtml = useCallback(
    (html: string) =>
      legacyFont || legacyAlign
        ? normalizeLegacyHtml(html, { font: legacyFont, align: legacyAlign })
        : html,
    [legacyFont, legacyAlign],
  );

  const raw = value ?? defaultValue ?? "";
  const lastEmitted = useRef<string>(raw);
  const [htmlValue, setHtmlValue] = useState(raw);

  // 工具栏裁剪同时决定装哪些扩展：没给表格按钮就别装表格扩展（省体积），
  // 但这也意味着**存量内容里的 <table> 会在载入时被 schema 丢掉** —— 文档里写死了这条。
  const enabled = useMemo(() => new Set(toolbar), [toolbar]);
  const extensions = useMemo<AnyExtension[]>(() => {
    const list: AnyExtension[] = [
      StarterKit.configure({ link: false }), // StarterKit v3 自带 link，关掉用单独 Link（配置不同）
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ];
    // TextStyle 是 color / fontSize / fontFamily 的载体，任一开启都要带上它。
    // legacyHtml.font 也要：`<font>` 翻成的 span 得有 mark 接住，否则翻了也白翻。
    if (enabled.has("color") || enabled.has("fontSize") || legacyFont) list.push(TextStyle);
    if (enabled.has("color") || legacyFont) list.push(Color);
    if (enabled.has("fontSize") || legacyFont) list.push(FontSize);
    // font-family 没有对应的工具栏按钮（不打算让运营选字体），装它纯粹是为了**别把存量的字体丢了**。
    if (legacyFont) list.push(FontFamily);
    // 文字底色（#210）。存量里它和 color 写在同一个 `style` 上（`<span style="color:…;background-color:…">`），
    // 一个保住一个丢掉解释不通，所以跟着 font 档一起走，不另开一档。
    // **刻意不用 Highlight**：那个扩展渲染的是 `<mark>`，会把存量的 `<span style>` 换成另一种标签 ——
    // 消费方存回库里的正文形状就变了，属于用一次静默内容变更换掉另一次。
    if (legacyFont) list.push(BackgroundColor);
    if (enabled.has("align") || legacyAlign)
      list.push(TextAlign.configure({ types: ["heading", "paragraph"] }));
    if (legacyImgStyle) list.push(LegacyImage.configure({ inline: false }));
    else if (enabled.has("image")) list.push(Image.configure({ inline: false }));
    if (enabled.has("table")) list.push(TableKit.configure({ table: { resizable: false } }));
    return extraExtensions ? [...list, ...extraExtensions] : list;
    // placeholder 变更不重建编辑器（会丢选区）；它只在挂载时取一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, extraExtensions, legacyFont, legacyImgStyle, legacyAlign]);

  const editor = useEditor({
    immediatelyRender: false, // Next SSR：防服务端立即渲染导致水合错
    editable: !disabled,
    extensions,
    content: toEditorHtml(raw),
    editorProps: {
      // 粘贴净化在 ProseMirror 解析之前跑：等它解析完再洗就晚了（class 已经进了节点属性）。
      // 顺序是「先归一后净化」：归一把 `<font color>` 翻成 `style`，净化才有东西可白名单；
      // 反过来 color/face/size 早被属性白名单删光了，翻译无从谈起。
      transformPastedHTML:
        legacy || sanitizePaste
          ? (html: string) => {
              const normalized = toEditorHtml(html);
              if (!sanitizePaste) return normalized;
              return sanitizePastedHtml(normalized, {
                extraStyleProps: [
                  ...(legacyFont ? LEGACY_FONT_STYLE_PROPS : []),
                  ...(legacyImgStyle ? LEGACY_IMG_PASTE_STYLE_PROPS : []),
                ],
              });
            }
          : undefined,
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
    editor.commands.setContent(toEditorHtml(value), { emitUpdate: false } as Parameters<
      typeof editor.commands.setContent
    >[1]);
  }, [editor, value, toEditorHtml]);

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
