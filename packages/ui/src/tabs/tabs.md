---
slug: tabs
name: Tabs
category: navigation
group: inpage
tags: []
exports: [Tabs, TabsList, TabsTab, TabsPanel, tabsListVariants]
status: enriched
---

# Tabs

> 选项卡 · Base UI 无浮层 + underline/solid 滑块 · navigation/inpage

## 何时用

同一区域内切换若干并列内容面板（账户/密码/团队），内容互斥、平级、无层级。表达页面在站点中的位置用 [Breadcrumb](../breadcrumb/breadcrumb.md)；长文内随阅读进度高亮的目录用 [Anchor](../anchor/anchor.md)；有序步骤流程用 [Stepper](../_mui/stepper.md)。

## 导入
```ts
import { Tabs, TabsList, TabsTab, TabsPanel, tabsListVariants } from "@hulianui/ui"
```

## Props

`Tabs` 透传 Base UI `Tabs.Root`（`value`/`defaultValue`/`onValueChange`/`orientation`），默认非受控。皮肤变体在 `TabsList` 上。

### Tabs（根）
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `any` | — | 受控当前 tab |
| defaultValue | `any` | — | 非受控初始 tab |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 方向 |

### TabsList
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"underline" \| "solid"` | `"underline"` | 皮肤：下划滑块 / 实心药丸 |
| className | `string` | — | — |

`TabsTab` 接 `value`（必填）、`disabled`、`className`；`TabsPanel` 接 `value`、`className`。

## Events

### Tabs（根）
| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value) => void` | 切换回调（透传 Base UI `Tabs.Root`） |

## 示例
```tsx
<Tabs defaultValue="account" className="w-80">
  <TabsList variant="underline">
    <TabsTab value="account">账户</TabsTab>
    <TabsTab value="password">密码</TabsTab>
    <TabsTab value="team" disabled>团队</TabsTab>
  </TabsList>
  <TabsPanel value="account">管理你的账户资料与偏好设置。</TabsPanel>
  <TabsPanel value="password">在这里修改登录密码。</TabsPanel>
  <TabsPanel value="team">邀请成员、分配角色。</TabsPanel>
</Tabs>
```

## 禁忌 / 坑

- [[base-ui-tabs-indicator-slider-via-active-tab-css-vars]]：滑块靠 Base UI 写在 indicator 上的 `--active-tab-*` CSS 变量 + 纯 CSS transition 实现，不引动画库。坑点：激活态钩子是 `data-active` 而非 `data-selected`，写错样式不生效；jsdom 单测无 ResizeObserver 也能跑（指示条几何不会真渲染）。

## 相关
[Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../_mui/stepper.md)
