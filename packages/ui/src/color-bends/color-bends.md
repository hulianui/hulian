---
slug: color-bends
name: ColorBends
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [ColorBends]
status: enriched
---

# ColorBends

> 多色流场 WebGL 背景组件 · 正弦折叠噪声场按软阈值带宽采样叠加生成相互弯折的有机色带 + 指针视差/牵引/自动旋转(ogl·主题感知·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要多彩、相互弯折的有机色带流场背景时用（创意落地页、AI 产品 Hero、品牌彩条）。要单色光幕用 [Beams](../beams/beams.md)，要油彩旋涡用 [Balatro](../balatro/balatro.md)，要规则点阵用 [DotPattern](../dot-pattern/dot-pattern.md)；ColorBends 主打多色融合与指针牵引交互，色彩最丰富、参数最多。

## 导入
```ts
import { ColorBends } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | chart token ×5 | 色带颜色数组（最多取前 8 个），可传任意 CSS 颜色字符串；不传吃明暗主题 |
| rotation | `number` | `90` | 静态基准旋转角度（度），决定流场整体朝向 |
| autoRotate | `number` | `0` | 自动旋转角速度（度/秒）；非 0 时随时间持续转动 |
| speed | `number` | `0.2` | 流动速度系数；0=冻结为静态纹理 |
| scale | `number` | `1` | 流场缩放；越小色带越密，越大越舒展 |
| frequency | `number` | `1` | 波纹频率；提升后正弦扰动更密集 |
| warpStrength | `number` | `1` | 扭曲强度，控制色带被波场拉扯变形幅度 |
| iterations | `number` | `1` | 折叠迭代次数（1–5）；越大结构越复杂 |
| intensity | `number` | `1.5` | 整体亮度增益，放大最终颜色 |
| bandWidth | `number` | `6` | 色带宽度软参；越大越窄越锐利 |
| noise | `number` | `0.15` | 颗粒噪声强度，打破塑料感；0=纯净 |
| parallax | `number` | `0.5` | 指针视差影响，营造景深 |
| mouseInfluence | `number` | `1` | 指针牵引强度；0=不响应指针 |
| transparent | `boolean` | `true` | 透明背景（仅渲染色带）；false 时填满黑底 |
| className | `string` | — | 透传到根容器（自带 absolute inset-0 z-0） |
| fallback | `ReactNode` | 渐变兜底 | reduced-motion / 无 WebGL 降级时渲染的内容 |

## 示例
```tsx
// 默认 chart token 多色流场
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ColorBends />
</div>
```
```tsx
// 自定义暖色带 + 自动旋转壁纸级
<ColorBends
  colors={["oklch(0.72 0.22 30)", "oklch(0.78 0.18 60)", "oklch(0.68 0.2 350)"]}
  autoRotate={8}
  intensity={2.2}
  bandWidth={8}
  speed={0.15}
/>
```

## 禁忌 / 坑

- **WebGL 客户端渲染**：依赖 ogl + WebGL，SSR 阶段降级到 `fallback`；勿在 server component 直接挂载。
- **token 颜色须带 `--color-` 前缀**：`colors` 传 CSS 变量须写 `var(--color-chart-1)` 完整名，裸 `var(--chart-1)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- `colors` 最多取前 8 个，多传无效。
- 父容器须 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
