---
slug: text-cursor
name: TextCursor
category: typography
group: text
tags: [animated]
exports: [TextCursor]
status: enriched
---

# TextCursor

> 光标拖尾文字 · 特效组件 · 在容器内移动光标时沿轨迹按间距落下一串字形并随机微浮动淡出回收（沿方向旋转 / emoji / 自定义间距上限）(零依赖·motion 运行时·reduced-motion 去浮动) · typography/text · #animated

## 何时用

需要鼠标在某区域内划过时留下一串字形/emoji 拖尾（趣味落地页、hero 互动区）时用。它是「光标在容器内移动」的拖尾，要做光标本身的果冻形态用 [BlobCursor](../blob-cursor/blob-cursor.md)；要逐字符压感形变用 [TextPressure](../text-pressure/text-pressure.md)。

## 导入
```ts
import { TextCursor } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLDivElement>, "children">`，额外：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text | `string` | `"瑚"` | 跟随光标拖出的字形；可传短字符串或 emoji（如 `"✨"`） |
| spacing | `number` | `80` | 相邻字形最小像素间距；光标每移动满 spacing 才落一个新字形，越小越密 |
| followMouseDirection | `boolean` | `true` | 字形是否沿移动方向旋转对齐（atan2）；关则保持水平 |
| randomFloat | `boolean` | `true` | 字形落定后随机微浮动（位移+轻旋呼吸）；reduced-motion 下自动停用仅保留淡出 |
| exitDuration | `number` | `0.5` | 字形淡出秒数（opacity 过渡时长） |
| removalInterval | `number` | `30` | 拖尾消减轮询间隔（ms）；光标静止 ~100ms 后每隔该值从队首移除一个字形 |
| maxPoints | `number` | `5` | 同时存在的字形上限，超出丢弃最旧 |
| fontSize | `string` | `"1.875rem"` | 字号（任意 CSS 长度） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 容器内居中内容（提示语/标题），不影响拖尾层 |

## 示例
```tsx
// 默认：在区域内移动光标即留「瑚」字拖尾
<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor>
    <p className="text-sm text-muted">在此区域内移动光标 →</p>
  </TextCursor>
</div>

// emoji + 大间距（稀疏拖尾）
<TextCursor text="✨" spacing={130} />
```

## 禁忌 / 坑

- 父容器必须有明确高度且 `overflow-hidden`、自身是定位上下文：拖尾层是绝对定位铺满容器，无高度则不可见。
- 拖尾只在「容器内」移动光标时落字，光标移出容器即停止并逐渐回收。
- reduced-motion 下去掉随机浮动，字形落定后仅做淡出。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
