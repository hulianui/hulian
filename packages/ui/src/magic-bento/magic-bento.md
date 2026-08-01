---
slug: magic-bento
name: MagicBento
category: data-display
group: collection
tags: [animated]
exports: [MagicBento]
status: enriched
---

# MagicBento

> 便当卡片网格 · 魔法便当卡片网格 · 光标跟随径向聚光 + 描边光呼吸 + 可选 3D 倾斜(零依赖·token·reduced-motion) · data-display/collection · #animated

## 何时用

落地页/控制台首屏要一组大小不一、带光标聚光高光的特性卡网格（bento 布局）时用。要的是"成组网格 + 聚光/描边光"用本组件；只对**单张**卡做指针 3D 倾斜用 [TiltedCard](../tilted-card/tilted-card.md)，要悬停像素波纹用 [PixelCard](../pixel-card/pixel-card.md)。

## 导入
```ts
import { MagicBento } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `MagicBentoItem[]` | 内置示例 | 卡片数据数组，不传时渲染一组内置示例卡 |
| columns | `number` | `4` | 网格列数（grid-template-columns 份数），各卡再用 colSpan/rowSpan 跨格 |
| glowColor | `string` | `var(--color-primary)` | 发光主色，喂给径向光晕/描边光；须用带 `--color-` 前缀的 token（裸 `var(--primary)` 不解析） |
| spotlightRadius | `number` | `280` | 聚光半径（px），越大光斑越大越柔 |
| enableSpotlight | `boolean` | `true` | 是否开启跟随光标的径向聚光 |
| enableBorderGlow | `boolean` | `true` | 是否开启描边光（边框随光标接近点亮） |
| enableTilt | `boolean` | `false` | 是否开启 3D 倾斜（卡片随光标轻微 tilt） |
| disableAnimations | `boolean` | `false` | 强制关闭所有动画/交互（等价 reduced-motion）；组件也自动尊重系统 prefers-reduced-motion |
| className | `string` | — | 透传到根网格容器的额外 className |
| style | `CSSProperties` | — | 透传到根网格容器的内联样式 |

`MagicBentoItem`：`{ label?, title?, description?: ReactNode; children?: ReactNode; colSpan?: number; rowSpan?: number }` —— 传 `children` 即覆盖 label/title/description 默认布局，自定义卡内结构。

## 示例
```tsx
const items = [
  { label: "Insights", title: "数据洞察", description: "追踪用户行为与漏斗", colSpan: 2 },
  { label: "Overview", title: "总览面板", description: "集中式数据视图" },
  { label: "Teamwork", title: "团队协作", description: "无缝实时协同" },
];

<MagicBento items={items} />

// 自定义发光色（须 --color- 前缀）+ 大聚光
<MagicBento items={items} glowColor="var(--color-chart-2)" spotlightRadius={420} />
```

## 禁忌 / 坑

- [[hulian-token-color-var-needs-color-prefix]]：`glowColor` 必须用 `var(--color-primary)` / `var(--color-chart-2)` 这类带 `--color-` 前缀的真名，裸 `var(--primary)` 在 Tailwind v4 下不解析、光晕变黑或不显。
- `colSpan`/`rowSpan` 受 `columns` 约束，单卡 colSpan 大于 columns 会溢出错位。
- 纯交互动效，无 WebGL；reduced-motion 或 `disableAnimations` 下退化为静态网格。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
