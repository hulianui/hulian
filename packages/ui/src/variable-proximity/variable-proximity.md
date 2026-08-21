---
slug: variable-proximity
name: VariableProximity
category: typography
group: text
tags: [animated]
exports: [VariableProximity]
status: enriched
---

# VariableProximity

> 邻近可变字体 · 鼠标邻近驱动的逐字可变字体文本 · 按距离插值 font-variation-settings（wght/opsz 等轴）+ linear/exponential/gaussian 三档衰减（零依赖 RAF · reduced-motion 定格 from · sr-only 完整朗读） · typography/text · #animated

## 何时用

需要文字按鼠标到每个字形的距离实时插值可变字体轴（wght/opsz 等），且要指定容器坐标系与衰减曲线时用。它面向「可变字体轴插值」，支持 from/to 任意轴；要更轻量的压感标题（系统字体兜底、scaleX 模拟）用 [TextPressure](../text-pressure/text-pressure.md)；要乱码解密入场用 [Shuffle](../shuffle/shuffle.md)。

## 导入
```ts
import { VariableProximity } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| label* | `string` | - | 渲染文本（按词与字拆分，空格保留为不可断词隙）；sr-only 副本完整朗读 |
| fromFontVariationSettings* | `string` | - | 鼠标远端时的可变轴设置，如 `"'wght' 400, 'opsz' 9"`（需可变字体才有视觉变化） |
| toFontVariationSettings* | `string` | - | 鼠标贴近时的目标轴设置，逐轴向此插值；缺省轴回退到 from 值 |
| containerRef | `RefObject<HTMLElement \| null>` | - | 计算鼠标相对坐标的参照容器；缺省回退到视口坐标 |
| radius | `number` | `50` | 影响半径（px）；超出则恢复 from 设置 |
| falloff | `"linear" \| "exponential" \| "gaussian"` | `"linear"` | 衰减曲线；exponential 更陡、gaussian 中心更聚拢柔和 |
| className | `string` | - | 合并到根 span 的额外类名 |
| style | `CSSProperties` | - | 合并到根 span 的内联样式 |

> 注：showcase controls 默认演示用 `radius={90}`，但接口默认值为 `50`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `React.MouseEventHandler<HTMLSpanElement>` | 点击根 span 的回调 |

## 示例
```tsx
function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <VariableProximity
        label="把鼠标移到这里 Hover me"
        fromFontVariationSettings="'wght' 400, 'opsz' 9"
        toFontVariationSettings="'wght' 900, 'opsz' 40"
        containerRef={ref}
        radius={90}
        falloff="linear"
        className="text-3xl font-medium"
      />
    </div>
  );
}
```

## 禁忌 / 坑

- 视觉变化依赖真正的可变字体：`from/to` 里写的轴（如 `wght`/`opsz`）必须是当前字体真实支持的轴，否则鼠标靠近无变化。这是字体能力限制，不是组件 bug。
- `containerRef` 决定距离坐标系：不传则按视口坐标算距离，文字在页面中部时手感会偏；通常应指向包裹本组件的盒子。
- `toFontVariationSettings` 只插值 `from` 中出现的轴，from 没列的轴不会变。
- reduced-motion 下定格在 from 设置，不随鼠标插值。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
