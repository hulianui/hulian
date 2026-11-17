---
slug: paper
name: Paper
category: data-display
group: collection
tags: []
exports: [Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, EqRef, FigureRaster, PaperPresenter, usePaperMode, usePaperExport, usePaperTerm, PaperHeader, Cite, Bibliography]
status: enriched
---

# Paper

> 让论文里的图跟着正文一步步变化，并能切到投稿用的打印形态 · data-display/collection

## 何时用

把论文、讲义、答辩材料里的图做成「会动的插图」：正文写到「如图 1(b) 所示」时点一下，图切到那一步；投稿或打印时，每张图定格在打印态，流程图展开成 (a)(b)(c) 分图。适合流程图、架构图逐步讲解（`ProcessFigure`），以及参数会变的公式曲线、权重分布（`PaperFigure`）。只是一张静态配图，用普通 `<figure>` 就够；要自由拖拽编排节点用 [Flow](../flow/flow.md)；要讲服务之间的调用顺序用 [SequenceDiagram](../sequence-diagram/sequence-diagram.md)。

## 导入
```ts
import { Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, EqRef, FigureRaster, PaperPresenter, usePaperMode, usePaperExport, usePaperTerm, PaperHeader, Cite, Bibliography } from "@hulianui/ui"
import { PaperEquation } from "@hulianui/ui/math"
import type { ProcessStep, FigureRenderContext, PresenterSlide, FigureSvgExportOptions, FigureRasterContext, EquationTerm, PaperAuthor, BibliographyEntry } from "@hulianui/ui"
```

## 结构

```
Paper                      呈现形态（阅读 / 打印）+ 图的注册表 + 图号计数
├─ PaperHeader             标题区：题目、作者、摘要
├─ FigRef                  正文引用：切到某个预设、滚到图、描边一下
├─ EqRef                   公式引用「公式 (1)」：滚到公式、描边一下
├─ Cite                    文献引用 [1, 2]，按 Bibliography 编号
├─ PaperEquation           公式，其中的项能和图联动（@hulianui/ui/math）
├─ PaperPresenter          答辩演示：全屏，把每张图的预设串成幻灯片
├─ Bibliography            参考文献列表
├─ PaperFigure<S>          通用图：状态是任意值 + 有名字的预设
└─ ProcessFigure           一步步讲的图（PaperFigure 的特化，状态就是步骤 key）
   └─ FigureStep           标出图里某一部分属于哪一步

FigureRaster               图的 <svg> 里的一块栅格（热力图），任何图都能用
```

核心约定只有一条：**图只由状态决定画成什么样**。`PaperFigure` 的 `children` 是「状态 → 画面」的函数，打印分图就是同一个函数在几个预设上各调一次。函数里藏的内部状态不会出现在分图和打印里。

## Paper

继承 `HTMLAttributes<HTMLElement>`，`ref` 落在根元素上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| as | `ElementType` | `"article"` | 根元素标签 |
| mode | `"read"` ｜ `"print"` | - | 受控形态 |
| defaultMode | `"read"` ｜ `"print"` | `"read"` | 非受控初始形态 |
| labels | `{ figure?; separator?; abstract?; references?; equation? }` | 跟随界面语言 | 图注前缀、自动引用（含 `EqRef` 的「公式」/ "Eq."）、摘要与参考文献标题的文字。论文语言和界面不同时指定，如中文界面里排英文论文：`{ figure: "Figure", separator: ": " }`。步骤按钮等控件文字仍跟随界面语言 |

| 事件 | 类型 | 说明 |
|------|------|------|
| onModeChange | `(mode: PaperMode) => void` | 通过 `usePaperMode` 切换形态时触发 |

- 浏览器真正打印时（`beforeprint`），`Paper` 临时切到 `print`，打印完（`afterprint`）切回，这一次不触发 `onModeChange`。
- 图号和公式号用 CSS 计数器，服务端渲染和打印时都有号。`PaperFigure` 必须放在 `Paper` 里，否则每张图都是「图 1」。
- 正文用衬线字体：`var(--paper-font, "STIX Two Text", "Times New Roman", var(--hl-font-serif, serif))`。西文先用 STIX Two Text / Times New Roman，中文和兜底回落到 tokens 的 `--hl-font-serif`（默认汉字落到系统宋体）。只想换中文衬线就设 `--hl-font-serif`，整个替换就在外层设 `--paper-font`。`Paper` 不接管标题、段落的样式，排版由你决定。

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
| presentStates | `string[]` | `states` 全部键 | `PaperPresenter` 演示时依次展示的预设；`[]` 表示演示时跳过这张图 |
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
| presentStates | `string[]` | 各步 + `"all"` | 演示时依次展示的预设 |
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

## FigureRaster

图里逐像素的部分：热力图、注意力矩阵、显微照片。`<image>` 元素，**只能放在图的 `<svg>` 里**。`draw` 在离屏 canvas 上画，编码成 PNG 写进 `href`。继承 `SVGAttributes<SVGImageElement>`（不含 `href`），`ref` 落在 `<image>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width * / height * | number | - | 在图的 SVG 坐标（`viewBox`）里的大小 |
| x / y | number | 0 | 在图的 SVG 坐标里的位置 |
| resolution * | `[宽, 高]` | - | 画布像素尺寸。数据栅格一般就是数据的列数和行数 |
| draw * | `(ctx, { width, height, color }) => void` | - | 在画布上画。只能由数据决定画面。按引用比较，引用不变就不重画，所以提到模块级常量或用 `useCallback` |
| pixelated | boolean | false | 一个像素就是一个数据格：放大后保持方块，不插值。照片类栅格保持 false |
| preserveAspectRatio | string | `"none"` | 默认拉伸填满 `width × height`，和数据格的坐标一一对应 |

`color(css)` 把任意 CSS 颜色（含 `var(--color-chart-1)` 这类 token）按栅格所在位置的主题解析成 0–255 的 `[r, g, b, a]`，可以直接写进 `ImageData`。

```tsx
const drawHeat = (ctx, { width, height, color }) => {
  const positive = color("var(--color-chart-1)");
  const negative = color("var(--color-chart-3)");
  const zero = color("var(--color-bg)");
  const image = ctx.createImageData(width, height);
  // … 每个像素按数值在 zero 与 positive / negative 之间插值
  ctx.putImageData(image, 0, 0);
};

<PaperFigure id="encoding" states={presets} printSubfigures={["c4", "c40"]} caption="…">
  {({ dim }) => (
    <svg viewBox="0 0 520 352">
      <FigureRaster x={4} y={4} width={512} height={176} resolution={[128, 64]} pixelated draw={drawHeat} />
      <rect x={4 + dim * 4} y={4} width={4} height={176} className="fill-none stroke-foreground" />
    </svg>
  )}
</PaperFigure>
```

- **为什么放进 SVG**：画面仍然是单独一个 `<svg>`，所以栅格和矢量部分（坐标轴、标记、曲线）共用 `viewBox` 坐标。打印分图里每份各画各的，演示时按舞台缩放，导出 SVG 时原样内嵌，得到一份混合 SVG。
- **主题**：颜色在栅格自己的位置解析。页面上任意一处 `data-theme` 改变或系统明暗切换时重画；导出时在亮色槽里画，所以导出的总是亮色。
- **pixelated**：编码时按整数倍最近邻放大（编码尺寸约为显示尺寸的 3 倍，长边不超过 4096 像素）。Word、PDF 转换器这些不认 `image-rendering` 的地方也是锐利的方块。
- **时机**：在 layout effect 里画。浏览器打印前 `Paper` 同步切到打印态，分图的栅格在打印快照之前就已画好。服务端渲染时输出没有 `href` 的 `<image>`，位置已经占好，不会跳动。
- 栅格不响应指针。要在上面选点，就叠一个透明的 `<rect>` 接事件，键盘操作交给图下方的控件（如 `Slider`）。
- 发散数据（有正有负）用两个色相加中性的中点，例如 `chart-1` / `chart-3` 加底色。不要用 `warning` / `danger` 这类状态色。

## FigRef

`<a href="#id">`，继承 `AnchorHTMLAttributes`（不含 `href`），`ref` 落在 `<a>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| to * | string | - | 目标图的 `id` |
| state | string | - | 要切到的预设；不传只跳到图，不改状态 |
| children | ReactNode | 「图 N」 | 引用文字。不传时按文档顺序自动取号（挂载后才有号） |

点击时：把图切到 `state` → 图不在视野里就滚过去（减弱动效时不平滑滚动）→ 图描边约 1.2 秒。没有 JS 或不在 `Paper` 里时退化成普通锚点。打印形态下去掉链接色和下划线。

## PaperPresenter

答辩演示：一个全屏层，把论文里每张图的预设串成一组幻灯片。放在 `Paper` 里任意位置（一般是工具栏）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| trigger | `ReactElement` | - | 打开演示的按钮，如 `<Button>演示</Button>`。关闭后焦点回到它 |
| open | boolean | - | 受控：是否打开。不用 `trigger` 时用它打开，关闭后焦点回到打开前聚焦的元素 |
| defaultOpen | boolean | false | 非受控初始是否打开 |
| title | ReactNode | - | 页眉左侧的标题，一般是论文题目 |
| slides | `PresenterSlide[]` | 见下 | 整组幻灯片，`{ figure: 图 id, state: 预设名 }` |
| controls | boolean | true | 是否渲染图自带的控件（步骤按钮、参数开关） |
| className | string | - | 加在全屏层根元素上 |

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | 打开 / 关闭（含 Esc、退出按钮） |
| onSlideChange | `(slide: PresenterSlide, index: number) => void` | 翻到某一页时触发，含打开时的第一页 |

- **幻灯片怎么来**：默认按文档顺序，把每张图的 `presentStates` 依次排开。`PaperFigure` 默认是全部预设，`ProcessFigure` 默认是各步加「全部」。传 `slides` 可以整体改写顺序，或把几张图交错着讲；不存在的图或预设在开发环境告警一次并跳过。页眉里的图号始终按文档顺序。
- **不搬 DOM**：演示层用图的同一个 `children(state)` 函数再画一遍，正文里的图不动、状态不变，退出后读者还停在原来那一步。图的 props 变了（如切换语言），演示里跟着重画。
- **图的控件照常可用**：控件 `select` 到某个预设时翻到对应那一页（`ProcessFigure` 的步骤按钮就是跳页）；`setState` 给的值只覆盖当前页，翻页即还原。
- **按键**：`→` / `空格` / `PageDown` 下一页，`←` / `PageUp` 上一页，`Esc` 退出。焦点在输入框、滑块、单选组等控件上时，方向键留给控件；焦点在按钮上时，空格是按下按钮。
- **无障碍**：`role="dialog"`，名字是「演示模式」（跟随界面语言）。焦点困在演示层里，打开后落在「下一页」，退出后回到触发按钮。演示层之外的内容对读屏隐藏。
- 演示层渲染在 `Paper` 的 DOM 之外（Portal），打开时沿用 `Paper` 所处位置的字体（含 `--paper-font` 等覆盖）和主题岛（`Paper` 最近的 `data-theme` 祖先，演示中切换也跟着变）。只靠自定义属性局部改色、不带 `data-theme` 的容器传不进演示层。图的渲染函数若依赖放在 `Paper` 与图之间的 context，演示里取不到。
- SVG 图在演示里按舞台高度撑满（宽度跟着 `viewBox` 比例），不需要另写演示尺寸。

```tsx
<Paper>
  <PaperPresenter title="Attention Is All You Need" trigger={<Button>演示 ▶</Button>} />
  <ProcessFigure id="transformer" steps={steps} caption="…">…</ProcessFigure>
  <PaperFigure id="attention" states={presets} presentStates={["scaled64", "raw512", "scaled512"]} caption="…">
    {(state) => <AttentionBars state={state} />}
  </PaperFigure>
</Paper>
```

## 逐状态导出 SVG

投稿时把每个状态的矢量图插进 Word，或转成 PDF 放进 LaTeX。在 `Paper` 里用 `usePaperExport()`：

```tsx
const { exportFigureSvg } = usePaperExport();
const svg = await exportFigureSvg("transformer", "b", { background: "white" }); // SVG 文本
```

`exportFigureSvg(id, stateKey, options?) => Promise<string>`：

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| theme | `"light"` ｜ `"current"` | `"light"` | 按哪套主题出色。默认亮色：读者开着暗色也导出白纸上的图 |
| background | string | 透明 | 底色，任意 CSS 颜色 |
| width | number | `viewBox` 的宽 | 输出的 `width`（px），高度按比例 |

- **怎么做的**：在 `Paper` 里临时挂一个屏幕外的槽，用图的同一个 `children(state)` 画出这个预设（画面的 `mode` 是 `"print"`），等字体就绪后逐个元素读计算样式，写成 SVG 表现属性（`fill="#…"`、`stroke-width="1.3"`…），去掉 `class` / `style` / `data-*`。正文里的图不受影响。
- **颜色**：Tailwind 类和 CSS 变量离开页面就失效，浏览器给的计算值又常是 `oklab()` / `oklch()`，Word、Inkscape 不认。导出时一律换成 `#rrggbb`，透明度并进 `fill-opacity` / `stroke-opacity`。
- **定格**：动画和过渡在槽里关掉，流动虚线定格在起点；`FigureStep` 的阶段透明度按导出的那一步算。`display: none` 的元素不进文件；`aria-label` 变成 `<title>`（Word 当替代文字用）。
- **文字保留为 `<text>`**，带上 `Paper` 的字体栈。写入的是计算后的整条字体栈：打开文件的机器上没有 STIX Two Text 时回退到 Times New Roman，中文落到 `--hl-font-serif` 里的字体或系统衬线（宋体）。LaTeX 里用 `\includesvg`（svg 宏包，需要 Inkscape）或先转成 PDF，转换的机器上要装好字体。
- **前提**：图的画面必须是单独一个 `<svg>`。画面是裸的 canvas、HTML 或带 `<foreignObject>` 时 reject 并说明原因（canvas 栅格改用 `FigureRaster` 画在 `<svg>` 里，导出时以 PNG 内嵌）；图找不到、预设不存在时也 reject。
- 图里的 CSS `transform`（如 Tailwind 的 `rotate-*`）不会写进文件，要旋转、平移请用 SVG 的 `transform` 属性。

## 公式与图联动

公式里的某一项可以点、可以悬停，和图的状态、控件互相高亮。分两半：

- **`PaperEquation`**：从 `@hulianui/ui/math` 引入。公式走 KaTeX，放在主入口会把 KaTeX 拉进每个消费方的包里。
- **`usePaperTerm`**：从 `@hulianui/ui` 引入，给图里的控件用，不依赖 KaTeX。

```tsx
import { PaperEquation } from "@hulianui/ui/math";
import { usePaperTerm } from "@hulianui/ui";

<PaperEquation
  number={1}
  terms={{
    dk: { label: "√dₖ：切换图 2 的缩放", figure: "attention", state: (s) => ({ ...s, scaled: !s.scaled }) },
  }}
>
  {String.raw`\mathrm{softmax}\left(\frac{QK^T}{\term{dk}{\sqrt{d_k}}}\right)V`}
</PaperEquation>

function ScaleToggle({ fig }) {
  const term = usePaperTerm("dk");
  return <Button {...term.bind} className="data-[active]:text-primary" onClick={…}>切换缩放</Button>;
}
```

### PaperEquation

继承 `HTMLAttributes<HTMLDivElement>`（不含 `children`），`ref` 落在根元素上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children * | string | - | 整条公式的 LaTeX（数学模式，不用包 `$`）。用 `\term{name}{…}` 标出可交互的项，name 只能是字母、数字、`_`、`-` |
| terms | `Record<string, EquationTerm>` | - | 各项的配置，键是 name |
| number | ReactNode | 自动编号 | 右侧的编号。在 `Paper` 里不传时自动编号，见下方「公式编号与 EqRef」；传值显示成 `(值)`，不占自动编号（同 LaTeX `\tag`）；传 `null` / `false` 不编号。在 `Paper` 外不传时不编号 |
| display | boolean | true | 块级排版 |
| macros | `Record<string, string>` | - | 自定义宏，透传给 KaTeX；`\term` 是保留名 |

```ts
interface EquationTerm {
  label: string;     // 读屏名和悬停提示，说清点了会怎样
  figure?: string;   // 点击驱动的图 id；不传则这一项只做高亮联动，不能点
  state?: string | ((current: unknown) => unknown); // 预设名，或由当前状态算新状态
}
```

- **点击**：`state` 是预设名就切到那个预设，是函数就用图的当前状态算出新状态（如开关取反）。之后和 `FigRef` 一样，图不在视野里就滚过去并描边。
- **高亮**：悬停或聚焦公式里的项时，用 `usePaperTerm` 绑定了同名的控件 `active` 为 true；悬停或聚焦控件时，公式里的项带 `data-active` 高亮。
- **可达性**：KaTeX 的 HTML 层整体是 `aria-hidden`，读屏读的是并排的 MathML，项本身不能聚焦。`PaperEquation` 在每个可点的项上叠一个透明的真 `<button>`（`aria-label` 即 `label`），键盘 Tab 得到，焦点环画在项上。尺寸变化和字体加载后会重新定位。
- **安全**：`\term` 展开成 KaTeX 的 `\htmlData`。trust 只放行「唯一属性是 `paper-term`、值是安全名字」的这一种，`\href`、`\htmlClass`、`\includegraphics` 等照旧拒绝。
- 打印形态下不叠按钮、不高亮。公式里写了 `terms` 没配的项，开发环境告警一次。

### usePaperTerm

`usePaperTerm(name) => { active, bind }`。把 `bind` 展开到控件（或图的一部分）上，悬停、聚焦时公式里同名的项会亮。高亮时 `bind` 带 `data-active`，可以用 `data-[active]:` 写样式。在 `Paper` 外调用时 `active` 恒为 false。

### 公式编号与 EqRef

```tsx
<p>… as shown in <EqRef to="attention" />.</p>   {/* 「公式 (1)」，英文论文 "Eq. (1)" */}
<PaperEquation id="attention">{String.raw`\mathrm{softmax}(QK^T/\sqrt{d_k})V`}</PaperEquation>  {/* (1) */}
<PaperEquation number="A.1">{…}</PaperEquation>   {/* (A.1)，不占号 */}
<PaperEquation number={null}>{…}</PaperEquation>  {/* 不编号 */}
<PaperEquation>{…}</PaperEquation>                {/* (2) */}
```

- **自动编号**：在 `Paper` 里不传 `number` 的公式占 CSS 计数器的一个号，和图号一样，服务端渲染和打印时都有号，不等 JS。手写 `number` 覆盖显示、不占号；`null` / `false` 不编号。
- **`EqRef`** 从 `@hulianui/ui` 引入（不依赖 KaTeX），是 `<a href="#id">`，继承 `AnchorHTMLAttributes`（不含 `href`），`ref` 落在 `<a>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| to * | string | - | 目标公式的 `id`（写在 `PaperEquation` 上） |
| children | ReactNode | 「公式 (N)」 | 引用文字。不传时按文档顺序自动取号（挂载后才有号），手写覆盖的号原样显示 |

- 点击：公式不在视野里就滚过去（减弱动效时不平滑），公式描边约 1.2 秒。没有 JS 或不在 `Paper` 里时退化成普通锚点；打印形态下去掉链接色。
- 「公式」/ "Eq." 属于论文内容，跟随 `Paper` 的 `labels.equation`，不传时跟随界面语言。
- 找不到公式时点击告警一次；引用了 `number={null}` 的公式时只显示「公式」，开发环境告警一次。
- 公式 id 和图 id、文献 id 共用页面的 DOM id 空间，不要取同名。

## 标题区与参考文献

### PaperHeader

论文标题区：题目夹在上粗下细两条线之间，下面是作者、一行说明、摘要。和 `Paper` 不同，它自带排版。继承 `HTMLAttributes<HTMLElement>`（不含 `title`），`ref` 落在 `<header>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title * | ReactNode | - | 论文题目 |
| titleAs | `ElementType` | `"h1"` | 题目的标签 |
| authors | `PaperAuthor[]` | - | `{ name, affiliation?, email? }`，居中换行排列 |
| meta | ReactNode | - | 作者下方的一行说明，如会议、日期、arXiv 号 |
| abstract | ReactNode | - | 摘要。字符串会包成一个段落；标题是 `labels.abstract` |

### Bibliography 与 Cite

```tsx
<p>… machine translation <Cite to={["hochreiter1997", "sutskever2014"]} />.</p>
<Bibliography
  entries={[
    { id: "hochreiter1997", content: <>Sepp Hochreiter and Jürgen Schmidhuber. Long short-term memory. …</> },
    { id: "sutskever2014", content: <>Ilya Sutskever, Oriol Vinyals, and Quoc V. Le. …</> },
  ]}
/>
```

`Bibliography` 继承 `HTMLAttributes<HTMLElement>`（不含 `title`），`ref` 落在 `<section>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| entries * | `BibliographyEntry[]` | - | `{ id, content }`，按编号顺序，第一条是 [1]。`id` 同时是条目 `<li>` 的 DOM id |
| title | ReactNode | `labels.references` | 标题；传 `null` 不渲染 |
| titleAs | `ElementType` | `"h2"` | 标题的标签 |

`Cite` 是 `<span>`，继承 `HTMLAttributes<HTMLSpanElement>`（不含 `children`），`ref` 落在 `<span>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| to * | `string` ｜ `string[]` | - | 引用的文献 id，可以是几条 |

- **编号**：按 `Bibliography` 里的顺序。一处引几条时排序去重，两个相邻写成 `[1, 2]`，连续三条及以上压成 `[1–3]`，每个号各自链接到条目。
- **点击**：滚到条目（减弱动效时不平滑），条目描边约 1.2 秒。没有 JS 时是普通锚点。打印形态下去掉链接色。
- 号要等 `Bibliography` 挂载登记后才有（同 `FigRef` 的自动图号），服务端渲染时先显示 `[?]`。找不到的 id 显示 `?`，开发环境告警一次。
- 同一个 `Paper` 只放一份 `Bibliography`；有两份时告警，`Cite` 按后登记的那份编号。
- 「摘要」「参考文献」两个标题属于论文内容，跟随 `Paper` 的 `labels`（`abstract`、`references`），不跟界面语言。
- 条目 id 和图 id 共用页面的 DOM id 空间，不要取同名。

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
