---
slug: code-editor
name: CodeEditor
category: forms
group: advanced
tags: []
exports: [CodeEditor, applyEdit, autoPairEdit, backspacePairEdit, getLanguageRules, indentEdit, lineEndAt, lineStartAt, newlineEdit, outdentEdit, selectedLineBlock, splitTokensByLine, toggleCommentEdit, tokenizeCss, tokenizeEditorCode]
status: enriched
---

# CodeEditor

> 代码编辑器 · 零依赖 textarea + 高亮层叠加（不引 CodeMirror/Monaco） · 受控 value/onChange + 行号槽 + 当前行高亮 + 语法着色(JS 家族/JSON/Shell 复用 CodeBlock 着色器，CSS 自带扫描器) · 键盘增强全套(Tab 缩进/Shift+Tab 反缩进/Enter 续缩进/成对符号自动闭合与包裹/退格删对/Cmd 或 Ctrl 加斜杠切注释)且**一律经 execCommand 落笔保住原生 undo 栈** · 编辑意图抽成纯函数带单测 · AI 生成 DSL/JSON 的可编辑检查器 · forms/advanced

## 何时用

需要用户**改**代码时用它：AI 生成的 DSL / JSON AST 检查器、配置片段编辑、模板编辑。
只展示不编辑用 [CodeBlock](../code-block/code-block.md)（自带复制按钮）；单行命令用 [Snippet](../snippet/snippet.md)；行内片段用 [Code](../code/code.md)；两版对比用 [CodeDiff](../code-diff/code-diff.md)。
写 Markdown 正文（带工具栏与预览）用 [MarkdownEditor](../markdown-editor/markdown-editor.md)。

需要代码折叠、自动补全、语义诊断、多光标的**真 IDE 体验**，请外接 CodeMirror 6 / Monaco：本组件是受控 `value`/`onChange` 的轻量件，外接引擎时把它当皮肤参考（配色令牌、行号槽、边框与聚焦环）而不是引擎。

## 导入
```ts
import { CodeEditor, applyEdit, autoPairEdit, backspacePairEdit, getLanguageRules, indentEdit, lineEndAt, lineStartAt, newlineEdit, outdentEdit, selectedLineBlock, splitTokensByLine, toggleCommentEdit, tokenizeCss, tokenizeEditorCode } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | string | - | 受控代码文本。**必须配合 onChange 回写**，否则每次编辑都会被 React 回滚 |
| language | CodeEditorLanguage | "tsx" | 决定着色器、注释符与成对符号规则。`typescript` ｜ `tsx` ｜ `javascript` ｜ `jsx` ｜ `json` ｜ `css` ｜ `bash` ｜ 任意字符串（未知按 JS 家族处理） |
| readOnly | boolean | false | 只读。仍可聚焦/选中/复制，只是不接受输入与键盘增强 |
| lineNumbers | boolean | true | 是否显示行号槽（横向滚动时钉在左侧，纵向跟随） |
| highlightActiveLine | boolean | true | 是否高亮光标所在行（仅聚焦时显示） |
| lineHeight | number | 1.6 | 行高倍数（无单位），同时作用于行号槽与代码区 |
| tabSize | number | 2 | 一级缩进宽度（空格数），同时作为 `tab-size` |
| placeholder | string | - | 无内容时的占位文案 |
| rows | number | 12 | 默认可见行数；外层 `className` 给了确定高度时以外层为准 |
| theme | "light" ｜ "dark" | - | 强制主题（逃生口）。不传时跟随全局 `[data-theme]`，这是推荐用法 |
| ariaLabel | string | 取自 locale | 无障碍名称；不传时取 ConfigProvider 的 locale（内置中文兜底为「代码编辑器（语言）」） |
| className | string | - | 外层类名（给宽度/高度/最大高度） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | (value: string) => void | 文本变化。普通输入与全部键盘增强走同一条回调，回调里必须回写 `value` |
| onFocus | () => void | 编辑区获得焦点 |
| onBlur | () => void | 编辑区失去焦点 |

## 键盘

| 按键 | 行为 |
|------|------|
| Tab | 跨行选区逐行加一级缩进；否则在光标处插入缩进（焦点不会跳走） |
| Shift + Tab | 选区覆盖的每一行反缩进（无选区时作用于当前行） |
| Enter | 沿用上一行缩进；`{` `[` `(` 之后再多缩一级；光标正夹在成对符号中间时把闭合符推到下一行 |
| `{` `[` `(` `"` `'` `` ` `` | 自动补闭合符；**有选区时是包裹而不是替换**，且包裹后内部文本仍被选中 |
| 闭合符 / 引号 | 贴着同款闭合符时 type-over：只跨过去，不重复插入 |
| Backspace | 光标夹在一对空括号/空引号中间时两个一起删 |
| Cmd / Ctrl + / | 按 language 切换行注释（CSS 降级为逐行 `/* */` 包裹；JSON 无注释，不响应） |
| Cmd / Ctrl + Z | 原生撤销，逐步回退上面每一次增强编辑 |

## 导出的纯函数

编辑意图与落笔手法是分开的：下列函数只算「把哪段换成什么、光标落哪」（`EditorEdit`），不碰 DOM，可单独单测，也可用来自搭编辑器。

| 函数 | 说明 |
|------|------|
| getLanguageRules(lang, indentSize) | 按语言产出缩进单位 / 注释符 / 成对符号规则 |
| indentEdit ｜ outdentEdit | Tab / Shift+Tab 的缩进与反缩进（含按行批处理） |
| newlineEdit | Enter 的续缩进与成对符号展开 |
| autoPairEdit(state, ch, rules) | 成对符号自动闭合、选区包裹、type-over；返回 null = 交给浏览器默认插入 |
| backspacePairEdit | 成对空符号一起删 |
| toggleCommentEdit | 行注释切换（含 CSS 块注释降级、JSON 不响应） |
| applyEdit(state, edit) | 把一条 EditorEdit 套用到 `{ value, selectionStart, selectionEnd }` 上 |
| lineStartAt ｜ lineEndAt ｜ selectedLineBlock | 行定位工具 |
| tokenizeCss ｜ tokenizeEditorCode ｜ splitTokensByLine | 着色：CSS 扫描器、按语言分派、token 按行切分 |

## 示例
```tsx
const [code, setCode] = useState(source);

// 基础：编辑 AI 生成的 TSX
<CodeEditor value={code} onChange={setCode} language="tsx" rows={12} />

// 检查器里的 DSL：固定高度内滚 + 四空格缩进
<CodeEditor
  value={dsl}
  onChange={setDsl}
  language="json"
  tabSize={4}
  className="h-[320px] w-full"
/>

// 只读预览（仍可选中复制）
<CodeEditor value={code} language="css" readOnly rows={8} />

// 窄侧栏：关行号与当前行高亮，压紧行高
<CodeEditor
  value={code}
  onChange={setCode}
  lineNumbers={false}
  highlightActiveLine={false}
  lineHeight={1.4}
  rows={6}
/>
```

## 无障碍

- 可编辑区就是原生 `<textarea>`：读屏、键盘、IME 组词、移动端长按选择菜单全部是浏览器原生行为，没有自制 `contenteditable` 的那些坑。
- 高亮层与行号槽都是 `aria-hidden`，避免同一段代码被读屏念两遍。
- 默认 `aria-label` 走 locale（内置中文兜底是「代码编辑器（语言）」），整站换语言时它跟着变。多个编辑器同屏时用 `ariaLabel` 区分（如「DSL 编辑区」），优先级是 `ariaLabel` prop > locale > 内置兜底。
- `readOnly` 同时落在 `readonly` 与 `aria-readonly` 上。
- Tab 被缩进占用后**焦点无法用 Tab 移出**——这是所有代码编辑器的共同取舍；同屏请提供别的移焦路径（Shift+Tab 也被反缩进占用），或对纯查看场景用 `readOnly`。
- 聚焦环画在外层容器上（`focus-within`），不是画在 textarea 上，避免与 1px 边框叠成双线。

## 禁忌 / 坑

- **根节点自带 `w-full`，别再靠外层给宽度**。`textarea` 的固有宽度由 HTML 默认 `cols`（20）决定，所以编辑器的 max-content 宽度锚在约 20 字符：普通块级上下文里 block-flex 会自然铺满看不出问题，一旦作为 flex/grid item（「左树右编辑器」正是最典型的用法）就会按内容宽塌成一条窄框（#116）。要限制宽度请显式给 `max-w-*`，不要指望它自己收窄。

- **必须受控**：`onChange` 里不回写 `value`，编辑会被 React 立刻回滚（表现为「打不进字」）。这是设计如此，不是 bug。
- **不要绕开组件直接改 value 再指望 undo**：所有键盘增强都走 `document.execCommand("insertText" | "delete")` 落笔，为的是把改动压进 textarea 的**原生 undo 栈**。如果你 fork 出去改成 `setState` 整篇覆盖，Cmd+Z 会当场失效——这是 textarea 方案最容易做错的一点。`execCommand` 不可用的环境（jsdom、极老浏览器）自动降级为整篇回吐，功能仍在，只是丢原生 undo。
- **不提供 `minimap`**。issue 里提到过这个 prop，这里明确不做：真实缩略图要把整篇文档按 sub-pixel 重绘一遍并同步视口与拖拽刷选，零依赖做不出真的；而用「按行长度画灰条」冒名顶替叫 `minimap` 会给消费方错误的心理模型。本组件的主场景是三栏工作台右侧检查器，横向空间是最稀缺的一维，缩略图要吃掉 60-80px。需要缩略图请外接 Monaco。
- **不做**：代码折叠、自动补全 / 智能提示、多光标 / 列选择、语义诊断与波浪线、查找替换面板、括号配对高亮。要这些请外接 CodeMirror 6 / Monaco。
- 文本不换行（`wrap="off"`，长行横向滚动）。这是刻意的：一旦软换行，行号槽就无法与视觉行对齐，`lineNumbers` 会立刻说谎。要换行请改用 [Textarea](../textarea/textarea.md)。
- **改样式必须三层同改**：透明 `<textarea>`、染色 `<pre>`、行号槽三层的字体族 / 字号 / 行高 / 内边距 / `white-space` / `tab-size` 逐项相等才不错位。只改其中一层的 padding 或字号，表现是「光标和字差半格」，且只在长行/深缩进时才看得出来。
- **`theme` 两个方向都成立**（@hulianui/tokens 0.3.0 起）：暗色页面里钉亮色、亮色页面里钉暗色都跟得住，岛内的 `dark:` 工具类、阴影与发丝边也一并跟着岛走。旧版本只有「亮页里嵌暗块」单向可用（hulianui/hulian#101）。仍建议默认不传 `theme`、跟随全局主题 —— 强制主题是逃生口，不是常规用法。
- 着色是**近似着色，不是解析器**：CSS 扫描器只跟踪「是否在 `{}` 内 / 是否越过 `:`」两个状态，JS 家族沿用 CodeBlock 的单条正则扫描。复杂泛型、正则字面量、嵌套模板串可能着色不准——着色错不影响编辑，`value` 永远是你的原文。
- `language="json"` 时 Cmd+/ **故意不响应**：JSON 规范没有注释，写进去就是非法 JSON。
- 选区底色用的是半透明 `bg-primary/25`：textarea 在高亮层之上，不透明的选区底色会把代码盖住。改这个类要连带确认深色主题下的对比度。

## 相关
[CodeBlock](../code-block/code-block.md) · [CodeDiff](../code-diff/code-diff.md) · [Code](../code/code.md) · [Snippet](../snippet/snippet.md) · [MarkdownEditor](../markdown-editor/markdown-editor.md) · [JsonViewer](../json-viewer/json-viewer.md) · [Textarea](../textarea/textarea.md)
