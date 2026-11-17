---
slug: icon-tile
name: IconTile
category: data-display
group: info
tags: []
exports: [IconTile, iconTileVariants]
status: enriched
---

# IconTile

> 把一个图标放进带底色的小方块，排在功能 / 通知文字的左边 · data-display/info

## 何时用

功能列表、通知流、产品线卡片、设置项里「图标 + 一段文字」最左边那一格。三档尺寸、三档变体、六档语义色与任意分类色。只要一个裸图标就直接放图标；要头像（人 / 账号）用 [Avatar](../avatar/avatar.md)；要品牌徽章用 [Brand](../brand/brand.md)。

## 导入
```ts
import { IconTile } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"brand" \| "neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"brand"` | 语义色档，与 Tag / Button 同一口径 |
| variant | `"soft" \| "solid" \| "outline"` | `"soft"` | `soft` 浅语义底 + 语义色图标；`solid` 实心语义底 + 前景色图标；`outline` 中性描边卡面底，只有图标带语义色 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 32 / 36 / 40px，圆角与图标尺寸随档 |
| color | `string` | - | 分类色：语义色名（`chart-3` …）、任意 CSS 色或 `var(--color-*)`，覆盖 `tone`，三档变体都从它派生 |

> 继承 `<span>` 原生属性。默认 `aria-hidden`（旁边总有文字说明）；要单独表意时传 `role="img"` + `aria-label`。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 图标（lucide 等 SVG），尺寸由组件按档给 |

## 示例
```tsx
<div className="flex gap-4">
  <IconTile size="lg"><Plug /></IconTile>
  <div>
    <Text weight="semibold">MCP 服务</Text>
    <Text size="sm" tone="muted">一行命令装上，助手查 props 而不是猜 props。</Text>
  </div>
</div>

// 选中 / 未选中两态：主色实底 vs 中性浅底
<IconTile tone={active ? "brand" : "neutral"} variant={active ? "solid" : "soft"}><Component /></IconTile>

// 分类色（通知流按事件类别区分）
<IconTile variant="solid" color="chart-4"><MessageCircle /></IconTile>
```

## 禁忌 / 坑

- 图标尺寸由组件按档给（`[&>svg]`），图标上不要再写 `size-*` 类，否则各档尺寸对不齐。
- 默认 `aria-hidden`：它是装饰，语义由旁边的文字承担；单独出现、需要读屏念出来时才传 `role="img"` + `aria-label`。

## 相关
[Avatar](../avatar/avatar.md) · [Brand](../brand/brand.md) · [Tag](../tag/tag.md) · [StatusDot](../status-dot/status-dot.md)
