---
slug: ascii-text
name: ASCIIText
category: typography
group: text
tags: [animated]
exports: [ASCIIText]
status: enriched
---

# ASCIIText

> 把文字渲染成 ASCII 字符画 · canvas2d 逐像素亮度采样映射字符 + 正弦波动位移 + 鼠标驱动 hue-rotate 色相（零依赖去 three.js·token·reduced-motion） · typography/text · #animated

## 何时用

Hero / 404 / 极客风装饰位想把一句短文渲染成跳动的字符画时用。要的是平滑渐变发光质感（AuroraText）或闪过的高光（AnimatedShinyText）就用那两个；ASCIIText 是把字形彻底拆成字符网格的重特效，仅适合短文本、装饰位。

## 导入
```ts
import { ASCIIText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text | `string` | `"瑚琏"` | 要转成字符画的文本，先渲染到离屏 canvas 再按像素亮度逐格映射字符 |
| asciiFontSize | `number` | `8` | 字符画字号(px)，决定网格密度；越小越密越费算力，建议 6–14 |
| textFontSize | `number` | `160` | 离屏源文本字号(px)，越大采样分辨率越高；与 asciiFontSize 比值≈字符列数 |
| textColor | `string` | `var(--color-foreground)` | 源文本填充色，喂给 canvas fillStyle，须可被 canvas 解析 |
| enableWaves | `boolean` | `true` | 字符网格按行做正弦相位偏移营造飘动；reduced-motion 下强制静止 |
| enableHue | `boolean` | `true` | 指针相对中心的角度驱动 hue-rotate 色相旋转；关闭则保持单一色相 |
| charset | `string` | 经典 70 级 ramp | 字符亮度坡道(暗→亮)，索引越大代表越亮的像素，可传自定义风格化 |
| className | `string` | — | 透传根容器额外 className |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## 示例
```tsx
// 默认：波动 + 鼠标色相，主色字符
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ASCIIText text="瑚琏" className="text-[color:var(--color-chart-1)]" />
</div>

// 静态：关波动、关色相，高密度细节
<ASCIIText text="代码" enableWaves={false} enableHue={false} asciiFontSize={6} textFontSize={200} />
```

## 禁忌 / 坑

- canvas2d 重绘：仅适合短文本装饰位，长串字符会让网格列数暴涨、逐帧采样吃满算力。
- textColor 喂的是 canvas fillStyle，须是 canvas 能解析的颜色值；想随主题变可走默认 token，自定义传裸值不会随明暗切换。
- reduced-motion 下波动强制静止（DOM 不变，仅停动画），别依赖动画状态做判断。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
