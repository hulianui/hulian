---
slug: accent-scope
name: AccentScope
category: layout
group: container
tags: []
exports: [AccentScope]
status: enriched
---

# AccentScope

> 给一块区域换主色的色相，子树里的组件自动跟着变 · layout/container

## 何时用

页面某一块要换主题色（营销页的主题色轮换、按业务线区分色调的分区、预览换色效果），且只换这一块、不动全站。子树里主色、hover、浅底（`-subtle`）、浅边（`-border`）、焦点环与图表色板 `chart-1..6` 一起换色相；**明度与彩度沿用品牌梯子**，任何色相下对比度与层级都和品牌原色一致。

全站明暗切换用 [ThemeProvider](../theme/theme.md)；整站换品牌色改 tokens 的 `--brand-*`，不用本组件。

## 导入
```ts
import { AccentScope } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| hue | `number` | — | 子树主色的 OKLCH 色相（0–360），只换色相。省略时取 tokens 注册的初值 258（品牌原色） |
| transition | `number` | `0` | 换色相时的过渡时长（毫秒），`0` 为瞬时换色。过渡的是 `--hl-accent-hue` 一个变量，子树派生色同步渐变 |
| theme | `"light" \| "dark"` | — | 把主题写在作用域同一个元素上，只在「暗页 > 亮色岛 > 作用域」这类嵌套里需要 |

> 继承 `ComponentPropsWithoutRef<"div">`。

## 示例
```tsx
<AccentScope hue={165}>
  <Button>主操作</Button>
  <Tag tone="brand">标签</Tag>
</AccentScope>

// 色相由状态驱动，整块同步渐变
const [hue, setHue] = useState(258);
<AccentScope hue={hue} transition={900}>…</AccentScope>

// 自己算衍生色时读同一个变量
<span style={{ color: "oklch(0.62 0.17 calc(var(--hl-accent-hue) + 45))" }} />
```

## 禁忌 / 坑

- 派生规则在 `@hulianui/tokens` 的 `semantic.css` 里（`[data-accent-scope]` 块），项目必须引了 tokens 的样式才生效；只渲染本组件、没有 tokens 时只是一个普通 div。
- 子元素不要再给 `--hl-accent-hue` 挂 transition：继承值每帧变化会让子元素重起一段过渡，变色拖尾。过渡只挂在作用域上（`transition` prop）。
- 「暗页 > 亮色岛 > 作用域」的嵌套里，祖先的两条主题选择器特异性相同、按源码顺序落到暗色；此时给本组件传 `theme="light"`。

## 相关
[ThemeProvider](../theme/theme.md) · [Spotlight](../spotlight/spotlight.md)
