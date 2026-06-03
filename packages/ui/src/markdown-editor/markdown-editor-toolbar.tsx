"use client";
import { useEffect, useReducer } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "../button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link,
  Minus,
} from "../_icons";
import { cn } from "../lib/cn";

// 工具栏按钮：ghost sm，aria-label + aria-pressed（激活态），onMouseDown preventDefault 防失焦
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

// 竖向分隔：Divider type="vertical" 用 h-[0.9em] 行内高度，工具栏需固定 h-5；改用 span 降级
const Sep = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

export function MarkdownEditorToolbar({ editor }: { editor: Editor }) {
  // 订阅 transaction 事件以在格式命令后刷新 isActive 高亮；useEffect 保证只注册一次 + cleanup 防泄漏
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    editor.on("transaction", forceUpdate);
    return () => {
      editor.off("transaction", forceUpdate);
    };
  }, [editor]);

  const icon = "size-4";

  return (
    <div
      role="toolbar"
      aria-label="格式工具栏"
      className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1"
    >
      {/* 行内格式 */}
      <TBtn
        label="加粗"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className={icon} />
      </TBtn>
      <TBtn
        label="斜体"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className={icon} />
      </TBtn>
      <TBtn
        label="删除线"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className={icon} />
      </TBtn>
      <TBtn
        label="行内代码"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className={icon} />
      </TBtn>
      <Sep />
      {/* 标题 */}
      <TBtn
        label="标题 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className={icon} />
      </TBtn>
      <TBtn
        label="标题 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className={icon} />
      </TBtn>
      <TBtn
        label="标题 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className={icon} />
      </TBtn>
      <Sep />
      {/* 块级格式 */}
      <TBtn
        label="无序列表"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className={icon} />
      </TBtn>
      <TBtn
        label="有序列表"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className={icon} />
      </TBtn>
      <TBtn
        label="引用"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className={icon} />
      </TBtn>
      <TBtn
        label="代码块"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className={icon} />
      </TBtn>
      <Sep />
      {/* 链接 & 分割线 */}
      <TBtn
        label="链接"
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("链接地址", prev ?? "https://");
          if (url === null) return;
          if (url === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        <Link className={icon} />
      </TBtn>
      <TBtn
        label="分割线"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className={icon} />
      </TBtn>
    </div>
  );
}
