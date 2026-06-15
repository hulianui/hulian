---
slug: tab-bar
name: TabBar
category: mobile
group: nav
tags: []
exports: [TabBar]
status: enriched
---

# TabBar

> 底部导航栏 · items 驱动受控/非受控 + 激活 text-primary/aria-current + 角标/红点 + 吃底部安全区(零依赖·H5 主导航) · mobile/nav

## 何时用

H5 / 移动端的全局主导航（首页/发现/我的等几个一级页签贴底切换）时用。临时性、单页内的悬浮操作入口用 [Fab](../fab/fab.md)；一次性列出多个动作并要弹层确认用 [ActionSheet](../action-sheet/action-sheet.md)。

## 导入
```ts
import { TabBar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `items` * | `TabBarItem[]` | — | 页签数据（见下） |
| `value` | `string` | — | 受控激活 key |
| `defaultValue` | `string` | 首项 key | 非受控初始 key |
| `onChange` | `(key: string) => void` | — | 切换页签回调 |
| `safeArea` | `boolean` | `true` | 吃底部安全区 inset |
| `fixed` | `boolean` | `true` | fixed 贴底；false 则随文档流 |
| `className` | `string` | — | — |

**TabBarItem**：`key: string` · `label: ReactNode` · `icon?: ReactNode`（默认态图标）· `activeIcon?: ReactNode`（激活态，缺省复用 icon）· `dot?: boolean`（红点）· `badge?: ReactNode`（角标，优先于 dot）· `disabled?: boolean`。

## 示例
```tsx
const [tab, setTab] = useState("home");

<TabBar
  value={tab}
  onChange={setTab}
  items={[
    { key: "home", label: "首页", icon: <Home /> },
    { key: "me", label: "我的", icon: <User />, badge: 5 },
  ]}
/>
```

## 禁忌 / 坑
- 默认 `fixed` 贴视口底 + 吃底部安全区。放进手机框/容器内演示时须 `fixed={false}` 收进文档流，否则会飘到整页底部；容器内不需要安全区时再加 `safeArea={false}`。
- `badge` 与 `dot` 同时给时 `badge` 优先。

## 相关
[Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
