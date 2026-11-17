---
slug: paper
name: Paper
category: data-display
group: collection
tags: []
exports: [Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, usePaperMode]
status: enriched
---

# Paper

> 让论文里的图跟着正文一步步变化，并能切到投稿用的打印形态 · data-display/collection

## 何时用

把论文、讲义、答辩材料里的图做成「会动的插图」：正文写到「如图 1(b) 所示」时点一下，图切到那一步；投稿或打印时，每张图定格在打印态，流程图展开成 (a)(b)(c) 分图。适合流程图、架构图逐步讲解（`ProcessFigure`），以及参数会变的公式曲线、权重分布（`PaperFigure`）。只是一张静态配图，用普通 `<figure>` 就够；要自由拖拽编排节点用 [Flow](../flow/flow.md)；要讲服务之间的调用顺序用 [SequenceDiagram](../sequence-diagram/sequence-diagram.md)。

## 导入
```ts
import { Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, usePaperMode } from "@hulianui/ui"
import type { ProcessStep, FigureRenderContext } from "@hulianui/ui"
```

## 结构

```
Paper                      呈现形态（阅读 / 打印）+ 图的注册表 + 图号计数
├─ FigRef                  正文引用：切到某个预设、滚到图、描边一下
├─ PaperFigure<S>          通用图：状态是任意值 + 有名字的预设
└─ ProcessFigure           一步步讲的图（PaperFigure 的特化，状态就是步骤 key）
   └─ FigureStep           标出图里某一部分属于哪一步
```

核心约定只有一条：**图只由状态决定画成什么样**。`PaperFigure` 的 `children` 是「状态 → 画面」的函数，打印分图就是同一个函数在几个预设上各调一次。函数里藏的内部状态不会出现在分图和打印里。

## Paper

继承 `HTMLAttributes<HTMLElement>`，`ref` 落在根元素上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| as | `ElementType` | `"article"` | 根元素标签 |
| mode | `"read"` ｜ `"print"` | - | 受控形态 |
| defaultMode | `"read"` ｜ `"print"` | `"read"` | 非受控初始形态 |
| labels | `{ figure?: string; separator?: string }` | 跟随界面语言 | 图注前缀和自动引用的文字。论文语言和界面不同时指定，如中文界面里排英文论文：`{ figure: "Figure", separator: ": " }`。步骤按钮等控件文字仍跟随界面语言 |

| 事件 | 类型 | 说明 |
|------|------|------|
| onModeChange | `(mode: PaperMode) => void` | 通过 `usePaperMode` 切换形态时触发 |

- 浏览器真正打印时（`beforeprint`），`Paper` 临时切到 `print`，打印完（`afterprint`）切回，这一次不触发 `onModeChange`。
- 图号用 CSS 计数器，服务端渲染和打印时都有号。`PaperFigure` 必须放在 `Paper` 里，否则每张图都是「图 1」。
- 正文用衬线字体：`var(--paper-font, "STIX Two Text", "Times New Roman", "Songti SC", "SimSun", serif)`。在外层设 `--paper-font` 即可替换。`Paper` 不接管标题、段落的样式，排版由你决定。

`usePaperMode()` 在 `Paper` 内部返回 `[mode, setMode]`，用来做自己的「阅读 / 打印预览」切换。

## PaperFigure

`PaperFigureProps<S>` 泛型，`S` 是状态的类型。继承 `HTMLAttributes<HTMLElement>`（不含 `children` / `title` / `id`），`ref` 落在根 `<figure>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id * | string | - | 图的稳定 id，`FigRef` 靠它找图，同时是根 `<figure>` 的 `id`（可作锚点） |
| states * | `Record<string, S>` | - | 有名字的状态预设。键的书写顺序就是讲解顺序 |
| caption * | ReactNode | - | 图注正文，「图 N：」前缀自动生成 |
| children * | `(state: S, figure: FigureRenderContext<S>) => ReactNode` | - | 画图。只能由 `state` 决定画面 |
| defaultState | string | `states` 第一个键 | 初始预设 |
| printState | string | 同 `defaultState` | 打印形态下主图用的预设 |
| printSubfigures | `string[]` | - | 打印形态下在主图下方展开成 (a)(b)… 分图的预设 |
| describe | `(state: S, key: string ｜ null) => ReactNode` | - | 图注第二行，说明当前状态；变化时读屏会念 |
| subfigureLabel | `(key: string, index: number) => ReactNode` | `(a)` + `describe` | 分图小标题 |
| controls | `(figure: FigureRenderContext<S>) => ReactNode` | - | 图下方的交互控件，只在阅读形态渲染 |

| 事件 | 类型 | 说明 |
|------|------|------|
| onStateChange | `(state: S, key: string ｜ null) => void` | 用户操作、`FigRef` 跳转都会触发 |

`FigureRenderContext<S>`：

```ts
interface FigureRenderContext<S> {
  state: S;                     // 当前画的状态
  stateKey: string | null;      // 对应的预设名；用 setState 直接给值时为 null
  select: (key: string) => void;    // 切到预设
  setState: (state: S) => void;     // 直接给值（滑块、开关）
  mode: "read" | "print";
}
```

## ProcessFigure

一步步讲的图。状态就是步骤的 `key`，外加保留名 `"all"`（每一部分都亮着）。继承 `PaperFigure` 的 `id` / `caption` / `defaultState` / `subfigureLabel` / `onStateChange` 和原生属性。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| steps * | `ProcessStep[]` | - | 按讲解顺序排列的步骤 |
| children * | ReactNode | - | 图本身，一般是用 `FigureStep` 标好各部分的 SVG |
| overview | boolean | true | 是否有「全部」状态 |
| overviewDescription | ReactNode | - | 「全部」状态的说明 |
| printState | string | `"all"`（无 overview 时为最后一步） | 打印态 |
| printSubfigures | `string[]` | 每一步各一张 | 打印分图；传 `[]` 不展开 |
| interval | number | 2200 | 自动播放每步停留的毫秒数 |

```ts
interface ProcessStep {
  key: string;              // 不能用 "all"
  label: string;            // 短名：步骤按钮提示、分图小标题
  description?: ReactNode;  // 图注第二行
}
```

图下方自带步骤控件：上一步 / 下一步（首尾禁用）、每一步一个字母按钮（a、b、c…）、「全部」、播放 / 暂停。播放到最后一步自动停。

## FigureStep

`<g>` 元素，标出图里一部分属于哪一步，只能放在 SVG 里。继承 `SVGAttributes<SVGGElement>`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| at * | `string` ｜ `string[]` | - | 属于哪一步。可以属于几步：`["b", "c"]` 或 `"b c"` |

它带 `data-phase`：

| phase | 含义 | 组件给的样式 |
|-------|------|------|
| `on` | 正在讲这一步 | 不透明 |
| `done` | 已经讲过 | 半透明 |
| `off` | 还没讲到 | 很淡，但不隐藏，读者始终看得到整张图 |
| `all` | 「全部」状态 | 不透明，不强调 |

组件只管透明度。强调色和流动虚线由你在图里写，`FigureStep` 带 `group/step`：

```tsx
<FigureStep at="b">
  <rect className="stroke-muted-foreground group-data-[phase=on]/step:stroke-primary" />
  <path className="stroke-muted-foreground group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]" />
</FigureStep>
```

`hulian-paper-flow` 关键帧在 `@hulianui/tokens` 的 preset-core.css 里。

## FigRef

`<a href="#id">`，继承 `AnchorHTMLAttributes`（不含 `href`），`ref` 落在 `<a>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| to * | string | - | 目标图的 `id` |
| state | string | - | 要切到的预设；不传只跳到图，不改状态 |
| children | ReactNode | 「图 N」 | 引用文字。不传时按文档顺序自动取号（挂载后才有号） |

点击时：把图切到 `state` → 图不在视野里就滚过去（减弱动效时不平滑滚动）→ 图描边约 1.2 秒。没有 JS 或不在 `Paper` 里时退化成普通锚点。打印形态下去掉链接色和下划线。

## 示例

```tsx
<Paper>
  <p>
    Each layer has a multi-head self-attention sub-layer{" "}
    <FigRef to="transformer" state="b">Figure 1(b)</FigRef>.
  </p>
  <ProcessFigure
    id="transformer"
    steps={[
      { key: "a", label: "Input embedding", description: "(a) …" },
      { key: "b", label: "Encoder self-attention", description: "(b) …" },
    ]}
    caption="The Transformer – model architecture."
  >
    <svg viewBox="0 0 600 704">
      <FigureStep at="a">…</FigureStep>
      <FigureStep at="b">…</FigureStep>
    </svg>
  </ProcessFigure>
</Paper>
```

参数图：

```tsx
<PaperFigure
  id="attention"
  states={{ scaled: { dk: 512, scaled: true }, raw: { dk: 512, scaled: false } }}
  caption="Scaled dot-product attention."
  describe={(s) => (s.scaled ? "scaled" : "unscaled")}
  controls={(fig) => (
    <Button onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}>切换缩放</Button>
  )}
>
  {(state) => <Bars state={state} />}
</PaperFigure>
```

## 注意

- **图里不要写 `id`**（SVG `marker`、`clipPath`、渐变）。打印分图会把同一张图渲染好几遍，id 会重复。箭头直接画成 `polygon`。
- 分图是 `aria-hidden` 的：读屏读主图和图注就够了，不把同一张图念六遍。
- 预设名在一张图里唯一；`FigRef` 引用不存在的图或预设，开发环境告警一次，状态不变。
- 同一个 `Paper` 里图 id 重复时，引用只会找到后挂载的那一张，并告警。
- 这一版还没有：答辩演示模式（全屏逐步翻）、每个状态单独导出 SVG、公式与图的联动、论文标题区和参考文献。
