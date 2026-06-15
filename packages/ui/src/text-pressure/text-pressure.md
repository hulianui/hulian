---
slug: text-pressure
name: TextPressure
category: typography
group: text
tags: [animated]
exports: [TextPressure]
status: enriched
---

# TextPressure

> 逐字符"压感"标题 · 字形随鼠标距离实时插值字重/宽度/倾斜 + 透明度(零依赖 RAF·token 配色·reduced-motion·系统字体兜底) · typography/text · #animated

## 何时用

需要大标题随鼠标靠近做逐字字重/宽度/倾斜「压感」形变（hero 主标题、互动品牌字）时用。它响应「距离」做轴插值；要随鼠标距离插值可变字体轴并支持容器坐标系/三档衰减用 [VariableProximity](../variable-proximity/variable-proximity.md)；要乱码解密入场用 [Shuffle](../shuffle/shuffle.md)。

## 导入
```ts
import { TextPressure } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text | `string` | `"Compressa"` | 渲染文字（逐字符响应鼠标压力形变） |
| fontFamily | `string` | 系统无衬线栈 | 字体族；系统字体下用 scaleX+font-weight+opacity 模拟压感，传入真可变字体则驱动 font-variation-settings |
| fontUrl | `string` | — | 自定义 @font-face 字体 URL；默认不注入远程字体（遵守禁远程资源门禁），仅显式传本地/自托管地址时注入 |
| width | `boolean` | `true` | 是否驱动 wdth 轴 + scaleX 模拟横向挤压 |
| weight | `boolean` | `true` | 是否驱动 wght 轴 / font-weight 随接近度变粗 |
| italic | `boolean` | `true` | 是否驱动 ital 轴（仅可变字体生效） |
| alpha | `boolean` | `false` | 是否驱动 opacity（接近时更不透明） |
| flex | `boolean` | `true` | 是否用 flex space-between 横向铺满字符 |
| stroke | `boolean` | `false` | 是否描边（字心透明 + token 描边色，空心轮廓） |
| scale | `boolean` | `false` | 是否纵向拉伸字块填满容器高度 |
| textColor | `string` | `var(--color-foreground)` | 文字颜色（明暗自适配） |
| strokeColor | `string` | `var(--color-primary)` | 描边颜色（stroke=true 时生效） |
| minFontSize | `number` | `24` | 最小字号（px），容器较窄时下限 |
| className | `string` | — | 透传到根 div（cn 合并） |

## 示例
```tsx
// 默认：移入鼠标看逐字压感
<TextPressure text="Compressa" className="flex items-center" />

// 描边空心（token primary 描边）
<TextPressure
  text="Hulian"
  stroke
  strokeColor="var(--color-primary)"
  className="flex items-center"
/>
```

## 禁忌 / 坑

- `width`/`italic` 轴需真正的可变字体（含 wght/wdth/ital 轴）才有完整效果；系统字体下 width 退化为 scaleX 模拟、italic 基本无效。这是字体能力限制，不是 bug。
- 喂给 `strokeColor`/`textColor` 的 token 必须带 `--color-` 前缀（如 `var(--color-primary)`），裸 `var(--primary)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- 默认不注入远程字体；要用自托管可变字体须显式传 `fontUrl`。
- reduced-motion 下不随鼠标形变。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
