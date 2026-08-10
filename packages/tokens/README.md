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

`preset.css` 里的 `@theme inline` 把语义变量映射成 Tailwind 的 token，于是 `bg-surface` / `text-muted-foreground` / `shadow-lg` 这些工具类天生跟随主题。

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
- **命名与 shadcn/ui 对齐**：`--color-muted` 是弱**背景**（等价 `--color-subtle`），`--color-muted-foreground` 才是次要**文字**色。`@hulianui/tokens` 0.7.0（= `@hulianui/ui` 0.28.0）之前这两个名字在瑚琏这边是反的，从 shadcn 迁过来会满屏变色；现在是零改动。原先的 `text-muted` 已无对应 token，**Tailwind 对未定义颜色既不报错也不生成规则**，写了会静默回退成继承色 —— 用 `npx hulian-check` 逐条列出来改，别靠肉眼。
- **`--color-hairline` 只能用于 `border-*`**：它在浅色主题就是 `transparent`，用作 `text-` / `bg-` / `fill-` 会静默隐形。
- **浅档走 `-subtle` / `-border`**：提示条底、选中行、Tag 浅底用 `bg-primary-subtle` + `border-primary-border`（`danger` / `success` / `warning` 同构）。别自己拿主色 `mix()` 到白色派生 —— 暗色主题下「浅底」的方向是变深不是变浅，对白 mix 必错。

## 不用 Tailwind 也能只吃令牌

`tailwindcss` 是**可选**对等依赖：四个入口里只有 `preset.css` 需要 Tailwind v4，
`tokens.css` / `primitives.css` / `semantic.css` 都是纯 CSS 自定义属性。

所以 Vue 2 + Element UI、纯 CSS 项目、还没升到 v4 的存量仓库可以直接：

```bash
npm i @hulianui/tokens          # 不会再 ERESOLVE
```

```css
@import "@hulianui/tokens/tokens.css";   /* 只要变量，不引 Tailwind */
```

拿到的是 `var(--color-primary)` 这一层，`[data-theme="dark"]` 照常切换；
`bg-primary` 这类**工具类**才需要 `preset.css`（那时才需要 Tailwind v4）。

## License

[MIT](https://github.com/hulianui/hulian/blob/master/LICENSE) © 瑚琏 Hulian
