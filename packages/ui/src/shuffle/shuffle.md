---
slug: shuffle
name: Shuffle
category: typography
group: text
tags: [animated]
exports: [Shuffle]
status: enriched
---

# Shuffle

> 洗牌解密文字 · 逐字「洗牌解密」文本动画 · 字位先滚乱码再按方向顺序锁定真字 + 视口/悬停/循环触发(零依赖 rAF·reduced-motion 直落终态·token 着色) · typography/text · #animated

## 何时用

需要标题/短句以「乱码滚动→逐字解密」入场（终端、解密、黑客风）时用。要逐字符随鼠标距离形变用 [TextPressure](../text-pressure/text-pressure.md)；要彩色渐变流光用 [AuroraText](../aurora-text/aurora-text.md)；只是普通排版文字用 [Text](../text/text.md)。

## 导入
```ts
import { Shuffle } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text* | `string` | — | 最终呈现的文本（解析目标） |
| duration | `number` | `0.6` | 整段洗牌时长（秒）；每字解析点 = 字索引/总字数 × duration |
| shuffleDirection | `"left" \| "right"` | `"right"` | 字符解析顺序；left 从右往左定、right 从左往右定 |
| scrambleCharset | `string` | 大写字母+数字+少量符号 | 解析前每字位随机取字闪烁的乱码字符集 |
| loop | `boolean` | `false` | 解析完成后是否清空重洗循环 |
| loopDelay | `number` | `1` | 循环间隔（秒，仅 loop 时生效） |
| triggerOnView | `boolean` | `true` | 是否进入视口才触发（IntersectionObserver） |
| triggerOnce | `boolean` | `true` | triggerOnView 时进入视口是否只触发一次 |
| triggerOnHover | `boolean` | `false` | 鼠标移入时重新洗牌（动画空闲才响应） |
| tag | `"p" \| "span" \| "div" \| "h1" \| "h2" \| "h3" \| "h4"` | `"p"` | 渲染标签 |
| textAlign | `CSSProperties["textAlign"]` | `"center"` | 文本对齐 |
| className | `string` | — | 合并到根元素的类名 |
| style | `CSSProperties` | — | 行内样式（与 textAlign 合并） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onShuffleComplete | `() => void` | 解析完成回调（loop 时每轮结束都触发） |

## 示例
```tsx
// 悬停重洗（关掉视口触发，靠 hover 主动触发）
<Shuffle
  text="HULIAN"
  triggerOnView={false}
  triggerOnHover
  className="text-3xl font-semibold tracking-wide"
/>

// 循环 + 自定义字符集（十六进制感）
<Shuffle
  text="0xC0FFEE"
  loop
  loopDelay={1.2}
  scrambleCharset="0123456789ABCDEF"
  duration={0.7}
  triggerOnView={false}
/>
```

## 禁忌 / 坑

- `triggerOnView` 默认 `true`：组件不在视口内永远不会播放。在固定可见的舞台里调试时记得关掉它（`triggerOnView={false}`），否则会以为没生效。
- `triggerOnHover` 仅在动画空闲时响应，洗牌进行中再移入不会打断重洗。
- reduced-motion 下直接落到终态文本，不播放洗牌——无障碍友好，但视觉演示需注意系统设置。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
