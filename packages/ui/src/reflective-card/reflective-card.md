---
slug: reflective-card
name: ReflectiveCard
category: data-display
group: collection
tags: [animated]
exports: [ReflectiveCard]
status: enriched
---

# ReflectiveCard

> 金属反光证件卡 · 对角高光横扫 + 磨砂噪点 + 渐变发丝边框(纯 CSS 零依赖·token·RSC 安全·reduced-motion)，内容可插槽化 · data-display/collection · #animated

## 何时用

需要一张有金属质感、自带高光横扫动画的「证件卡 / 会员卡 / 名片」展示块时用，内置标题/副标题/卡头徽标/卡尾键值的证件版式，传 `children` 可整体替换为自定义内容。要做普通信息卡用 Card；要做定价对比表用 [PricingTable](../pricing-table/pricing-table.md)；要做可翻页的书本展示用 [Book3D](../book-3d/book-3d.md)。

## 导入
```ts
import { ReflectiveCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sheenColor | `string` | `var(--color-foreground)` | 金属高光主色，喂反光层渐变，可传任意 CSS 颜色 |
| baseColor | `string` | `var(--color-chart-1)` | 卡片底色基调，决定金属表面暗部色 |
| speed | `number` | `6` | 高光横扫一轮时长（秒），越大越慢越细腻 |
| roughness | `number` | `0.35` | 表面噪点强度 0–1，0=镜面无颗粒，1=重磨砂 |
| metalness | `number` | `1` | 反光层整体不透明度 0–1，调低让卡面更内敛 |
| className | `string` | — | 透传根容器 className |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 大字号主标题（人名/卡名），留空不渲染标题行 |
| subtitle | `ReactNode` | 标题下方小字说明（职位/等级） |
| badge | `ReactNode` | 卡头左侧徽标文案（默认配锁图标），传 `null` 隐藏整个卡头徽标区 |
| footerLabel | `ReactNode` | 卡尾左侧标注小灰字（如 "ID NUMBER"） |
| footerValue | `ReactNode` | 卡尾左侧的值（等宽字体，如 "8901-2345-6789"） |
| children | `ReactNode` | 自定义主体，传入后完全替换内置证件版式，仅保留反光背景层与边框 |

## 示例

```tsx
// 默认金属证件卡
<ReflectiveCard />

// 暖金色会员卡
<ReflectiveCard
  sheenColor="oklch(0.85 0.16 85)"
  baseColor="var(--color-chart-3)"
  title="JANE SMITH"
  subtitle="PLATINUM MEMBER"
  footerLabel="MEMBER NO."
  footerValue="0042-7781-1190"
/>
```

## 禁忌 / 坑

- 高光与噪点需在较暗背景上才看得清楚；放在浅色容器里效果会变弱，建议外层给暗底舞台。
- 传 `children` 后内置 `title/subtitle/badge/footerLabel/footerValue` 全部失效（仅保留背景与边框），二者不要混用。
- 颜色 token 务必带 `--color-` 前缀（如 `var(--color-chart-1)`），裸 `var(--primary)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
