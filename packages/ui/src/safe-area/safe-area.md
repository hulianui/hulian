---
slug: safe-area
name: SafeArea
category: mobile
group: layout
tags: []
exports: [SafeArea]
status: enriched
---

# SafeArea

> 安全区适配 · env(safe-area-inset-*) 作 padding/margin 应用到指定边 + min 兜底 + as 多态(零依赖·RSC·刘海/底部横条) · mobile/layout

## 何时用

页面边缘内容（顶栏避刘海、底栏避 Home 横条）需要避开设备安全区时用，纯布局原语。底部主导航直接用 [TabBar](../tab-bar/tab-bar.md)（已内置吃安全区）；只有自定义贴边元素才单独包 SafeArea。

## 导入
```ts
import { SafeArea } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `edges` | `SafeAreaEdge[] \| "all" \| "vertical" \| "horizontal"` | `"all"` | 应用哪几条安全区 inset；`SafeAreaEdge = "top"\|"right"\|"bottom"\|"left"` |
| `mode` | `"padding" \| "margin"` | `"padding"` | padding=撑开自身，margin=外推 |
| `min` | `number \| string` | `0` | 每条 inset 的最小值（数字=px 或任意 CSS 长度），env 取不到时兜底 |
| `as` | `ElementType` | `"div"` | 多态根元素 |

> 继承 `HTMLAttributes<HTMLElement>`（className、style、children 等可透传）。

## 示例
```tsx
<SafeArea edges="all" min={0}>
  <Content />
</SafeArea>
```

## 禁忌 / 坑
- 桌面端 `env(safe-area-inset-*)` 恒为 0，要在非刘海设备上看到留白须给 `min`（如 `min={16}`）兜底——这也是真机无安全区时的兜底间距。
- `min` 给数字按 px，也可传任意 CSS 长度字符串（如 `"1rem"`）。

## 相关
[TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md)
