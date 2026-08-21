---
slug: magic-card
name: MagicCard
category: data-display
group: collection
tags: [animated]
exports: [MagicCard]
status: enriched
---

# MagicCard

> 魔法卡片 · 鼠标跟随径向高光(motion) + surface token · data-display/collection · #animated

## 何时用

给单张卡片加鼠标跟随的径向高光，用于落地页/特性墙里需要一点交互质感的容器。要一组错落特性卡片用 [BentoGrid](../bento-grid/bento-grid.md)；要静态信息卡片直接用普通 Card 即可，不必引入这个带运动监听的组件。

## 导入
```ts
import { MagicCard } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gradientSize | number | 200 | 高光半径（px） |
| gradientColor | string | `var(--color-primary)` | 高光色 |
| gradientOpacity | number | 0.15 | 高光不透明度 |
| ...div | ComponentPropsWithoutRef\<"div"\> | - | 透传（`className` 控尺寸） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | ReactNode | 卡片内容 |

## 示例
```tsx
<MagicCard className="h-44 w-72">
  <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
    <span className="text-lg font-semibold text-foreground">Magic Card</span>
    <span className="text-sm text-muted-foreground">把鼠标移上来看高光</span>
  </div>
</MagicCard>
```

## 禁忌 / 坑

- 依赖鼠标 `pointermove`（motion 驱动），是客户端组件——在纯触屏/无指针环境高光不会触发，仅作渐进增强。
- 高光色默认 `var(--color-primary)`；若自定义 `gradientColor` 走裸 `var(...)`，注意瑚琏色彩 token 须带 `--color-` 前缀才解析（[[hulian-token-color-var-needs-color-prefix]]）。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
