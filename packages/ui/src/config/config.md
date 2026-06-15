---
slug: config
name: Config
category: uncatalogued
group: 
tags: []
exports: [ConfigProvider]
status: enriched
---

# Config

> 全局配置根：当前承载 i18n（locale），后续渐进扩展默认尺寸/主题等全局项。 · uncatalogued

## 何时用

应用最外层注入全局 Locale（i18n 文案），裹在与 ThemeProvider 同层。组件级文案覆盖请就近传 prop，不用为单点改 Provider；主题/暗色由 ThemeProvider 负责，Config 当前只管 locale。

## 导入
```ts
import { ConfigProvider } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| locale | `Locale` | `zhCN` | 全局 Locale（用导出的 zhCN/enUS 或 spread 自定义） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 子树 |

## 示例
```tsx
import { ConfigProvider } from "@hulianui/ui";
// zhCN / enUS 同包导出

// 应用最外层，与 ThemeProvider 同层
<ConfigProvider locale={enUS}>
  <App />
</ConfigProvider>

// 缺省即 zhCN，可不传 locale
<ConfigProvider>
  <App />
</ConfigProvider>
```

## 禁忌 / 坑

- 当前仅承载 locale；不要期望它接管尺寸/主题（按设计后续在同一 Provider 渐进扩展）。
- 自定义 locale 建议 spread 内置 `zhCN`/`enUS` 再覆盖，避免漏键。

## 相关
—
