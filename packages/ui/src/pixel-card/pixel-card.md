---
slug: pixel-card
name: PixelCard
category: data-display
group: collection
tags: [animated]
exports: [PixelCard]
status: enriched
---

# PixelCard

> canvas2d 像素卡片 · 悬停/聚焦时像素自中心波纹生长+闪烁、离开收缩消散 · 4 变体/可定制 gap·speed·colors(零依赖 RAF·token 配色·reduced-motion 静止) · data-display/collection · #animated

## 何时用

给卡片加"悬停时像素自中心波纹生长"的复古/科技感装饰背景时用，内容叠在像素层之上。要的是**像素动画背景**用本组件；要指针 3D 倾斜用 [TiltedCard](../tilted-card/tilted-card.md)，要光标聚光网格用 [MagicBento](../magic-bento/magic-bento.md)。

## 导入
```ts
import { PixelCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"default" \| "blue" \| "pink" \| "amber"` | `"default"` | 预设变体，决定默认 gap/speed/colors/noFocus 组合（default 中性灰白 / blue chart-2 / pink chart-5 默认关焦点 / amber chart-3 暖橙更密）。单独传下方 prop 可覆盖对应项 |
| gap | `number` | 变体默认 | 像素网格间距（px），越小越密数量越多（性能开销越大），建议 3–12 |
| speed | `number` | 变体默认 | 动画速度（0–100 整数标度），0 等价禁用动画 |
| colors | `string[]` | 变体默认（token） | 像素配色数组，每像素随机取一；默认取瑚琏 token，可传任意 CSS 颜色 |
| noFocus | `boolean` | 变体默认 | true 时仅鼠标悬停触发、根容器不可聚焦（禁键盘焦点触发） |
| className | `string` | — | 透传到根容器的额外 className（控尺寸/圆角/边框） |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 覆盖在像素层上方的内容（relative 层叠在 canvas 背景之上） |

## 示例
```tsx
// 用 className 给容器定尺寸；children 叠在像素背景上
<PixelCard variant="blue" className="h-48 w-64">
  <div className="flex flex-col items-center gap-1 px-6 text-center">
    <p className="text-base font-semibold text-foreground">Pixel Card</p>
    <p className="text-xs text-muted">悬停 / 聚焦触发像素动画</p>
  </div>
</PixelCard>

// 自定义配色 + 慢速（覆盖变体默认）
<PixelCard colors={["var(--color-chart-5)", "var(--color-chart-1)"]} gap={5} speed={18} className="h-48 w-64" />
```

## 禁忌 / 坑

- **尺寸靠 `className`/`style` 给**（如 `h-48 w-64`），不给尺寸 canvas 为 0 不可见。
- `gap` 越小像素越多、RAF 重绘开销越大，大卡片配小 gap 易掉帧；按需折中。
- [[hulian-token-color-var-needs-color-prefix]]：`colors` 用 token 时须带 `--color-` 前缀（`var(--color-chart-2)`），裸 `var(--chart-2)` 在 canvas fillStyle 下不解析。
- canvas2d 动画，reduced-motion 下静止（不波纹）；`speed=0` 同样禁用动画。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
