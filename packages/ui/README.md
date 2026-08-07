# @hulianui/ui

> **English TL;DR** — A React component library with 383 components, built on Base UI's accessible behaviour layer and Tailwind CSS v4 OKLCH tokens: zero-flash theme switching and runtime re-skinning. It ships **source**, not a compiled bundle. English docs: <https://hulianui.haloritual.com/en>

颜值 + 好用的 React 设计系统 —— **383 个组件**，OKLCH 主题 · Tailwind v4 · 暗色零闪烁 · 运行时换肤。

- 文档站：<https://hulianui.haloritual.com>（中国大陆直连镜像：<https://hulianui-zh.haloritual.com>）
- 给 AI 用的 MCP server：[`@hulianui/mcp`](https://www.npmjs.com/package/@hulianui/mcp) —— 让 AI 按需查组件，而不是猜签名
- License：MIT

## 安装

```bash
pnpm add @hulianui/ui @hulianui/tokens
# peer：react · react-dom · tailwindcss@4 · @base-ui/react · motion
```

## 三步接入

### 1. 引入 token + preset，并把组件源码加进 Tailwind 扫描范围

```css
/* 全局 CSS */
@import "tailwindcss";
@import "@hulianui/tokens/tokens.css";   /* 原语 + 语义层（明暗在这里切值） */
@import "@hulianui/tokens/preset.css";   /* 把语义变量接进 Tailwind 的 @theme */
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
```

**`@source` 这行漏不得**：本库以源码分发，类名写在 `node_modules` 里，而 Tailwind 默认不扫 `node_modules`。漏了它的表现是「组件渲染出来了，但完全没有样式」。

### 2. 根部包一层 `ThemeProvider`

```tsx
import { ThemeProvider, Button } from "@hulianui/ui";

export default function App() {
  return (
    <ThemeProvider defaultSetting="system">
      <Button>瑚琏</Button>
    </ThemeProvider>
  );
}
```

语义 token 挂在 `[data-theme]` 上：**缺 Provider 则明暗切换整个无效**。SSR 应用还需在入口注入一段防白闪的 inline script（在首帧之前就把 `data-theme` 写上），参考文档站的 [`theme-script.tsx`](https://github.com/hulianui/hulian/blob/master/apps/www/app/theme-script.tsx)。

### 3. 用组件

```tsx
import { Button, Card, CardBody, Tag } from "@hulianui/ui";

export function Panel() {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <Tag tone="success">已发布</Tag>
        <Button tone="danger">删除</Button>
      </CardBody>
    </Card>
  );
}
```

## 源码分发意味着什么

发布的是 `src/`（不编译 dist），所以消费方需要能转译 TSX：

- **Next.js**：加 `transpilePackages: ["@hulianui/ui"]`。跑 **webpack dev**（Next 15 及以下）时还须**成对**加上 `experimental.optimizePackageImports: ["@hulianui/ui"]`，否则冷编译会慢数倍（Next 16 的 Turbopack 实测无差异）。
- **Vite**：一般免配。

换来的是：换肤、tree-shaking、类型跳转都直接指向真实源码，没有中间产物。

## 导入方式

根 barrel 与子路径都是官方入口，导出同一份东西，可以混用：

```ts
import { Button } from "@hulianui/ui";  // 默认写法
import { Tag } from "@hulianui/ui/tag"; // 只用少数几个组件时，减小 dev 模块图
```

`_icons`、`src/...` 这类不在 `exports` 里的路径导不进去。

## 几条最常踩的约束

- **颜色变量必须带 `--color-` 前缀**：`fill="var(--color-primary)"` 才解析；裸 `var(--primary)` 在 SVG 的 `fill` / `stroke` 上会静默失效（工具类如 `text-primary` 不受影响）。
- **不要用 `style=` 或局部 CSS 覆盖组件样式**：那会绕过 OKLCH 语义 token，明暗切换与运行时换肤当场失效，升级时也必然冲突。组件缺能力请提 issue，不要在调用处打补丁。
- **`toast` 只有对象签名**：`toast({ title, tone })`，没有 `toast.success()` 之类快捷方法。

完整的机器可读约束见 [`conventions.json`](https://hulianui.haloritual.com/conventions.json)，可用 [`@hulianui/guard`](https://www.npmjs.com/package/@hulianui/guard) 在 CI 里执行。

## 更多

| 想做什么 | 去哪 |
|---|---|
| 找组件、调参数、抄代码 | <https://hulianui.haloritual.com/components> |
| 定制主题 / 换肤 | <https://hulianui.haloritual.com/theme> |
| 让 AI 正确使用本库 | [`@hulianui/mcp`](https://www.npmjs.com/package/@hulianui/mcp) |
| 在 CI 里拦住误用 | [`@hulianui/guard`](https://www.npmjs.com/package/@hulianui/guard) |
| 提 issue / 参与开发 | <https://github.com/hulianui/hulian> |

## License

[MIT](https://github.com/hulianui/hulian/blob/master/LICENSE) © 瑚琏 Hulian
