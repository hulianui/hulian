"use client";
import { useEffect, useReducer, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ColorSwatchPicker } from "../color-swatch-picker";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Quote,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
} from "../_icons";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import type { RichTextToolbarItem } from "./rich-text-editor.types";

const FALLBACK_LABELS = {
  editor: "富文本编辑器",
  toolbar: "格式工具栏",
  bold: "加粗",
  italic: "斜体",
  underline: "下划线",
  strikethrough: "删除线",
  heading: "标题",
  paragraph: "正文",
  fontSize: "字号",
  color: "文字颜色",
  backgroundColor: "文字底色",
  noBackground: "无底色",
  defaultColor: "默认色",
  alignLeft: "左对齐",
  alignCenter: "居中",
  alignRight: "右对齐",
  unorderedList: "无序列表",
  orderedList: "有序列表",
  blockquote: "引用",
  link: "链接",
  linkUrl: "链接地址",
  image: "图片",
  imageUrl: "图片地址",
  table: "表格",
  clearFormat: "清除格式",
  uploading: "上传中…",
  uploadFailed: "图片上传失败",
};

/** 中后台文案常用的一档字号（px）。运营要的是「大一号/小一号」，不是无级调节。 */
const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];

/**
 * 「清除」哨兵：选中它走 `unset*`，而不是往正文里写一个颜色。
 *
 * 用 `currentColor` / `transparent` 这两个**合法 CSS 颜色**当哨兵，是为了色块本身还能
 * 正常画出来（前者显示成色块自己的文字色，后者是空底）—— 换个自造串就画不出来了。
 */
const UNSET_TEXT_COLOR = "currentColor";
const UNSET_BACKGROUND = "transparent";

/**
 * 预设文字色：首项是「默认色」，再给运营惯用的红/橙/绿/蓝。
 *
 * 首项刻意**不是** `var(--color-foreground)`。正文是要存进消费方数据库、再由**别处的前台**
 * （`v-html` / 小程序 `rich-text` / 邮件）渲染的，那些地方没有瑚琏的 CSS 变量，
 * `color: var(--color-foreground)` 到了那边解析不出值、静默退回继承色 —— 等于把一个
 * 只在编辑器里成立的样式写进了永久内容。「默认色」的真正语义就是「不写这条声明」，
 * 所以它走 `unsetColor()`。
 */
const COLORS = [
  { color: UNSET_TEXT_COLOR, labelKey: "defaultColor" as const },
  { color: "#e4393c", labelKey: "red" },
  { color: "#fa8c16", labelKey: "orange" },
  { color: "#52c41a", labelKey: "green" },
  { color: "#1677ff", labelKey: "blue" },
  { color: "#8c8c8c", labelKey: "gray" },
];

/**
 * 预设文字底色（#210）。运营用它做「暗红底白字」那类标记。
 *
 * 第一项是「无底色」= 清除。其余取存量正文里实际出现过的那档饱和底色，外加两个浅底 ——
 * 浅底配默认文字色可读，深底通常要连文字色一起改，两类都给。
 * 同样只写具体色值，不写 `var(--color-*)`，理由见 COLORS 上方。
 */
const BACKGROUND_COLORS = [
  { color: UNSET_BACKGROUND, labelKey: "noBackground" as const },
  { color: "#fff566", labelKey: "yellow" },
  { color: "#b7eb8f", labelKey: "lightGreen" },
  { color: "#c24f4a", labelKey: "darkRed" },
  { color: "#1677ff", labelKey: "blue" },
  { color: "#8c8c8c", labelKey: "gray" },
];

// 工具栏按钮：ghost sm，aria-label + aria-pressed（激活态），onMouseDown preventDefault 防失焦。
// 失焦这条不是细节：编辑器一失焦，selection 就没了，命令会落到「没有选区」上什么也不做。
function TBtn({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      aria-pressed={active || undefined}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("size-8 px-0", active && "bg-primary/12 text-primary")}
    >
      {children}
    </Button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

export function RichTextEditorToolbar({
  editor,
  items,
  onUploadImage,
}: {
  editor: Editor;
  items: RichTextToolbarItem[];
  onUploadImage?: (file: File) => Promise<{ url: string }>;
}) {
  const labels = { ...FALLBACK_LABELS, ...useComponentLocale().richTextEditor };
  // 订阅 transaction 以在命令后刷新 isActive 高亮；useEffect 保证只注册一次 + cleanup 防泄漏。
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    editor.on("transaction", forceUpdate);
    return () => {
      editor.off("transaction", forceUpdate);
    };
  }, [editor]);

  const fileRef = useRef<HTMLInputElement>(null);
  const icon = "size-4";

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
    ? "2"
    : editor.isActive("heading", { level: 3 })
    ? "3"
    : "0";

  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  const pickImage = () => {
    // 有上传口就走文件选择（消费方自己带鉴权头传 OSS）；没有就退回填 URL。
    // 任何情况下都不内联 base64：一篇正文膨胀几 MB，数据库字段先炸。
    if (onUploadImage) {
      fileRef.current?.click();
      return;
    }
    const url = window.prompt(labels.imageUrl, "https://");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const uploadPicked = async (file: File) => {
    try {
      const { url } = await onUploadImage!(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      window.alert(labels.uploadFailed);
    }
  };

  const render = (item: RichTextToolbarItem, index: number) => {
    switch (item) {
      case "divider":
        return <Sep key={`sep-${index}`} />;
      case "bold":
        return (
          <TBtn
            key={item}
            label={labels.bold}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className={icon} />
          </TBtn>
        );
      case "italic":
        return (
          <TBtn
            key={item}
            label={labels.italic}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className={icon} />
          </TBtn>
        );
      case "underline":
        return (
          <TBtn
            key={item}
            label={labels.underline}
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className={icon} />
          </TBtn>
        );
      case "strike":
        return (
          <TBtn
            key={item}
            label={labels.strikethrough}
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className={icon} />
          </TBtn>
        );
      case "heading":
        return (
          <Select
            key={item}
            items={[
              { value: "0", label: labels.paragraph },
              { value: "1", label: "H1" },
              { value: "2", label: "H2" },
              { value: "3", label: "H3" },
            ]}
            value={headingValue}
            onValueChange={(v: unknown) => {
              const level = Number(v);
              if (!level) editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .setHeading({ level: level as 1 | 2 | 3 })
                  .run();
            }}
          >
            <SelectTrigger size="sm" aria-label={labels.heading} className="h-8 w-24" />
            <SelectContent>
              <SelectItem value="0">{labels.paragraph}</SelectItem>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
            </SelectContent>
          </Select>
        );
      case "fontSize":
        return (
          <Select
            key={item}
            items={FONT_SIZES.map((s) => ({ value: s, label: s.replace("px", "") }))}
            value={currentFontSize === "" ? null : currentFontSize}
            placeholder={labels.fontSize}
            onValueChange={(v: unknown) => {
              if (v == null) editor.chain().focus().unsetFontSize().run();
              else editor.chain().focus().setFontSize(String(v)).run();
            }}
          >
            <SelectTrigger size="sm" aria-label={labels.fontSize} className="h-8 w-20" />
            <SelectContent>
              {FONT_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("px", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "color":
        return (
          <Popover key={item}>
            <PopoverTrigger
              aria-label={labels.color}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-[min(var(--radius),0.375rem)]",
                "text-foreground transition-colors hover:bg-surface-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Palette className={icon} />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto">
              <ColorSwatchPicker
                aria-label={labels.color}
                size="sm"
                colors={COLORS.map((c) => ({
                  color: c.color,
                  // 哨兵色块得给人读名，否则读屏念的是 "currentColor"。
                  label: c.color === UNSET_TEXT_COLOR ? labels.defaultColor : c.color,
                }))}
                // 没有 color 属性时让「默认色」显示为选中 —— 那正是当前状态。
                value={
                  (editor.getAttributes("textStyle").color as string | undefined) ??
                  UNSET_TEXT_COLOR
                }
                onValueChange={(color) =>
                  color === UNSET_TEXT_COLOR
                    ? editor.chain().focus().unsetColor().run()
                    : editor.chain().focus().setColor(color).run()
                }
              />
            </PopoverContent>
          </Popover>
        );
      case "backgroundColor":
        return (
          <Popover key={item}>
            <PopoverTrigger
              aria-label={labels.backgroundColor}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-[min(var(--radius),0.375rem)]",
                "text-foreground transition-colors hover:bg-surface-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Highlighter className={icon} />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto">
              <ColorSwatchPicker
                aria-label={labels.backgroundColor}
                size="sm"
                colors={BACKGROUND_COLORS.map((c) => ({
                  color: c.color,
                  label: c.color === UNSET_BACKGROUND ? labels.noBackground : c.color,
                }))}
                value={
                  (editor.getAttributes("textStyle").backgroundColor as string | undefined) ??
                  UNSET_BACKGROUND
                }
                onValueChange={(color) =>
                  color === UNSET_BACKGROUND
                    ? editor.chain().focus().unsetBackgroundColor().run()
                    : editor.chain().focus().setBackgroundColor(color).run()
                }
              />
            </PopoverContent>
          </Popover>
        );
      case "align":
        return (
          <span key={item} className="contents">
            <TBtn
              label={labels.alignLeft}
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className={icon} />
            </TBtn>
            <TBtn
              label={labels.alignCenter}
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className={icon} />
            </TBtn>
            <TBtn
              label={labels.alignRight}
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className={icon} />
            </TBtn>
          </span>
        );
      case "bulletList":
        return (
          <TBtn
            key={item}
            label={labels.unorderedList}
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className={icon} />
          </TBtn>
        );
      case "orderedList":
        return (
          <TBtn
            key={item}
            label={labels.orderedList}
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className={icon} />
          </TBtn>
        );
      case "blockquote":
        return (
          <TBtn
            key={item}
            label={labels.blockquote}
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className={icon} />
          </TBtn>
        );
      case "link":
        return (
          <TBtn
            key={item}
            label={labels.link}
            active={editor.isActive("link")}
            onClick={() => {
              const prev = editor.getAttributes("link").href as string | undefined;
              const url = window.prompt(labels.linkUrl, prev ?? "https://");
              if (url === null) return;
              if (url === "") editor.chain().focus().unsetLink().run();
              else editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            <LinkIcon className={icon} />
          </TBtn>
        );
      case "image":
        return (
          <span key={item} className="contents">
            <TBtn label={labels.image} onClick={pickImage}>
              <ImageIcon className={icon} />
            </TBtn>
            {onUploadImage && (
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = ""; // 允许连传同一个文件
                  if (file) void uploadPicked(file);
                }}
              />
            )}
          </span>
        );
      case "table":
        return (
          <TBtn
            key={item}
            label={labels.table}
            active={editor.isActive("table")}
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            <TableIcon className={icon} />
          </TBtn>
        );
      case "clear":
        return (
          <TBtn
            key={item}
            label={labels.clearFormat}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <Eraser className={icon} />
          </TBtn>
        );
      default:
        return null;
    }
  };

  return (
    <div
      role="toolbar"
      aria-label={labels.toolbar}
      className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1"
    >
      {items.map(render)}
    </div>
  );
}
