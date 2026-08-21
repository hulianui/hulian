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

> 在多个内容面板之间切换，指示条可下划线可实心 · navigation/inpage

## 何时用

同一区域内切换若干并列内容面板（账户/密码/团队），内容互斥、平级、无层级。表达页面在站点中的位置用 [Breadcrumb](../breadcrumb/breadcrumb.md)；长文内随阅读进度高亮的目录用 [Anchor](../anchor/anchor.md)；有序步骤流程用 [Stepper](../stepper/stepper.md)。

## 导入
```ts
import { Tabs, TabsList, TabsTab, TabsPanel, tabsListVariants } from "@hulianui/ui"
```

## Props

`Tabs` 透传 Base UI `Tabs.Root`（`value`/`defaultValue`/`onValueChange`/`orientation`），默认非受控。皮肤变体在 `TabsList` 上。

### Tabs（根）
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `any` | - | 受控当前 tab |
| defaultValue | `any` | - | 非受控初始 tab |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 方向 |

### TabsList
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"underline" \| "solid"` | `"underline"` | 皮肤：下划滑块 / 实心药丸 |
| size | `"sm" \| "md"` | `"md"` | 尺寸档，下发给 `TabsTab`（不必逐个传）。`md` 是页面级 tab 导航；`sm` 给「跟标题 / 搜索框同行」的行内切换器。见「尺寸」 |
| className | `string` | - | - |

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

## 尺寸

`md`（默认）是**页面级 tab 导航**的尺寸。但 tab 条经常不是导航，而是跟标题、搜索框同行的一个切换器 —— 那一行的既有高度是 28-32px，`md` 塞不进去：

| | 轨道（solid） | tab |
|---|---|---|
| `md`，纯文字 | 40 | 32 |
| `md`，文字 + 计数 `Tag` | 44 | 36 |
| `sm`，纯文字 | **28** | **24** |
| `sm`，文字 + `Tag size="sm"` | 32 | 28 |

```tsx
// 跟标题同行的行内切换器
<div className="flex items-center gap-2">
  <span className="text-sm font-semibold">职称组报表</span>
  <Tabs defaultValue="a">
    <TabsList variant="solid" size="sm">
      <TabsTab value="a">职称订单<Tag size="sm" className="ml-1.5">2</Tag></TabsTab>
      <TabsTab value="b">论文订单<Tag size="sm" className="ml-1.5">7</Tag></TabsTab>
    </TabsList>
    <TabsPanel value="a">…</TabsPanel>
  </Tabs>
</div>
```

`sm` 里的计数 `Tag` **要自己给 `size="sm"`**：Tag 默认 `md` 是 24px，一颗就把 tab 顶回 32px。组件不会去改子元素显式声明的尺寸 —— 那是从外面穿透改内部件，正是本库禁止消费方做的事。

## 禁忌 / 坑

- **别在消费侧压 `TabsList` 的高度**（`<TabsList className="h-7">`）：它是 `inline-flex items-center`，强压之后 tab 只是居中溢出，solid 的药丸上下各探出轨道 4px（实测），比高一点更难看。要矮就用 `size="sm"` —— tab 的 `py` 与轨道的 `p` 必须一起收，只压一层必然探出。

- [[base-ui-tabs-indicator-slider-via-active-tab-css-vars]]：滑块靠 Base UI 写在 indicator 上的 `--active-tab-*` CSS 变量 + 纯 CSS transition 实现，不引动画库。坑点：激活态钩子是 `data-active` 而非 `data-selected`，写错样式不生效；jsdom 单测无 ResizeObserver 也能跑（指示条几何不会真渲染）。

## 相关
[Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
