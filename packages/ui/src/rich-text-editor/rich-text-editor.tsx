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
import { warnOnce } from "../lib/warn-once";
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
  "backgroundColor",
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

/** 从 DataTransfer 里挑出图片文件。拖 Finder 里的图、粘贴截图走的都是这里。 */
function imageFilesOf(data: DataTransfer | null | undefined): File[] {
  if (!data) return [];
  return Array.from(data.files ?? []).filter((file) => file.type.startsWith("image/"));
}

/**
 * 把 `data:` URL 还原成 `File`。
 *
 * 从 Word / Excel / 部分网页粘过来的正文，图片是内联在 HTML 里的 base64，**剪贴板里没有
 * 对应的文件条目** —— 所以 `DataTransfer.files` 那条路取不到它们，只能从 HTML 里捞。
 * `fetch` 认 `data:` URL，且这一步纯本地、不出网。
 */
async function dataUrlToFile(dataUrl: string, index: number): Promise<File | null> {
  try {
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const ext = blob.type.split("/")[1]?.split("+")[0] || "png";
    return new File([blob], `pasted-image-${index + 1}.${ext}`, { type: blob.type });
  } catch {
    return null;
  }
}

/** 一段 HTML 里所有 `data:image/*` 的 `<img src>`（去重后按出现顺序）。 */
function dataImageSrcsOf(html: string): string[] {
  if (typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const seen = new Set<string>();
  for (const img of Array.from(doc.body.querySelectorAll("img"))) {
    const src = img.getAttribute("src") ?? "";
    if (src.startsWith("data:image/")) seen.add(src);
  }
  return [...seen];
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
 * 一「行」= 1.75rem，与内容区的 `leading-7` 逐字对齐 —— `minRows` / `maxRows` 共用这一把尺子，
 * 所以 `maxRows === minRows` 恰好是「不滚」的临界点。
 *
 * min-h 那侧是 Tailwind 静态类（`min-h-[calc(var(--rte-min-rows)*1.75rem)]`，编译期就要拿到字面量），
 * 改这里必须连它一起改。
 */
const ROW_HEIGHT_REM = 1.75;

/**
 * 高度上限归一成一个 CSS 长度：`maxHeight` 优先（数值按 px），否则按 `maxRows` 折成行高。
 * 两个都不给返回 `undefined` —— 那时组件行为与不认识这两个 prop 时逐字节一致。
 */
function resolveMaxHeight(
  maxHeight: number | string | undefined,
  maxRows: number | undefined,
): string | undefined {
  if (maxHeight != null) return typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
  if (maxRows != null) return `${maxRows * ROW_HEIGHT_REM}rem`;
  return undefined;
}

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
  maxRows,
  maxHeight,
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

  // 高度上限（#264）。滚动必须落在**正文容器**上、工具栏留在它外面 ——
  // 包在整个外壳上工具栏会跟着正文滚走，那正是消费方自己套 max-h 时的下场。
  const maxContentHeight = resolveMaxHeight(maxHeight, maxRows);
  if (maxHeight != null && maxRows != null) {
    warnOnce(
      "rte-max-height-and-max-rows",
      "[hulian] RichTextEditor：maxHeight 与 maxRows 同给，本次以 maxHeight 为准、maxRows 被忽略。" +
        "两者是同一件事的两种单位，留一个即可。",
    );
  }
  // CSS 里 min-height 压过 max-height，所以上限比下限矮时**什么都不会发生**：
  // 既不滚也不矮，看不出选错了 —— 只能在这里点名。
  if (maxHeight == null && maxRows != null && maxRows < minRows) {
    warnOnce(
      "rte-max-rows-below-min-rows",
      `[hulian] RichTextEditor：maxRows(${maxRows}) 小于 minRows(${minRows})，上限不会生效 ——` +
        " CSS 里 min-height 压过 max-height，内容区仍按 minRows 撑开且不滚动。",
    );
  }

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
    // TextStyle 是 color / fontSize / fontFamily / backgroundColor 的载体，任一开启都要带上它。
    // legacyHtml.font 也要：`<font>` 翻成的 span 得有 mark 接住，否则翻了也白翻。
    if (
      enabled.has("color") ||
      enabled.has("fontSize") ||
      enabled.has("backgroundColor") ||
      legacyFont
    )
      list.push(TextStyle);
    if (enabled.has("color") || legacyFont) list.push(Color);
    if (enabled.has("fontSize") || legacyFont) list.push(FontSize);
    // font-family 没有对应的工具栏按钮（不打算让运营选字体），装它纯粹是为了**别把存量的字体丢了**。
    if (legacyFont) list.push(FontFamily);
    // 文字底色（#210）。存量里它和 color 写在同一个 `style` 上（`<span style="color:…;background-color:…">`），
    // 一个保住一个丢掉解释不通，所以 legacyHtml.font 也无条件带上它，不另开一档。
    // **刻意不用 Highlight**：那个扩展渲染的是 `<mark>`，会让同一个字段里长出两种标签 ——
    // 存量是 `<span style>`、新标的是 `<mark>`，消费方前台（`v-html` / 小程序 `rich-text`）
    // 得处理两套。工具栏这一档因此也走 BackgroundColor，按钮与存量产出同一种形状。
    if (enabled.has("backgroundColor") || legacyFont) list.push(BackgroundColor);
    if (enabled.has("align") || legacyAlign)
      list.push(TextAlign.configure({ types: ["heading", "paragraph"] }));
    if (legacyImgStyle) list.push(LegacyImage.configure({ inline: false }));
    else if (enabled.has("image")) list.push(Image.configure({ inline: false }));
    if (enabled.has("table")) list.push(TableKit.configure({ table: { resizable: false } }));
    return extraExtensions ? [...list, ...extraExtensions] : list;
    // placeholder 变更不重建编辑器（会丢选区）；它只在挂载时取一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, extraExtensions, legacyFont, legacyImgStyle, legacyAlign]);

  // 粘贴管线抽成一个函数：`transformPastedHTML` 与「上传完再插回去」两条路必须走同一套，
  // 否则异步插入的那条会绕过归一与净化。
  // 顺序是「先归一后净化」：归一把 `<font color>` 翻成 `style`，净化才有东西可白名单；
  // 反过来 color/face/size 早被属性白名单删光了，翻译无从谈起。
  const transformPasted = useCallback(
    (html: string) => {
      const normalized = toEditorHtml(html);
      if (!sanitizePaste) return normalized;
      return sanitizePastedHtml(normalized, {
        extraStyleProps: [
          ...(legacyFont ? LEGACY_FONT_STYLE_PROPS : []),
          ...(legacyImgStyle ? LEGACY_IMG_PASTE_STYLE_PROPS : []),
        ],
      });
    },
    [toEditorHtml, sanitizePaste, legacyFont, legacyImgStyle],
  );

  // editorProps 里的 handler 在 useEditor 初始化时就被捕获，闭包不会跟着 props 更新。
  // 用 ref 兜住最新的 onUploadImage，免得消费方换了上传实现之后粘贴还在调旧的那个。
  const uploadRef = useRef(onUploadImage);
  uploadRef.current = onUploadImage;
  const transformRef = useRef(transformPasted);
  transformRef.current = transformPasted;

  // editorProps 的 handler 要用 editor 实例，而 editor 又由 useEditor 产出 —— 用 ref 解开这个环。
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);

  // 图片节点在不在 schema 里。`toolbar` 裁掉 image 档就不装 Image 扩展（既有约定），
  // 那时 `setImage` 命令根本不存在 —— 不先挡住的话会「文件传上去了、图却插不进来」：
  // 白白占一次消费方的对象存储，用户还看不到任何反馈。
  const imageEnabledRef = useRef(false);
  imageEnabledRef.current = enabled.has("image") || legacyImgStyle;

  /** 上传若干图片文件，成功一张插一张（`at` 给拖放的落点）。 */
  const insertUploadedFiles = async (files: File[], at?: number) => {
    const upload = uploadRef.current;
    const instance = editorRef.current;
    if (!upload || !instance) return;
    let pos = at;
    for (const file of files) {
      try {
        const { url } = await upload(file);
        const chain = instance.chain().focus();
        // 逐张往后挪一格，多张图才不会插成倒序。
        if (pos !== undefined) chain.insertContentAt(pos, { type: "image", attrs: { src: url } });
        else chain.setImage({ src: url });
        chain.run();
        if (pos !== undefined) pos += 1;
      } catch {
        // 单张失败不该把整批打断：上传是消费方实现的，超时/鉴权失败都可能发生。
        // 这里不弹 UI —— 提示归消费方（它才知道该说什么），组件只保证不崩、不插半张。
        warnOnce("rte-upload-failed", "[hulian] RichTextEditor：onUploadImage 抛错，该图未插入。");
      }
    }
  };

  /** Word / 网页粘来的正文：把内联 base64 转存成 URL 再整段插入。 */
  const insertHtmlWithUploadedImages = async (html: string, dataUrls: string[]) => {
    const upload = uploadRef.current;
    const instance = editorRef.current;
    if (!upload || !instance) return;
    const replacements = new Map<string, string>();
    await Promise.all(
      dataUrls.map(async (dataUrl, index) => {
        const file = await dataUrlToFile(dataUrl, index);
        if (!file) return;
        try {
          const { url } = await upload(file);
          replacements.set(dataUrl, url);
        } catch {
          warnOnce(
            "rte-paste-upload-failed",
            "[hulian] RichTextEditor：粘贴的内联图片转存失败，该图未插入。",
          );
        }
      }),
    );
    // 先替 src 再走净化：替完就是普通的 https URL，能过协议白名单；
    // 顺序反过来的话 data: 图早被净化删光了，替无可替。
    let replaced = html;
    for (const [dataUrl, url] of replacements) replaced = replaced.split(dataUrl).join(url);
    instance.chain().focus().insertContent(transformRef.current(replaced)).run();
  };

  const editor = useEditor({
    immediatelyRender: false, // Next SSR：防服务端立即渲染导致水合错
    editable: !disabled,
    extensions,
    content: toEditorHtml(raw),
    editorProps: {
      // 粘贴净化在 ProseMirror 解析之前跑：等它解析完再洗就晚了（class 已经进了节点属性）。
      transformPastedHTML:
        legacy || sanitizePaste ? (html: string) => transformRef.current(html) : undefined,
      /**
       * 粘贴图片（#213）。组件本来就有完整的上传能力，此前只接在工具栏按钮上 ——
       * 而截图 `Cmd+V` 才是运营真正会用的路径，点按钮反倒是少数。
       *
       * 两条来源要分开处理，它们在剪贴板里长得完全不一样：
       * - **截图 / 从 Finder 复制的文件** 在 `clipboardData.files` 里，HTML 里没有对应的 `<img>`。
       * - **从 Word / Excel / 网页复制的正文** 里图片是内联 base64，`files` 是空的，
       *   只能从 `text/html` 里把 `data:image/*` 捞出来。
       */
      handlePaste: (_view, event) => {
        const upload = uploadRef.current;
        const files = imageFilesOf(event.clipboardData);
        if (files.length > 0) {
          if (!imageEnabledRef.current) {
            warnOnce(
              "rte-paste-image-without-node",
              "[hulian] RichTextEditor：粘贴了图片，但 toolbar 裁掉了 image 档、图片节点不在 schema 里，" +
                "插不进来。要支持图片就把 \"image\" 留在 toolbar 里。",
            );
            return false;
          }
          if (!upload) {
            // 没有上传口就没法把它变成 URL。返回 false 而不是吞掉：剪贴板里可能同时有
            // text/html（比如从网页复制图片），让 HTML 那条路继续跑，至少远程图还能进来。
            warnOnce(
              "rte-paste-image-without-upload",
              "[hulian] RichTextEditor：粘贴了图片文件，但没有传 onUploadImage，只能忽略。" +
                "需要支持粘贴上传就传 onUploadImage（拿 File、还 URL）。",
            );
            return false;
          }
          event.preventDefault();
          void insertUploadedFiles(files);
          return true;
        }

        const html = event.clipboardData?.getData("text/html") ?? "";
        const dataUrls = dataImageSrcsOf(html);
        if (dataUrls.length === 0 || !imageEnabledRef.current) return false;
        if (!upload) {
          // 净化那一层会把 data: 整个 <img> 删掉（不能把几 MB base64 写进数据库），
          // 于是图片会静默消失。开发期点名，别让消费方到生产才发现。
          warnOnce(
            "rte-paste-base64-without-upload",
            "[hulian] RichTextEditor：粘贴的正文里有内联 base64 图片，但没有传 onUploadImage，" +
              "这些图片会被丢弃（base64 不会写进正文）。传 onUploadImage 即可自动转存。",
          );
          return false;
        }
        event.preventDefault();
        void insertHtmlWithUploadedImages(html, dataUrls);
        return true;
      },
      /** 拖图进来（#213）。`moved` 为真是编辑器内部拖动节点，别劫持。 */
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const upload = uploadRef.current;
        const files = imageFilesOf((event as DragEvent).dataTransfer);
        if (files.length > 0 && !imageEnabledRef.current) {
          warnOnce(
            "rte-drop-image-without-node",
            "[hulian] RichTextEditor：拖入了图片，但 toolbar 裁掉了 image 档、图片节点不在 schema 里。",
          );
          return false;
        }
        if (files.length === 0 || !upload) {
          if (files.length > 0) {
            warnOnce(
              "rte-drop-image-without-upload",
              "[hulian] RichTextEditor：拖入了图片文件，但没有传 onUploadImage，只能忽略。",
            );
          }
          return false;
        }
        event.preventDefault();
        // 插到落点而不是原光标处 —— 拖放的语义就是「放在我指的地方」。
        const at = view.posAtCoords({
          left: (event as DragEvent).clientX,
          top: (event as DragEvent).clientY,
        });
        void insertUploadedFiles(files, at?.pos);
        return true;
      },
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
  editorRef.current = editor;

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
      {/*
        滚动容器是这一层而不是外壳：工具栏是它的兄弟节点，于是正文滚到第几千 px 都够得着按钮。
        也不放在 .ProseMirror 自己身上 —— 那层的 class 走 editorProps.attributes，
        是 useEditor 初始化时定下的，改 prop 不会重新落到 DOM 上。
      */}
      <EditorContent
        editor={editor}
        className={maxContentHeight != null ? "overflow-y-auto" : undefined}
        style={maxContentHeight != null ? { maxHeight: maxContentHeight } : undefined}
      />
      {name != null && <input type="hidden" name={name} value={htmlValue} readOnly />}
    </div>
  );
}
