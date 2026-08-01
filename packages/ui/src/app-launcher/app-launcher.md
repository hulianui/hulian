---
slug: app-launcher
name: AppLauncher
category: navigation
group: global
tags: []
exports: [AppLauncher, matchApp, filterApps, groupSections]
status: enriched
---

# AppLauncher

> 应用启动台 · 毛玻璃面板 + 搜索(标题即 placeholder) + 分类胶囊 + 图标网格(macOS Launchpad/工作台首页) · 搜索与分类各自可受控/非受控 · keywords 别名(拼音/英文名)参与匹配·中文按子串命中 · 连续同 section 归组自动分隔线 · 方向键在网格漫游焦点(Home/End·越界不回绕) · badge 角标/href 链接项/disabled/右上操作槽 · glass 毛玻璃 vs solid 实底 · 筛选分节是纯函数 matchApp/filterApps/groupSections 可测(零依赖) · navigation/global

## 何时用

做「应用中心 / 我的工作台 / 微应用市场 / 快捷入口」——一屏铺开所有入口，按分类筛、按名字搜。

和库内两个近邻的分工：[Command](../command/command.md) 是**列表式**命令面板（键盘驱动、结果是命令与动作）；[Dock](../dock/dock.md) 是常驻程序坞（一排图标，不分类不搜索）。本组件是**网格式**应用入口，图标大、有名字、可分节——认图找应用而不是敲命令。

## 导入
```ts
import { AppLauncher, type AppLauncherItem } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `AppLauncherItem[]` | — | 见下表 |
| categories | `{ key, label }[]` | — | 分类胶囊；不传则不渲染这一行 |
| category / defaultCategory | `string` | — | 当前分类，受控 / 非受控（`undefined` = 全部） |
| onCategoryChange | `(key?: string) => void` | — | 切分类回调 |
| allLabel | `ReactNode` | `"全部"` | 「全部」胶囊文案 |
| title | `ReactNode` | — | 左上标题；`searchable` 时同时是搜索框 placeholder（对齐 macOS 启动台） |
| logo / actions | `ReactNode` | — | 标题左侧 logo 槽 / 右上操作槽 |
| searchable | `boolean` | `true` | 是否出搜索框 |
| search / defaultSearch | `string` | `""` | 搜索词，受控 / 非受控 |
| onSearchChange | `(v: string) => void` | — | 搜索回调 |
| columns | `number` | `7` | 列数 |
| iconSize | `number` | `64` | 图标边长 px |
| labelLines | `1 \| 2` | `1` | 应用名行数（超出省略号） |
| variant | `"glass" \| "solid"` | `"glass"` | 毛玻璃（需身后有底图）/ 实底 |
| emptyText | `ReactNode` | `"没有匹配的应用"` | 空结果文案 |
| onItemClick / onItemContextMenu | `(item, event) => void` | — | 点击 / 右键 |

### AppLauncherItem

| 字段 | 类型 | 说明 |
|------|------|------|
| id* | `string \| number` | 唯一键 |
| label* | `ReactNode` | 应用名 |
| icon* | `ReactNode` | 图标槽（`<img>`/svg/emoji），自动裁进 22% 圆角方框 |
| category | `string` | 所属分类 |
| section | `string` | 分节：**连续**同节的项归一组，组间画分隔线 |
| keywords | `string[]` | 搜索别名（拼音 / 英文名 / 缩写）；label 非字符串时**只**靠它命中 |
| href / target | `string` | 传了则条目渲染成 `<a>` |
| badge | `ReactNode` | 图标右上角标 |
| disabled | `boolean` | 不可点、不进 tab 顺序 |

### matchApp / filterApps / groupSections

筛选与分节的纯函数，已导出：想自己画网格但复用「关键词命中 + 分类过滤 + 连续分节」时直接调。

## 示例
```tsx
<AppLauncher
  items={apps}
  categories={[{ key: "dev", label: "开发者工具" }, { key: "tool", label: "工具" }]}
  title="应用程序"
  logo={<Logo />}
  actions={<MoreButton />}
  className="h-[28rem]"
  onItemClick={(app) => router.push(`/apps/${app.id}`)}
/>
```

## 禁忌 / 坑

- **glass 需要身后有底图**：`variant="glass"` 是 `bg-surface/70 + backdrop-blur`，铺在纯色背景上等于半透明面板，看不出玻璃。无底图场景用 `variant="solid"`。
- **中文搜索按子串匹配**，不是前缀——「云盘」搜「盘」要命中。给英文/拼音别名请走 `keywords`，别把它们拼进 `label`。
- **section 按「连续」分组**，不做全局重排：调用方数组的顺序就是最终顺序（「最近使用」排在最前是靠顺序表达的，重排会把它打散）。同名但不连续的 section 会各自成组，这是刻意的。
- 图标圆角固定 22%（逼近 Apple 超椭圆），不吃 `var(--radius)`——大方块上它偏小、小图标上又会被磨成圆。
- 面板高度由调用方给（`className="h-[28rem]"`），网格区自己滚；不给高度时面板会被内容撑开。

## 相关
[Command](../command/command.md) · [Dock](../dock/dock.md) · [Grid](../grid/grid.md) · [BentoGrid](../bento-grid/bento-grid.md) · [Empty](../empty/empty.md) · [Chip](../chip/chip.md)
