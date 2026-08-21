---
slug: spinner
name: Spinner
category: feedback
group: loading
tags: []
exports: [Spinner, spinnerVariants]
status: enriched
---

# Spinner

> 加载旋转器 · 纯 CSS animate-spin SVG 环 + role=status + 本地化读屏文案 · feedback/loading

## 何时用

需要一个裸的加载旋转图标时用（按钮内、行内、空状态占位）：纯 CSS `animate-spin` SVG 环，带 `role=status`，零交互。需要遮罩/包裹内容区/整页加载用 [Spin](../spin/spin.md)；已知进度用 [Progress](../progress/progress.md)。

## 导入
```ts
import { Spinner, spinnerVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸 |
| tone | `"primary"｜"current"｜"muted"` | `"primary"` | 配色（`current`=继承 currentColor，适合放进彩色按钮内） |
| label | `string` | 跟随 `ConfigProvider` | a11y 文案（role=status 读屏播报）；显式传值优先 |
| className | `string` | - | 容器类名 |

## 示例
```tsx
// 默认
<Spinner />

// 放进主色按钮内（继承文字色）
<Button>
  <Spinner size="sm" tone="current" />
  提交中
</Button>
```

## 禁忌 / 坑

- `tone="current"` 才继承 `currentColor`——放进彩色按钮/链接内想随文字色变时用它，默认 `primary` 是固定主色。
- 它无 `spinning` 开关，渲染即转；要按状态控制显隐自行 `{loading && <Spinner />}`，或用 [Spin](../spin/spin.md) 的 `spinning` prop。
- 暂无其它已知坑。

## 相关
[Spin](../spin/spin.md) · [Progress](../progress/progress.md) · [Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md)
