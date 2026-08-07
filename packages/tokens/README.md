# @hulianui/tokens

> **English TL;DR** — The OKLCH design tokens behind [`@hulianui/ui`](https://www.npmjs.com/package/@hulianui/ui): plain CSS files, no JS runtime. Light and dark swap **values, never structure**, so themes switch with zero layout shift. English docs: <https://hulianui.haloritual.com/en/theme>

瑚琏 Hulian 的**主题真源** —— OKLCH 色彩 / 阴影 / 圆角 / 动效曲线的 CSS 变量定义。纯 CSS，零 JS 运行时。

- 主题文档：<https://hulianui.haloritual.com/theme>
- License：MIT

## 什么时候需要单独装它

装 [`@hulianui/ui`](https://www.npmjs.com/package/@hulianui/ui) 时它是必需的对等依赖，按组件库 README 的三步接入即可，通常不必单独关心。

单独用它的场景只有一种：**你不用瑚琏组件，但想要这套主题体系** —— 比如给自研组件、图表、Canvas 或邮件模板一份明暗自适应的色板。这时只引本包，不引组件库。

```bash
pnpm add @hulianui/tokens
```

```css
@import "tailwindcss";
@import "@hulianui/tokens/tokens.css";   /* 原语 + 语义层 */
@import "@hulianui/tokens/preset.css";   /* 把语义变量接进 Tailwind 的 @theme */
```

## 两层结构

| 层 | 文件 | 内容 | 谁消费 |
|---|---|---|---|
| 原语 | `primitives.css` | `--gray-50…950` / `--brand-400…700` / `--danger-*` … 具体色值 | 只被语义层引用 |
| 语义 | `semantic.css` | `--color-bg` / `--color-surface` / `--color-primary` / `--color-danger` … | 组件与业务代码 |

**组件只消费语义层。** 明暗切换发生在语义层：`[data-theme="dark"]` 只换值、不换结构，所以切主题零布局抖动，也不会出现「暗色下某个组件忘了适配」。

`preset.css` 里的 `@theme inline` 把语义变量映射成 Tailwind 的 token，于是 `bg-surface` / `text-muted` / `shadow-lg` 这些工具类天生跟随主题。

## 单独引用某一层

```json
{
  "exports": {
    "./tokens.css": "原语 + 语义，一次引全（推荐）",
    "./preset.css": "Tailwind @theme 接线",
    "./primitives.css": "只要原语色板",
    "./semantic.css": "只要语义层"
  }
}
```

## 几条命名约束

- **Tailwind v4 的 `@theme` 真名带 `--color-` 前缀**：`var(--color-primary)` 才解析，裸 `var(--primary)` 在 SVG 的 `fill` / `stroke` 上会静默失效。
- **`--color-muted` 是次要*文字*色，不是背景色**（这点与 shadcn/ui 相反）。区域底用 `--color-subtle`，悬停态用 `--color-surface-hover`。拿 muted 当背景，亮色下是一块脏灰、暗色下是发白的浅灰 —— 两个主题都错，且 Tailwind 不会报错。
- **`--color-hairline` 只能用于 `border-*`**：它在浅色主题就是 `transparent`，用作 `text-` / `bg-` / `fill-` 会静默隐形。

## License

[MIT](https://github.com/hulianui/hulian/blob/master/LICENSE) © 瑚琏 Hulian
