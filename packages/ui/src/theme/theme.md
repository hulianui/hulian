---
slug: theme
name: Theme
category: uncatalogued
group: 
tags: []
exports: [ThemeProvider]
status: enriched
---

# Theme

>  · uncatalogued

## 何时用

在应用根部包一层 `ThemeProvider`，统一管理亮/暗/跟随系统的主题状态，并把解析后的主题写到 `<html data-theme>` 供 CSS token 消费。需要在子组件里读/切主题时配套用 `useTheme()` hook（如主题切换按钮）。本组件只管 React 侧的状态与 `data-theme` 同步，不负责首屏防闪烁——视觉主题的首帧由页面里的 anti-FOUC inline 脚本设的 `data-theme` + CSS 驱动，Provider 在 mount 后做校正。

## 导入
```ts
import { ThemeProvider } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| defaultSetting | `"light" \| "dark" \| "system"` | `"system"` | 初始主题偏好；mount 时若 localStorage(`hulian-theme`) 有存值则被其覆盖 |
| forcedTheme | `"light" \| "dark"` | - | 强制主题（如按路由定主题）：覆盖用户偏好与系统监听；期间 `setTheme`/`toggle` 仍写入偏好但不改变视觉 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 被包裹的子树 |

`useTheme()` 返回的 context 值：`theme`（解析后的实际主题 `"light"|"dark"`）、`setting`（用户选择，含 `"system"`）、`setTheme(s)`、`toggle()`。

## 示例

```tsx
// 应用根
import { ThemeProvider } from "@hulianui/ui";

export function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultSetting="system">{children}</ThemeProvider>;
}
```

```tsx
// 子组件里切主题（主题切换按钮）
"use client";
import { useTheme } from "@hulianui/ui";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>{theme === "dark" ? "切到亮色" : "切到暗色"}</button>;
}
```

## 禁忌 / 坑

- `useTheme()` 必须在 `ThemeProvider` 子树内调用，否则抛 `"useTheme must be used within ThemeProvider"`。
- 该组件是 `"use client"` 客户端组件，须挂在客户端边界内（Next.js App Router 下别直接放进纯 server 组件树）。
- 首渲 `theme` 取确定值（`system` 解析为 `light`），不在 SSR/首帧调 `systemTheme()`，以免主题相关渲染（如 toggler 图标）触发 hydration mismatch（React #418）；真实主题由 mount effect 立即校正。因此别依赖首帧的 `theme` 值做关键渲染分支。
- 传了 `forcedTheme` 后视觉被锁定：`setTheme`/`toggle` 只写偏好不改 `data-theme`，切主题 UI 在强制期看起来"无效"是预期行为。
- 候选坑 skill（MUI/emotion/rehype/theme-factory 系）均针对其它技术栈的主题方案，与本组件的 `data-theme` + CSS 变量机制无关，不适用。

## 相关
—
