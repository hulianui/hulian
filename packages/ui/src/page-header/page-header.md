---
slug: page-header
name: PageHeader
category: navigation
group: inpage
tags: []
exports: [PageHeader]
status: enriched
---

# PageHeader

> 页头骨架 · 返回/面包屑/标题/标签/操作区/Tabs 页脚(dogfood 复用·零依赖·可 RSC) · navigation/inpage

## 何时用

详情页 / 管理页顶部的页头骨架：统一安放返回箭头、面包屑、主标题、状态标签、右侧操作区和底部 Tabs。各槽位直接 dogfood 传入瑚琏 [Breadcrumb](../breadcrumb/breadcrumb.md) / Chip / [Tabs](../tabs/tabs.md)；只需要面包屑导航本身用 Breadcrumb，PageHeader 是把整块页头排版好。不传 `onBack` 时可保持 RSC（无回调）。

## 导入
```ts
import { PageHeader } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title* | `ReactNode` | — | 主标题。 |
| subTitle | `ReactNode` | — | 副标题，内联于标题右侧，中性弱化色。 |
| onBack | `() => void` | — | 提供则在标题左侧渲染返回箭头按钮（带回调 → 消费侧为 client）。 |
| backLabel | `string` | `"返回"` | 返回按钮的无障碍标签。 |
| breadcrumb | `ReactNode` | — | 面包屑区（标题行上方），传入瑚琏 `<Breadcrumb/>`。 |
| tags | `ReactNode` | — | 状态标签区（贴标题右侧），传入 `<Chip/>`/`<Badge/>` 等。 |
| extra | `ReactNode` | — | 右侧操作区（按钮组等），窄屏自动换行到标题下方。 |
| footer | `ReactNode` | — | 底部附加区，常放 `<Tabs/>`。 |
| bordered | `boolean` | `false` | 是否在页头底部渲染分隔线（复用 `<Separator/>`）。 |

> 另继承 `HTMLAttributes<HTMLElement>`（除 `title`，因其类型被改为 ReactNode）。

## 示例
```tsx
// 极简：仅标题 + 操作（可 RSC，无 onBack）
<PageHeader title="用户管理" extra={<Button variant="solid" size="sm">新建用户</Button>} />

// 完整页头
<PageHeader
  onBack={() => router.back()}
  breadcrumb={<Breadcrumb items={[{ label: "首页", href: "/" }, { label: "订单详情" }]} />}
  title="订单 #20260603-8821"
  subTitle="共 6 件商品"
  tags={<Chip tone="brand" variant="soft" size="sm">进行中</Chip>}
  extra={<Button variant="solid" size="sm">编辑</Button>}
  footer={<Tabs defaultValue="detail"><TabsList><TabsTab value="detail">详情</TabsTab></TabsList></Tabs>}
  bordered
/>
```

## 禁忌 / 坑

- `title` 为 ReactNode，与 `HTMLAttributes.title?: string` 冲突，类型已 `Omit<"title">`——别再往 DOM 透传字符串 title。
- 传 `onBack` 即引入回调，该消费组件必须是 client；纯展示页头不传 onBack 可保持 server 组件。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
