---
slug: decrypted-text
name: DecryptedText
category: typography
group: text
tags: [animated]
exports: [DecryptedText]
status: enriched
---

# DecryptedText

> 乱码解码 · 字符翻滚后逐位解码到明文 + view/hover 触发(随机仅客户端 effect 避 hydration mismatch · 等宽 tabular-nums 防抖 · aria-label 明文) · typography/text · #animated

## 何时用

科技/安全/黑客感场景里让文本先翻滚乱码再逐位解码到明文，强调「解密揭示」的戏剧性。要做平滑的模糊对焦用 [BlurText](../blur-text/blur-text.md)；要做 RGB 错位故障撕裂用 [GlitchText](../glitch-text/glitch-text.md)；普通逐字进场用 [SplitText](../split-text/split-text.md)。

## 导入
```ts
import { DecryptedText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text * | `string` | — | 目标明文 |
| speed | `number` | `55` | 每次乱码刷新间隔毫秒 |
| animateOn | `"view" \| "hover"` | `"view"` | 触发方式：view 滚入视口一次性解码 / hover 悬停解码、移出复位 |
| characters | `string` | 大小写字母+数字+符号 | 乱码取样字符集 |

其余 `<span>` 原生属性透传。

## 示例
```tsx
<DecryptedText text="Decrypting access..." className="text-2xl font-semibold text-foreground" />

<DecryptedText
  text="Hover to decrypt"
  animateOn="hover"
  className="text-2xl font-semibold text-primary"
/>
```

## 禁忌 / 坑

- 乱码取样是随机的，仅在客户端 effect 里跑，避免 SSR/hydration mismatch（服务端首帧呈明文）。
- 内部用等宽 `tabular-nums` 防止翻滚时宽度抖动；自定义 `className` 别覆盖等宽设定，否则字符乱跳。
- 暂无其他已知坑。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
