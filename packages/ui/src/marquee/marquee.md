---
slug: marquee
name: Marquee
category: data-display
group: collection
tags: [animated]
exports: [Marquee]
status: enriched
---

# Marquee

> 跑马灯 · 纯 CSS 无缝循环 + hover 暂停 + 方向 · data-display/collection · #animated

## 何时用

纯 CSS 无缝循环滚动一排内容（logo 墙、技术栈 chip、口碑条），支持横/竖向、渐隐遮罩、hover 暂停。要进入视口逐项淡入的列表用 [AnimatedList](../animated-list/animated-list.md)；要用户能拖拽改顺序用 [Sortable](../sortable/sortable.md)。

## 导入
```ts
import { Marquee } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | `"left"｜"right"` | `"left"` | 滚动方向；`"right"` 经 `animation-direction: reverse` |
| duration | number | 40 | 单轮时长（秒），越大越慢 |
| gap | string | `"1rem"` | 子项间距（CSS 长度） |
| pauseOnHover | boolean | false | 鼠标悬停暂停 |
| repeat | number | 4 | 子项复制份数（窄内容也铺满不露缝） |
| vertical | boolean | false | 竖向滚动；竖向时 `direction="left"` 视为向上、`"right"` 向下 |
| fade | boolean | false | 两端渐隐遮罩（mask-image），适合 logo/图标墙 |
| fadeWidth | string | `"15%"` | 渐隐区宽度（CSS 长度），仅 `fade` 为真时生效 |
| ...div | ComponentPropsWithoutRef\<"div"\> | — | 透传（`className` 控宽/高） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | ReactNode | 滚动子项 |

> 注：showcase controls 里 `duration` 默认演示值为 20、`pauseOnHover`/`fade` 默认演示为 true，仅展示用；组件实际默认值以上表（接口 JSDoc）为准。

## 示例
```tsx
// 横向 · hover 暂停
<Marquee className="w-80" pauseOnHover>
  {items.map((c) => <Chip key={c}>{c}</Chip>)}
</Marquee>

// 图标墙 · 渐隐
<Marquee className="w-80" fade pauseOnHover gap="1.25rem">
  {logos.map((Icon, i) => <LogoTile key={i}><Icon className="size-6" /></LogoTile>)}
</Marquee>

// 竖向
<Marquee className="h-56" vertical fade pauseOnHover>
  {items.map((c) => <Chip key={c}>{c}</Chip>)}
</Marquee>
```

## 禁忌 / 坑

- 横向给外壳定宽（`w-*`）、竖向给定高（`h-*`），否则无可视窗口、循环看不出来。
- 子项过窄时靠 `repeat` 复制铺满才无缝；内容本身很少时调大 `repeat` 防止露缝。
- 纯 CSS 动画，无运行时；`fadeWidth` 只在 `fade` 开启时才生效。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
