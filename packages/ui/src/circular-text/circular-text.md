---
slug: circular-text
name: CircularText
category: typography
group: text
tags: [animated]
exports: [CircularText]
status: enriched
---

# CircularText

> 环形文字 · 每字按等分角排到圆周 + 整体匀速自转 + 悬停调速(加速/减速/暂停/抓狂 · 颜色继承 currentColor · reduced-motion 静态) · typography/text · #animated

## 何时用

徽章/印章/旋转 logo 场景把文本按等分角排到圆周并匀速自转，悬停可调速。要做平铺逐字进场用 [SplitText](../split-text/split-text.md)；要故障撕裂用 [GlitchText](../glitch-text/glitch-text.md)；普通静态标题用 [Heading](../heading/heading.md)。

## 导入
```ts
import { CircularText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text * | `string` | — | 环绕排布的文本，建议尾部加分隔符（如 `✦`）让首尾衔接更顺 |
| spinDuration | `number` | `20` | 转一圈秒数 |
| onHover | `"speedUp" \| "slow" \| "pause" \| "goBonkers"` | `"speedUp"` | 悬停行为：加速 / 减速 / 暂停 / 抓狂 |
| radius | `number` | `80` | 文字所在圆半径像素 |

其余 `<div>` 原生属性透传。文字颜色继承 `currentColor`，用 `text-*` 工具类着色。

## 示例
```tsx
<CircularText
  text="瑚琏 · HULIAN UI · 设计系统 · "
  className="text-sm font-semibold tracking-widest text-primary"
/>

<CircularText
  text="★ HULIAN ★ STUDIO ★ "
  spinDuration={14}
  onHover="goBonkers"
  radius={64}
  className="text-xs font-bold tracking-[0.2em] text-background"
/>
```

## 禁忌 / 坑

- `text` 首尾会衔接成环：结尾建议补分隔符（` · ` / `✦` / `★`），否则末字与首字直接相贴。
- 颜色继承 `currentColor`，必须靠 `text-*` 类或父级 color 着色，没有独立颜色 prop。
- 尊重 `prefers-reduced-motion`：开启减弱动效时静止不自转。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
