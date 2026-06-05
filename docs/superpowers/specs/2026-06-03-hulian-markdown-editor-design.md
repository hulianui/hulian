# MarkdownEditor 设计（瑚琏皮肤罩 TipTap）

- 日期：2026-06-03
- 状态：已确认设计，待写实现 plan
- 组件：`MarkdownEditor` · slug `markdown-editor` · 分类 `forms` / group `advanced` · status `new`
- 包：`@hulianui/ui`（`packages/ui`）

## 背景与定位

`@hulianui/ui` 此前**没有任何富文本/markdown 编辑器**——表单分类只有 input/textarea/mentions 等纯文本录入；
`prose` 是**展示层**排版容器（吃 token 渲染已生成的 HTML/JSX），不编辑、不解析。

本组件补齐「WYSIWYG markdown 编辑」这一中后台高频缺口。范式与契约（与用户确认）：

- **编辑范式**：WYSIWYG（边打字边渲染格式），不是源码双栏。
- **值契约**：`value` / `onChange` 进出都是 **markdown 字符串**（非 HTML、非 JSON）。
- **表单集成**：独立受控件 + 隐藏 input 桥，放进 `<Field>` 即得标签/必填/错误态。
- **功能范围（首版基线）**：标准集——加粗/斜体/删除线/行内代码 + H1–H3 + 有序/无序列表 + 引用 + 代码块 + 链接 + 分割线。

## 选型

| 维度 | 决策 | 理由 / 备选 |
|------|------|------------|
| 引擎 | **TipTap v3**（ProseMirror 封装） | WYSIWYG + markdown 序列化生态最成熟。备选 Lexical（需自写 md transformer，成本高）、CodeMirror（偏源码非 WYSIWYG），均否决 |
| 依赖位置 | `dependencies`（非 peer/optional） | 与 MUI / recharts / TanStack 的「高价值组件背重依赖」既有先例一致 |
| 包清单 | `@tiptap/react` + `@tiptap/pm` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `tiptap-markdown` | StarterKit 覆盖标准集大部分节点/标记；Link 单独装；md I/O 用 tiptap-markdown |
| 工具栏 | 固定顶部栏（非 bubble menu） | 中后台填写更直觉；dogfood 自家 Toolbar/Button/Divider/Tooltip/Popover |

### 已知风险（实现期必须验证）

1. **`tiptap-markdown` 第三方维护 + TipTap v3 兼容性**：装完**首先**跑 markdown round-trip（md→doc→md 文本一致）验证；不兼容则退路为 `prosemirror-markdown` 自接 serializer/parser。
2. **bundle 体积**：ProseMirror 核心约 +200KB，与库既有重依赖件同量级，可接受但需在 PR 说明。
3. **jsdom 测试局限**：ProseMirror contentEditable 在 jsdom 下光标/range 能力不全，部分交互测不了——见「测试策略」。

## 组件 API

```ts
interface MarkdownEditorProps {
  value?: string;              // 受控 markdown 字符串
  defaultValue?: string;       // 非受控初值
  onChange?: (markdown: string) => void;
  name?: string;               // 桥给 Field/Form 的隐藏 input
  placeholder?: string;
  invalid?: boolean;           // 落 data-invalid，外壳变 danger
  disabled?: boolean;          // editor.setEditable(false) + 外壳变灰
  minRows?: number;            // 内容区最小高度（默认约 6 行）
  className?: string;
  "aria-label"?: string;
}
```

## 架构与数据流

```
<MarkdownEditor>                         "use client"
 ├─ 外壳 span（复刻 Input：border/圆角/focus-within:ring/has-[[data-invalid]]）
 │   ├─ <Toolbar>（dogfood）：按钮按 editor.isActive(...) 反映激活态
 │   │     B I S <>  │  H1 H2 H3  │  • 1.  │  ”  │  {}  │  🔗  │  ─
 │   └─ <EditorContent editor={editor} />   ← 内容区，prose token 后代选择器排版
 └─ <input type="hidden" name={name} value={md} readOnly />   ← 表单桥
```

数据流（防回环是关键）：

1. **挂载**：`tiptap-markdown` 把 `value ?? defaultValue` 解析进 doc。
2. **编辑 → 外**：editor `onUpdate` 把 doc 序列化成 md → `onChange(md)` + 同步隐藏 input + 记 `lastEmitted = md`。
3. **外 → 编辑**（受控）：`value` 变化时，仅当 `value !== lastEmitted` 才 `editor.commands.setContent(parse(value))`，避免「序列化≠原文」引起的光标跳动/无限回环。
4. **SSR**：`'use client'` + `useEditor({ immediatelyRender: false })` + `if (!editor) return null` 防 Next 水合错。

## 表单 / 主题集成

- **invalid**：`invalid` prop → 外壳内层落 `data-invalid`（同 Input 范式）；放进 `<Field error=…>` 时 Field.Root 的 invalid 经 Base UI 下传，外壳 `has-[[data-invalid]]:border-danger` 响应。两条路统一。
- **disabled**：`editor.setEditable(false)` + 外壳 `opacity-50 pointer-events-none`。
- **name**：隐藏 input 携 md 值，原生表单提交 + Field 校验都能拿到。
- **排版**：内容区复用 `prose` 的 token 后代选择器（`[&_h1]…[&_blockquote]…[&_pre]…`），标题/列表/引用/代码统一吃语义 token，明暗自适配。focus-ring/border/radius 复刻 `inputShellVariants`。

## 文件清单

```
packages/ui/src/markdown-editor/
  markdown-editor.tsx          # 主组件（含工具栏，或拆 toolbar 子件）
  markdown-editor.types.ts     # MarkdownEditorProps
  markdown-editor.showcase.tsx # 4 例：基础 / 放 Field 内带必填错误 / 受控值回显 / 禁用
  markdown-editor.test.tsx     # 契约层测试
  index.ts                     # 桶
```
外加：`packages/ui/src/index.ts` barrel 追加；`apps/www/lib/manifest.ts` 加一条（forms/advanced，status new，tags 可加 ["new"]）；`packages/ui/package.json` 加 5 个依赖并 `pnpm install`。

> 注意（踩坑库已记）：barrel 与组件源码必须一起提交，否则 clean HEAD 构建会因孤儿引用断裂。

## 测试策略（诚实标注限制）

jsdom 下 ProseMirror 交互能力不全，故单测**聚焦可测的契约层**，真实交互/视觉用 dev server 截图验（同本轮 Stepper 流程；注意起 www 预览用 `pnpm --filter www dev` 避免 kill:stale 误杀 5514 桌面 app）：

- markdown round-trip：`value="# 标题\n\n**粗**"` → 渲染出 `<h1>` / `<strong>`，序列化回 md 文本一致
- 受控 `onChange`：编辑触发回调，回调参数是 markdown 字符串
- 隐藏 input：`name` 下 input 的 value == 当前 md
- 外壳态：`invalid` → `data-invalid` 存在；`disabled` → 不可编辑 + 外壳变灰
- 工具栏命令：点加粗 → `editor.isActive('bold')` 切换（若 jsdom 支持，否则降级为 dev-server 截图验）

## 非目标（首版不做，YAGNI）

- 图片上传 / 表格 / 任务列表 / @提及 / 高亮（属「丰富集」，后续按需扩 extension）
- 协同编辑（Yjs）、版本历史、AI 续写
- 源码切换视图、全屏、字数统计
