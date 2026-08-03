---
slug: button-group
name: ButtonGroup
category: forms
group: button
tags: []
exports: [ButtonGroup]
status: enriched
---

# ButtonGroup

> 按钮组 · 把若干 Button 连排成一体(抹内侧圆角/合并相邻边框/hover 项抬层) 或分离编组 + 横竖向 · 工具栏分段/拆分按钮/步进器(纯布局壳·不接管子按钮变体) · forms/button

## 何时用

把多个相关 [Button](../button/button.md) 编为一组：工具栏分段、拆分按钮（主操作 + 更多）、步进器（减/数/加）。`attached`（默认）让子按钮贴合成一体；想要语义分组但保留间距用 `attached={false}`。它只是纯布局壳，不接管子按钮的 `variant`/`size`——子按钮变体仍各自传。单个独立按钮直接用 Button。

## 导入
```ts
import { ButtonGroup } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| orientation | `"horizontal" ｜ "vertical"` | `"horizontal"` | 主轴方向 |
| attached | `boolean` | `true` | true=子按钮贴合成一体（抹内侧圆角/合并边框/hover 抬层）；false=留 gap 仅作语义分组 |
| gap | `"sm" ｜ "md"` | `"sm"` | 子项间距档（仅 `attached={false}` 生效） |
| className | `string` | — | 透传根节点类名 |
| aria-label | `string` | — | 组的无障碍标签 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 一般放若干 `<Button>`；也可混入 Dropdown/Tooltip 包裹的按钮 |

## 示例
```tsx
<ButtonGroup aria-label="对齐方式">
  <Button variant="outline" size="icon" aria-label="左对齐"><AlignLeft className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="居中"><AlignCenter className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="右对齐"><AlignRight className="size-4" /></Button>
</ButtonGroup>
```
```tsx
{/* 拆分按钮：主操作 + 更多 */}
<ButtonGroup aria-label="保存">
  <Button>保存</Button>
  <Button size="icon" aria-label="更多保存选项"><ChevronDown className="size-4" /></Button>
</ButtonGroup>
```

## 禁忌 / 坑

- **成员必须同高，连排态尤其**。连排是靠 `-ml-px` 把相邻按钮的边框叠在一起实现的，这个拼接假定所有成员等高；高度一旦不一致，矮的那些上下就会露出台阶。而 [Button](../button/button.md) 的尺寸档里 **`icon`（36px）没有等高的文字档**——文字档是 `sm` 32 / `md` 40 / `lg` 48。所以 `size="icon"` 与任何带文字的按钮混排都会错位。要图标 + 文字混排，用**等高的一对**：`iconSm`(32) 配 `sm`(32)，或给 icon 按钮显式贴高度去对齐 `md`。
- 上一条**看代码是发现不了的**：三个按钮都写 `variant="outline"`、都不传或只有一个传 `size`，读起来很整齐，只有渲染出来才看得见中间那个高出 4px。典型场景是 `−/数值/+` 步进器。
- `gap` 仅在 `attached={false}` 时生效；连排态（`attached`）由组件自行抹圆角/合并边框，不要再给子按钮加外边距。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [SocialButton](../social-button/social-button.md)
