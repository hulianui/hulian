---
slug: falling-text
name: FallingText
category: typography
group: text
tags: [animated]
exports: [FallingText]
status: enriched
---

# FallingText

> 文字散落 · 文字按词散落物理特效 · 触发后逐词受重力下落/撞墙反弹堆叠 + 指针拖拽抛掷(零依赖 RAF 自写二维刚体·token·reduced-motion) · typography/text · #animated

## 何时用

落地页彩蛋 / 互动 banner 想让一句话按词「散架掉落」并可拖拽抛玩时用。要平滑入场浮现/错峰用 ScrollFloat、Reveal；FallingText 是把每个词当独立刚体做重力碰撞的重交互特效，仅适合短句、装饰互动位。

## 导入
```ts
import { FallingText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text | `string` | `""` | 整段文本，按空格切「词块」，每词一个独立刚体下落 |
| highlightWords | `string[]` | `[]` | 需高亮的词(前缀匹配：词 startsWith 任一即高亮) |
| highlightClass | `string` | `"text-primary font-semibold"` | 高亮词额外 className(叠加在词块上) |
| trigger | `"auto" \| "scroll" \| "click" \| "hover"` | `"auto"` | 掉落时机：挂载即播/滚入视口/点击容器/指针移入 |
| gravity | `number` | `1` | 向下加速度系数，越大下落越快堆叠越急，建议 0.3-3 |
| bounce | `number` | `0.6` | 落地/撞墙反弹系数(0 不弹，1 全弹) |
| fontSize | `string` | `"1.5rem"` | 文本字号(CSS 长度，传入根 fontSize) |
| className | `string` | - | 透传根容器额外 className |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## 示例
```tsx
// 默认：自动掉落 + 高亮词
<FallingText
  text="瑚琏 组件库 企业级 高质量 原生适配 token 主题"
  highlightWords={["瑚琏", "token"]}
  className="text-white/90"
  fontSize="1.5rem"
/>

// 点击触发 + 高重力低反弹(迅速堆叠)
<FallingText text="点我 让 文字 散落 下来" trigger="click" gravity={2.4} bounce={0.2} />
```

## 禁忌 / 坑

- 词块按空格切分：中文要靠手动空格分词（如 `"瑚琏 组件库 企业级"`），不空格会整段当一个刚体。
- highlightWords 是前缀匹配（startsWith），不是全等，注意误命中相同前缀的词。
- 默认 `text=""` 不渲染任何词，忘传 text 会得到空舞台。
- reduced-motion 下不做物理掉落动画；别把它当核心内容的唯一呈现方式。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
