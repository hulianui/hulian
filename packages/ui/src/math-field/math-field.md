---
slug: math-field
name: MathField
category: forms
group: advanced
tags: []
exports: [MathField, createCasComparator, stripMathDelimiters, MATHLIVE_INSTALL_HINT, COMPUTE_ENGINE_INSTALL_HINT, MathLiveUnavailableError, ComputeEngineUnavailableError, MATH_FIELD_LOCALE_ZH, MATH_FIELD_LOCALE_EN]
status: enriched
---

# MathField

> 可视化公式键盘 · MathLive 驱动，所见即所得地敲出 LaTeX（值不带 $）· 满足 MathFieldLikeProps，直接注入 MathTextarea / QuestionEditor 的 visualEditor 与 QuestionAnswer 的 mathField · 服务端与首帧渲染骨架，mathlive 在客户端动态加载，没装时显示安装提示不白屏 · 独立子路径 @hulianui/ui/math-field，主包与 @hulianui/ui/math 零 MathLive · 另给 createCasComparator 做第 3 档等价判分 · forms/advanced

## 何时用

学生在填空题里要敲 $\frac{5}{6}$、老师录题时不会写 `\sqrt{}` 这类场合：用户面对的是一个像计算器一样的公式框，敲出来的东西已经是 LaTeX，你拿到的 `value` 直接能进 [Formula](../math/math.md) 排版、进 `gradeObjective` 判分。只是要在一段文字里插公式，用 [MathTextarea](../math-textarea/math-textarea.md) 并把本件传给它的 `visualEditor`，它负责套 `$…$` 与插到光标处；本件自己不产出 `$`。

只展示不编辑用 Formula。

## 安装

`mathlive` 是**可选 peer**，装了才能用本件：

```bash
pnpm add mathlive
```

要用 `createCasComparator` 再装 `@cortex-js/compute-engine`（它是 mathlive 钉死的依赖，通常已经在 node_modules 里，显式装一次让打包器的解析不依赖 hoist）：

```bash
pnpm add mathlive @cortex-js/compute-engine
```

字体由你引入一次（Next 放根 layout，Vite 放 main.tsx）；缺字体只是回退成系统字体，不是白屏：

```ts
import "mathlive/fonts.css";
```

peer 下界 `mathlive >=0.110.0`、`@cortex-js/compute-engine >=0.58.0`：只承诺测过的版本。MathLive 0.9x 到 0.10x 之间 `menuItems` 与虚拟键盘策略的语义都改过，往下放宽等于拿没测过的组合做承诺。

## 导入

```ts
import { MathField, createCasComparator } from "@hulianui/ui/math-field"
```

住独立子路径而不是 `@hulianui/ui/math`：MathLive 本体加 Compute Engine 是几百 KB 的懒加载 chunk，只有真要可视化输入 / CAS 判分的页面才为它们买单；`@hulianui/ui/math` 自身零 MathLive。

## 用法

```tsx
const [latex, setLatex] = useState("\\frac{a}{b}");

<MathField value={latex} onChange={setLatex} aria-label="公式" />
```

注入 MathTextarea（多出「可视化输入」页签，确认后按 `$…$` 插到光标处）：

```tsx
<MathTextarea multiline value={stem} onChange={setStem} visualEditor={MathField} />
<QuestionEditor value={question} onChange={setQuestion} visualEditor={MathField} />
```

注入 QuestionAnswer 的填空，并接三档判分：

```tsx
const equivalent = await createCasComparator();   // 页面挂载时做一次即可

<QuestionAnswer
  question={q}
  value={v}
  onChange={setV}
  blankInput="math"
  mathField={MathField}
  onSubmit={(answer) => gradeObjective(q, answer, { normalize: true, equivalent })}
/>
```

## Props

`MathFieldProps` 继承 [`MathFieldLikeProps`](../math-textarea/math-textarea.md)，前六行就是那份契约。

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| value | `string` | - | LaTeX，不带 `$` |
| onChange | `(latex: string) => void` | - | 每次击键回传 |
| onSubmit | `(latex: string) => void` | - | 回车。MathTextarea 把它接到「插入到光标处」 |
| disabled | `boolean` | `false` | 锁定（已提交 / 提交中） |
| aria-label | `string` | - | 无障碍名，透传给 `<math-field>` |
| className | `string` | - | 外层容器 |
| virtualKeyboard | `"auto" \| "manual" \| "off"` | `"auto"` | 虚拟键盘策略：auto 触屏聚焦时弹出、manual 只由切换钮弹出、off 不挂键盘（策略 manual 且隐藏切换钮） |
| keyboardLayouts | `readonly unknown[]` | - | 透传给 `window.mathVirtualKeyboard.layouts`。键盘是页面级单例，后挂载的覆盖先挂载的 |
| readOnly | `boolean` | `false` | 只读：能选中复制，不能改 |
| placeholder | `string` | - | 空值时的占位 |

## Events

| 事件 | 参数 | 时机 |
|---|---|---|
| onChange | `latex: string` | 用户每次击键（MathLive 的 `input` 事件） |
| onSubmit | `latex: string` | 回车（Shift+Enter 不触发） |

## createCasComparator

```ts
function createCasComparator(): Promise<(a: string, b: string) => boolean>
```

用 Compute Engine 判两个 LaTeX 是否**数学等价**：`\frac{1}{2}` 与 `0.5`、`2x+1` 与 `1+2x` 都为真。返回值是同步比较器，直接喂 `gradeObjective` 的 `equivalent`（第 3 档，只在字面与归一都不等时才调）。两侧的 `$…$` / `$$…$$` / `\(…\)` 会先剥掉（`stripMathDelimiters`），解析失败、空串、任何异常一律 `false`：判分宁可漏判不可误判。

它是 async 的：Compute Engine 不随 mathlive 打包，第一次调用才 `import()`，之后同一个引擎实例复用。没装 `@cortex-js/compute-engine` 时抛 `ComputeEngineUnavailableError`，消息里带安装命令。

**服务端才是判分 SSOT**（见 [Formula](../math/math.md) 文档里 `gradeObjective` 一节）：这里给的是即时反馈与录题自测，正式成绩以服务端为准。

## SSR 与加载

组件有三态，`data-slot="math-field"` 上的 `data-status` 分别是 `loading` / `ready` / `unavailable`：

- **loading**：服务端与客户端首帧都只渲染一个同尺寸 `Skeleton`，两边 HTML 一致，没有 hydration mismatch。
- **ready**：`mathlive` 在 `useEffect` 里 `import()` 成功后，用 `document.createElement("math-field")` 挂真元素并做受控同步。
- **unavailable**：没装 mathlive、或解析到的是 MathLive 的 SSR 构建（没有 `MathfieldElement`），渲染一条带安装命令的 `Alert`，**不抛错**，静态导出不会因此整页失败。开发期 `warnOnce` 一次。

Next App Router 直接用，组件已是 client 组件，不需要 `next/dynamic`。Vite 可选 `optimizeDeps.include: ["mathlive", "@cortex-js/compute-engine"]`，避免第一次打开时中途重优化。

## 虚拟键盘

MathLive 的虚拟键盘是**页面级单例**（`window.mathVirtualKeyboard`），同页多个 MathField 共用同一块键盘；`keyboardLayouts` 给了就写进这个单例，后挂载的覆盖先挂载的。桌面端录题一般 `virtualKeyboard="off"`，学生端触屏作答用默认 `auto`。

## 主题

MathLive 通过 CSS 变量取色，本件把它们钉到瑚琏 token，亮暗随主题切换：

| MathLive 变量 | 瑚琏 token |
|---|---|
| `--caret-color` | `--color-primary` |
| `--selection-background-color` | `--color-primary` 18% |
| `--selection-color` / `--latex-color` / `--highlight-text` | `--color-foreground` |
| `--contains-highlight-background-color` | `--color-primary` 10% |
| `--placeholder-color` / `--smart-fence-color` | `--color-muted-foreground` |
| `--correct-color` / `--incorrect-color` | `--color-success` / `--color-danger` |

外框与 [Input](../input/input.md) 同一套边框 / 焦点环；MathLive 内置右键菜单已关掉（`menuItems = []`）。

## 国际化

文案只有加载中占位的无障碍名与缺依赖提示两组，从 `ConfigProvider` 的 `components.mathField` 取，SSOT 在 `math-field.locale.ts`（`MATH_FIELD_LOCALE_ZH` / `MATH_FIELD_LOCALE_EN`）。

## 禁忌 / 坑

- **值是不带 `$` 的 LaTeX**。要插进题干走 MathTextarea 的 `visualEditor`（它负责套 `$`）；直接把 `value` 拼进题干会得到没有定界符的裸记号。
- **注入的是组件不是元素**：`mathField={MathField}`、`visualEditor={MathField}`，不是 `<MathField />`。
- **jsdom 里 mathlive 解析到 SSR 构建**，组件会显示安装提示：消费方单测里 `vi.mock("mathlive")` 一个只实现 `getValue` / `setValue` 的假元素，或只断言首帧骨架。
- **MathLive 的 `setValue` 要求元素已挂载**，本件内部先 `appendChild` 再写值；自己直接操作 `<math-field>` 时同理。

## 相关

- [MathTextarea](../math-textarea/math-textarea.md) —— `MathFieldLikeProps` 契约与 `visualEditor` 注入点
- [QuestionAnswer](../question-answer/question-answer.md) —— `blankInput="math"` + `mathField`
- [QuestionEditor](../question-editor/question-editor.md) —— `visualEditor` 透传给每个 MathTextarea
- [Formula](../math/math.md) —— 排版与 `@hulianui/ui/math` 的题目域纯函数（`gradeObjective`）
- [消费指南 · 数学题件](https://github.com/hulianui/hulian/blob/master/docs/consuming-math.md) —— 三条入口各买什么体积、SSR、判分 SSOT
