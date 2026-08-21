---
slug: design-canvas
name: DesignCanvas
category: data-display
group: collection
tags: []
exports: [DesignCanvas, canvasToScreen, itemsBounds, moveRect, normalizeRect, resizeRect, snapTo]
status: enriched
---

# DesignCanvas

> 视觉设计画布 · 零依赖原生 Pointer Events · 无限平移缩放（滚轮以指针为锚点/空格·中键·右键拖拽）+ 元素选择框 + 拖拽移动 + 八向 resize（越过锚定边自动翻转）· 受控 items 托管几何、children 作自绘图层，`data-canvas-item` 事件委托识别子元素 · 键盘可达（Tab 走查 / 方向键微调 / Alt+方向键改尺寸 / Delete 删除）· 几何抽纯函数带单测 · data-display/collection

## 何时用

在一块无限画布上**自由摆放矩形元素**——页面草稿、看板画板、海报/幻灯排版、低代码可视化编辑器的画布区。元素的位置和尺寸就是数据本身，没有「谁连到谁」的拓扑。

- 要编排的是**节点与连线的拓扑**（AI 工作流、DAG、流程图）用 [Flow](../flow/flow.md)：它管连接桩、贝塞尔连线、按拓扑自动分层，本组件一根线都不画。
- 只要把一个**固定设计尺寸**等比缩放铺满容器（大屏可视化）用 [FitScreen](../fit-screen/fit-screen.md)：它没有平移、没有选中、没有编辑。
- 只要多列卡片在列间流转用 [Kanban](../kanban/kanban.md)；单列表排序用 [Sortable](../sortable/sortable.md)。

DesignCanvas 与 Flow 共用同一套视口数学（`screenToCanvas` / `zoomAtPoint` / `clampZoom` 复用自 Flow 的几何模块），所以两者的滚轮手感、坐标约定完全一致，同一页面里混用不会有「一个跟手一个不跟手」的割裂。

## 导入
```ts
import { DesignCanvas, canvasToScreen, itemsBounds, moveRect, normalizeRect, resizeRect, snapTo } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | DesignCanvasItem[] | [] | 受控元素数组（`{ id, x, y, width, height, locked?, label? }`）。画布**托管**这些元素的几何 |
| zoom | number | - | 缩放受控。传了就以它为准，组件只回吐 `onZoomChange` |
| defaultZoom | number | 1 | 非受控初始缩放 |
| pan | { x, y } | - | 平移受控（画布原点在容器内的屏幕像素偏移） |
| defaultPan | { x, y } | { x: 0, y: 0 } | 非受控初始平移 |
| selectedElement | string ｜ null | - | 选中受控（元素 id / 路径） |
| defaultSelectedElement | string ｜ null | null | 非受控初始选中 |
| minZoom | number | 0.1 | 缩放下限 |
| maxZoom | number | 4 | 缩放上限 |
| grid | boolean ｜ number | true | 网格底纹：`true`=40 世界单位，数字=自定义边长，`false` 关闭 |
| snap | number | 0 | 拖动 / resize / 方向键的吸附步长（世界单位），0 = 不吸附 |
| minItemSize | number | 8 | 元素最小宽高（世界单位） |
| wheelBehavior | "zoom" ｜ "pan" | "pan" | 无修饰键时的滚轮行为。Ctrl（含触控板捏合）恒为缩放，不受此项影响 |
| controls | boolean | true | 是否显示右下角缩放工具条 |
| readOnly | boolean | false | 禁用拖动 / resize / 删除，仍可选中、平移、缩放 |
| className | string | - | 画布外层类名（须有确定高度，组件填满） |
| labels | Partial\<DesignCanvasLabels\> | - | 覆盖取自 locale 的文案（canvas / item / zoomIn / zoomOut / fitView / resetView）；不传则跟随 ConfigProvider |
| apiRef | MutableRefObject\<DesignCanvasApi ｜ null\> | - | 命令式句柄（zoomIn / zoomOut / reset / fitView / screenToCanvas） |

`DesignCanvasItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id * | `string` | - | 唯一键，也是 `selectedElement` 的取值 |
| x * / y * | `number` | - | 左上角在世界坐标里的位置 |
| width * / height * | `number` | - | 宽高（世界单位） |
| locked | `boolean` | `false` | 锁定：不可拖动、不出 resize 手柄（仍可选中、仍可 Tab 到） |
| label | `string` | 回退到 `id` | 无障碍名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onItemsChange | (items: DesignCanvasItem[]) => void | 几何变化后回吐**整组**新 items。拖动 / resize 在指针抬起时提交一次，方向键每次按下提交一次 |
| onItemDelete | (id: string) => void | 选中元素后按 Delete / Backspace。不传则不响应删除键 |
| onSelect | (elementPath: string ｜ null) => void | 选中变化（点元素 = 它的 id，点空白 = null） |
| onZoomChange | (zoom: number) => void | 缩放变化 |
| onPanChange | (pan: { x, y }) => void | 平移变化 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem | (item, state: { selected, dragging, resizing }) => ReactNode | 渲染元素内容（定位、选择框、手柄由组件负责）。不传则渲染占位空框 |
| children | ReactNode | 自绘图层，直接挂进世界坐标层（跟随平移缩放）。几何由你自己摆 |

## 示例
```tsx
const [items, setItems] = useState<DesignCanvasItem[]>([
  { id: "hero", x: 40, y: 32, width: 260, height: 120, label: "首屏横幅" },
  { id: "cta", x: 40, y: 176, width: 120, height: 96, label: "行动按钮" },
]);
const [selected, setSelected] = useState<string | null>(null);

<div className="h-[420px] w-full overflow-hidden rounded border border-border">
  <DesignCanvas
    items={items}
    onItemsChange={setItems}
    selectedElement={selected}
    onSelect={setSelected}
    onItemDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))}
    grid={20}
    snap={20}
    renderItem={(item, s) => (
      <div className={cn("grid h-full w-full place-items-center rounded-[var(--radius)] border bg-surface",
        s.selected ? "border-primary" : "border-hairline")}>
        {item.label}
      </div>
    )}
  />
</div>
```

`items` 与 `children` 不是两套互斥 API，区别只在**画布认不认识它的矩形**：

```tsx
<DesignCanvas items={items} onItemsChange={setItems}>
  {/* 自绘图层：可以被点选（onSelect 回吐 "ruler"），但画布不知道它多大 → 拖不动、不出手柄 */}
  <div data-canvas-item="ruler" className="absolute left-0 top-0 h-px w-[600px] bg-primary" />
</DesignCanvas>
```

几何纯函数可单独用来做外部工具栏（对齐、等宽、批量位移）：

```ts
const bounds = itemsBounds(items);                       // 多元素包围盒 → 对齐参考线
const next = moveRect(item, 0, 8, 8);                    // 按 8px 网格下移一格
const bigger = resizeRect(item, "se", 20, 20, { snap: 8 }); // 右下角放大并吸附
const screen = canvasToScreen({ x: item.x, y: item.y }, { x: pan.x, y: pan.y, zoom });
```

## 无障碍

- 画布是 `role="application"` + `tabIndex=0`，聚焦时有可见焦点环；`aria-label` 走 `labels.canvas`。文案优先级是 `labels` prop > ConfigProvider 的 locale > 内置中文兜底，所以整站换语言时画布跟着变，不必逐处传 `labels`。
- 每个 `items` 元素是可聚焦节点，**Tab 依次走过**；聚焦即选中（`onSelect` 会回吐），选中项带 `aria-current="true"` 与 `data-selected`，焦点环用 `focus-visible:ring`。
- 元素的无障碍名取 `label`，缺省回落到 `id`——所以 `id` 请用人能读的串（`"hero"` 而不是 `"a1f3"`）。
- 纯键盘通路完整：方向键移动 1 世界单位（开了 `snap` 则按网格步进），`Shift+方向键` 十倍粗调，`Alt+方向键` 改尺寸，`Delete`/`Backspace` 删除。八个 resize 手柄因此是 `aria-hidden` 的纯指针装饰，不占 Tab 序。
- 焦点落在元素内部的 `input` / `textarea` / `contenteditable` 时，方向键与 Delete 交还给控件，不被画布劫持。

## 禁忌 / 坑

- 外层 `className` **必须有确定高度**（如 `h-[420px]` 或父级撑满），画布按外层尺寸填充——高度塌缩则画布不可见。
- 全受控：`onItemsChange` 回吐的是**整组新 items**，不写回 state 画布就弹回原位。拖动 / resize 中途只改内部草稿，**不会**每帧回吐；要实时联动外部面板请读 `renderItem` 的 `dragging` / `resizing`。
- `children` 里的元素画布不托管几何：给它加 `data-canvas-item` 只买到「可被选中」，**买不到拖拽与 resize**，也不会出选择框。要托管就放进 `items`。
- 元素内部放按钮 / 输入框请照常写——按在这类控件上只选中不起拖（与 Kanban / Sortable 同一口径）。要让某个自定义元素也免于拖拽，给它加 `data-no-drag`。
- 右键在画布上是「拖拽平移」手势的一部分，因此**系统右键菜单被抑制**。需要自定义右键菜单请自行在 `renderItem` 内监听 `contextmenu` 并 `stopPropagation`。
- 滚轮事件用 `{ passive: false }` 注册并 `preventDefault`，画布区域**不会**滚动祖先容器——这是有意为之，别把画布塞进需要靠滚轮滚动的窄栏里。
- 滚轮语义与系统惯例、与同库 [Flow](../flow/flow.md) 一致：**两指滑动平移、捏合（= Ctrl+滚轮）缩放**。`wheelBehavior="zoom"` 只改「无修饰键」那一档，捏合永远缩放。⌘+滚轮不做缩放（macOS 上它没有这个语义）。
- 画布整体 `select-none`：点选 / 拖动不该把元素文字刷成选区。`renderItem` 里塞进来的 `input` / `textarea` / `contenteditable` 已开逃生口照常可选；其它需要复制的自定义内容请自行加 `select-text`。
- `resize` 拖过锚定边会**翻转**（与 Figma 一致），不是卡死在 `minItemSize`。若你的业务不接受翻转，请在 `onItemsChange` 里自行拒绝。
- 客户端组件（原生 Pointer Events），必须在 client 上下文用。

## 相关
[Flow](../flow/flow.md) · [FitScreen](../fit-screen/fit-screen.md) · [Kanban](../kanban/kanban.md) · [Sortable](../sortable/sortable.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [ImageViewer](../image-viewer/image-viewer.md)
