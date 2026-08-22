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
    "./preset.css": "Tailwind @theme 接线（= core + opinionated 聚合入口）",
    "./preset-core.css": "只要颜色映射 / 断点 / hulian-* 关键帧（纯加法）",
    "./preset-opinionated.css": "dark variant / 阴影 / 缓动这三处全局接管",
    "./primitives.css": "只要原语色板",
    "./semantic.css": "只要语义层"
  }
}
```

## 渐进接入：`preset.css` 拆成了两层

新项目照旧引 `preset.css` 一份，**行为与拆分前逐字节相同**，什么都不用改。

下面这段是给**存量项目**的。`preset.css` 里的内容按风险分成两类，拆成了两个可独立引入的文件：

| 入口 | 内容 | 性质 |
|---|---|---|
| `preset-core.css` | 语义 token → `--color-*` 映射、断点、42 个 `hulian-*` 关键帧 | **纯加法**：全是新增 token / 新增关键帧，`hulian-` 前缀不撞名，断点与 Tailwind 默认同值 |
| `preset-opinionated.css` | `@custom-variant dark`、`--shadow-sm..2xl` 重绑、`--ease-*` 与默认过渡曲线重绑 | **接管**：改变项目里已有的 `dark:` / `shadow-*` / 裸 `transition` 的行为 |

组件库要正常显示，只需要 `preset-core.css`。所以存量项目可以：

```css
@import "tailwindcss";
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset-core.css";   /* 先只要这一份 */
/* @import "@hulianui/tokens/preset-opinionated.css";  ← 换完组件、准备统一视觉语言时再放开 */
```

代价是：瑚琏组件的阴影会走 Tailwind 默认那套（不随明暗切值），动效走 Tailwind 内置缓动，
暗色要靠你自己那套 `dark:` 机制驱动 —— 三样都是「看起来不完全是瑚琏的样子」，不是坏掉。

### `dark:` 那条最容易静默翻车

`preset-opinionated.css` 里的 `@custom-variant dark` 判的是继承来的 `--hl-theme`（[#101](https://github.com/hulianui/hulian/issues/101)，
为的是主题岛嵌套时 `dark:` 跟着**最近**的岛走）。如果你的项目用 `<html class="dark">` 驱动暗色
（shadcn 的默认形态，`globals.css` 里写着 `@custom-variant dark (&:is(.dark *))`），
两份定义里**后声明的那份生效**，于是可能出现「全站 `dark:` 工具类不再匹配任何东西」——
底色还是暗的（那来自 `.dark { … }` 的 token 块，不走 variant），前景色留在亮色，也就是暗底压黑字。
构建成功、控制台无警告、DevTools 里规则确实存在，很难查。三条出路，任选其一：

1. **只引 `preset-core.css`**（上面那段），你自己那份 `@custom-variant dark` 原样保留 —— 最省心。
2. **把 `@custom-variant dark (&:is(.dark *))` 挪到瑚琏 `@import` 之后**。Tailwind v4 里后声明的赢，
   你的定义盖回瑚琏的，`dark:` 照常工作；代价是瑚琏组件的主题岛嵌套退化成跟随页面。
3. **加一层 `--hl-theme` 桥**（已实测，见下），保留瑚琏的定义，让 `.dark` 也能驱动它。

```css
/* 放在所有 @import 之后 */
.dark {
  --hl-theme: dark;
}
:root:not(.dark) {
  --hl-theme: light;
}
```

自定义属性靠继承传播，`.dark` 挂在 `<html>` 上时全部后代都读得到，
`@container style(--hl-theme: dark)` 那条分支即命中。Chrome 151 headless 实测：
`<html class="dark">` 下 `dark:text-red-500` 计算值确为 `red-500`，`dark:bg-black` 确为黑，
并且嵌在 `[data-theme="light"]` 岛内的元素**不会**被点亮 —— 桥和主题岛语义是相容的。

两个已知边界：① 需要 style container query（Chrome 111 / Safari 18 / Firefox 128），与本库基线一致；
② `@container` 查的是**父容器**，所以元素**自己**带 `.dark` 又同时写 `dark:` 工具类时不会命中
（`<html class="dark">` 这种放在根上的常规写法不受影响）。

## 几条命名约束

- **Tailwind v4 的 `@theme` 真名带 `--color-` 前缀**：`var(--color-primary)` 才解析，裸 `var(--primary)` 在 SVG 的 `fill` / `stroke` 上会静默失效。
- **命名与 shadcn/ui 对齐**：`--color-muted` 是弱**背景**（等价 `--color-subtle`），`--color-muted-foreground` 才是次要**文字**色。`@hulianui/tokens` 0.7.0（= `@hulianui/ui` 0.28.0）之前这两个名字在瑚琏这边是反的，从 shadcn 迁过来会满屏变色；现在是零改动。原先的 `text-muted` 已无对应 token，**Tailwind 对未定义颜色既不报错也不生成规则**，写了会静默回退成继承色 —— 用 `npx hulian-check` 逐条列出来改，别靠肉眼。
- **`--color-hairline` 只能用于 `border-*`**：它在浅色主题就是 `transparent`，用作 `text-` / `bg-` / `fill-` 会静默隐形。
- **浅档走 `-subtle` / `-border`**：提示条底、选中行、Tag 浅底用 `bg-primary-subtle` + `border-primary-border`（`danger` / `success` / `warning` / `info` 同构）。别自己拿主色 `mix()` 到白色派生 —— 暗色主题下「浅底」的方向是变深不是变浅，对白 mix 必错。

## 换字体

字体走 `--hl-font-sans` / `--hl-font-mono` 两个运行时变量，库里没有任何组件写死字族。
默认值等价于 Tailwind v4 的默认栈 —— 不设它们的项目，渲染与接这层令牌之前逐字一致。

```css
:root {
  --hl-font-sans: "Your Sans", ui-sans-serif, system-ui, sans-serif;
  --hl-font-mono: "Your Mono", ui-monospace, monospace;
}
```

这一行同时改掉三处：`font-sans` / `font-mono` 工具类、Tailwind preflight 给 `<html>` 的默认字体
（v4 的 `--default-font-family` 解析的就是 `--font-sans`），以及 `@hulianui/ui` 里 **48 个用
`font-mono` 的组件**（Kbd / CodeEditor / JsonViewer / LogViewer / Snippet …）。后者是靠覆盖
`body { font-family }` 换字体时**换不掉**的那一批 —— 它们吃的是 Tailwind 的 `--font-mono`，
不在 body 的继承链上。

**只换某一块**时，正文与等宽的写法不对称（实测，容易踩）：

```html
<!-- 等宽：写变量就够。用 font-mono 的元素各自声明了 font-family: var(--hl-font-mono)，
     会在自己所处的作用域重新解析它 -->
<div style="--hl-font-mono: 'IBM Plex Mono', monospace">…</div>

<!-- 正文：变量之外还要一个 font-sans 类。自定义属性会继承，但 font-family: var(…) 只在
     声明了这条属性的元素上重新解析 —— 普通文字继承的是根节点那里已经解析完的字体名，
     不会回头读变量 -->
<div class="font-sans" style="--hl-font-sans: Georgia, serif">…</div>
```

CJK 直接写进同一个变量即可（`Geist, "Noto Sans SC", …`）。两条顺序规则都别踩：

- **西文放中文前面** —— 中文字体自带的西文通常很难看，顺序反了整站英文数字都被拖下水；
- **中文放 `ui-sans-serif` / `system-ui` 前面** —— 这两个通用族对汉字会直接命中系统字体
  （苹方 / 微软雅黑），排在它们后面的中文字体永远轮不到，自托管等于白做。

本站自己的做法可作参考：`Geist, "Noto Sans SC", ui-sans-serif, system-ui, "PingFang SC", …`，
中文按 `unicode-range` 切成 97 片按需加载（见 `apps/www/app/fonts/`）。

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
