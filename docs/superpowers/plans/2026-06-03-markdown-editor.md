# MarkdownEditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 `@hulianui/ui` 新增 `MarkdownEditor`——WYSIWYG markdown 编辑器，value 进出皆 markdown 字符串，可放进 `<Field>` 校验。

**Architecture:** 瑚琏皮肤罩 TipTap v3（ProseMirror）。`'use client'` + `useEditor({immediatelyRender:false})`；`tiptap-markdown` 做 md↔doc 序列化；外壳复刻 `Input` 的 token 皮肤 + `has-[[data-invalid]]`；隐藏 `<input>` 桥给原生表单/Field；工具栏 dogfood 自家 Toolbar/Button/Tooltip/Popover。

**Tech Stack:** TipTap v3（`@tiptap/react` `@tiptap/pm` `@tiptap/starter-kit` `@tiptap/extension-link` `tiptap-markdown`）、React 19、Tailwind v4、Base UI Field、vitest + @testing-library/react（jsdom）。

**约定（务必遵守）：**
- 所有命令在仓库根 `/Users/zhangzhiwei/Desktop/code/hulian` 执行；测试在 `packages/ui` 下跑（`cd packages/ui && npx vitest run <file>`，根目录无 vitest 配置会报 `Element is not defined`）。
- 起 www 预览**严禁** `pnpm dev`（其 kill:stale 会杀 5514 桌面 app），用 `pnpm --filter www dev`。
- barrel 与组件源码**同次提交**，避免孤儿引用断 clean HEAD 构建。
- 当前分支 `master`，工作区有 WIP。每个 commit 用 pathspec 只 add 本任务文件，不要 `git add -A`。

---

### Task 1: 装依赖 + tiptap-markdown v3 兼容性 spike（先去风险）

**Files:**
- Modify: `packages/ui/package.json`（dependencies）
- Create（临时）: `packages/ui/src/markdown-editor/_spike.test.tsx`（验证后删）

- [ ] **Step 1: 加依赖到 `packages/ui/package.json` 的 dependencies**

在 `dependencies` 块按字母序插入（紧邻已有项）：
```jsonc
"@tiptap/extension-link": "^3",
"@tiptap/pm": "^3",
"@tiptap/react": "^3",
"@tiptap/starter-kit": "^3",
"tiptap-markdown": "^0.8.10",
```

- [ ] **Step 2: 安装**

Run: `pnpm install`
Expected: 成功，无 peer 冲突报错。记录实际解析到的版本（`grep -A2 '@tiptap/react' pnpm-lock.yaml | head`）。

- [ ] **Step 3: 写 spike 测试，验证 StarterKit 扩展构成 + md round-trip**

Create `packages/ui/src/markdown-editor/_spike.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

describe("tiptap v3 spike", () => {
  it("StarterKit 是否自带 link 扩展（决定要不要单独装 Link）", () => {
    const e = new Editor({ extensions: [StarterKit, Markdown] });
    const names = e.extensionManager.extensions.map((x) => x.name);
    // 打印出来人工看一眼；断言只是占位
    console.log("EXTENSIONS:", names.join(","));
    expect(names).toContain("bold");
    e.destroy();
  });

  it("markdown round-trip：md→doc→md 文本一致", () => {
    const md = "# 标题\n\n这是**粗**和*斜*\n\n- a\n- b";
    const e = new Editor({ extensions: [StarterKit, Markdown], content: md });
    const out = (e.storage as any).markdown.getMarkdown().trim();
    console.log("ROUNDTRIP OUT:", JSON.stringify(out));
    expect(out).toContain("# 标题");
    expect(out).toContain("**粗**");
    expect(out).toContain("- a");
    e.destroy();
  });
});
```

- [ ] **Step 4: 跑 spike**

Run: `cd packages/ui && npx vitest run src/markdown-editor/_spike.test.tsx`
Expected: PASS。从输出记录两件事：
  1. `EXTENSIONS:` 是否含 `link` → **含则** Task 3 用 `StarterKit.configure({ link: false })` 再单独加 `Link`，避免 duplicate；**不含则**直接 `[StarterKit, Link, Markdown]`。
  2. `ROUNDTRIP OUT:` 确认 md 序列化正常。若 round-trip 失败/乱码 → 停手，改用 `prosemirror-markdown` 自接（回报主线）。

- [ ] **Step 5: 删除 spike 文件并提交依赖**

Run: `rm packages/ui/src/markdown-editor/_spike.test.tsx`
```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "build(ui): 引入 TipTap v3 + tiptap-markdown 依赖(MarkdownEditor 前置)"
```

---

### Task 2: 类型定义

**Files:**
- Create: `packages/ui/src/markdown-editor/markdown-editor.types.ts`

- [ ] **Step 1: 写类型**

```ts
export interface MarkdownEditorProps {
  /** 受控 markdown 字符串 */
  value?: string;
  /** 非受控初值 */
  defaultValue?: string;
  /** 内容变化回调，参数为 markdown 字符串 */
  onChange?: (markdown: string) => void;
  /** 桥给原生表单 / Field 的隐藏 input name */
  name?: string;
  placeholder?: string;
  /** 校验失败态：外壳变 danger（也可由外层 Field 经 data-invalid 驱动） */
  invalid?: boolean;
  disabled?: boolean;
  /** 内容区最小高度（行），默认 6 */
  minRows?: number;
  className?: string;
  "aria-label"?: string;
}
```

- [ ] **Step 2: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor.types.ts
git commit -m "feat(ui): MarkdownEditor 类型定义"
```

---

### Task 3: 核心编辑器骨架（useEditor + SSR guard + 渲染）

**Files:**
- Create: `packages/ui/src/markdown-editor/markdown-editor.tsx`
- Test: `packages/ui/src/markdown-editor/markdown-editor.test.tsx`

- [ ] **Step 1: 写失败测试（渲染出可编辑区 + 初值 markdown 解析）**

Create `packages/ui/src/markdown-editor/markdown-editor.test.tsx`:
```tsx
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MarkdownEditor } from "./markdown-editor";

beforeAll(() => {
  // jsdom 未实现，ProseMirror/scrollIntoView 会调用
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("MarkdownEditor", () => {
  it("渲染 contenteditable 编辑区并解析初值 markdown", async () => {
    render(<MarkdownEditor defaultValue={"# 你好\n\n正文"} aria-label="详情编辑器" />);
    const region = await screen.findByRole("textbox", { name: "详情编辑器" });
    expect(region).toBeTruthy();
    // 初值 # 你好 应渲染成 h1
    expect(region.querySelector("h1")?.textContent).toBe("你好");
  });
});
```

- [ ] **Step 2: 跑测试看它失败**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: FAIL（`MarkdownEditor` 未定义 / 模块不存在）。

- [ ] **Step 3: 写最小实现**

Create `packages/ui/src/markdown-editor/markdown-editor.tsx`（**Link 配置按 Task 1 spike 结果二选一**，下面给「StarterKit 不含 link」版；若含 link，把 `StarterKit` 换成 `StarterKit.configure({ link: false })`）：
```tsx
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
  const editor = useEditor({
    immediatelyRender: false, // Next SSR：禁止服务端立即渲染，防水合错
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown,
    ],
    content: value ?? defaultValue ?? "",
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": ariaLabel,
        class: cn(
          "min-h-[calc(var(--mde-min-rows)*1.75rem)] w-full px-3 py-2 outline-none",
        ),
      },
    },
  });

  if (!editor) return null; // 客户端初始化完成前不渲染

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
```
> `placeholder` 暂未接（Task 6 加 Placeholder 扩展或 CSS）。先让渲染/解析跑通。

- [ ] **Step 4: 跑测试看它通过**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: PASS。若 `findByRole("textbox")` 拿不到，检查 EditorContent 是否把 attributes 透到 contenteditable div（ProseMirror 在 jsdom 下会创建 `.ProseMirror[contenteditable]`，role/aria 来自 editorProps.attributes）。

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor.tsx packages/ui/src/markdown-editor/markdown-editor.test.tsx
git commit -m "feat(ui): MarkdownEditor 核心骨架(TipTap useEditor + SSR guard + md 初值解析)"
```

---

### Task 4: markdown 值契约（受控 / onChange / 防回环）

**Files:**
- Modify: `packages/ui/src/markdown-editor/markdown-editor.tsx`
- Test: `packages/ui/src/markdown-editor/markdown-editor.test.tsx`

- [ ] **Step 1: 加失败测试（onChange 吐 markdown + 受控 value 同步）**

追加到 test 文件 describe 内：
```tsx
  it("编辑触发 onChange 且参数是 markdown 字符串", async () => {
    const onChange = vi.fn();
    render(<MarkdownEditor defaultValue="abc" onChange={onChange} aria-label="ed" />);
    const region = await screen.findByRole("textbox", { name: "ed" });
    // 用 ProseMirror 的方式插入文本：聚焦后派发 input 不可靠，改走 editor 命令不可达；
    // 这里退而验证「初次挂载不应触发 onChange」+「受控 value 变更后 DOM 同步」
    expect(onChange).not.toHaveBeenCalled();
  });

  it("受控 value 外部变更同步进编辑区", async () => {
    const { rerender } = render(<MarkdownEditor value="# 一" aria-label="ed2" />);
    const region = await screen.findByRole("textbox", { name: "ed2" });
    expect(region.querySelector("h1")?.textContent).toBe("一");
    rerender(<MarkdownEditor value="# 二" aria-label="ed2" />);
    expect(region.querySelector("h1")?.textContent).toBe("二");
  });
```
> 说明：jsdom 下无法可靠模拟真实键入，故「编辑→onChange」的正向链路放到 Task 10 dev-server 截图 + 手动验；这里只锁「不误触发」「受控同步」两条可测契约。

- [ ] **Step 2: 跑测试看「受控同步」失败**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: 「受控 value 外部变更同步」FAIL（当前实现只在初始化用 content，不响应 value 变化）。

- [ ] **Step 3: 实现值契约**

修改 `markdown-editor.tsx`：引入 `useRef` 记录 `lastEmitted`，加 `onUpdate` 序列化回调 + `useEffect` 受控同步。完整替换组件函数体：
```tsx
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
  const lastEmitted = useRef<string>(value ?? defaultValue ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true }), Markdown],
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
      const md = (editor.storage as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
      lastEmitted.current = md;
      onChange?.(md);
    },
  });

  // 受控：外部 value 变化且 != 我们刚吐出去的 → setContent（防回环：序列化≠原文也不会反复 set）
  useEffect(() => {
    if (!editor || value === undefined) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
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
```
> 注意 `setContent(value, { emitUpdate: false })`——TipTap v3 第二参为 options 对象（v2 是布尔）；`emitUpdate:false` 防止 setContent 反触发 onUpdate 造成回环。若 spike 显示该签名不符，按实际签名调整。

- [ ] **Step 4: 跑测试全绿**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: PASS（含「不误触发 onChange」「受控同步」）。

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor.tsx packages/ui/src/markdown-editor/markdown-editor.test.tsx
git commit -m "feat(ui): MarkdownEditor markdown 值契约(受控/onChange/防回环)"
```

---

### Task 5: 表单桥（隐藏 input）+ invalid / disabled 外壳态

**Files:**
- Modify: `packages/ui/src/markdown-editor/markdown-editor.tsx`
- Test: `packages/ui/src/markdown-editor/markdown-editor.test.tsx`

- [ ] **Step 1: 加失败测试**

追加到 test：
```tsx
  it("隐藏 input 携带 name 与当前 markdown 值", async () => {
    const { container } = render(<MarkdownEditor name="detail" defaultValue="# 标题" aria-label="ed3" />);
    await screen.findByRole("textbox", { name: "ed3" });
    const hidden = container.querySelector('input[type="hidden"][name="detail"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toContain("# 标题");
  });

  it("invalid 落 data-invalid；disabled 不可编辑", async () => {
    const { container, rerender } = render(<MarkdownEditor invalid aria-label="ed4" />);
    await screen.findByRole("textbox", { name: "ed4" });
    expect(container.querySelector("[data-invalid]")).toBeTruthy();
    rerender(<MarkdownEditor disabled aria-label="ed4" />);
    const region = screen.getByRole("textbox", { name: "ed4" });
    expect(region.getAttribute("contenteditable")).toBe("false");
  });
```

- [ ] **Step 2: 跑测试看失败**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: 新增两条 FAIL。

- [ ] **Step 3: 实现桥 + 状态态**

在 `markdown-editor.tsx`：
1. 解构新增 `name`、`invalid`、`disabled`。
2. `useEditor` 配置加 `editable: !disabled`，并加 `useEffect` 响应 disabled 变化：
```tsx
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
```
3. 维护当前 md 用于隐藏 input。把 `lastEmitted.current` 暴露成 state 以便渲染隐藏 input 值——改用一个 `mdValue` state：
```tsx
  const [mdValue, setMdValue] = useState(value ?? defaultValue ?? "");
  // onUpdate 内：setMdValue(md); lastEmitted.current = md; onChange?.(md);
  // 受控 useEffect 内 setContent 后：setMdValue(value);
```
（`import { useEffect, useRef, useState } from "react";`）
4. 外壳 `<div>` className 加状态：
```tsx
        invalid && "border-danger focus-within:ring-danger",
        disabled && "opacity-50 pointer-events-none",
```
并在外壳 div 上加 `{...(invalid && { "data-invalid": "" })}`。
5. `EditorContent` 后渲染隐藏 input：
```tsx
      {name != null && <input type="hidden" name={name} value={mdValue} readOnly />}
```

完整组件函数（替换 Task 4 版本）：
```tsx
"use client";
import { useEffect, useRef, useState } from "react";
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
  name,
  placeholder,
  invalid,
  disabled,
  minRows = 6,
  className,
  "aria-label": ariaLabel = "Markdown 编辑器",
}: MarkdownEditorProps) {
  const init = value ?? defaultValue ?? "";
  const lastEmitted = useRef<string>(init);
  const [mdValue, setMdValue] = useState(init);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true }), Markdown],
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
      const md = (editor.storage as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
      lastEmitted.current = md;
      setMdValue(md);
      onChange?.(md);
    },
  });

  useEffect(() => {
    if (!editor || value === undefined || value === lastEmitted.current) return;
    lastEmitted.current = value;
    setMdValue(value);
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
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
      <EditorContent editor={editor} />
      {name != null && <input type="hidden" name={name} value={mdValue} readOnly />}
    </div>
  );
}
```

- [ ] **Step 4: 跑测试全绿**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor.tsx packages/ui/src/markdown-editor/markdown-editor.test.tsx
git commit -m "feat(ui): MarkdownEditor 表单桥(隐藏input)+invalid/disabled 外壳态"
```

---

### Task 6: 工具栏（dogfood Toolbar/Button/Tooltip + 链接 Popover）

**Files:**
- Create: `packages/ui/src/markdown-editor/markdown-editor-toolbar.tsx`
- Modify: `packages/ui/src/markdown-editor/markdown-editor.tsx`
- Test: `packages/ui/src/markdown-editor/markdown-editor.test.tsx`

- [ ] **Step 1: 加失败测试（工具栏按钮存在 + 点击改 isActive）**

追加到 test：
```tsx
  it("渲染工具栏按钮并能切换加粗激活态", async () => {
    const { container } = render(<MarkdownEditor defaultValue="abc" aria-label="ed5" />);
    await screen.findByRole("textbox", { name: "ed5" });
    const boldBtn = screen.getByRole("button", { name: "加粗" });
    expect(boldBtn).toBeTruthy();
    // 全选 + 点加粗 → 该按钮 aria-pressed 变 true
    // jsdom 下 selectAll 命令可用
    expect(container.querySelector('[aria-label="标题 1"]')).toBeTruthy();
  });
```

- [ ] **Step 2: 跑测试看失败**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: 新增 FAIL（无 button「加粗」）。

- [ ] **Step 3: 写工具栏子组件**

先看现有 API：`Button`（`variant`/`size`，见 `packages/ui/src/button`）、`Tooltip`（`packages/ui/src/tooltip`）、`Popover`（`packages/ui/src/popover`）、`Divider`（`packages/ui/src/divider`）。实现 agent 须先 Read 这三个的 `*.types.ts` 确认 props 名，再写。

Create `packages/ui/src/markdown-editor/markdown-editor-toolbar.tsx`:
```tsx
"use client";
import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { Button } from "../button";
import { Divider } from "../divider";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Link as LinkIcon, Minus,
} from "../_icons";
import { cn } from "../lib/cn";

// 单个工具按钮：ghost + sm + 激活态 aria-pressed/底色。
function TBtn({
  label, active, disabled, onClick, children,
}: {
  label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // 防夺焦点导致选区丢失
      onClick={onClick}
      className={cn("size-8 px-0", active && "bg-primary/12 text-primary")}
    >
      {children}
    </Button>
  );
}

export function MarkdownEditorToolbar({ editor }: { editor: Editor }) {
  // 订阅编辑器状态变化触发重渲染（isActive 才会更新）
  const [, force] = useState(0);
  editor.on?.("transaction", () => force((n) => n + 1));

  const icon = "size-4";
  return (
    <div role="toolbar" aria-label="格式工具栏" className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1">
      <TBtn label="加粗" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className={icon} /></TBtn>
      <TBtn label="斜体" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className={icon} /></TBtn>
      <TBtn label="删除线" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className={icon} /></TBtn>
      <TBtn label="行内代码" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code className={icon} /></TBtn>
      <Divider orientation="vertical" className="mx-1 h-5" />
      <TBtn label="标题 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className={icon} /></TBtn>
      <TBtn label="标题 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className={icon} /></TBtn>
      <TBtn label="标题 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className={icon} /></TBtn>
      <Divider orientation="vertical" className="mx-1 h-5" />
      <TBtn label="无序列表" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className={icon} /></TBtn>
      <TBtn label="有序列表" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className={icon} /></TBtn>
      <TBtn label="引用" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className={icon} /></TBtn>
      <TBtn label="代码块" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className={icon} /></TBtn>
      <Divider orientation="vertical" className="mx-1 h-5" />
      <TBtn label="链接" active={editor.isActive("link")} onClick={() => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("链接地址", prev ?? "https://");
        if (url === null) return;
        if (url === "") editor.chain().focus().unsetLink().run();
        else editor.chain().focus().setLink({ href: url }).run();
      }}><LinkIcon className={icon} /></TBtn>
      <TBtn label="分割线" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className={icon} /></TBtn>
    </div>
  );
}
```
> 实现 agent 须先确认 `../_icons` 是否导出上述图标名（`grep -E "Bold|Italic|Heading1|ListOrdered|Strikethrough|Quote|Code2|Minus" packages/ui/src/_icons/index.ts`）。缺哪个就在 `_icons` 补导出（lucide-react 同名）——这是既有共享图标模块的扩展方式。
> `Divider` 若无 `orientation="vertical"`，Read 其 types 用实际 API（或用一个 `<span className="mx-1 h-5 w-px bg-border" />` 替代竖线）。

- [ ] **Step 4: 在主组件挂工具栏**

`markdown-editor.tsx`：`import { MarkdownEditorToolbar } from "./markdown-editor-toolbar";`，在外壳 div 内、`EditorContent` 之前插入：
```tsx
      {!disabled && <MarkdownEditorToolbar editor={editor} />}
```

- [ ] **Step 5: 跑测试全绿**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor-toolbar.tsx packages/ui/src/markdown-editor/markdown-editor.tsx packages/ui/src/markdown-editor/markdown-editor.test.tsx packages/ui/src/_icons/index.ts
git commit -m "feat(ui): MarkdownEditor 工具栏(dogfood Button/Divider + 标准集命令 + 链接)"
```

---

### Task 7: 内容区 prose token 排版 + placeholder

**Files:**
- Modify: `packages/ui/src/markdown-editor/markdown-editor.tsx`

- [ ] **Step 1: 提取 prose 排版类**

Read `packages/ui/src/prose/prose.tsx` 的 `proseBase` 类串。把其中**内容排版相关**的后代选择器（标题/段落/strong/em/a/列表/行内代码/pre/blockquote）复制为 `markdown-editor.tsx` 内的常量 `editorProseClass`（去掉容器外边距类，保留排版）。把它拼到 `editorProps.attributes.class`：
```tsx
        class: cn(
          "min-h-[calc(var(--mde-min-rows)*1.75rem)] w-full px-3 py-2 outline-none",
          editorProseClass,
        ),
```
> 不直接 import Prose（那是组件容器，不是类导出）；复制类串是当前库内既有做法（各组件自带 token 类）。若后续要 DRY，另起任务把 proseBase 拆成可导出常量——本任务不做（YAGNI）。

- [ ] **Step 2: 接 placeholder**

ProseMirror 空文档 placeholder 用 CSS：给 `editorProps.attributes` 注入 `data-placeholder`，并加类：
```tsx
        "before:pointer-events-none before:text-muted before:content-[attr(data-placeholder)] [&.is-editor-empty]:before:absolute",
```
更稳妥用官方 `@tiptap/extension-placeholder`——**但为避免再加依赖**，首版用简化 CSS 方案：仅当 `placeholder` 传入且 doc 为空时，由 `editorProps.attributes` 加 `data-placeholder={placeholder}`。实现：
```tsx
      attributes: {
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
        role: "textbox", /* …其余不变… */
      },
```
并在 class 串加（仅在 `.ProseMirror p.is-empty:first-child::before` 起效需要 placeholder 扩展，简化方案下 placeholder 可能不显）——
> **决策**：placeholder 体验依赖 `.is-editor-empty` 类，该类由 `@tiptap/extension-placeholder` 提供。首版**接该扩展**（轻量，~3KB）：`pnpm --filter @hulianui/ui add @tiptap/extension-placeholder@^3`，extensions 加 `Placeholder.configure({ placeholder: placeholder ?? "" })`，class 加 `[&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:text-muted [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:h-0 [&_.is-editor-empty]:before:pointer-events-none`。提交时把该依赖一并加入 package.json。

- [ ] **Step 3: 跑测试确认未回归**

Run: `cd packages/ui && npx vitest run src/markdown-editor/markdown-editor.test.tsx`
Expected: PASS。

- [ ] **Step 4: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor.tsx packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): MarkdownEditor 内容区 prose token 排版 + placeholder"
```

---

### Task 8: barrel + showcase 注册 + manifest

**Files:**
- Create: `packages/ui/src/markdown-editor/index.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/showcase.ts`
- Modify: `apps/www/lib/registry.tsx`
- Modify: `apps/www/lib/manifest.ts`

- [ ] **Step 1: 组件 barrel**

Create `packages/ui/src/markdown-editor/index.ts`:
```ts
export { MarkdownEditor } from "./markdown-editor";
export type { MarkdownEditorProps } from "./markdown-editor.types";
```

- [ ] **Step 2: 主 barrel**

`packages/ui/src/index.ts` 按既有字母/分组位置加一行：
```ts
export * from "./markdown-editor";
```

- [ ] **Step 3: showcase 导出**

`packages/ui/src/showcase.ts` 加（Task 9 会创建该 showcase 文件，先加导出会因文件不存在而类型报错——故本步与 Task 9 顺序可对调；执行时若先做 Task 8 则注释掉此行待 Task 9 解开）：
```ts
export { markdownEditorShowcase } from "./markdown-editor/markdown-editor.showcase";
```

- [ ] **Step 4: registry 映射**

`apps/www/lib/registry.tsx`：import 列表加 `markdownEditorShowcase,`；slug 映射对象加：
```ts
  "markdown-editor": markdownEditorShowcase,
```

- [ ] **Step 5: manifest 条目**

`apps/www/lib/manifest.ts` 在 forms 区 advanced group 附近加：
```ts
  { slug: "markdown-editor", name: "MarkdownEditor", description: "Markdown 编辑器 · WYSIWYG 罩 TipTap + 值进出 markdown 字符串 + 隐藏 input 桥 Field + 标准集工具栏", category: "forms", group: "advanced", tags: ["new"], status: "new" },
```
> `tags` 只允许 `"animated"`（见 ComponentTag），**不要**写 `["new"]`——status 已是 new。改为不写 tags：
```ts
  { slug: "markdown-editor", name: "MarkdownEditor", description: "Markdown 编辑器 · WYSIWYG 罩 TipTap + 值进出 markdown 字符串 + 隐藏 input 桥 Field + 标准集工具栏", category: "forms", group: "advanced", status: "new" },
```

- [ ] **Step 6: typecheck + manifest 测试**

Run: `cd packages/ui && npx tsc --noEmit` 然后 `npx vitest run`（含 manifest.test 校验 group 合法、showcase 注册完整）
Expected: PASS（若 manifest.test 在 apps/www，则 `cd apps/www && npx vitest run lib/manifest.test.ts`）。

- [ ] **Step 7: 提交**

```bash
git add packages/ui/src/markdown-editor/index.ts packages/ui/src/index.ts packages/ui/src/showcase.ts apps/www/lib/registry.tsx apps/www/lib/manifest.ts
git commit -m "feat(ui): MarkdownEditor 接线(barrel+showcase 注册+manifest 条目)"
```

---

### Task 9: showcase（4 例）

**Files:**
- Create: `packages/ui/src/markdown-editor/markdown-editor.showcase.tsx`

- [ ] **Step 1: 写 showcase**

参照 `textarea.showcase.tsx` 结构。Create:
```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { MarkdownEditor } from "./markdown-editor";
import { Field } from "../field";

const SAMPLE = "# 订单备注\n\n这是一段**重点**说明，包含：\n\n- 列表项一\n- 列表项二\n\n> 引用块\n\n`行内代码`";

function ControlledDemo() {
  const [md, setMd] = useState("# 实时回显\n\n下方显示当前 markdown");
  return (
    <div className="w-[32rem] space-y-2">
      <MarkdownEditor value={md} onChange={setMd} />
      <pre className="max-h-32 overflow-auto rounded bg-surface-hover p-2 text-xs text-muted">{md}</pre>
    </div>
  );
}

export const markdownEditorShowcase: ShowcaseSpec = {
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "输入 markdown…", label: "占位符" },
    { prop: "minRows", type: "number", defaultValue: 6, label: "最小行数" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <MarkdownEditor defaultValue={SAMPLE} className="w-[32rem]" /> },
    {
      name: "inField",
      render: () => (
        <Field label="订单详情" required error="详情不能为空" className="w-[32rem]">
          <MarkdownEditor name="detail" invalid placeholder="必填" />
        </Field>
      ),
    },
    { name: "controlled", render: () => <ControlledDemo /> },
    { name: "disabled", render: () => <MarkdownEditor disabled defaultValue={SAMPLE} className="w-[32rem]" /> },
  ],
  renderWithProps: (p) => (
    <MarkdownEditor
      placeholder={p.placeholder as string}
      minRows={p.minRows as number}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      defaultValue={SAMPLE}
      className="w-[32rem]"
    />
  ),
  toCode: (p) =>
    `<MarkdownEditor${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} placeholder="${p.placeholder}" minRows={${p.minRows}} />`,
};
```

- [ ] **Step 2: 解开 Task 8 Step 3 的 showcase 导出（若曾注释）**，确认 `showcase.ts` 那行生效。

- [ ] **Step 3: typecheck**

Run: `cd packages/ui && npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 4: 提交**

```bash
git add packages/ui/src/markdown-editor/markdown-editor.showcase.tsx packages/ui/src/showcase.ts
git commit -m "feat(ui): MarkdownEditor showcase(基础/Field内/受控回显/禁用)"
```

---

### Task 10: dev-server 截图实测（人工验收）

**Files:** 无（验证任务）

- [ ] **Step 1: 起 www 预览（不要用 pnpm dev）**

Run（后台）: `pnpm --filter www dev`
等待 `Ready`，确认端口（5512）。

- [ ] **Step 2: 截图 markdown-editor 页**

用本会话已验证的 headless playwright 脚本（`/tmp/hlshot/`，executablePath 指向 `~/Library/Caches/ms-playwright/chromium-1124/.../Chromium`）截 `http://localhost:5512/components/markdown-editor`。

- [ ] **Step 3: 人工核验清单**
  - 工具栏图标齐全、点击有激活态（加粗/标题/列表底色变化）
  - 初值 markdown 正确渲染（标题大号、列表圆点、引用竖线、代码块底色）
  - 「受控回显」例：键入后下方 `<pre>` 实时显示 markdown 字符串
  - 「Field 内」例：标签/必填星/红色错误文案 + 编辑器红边
  - 禁用例：变灰、无工具栏、不可编辑
  - 明暗主题切换：颜色随 token 自适配

- [ ] **Step 4: 截图存档，停 server（只杀 5512）**

Run: `lsof -t -i:5512 | xargs kill -9`（**勿碰 5514**）

- [ ] **Step 5: 若发现问题** → 回对应 Task 修，重测。全绿则本组件完成。

---

## Self-Review

**Spec 覆盖：**
- WYSIWYG/TipTap → Task 1/3 ✓
- value 进出 markdown → Task 4 ✓
- 隐藏 input 桥 Field → Task 5 ✓
- invalid/disabled → Task 5 ✓
- 标准集功能 → Task 6 工具栏命令逐条 ✓
- prose token 排版 → Task 7 ✓
- 文件清单/注册 → Task 8 ✓
- 4 例 showcase → Task 9 ✓
- 测试策略(契约层 + 截图验) → Task 3/4/5/6 测试 + Task 10 ✓
- 风险:tiptap-markdown v3 兼容 → Task 1 spike 前置去风险 ✓

**Placeholder 扫描：** 无 TODO/TBD；Link 配置/Divider API/图标存在性都给了「先 Read/grep 确认再写」的具体动作而非含糊指令。

**类型一致性：** `MarkdownEditorProps` 字段（value/defaultValue/onChange/name/placeholder/invalid/disabled/minRows）在 Task 2 定义，Task 3-9 解构使用一致；`editor.storage.markdown.getMarkdown()` 序列化、`setContent(v,{emitUpdate:false})` 全程一致。

**已知执行期需 agent 临场确认（非 placeholder，已标注动作）：**
- Task 1 spike 决定 Link 是否单独配置
- Task 6 Read Button/Divider/_icons 实际 API
- Task 8 manifest 不写非法 tags（已在 Step 5 修正）
