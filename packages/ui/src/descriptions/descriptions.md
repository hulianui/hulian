---
slug: descriptions
name: Descriptions
category: data-display
group: collection
tags: []
exports: [Descriptions, DescriptionsItem]
status: enriched
---

# Descriptions

> 描述列表 · 详情页键值对 + horizontal/vertical + bordered + span 跨列(纯皮肤·RSC) · data-display/collection

## 何时用

详情页/详情抽屉里展示一组只读键值对——用户资料、订单详情、合同信息。深层嵌套的 JSON 树用 [JsonViewer](../json-viewer/json-viewer.md)；需要列表流/操作按钮用 [List](../list/list.md)。本组件专攻"标准多列对齐的扁平字段表"，纯皮肤可在 RSC 直接渲染。

## 导入
```ts
import { Descriptions, DescriptionsItem } from "@hulianui/ui"
```

## Props

`DescriptionsProps`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| column | `number` | `3` | 每行列数 |
| layout | `"horizontal" \| "vertical"` | `"horizontal"` | horizontal=键左值右；vertical=键上值下 |
| bordered | `boolean` | `false` | 带边框分隔的表格态 |
| items | `DescriptionsItemData[]` | — | 数据驱动备选；提供时优先于 `DescriptionsItem` 子节点 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题(左上) |
| extra | `ReactNode` | 右上操作区 |

`DescriptionsItem` / `DescriptionsItemData`：`label`(键名，text-muted-foreground) / `children`(值，text-foreground) / `span`(跨列数，默认 1，超过 `column` 时钳制到 `column`)

## 示例
```tsx
// 子节点模式
<Descriptions title="用户信息">
  <DescriptionsItem label="姓名">张三</DescriptionsItem>
  <DescriptionsItem label="性别">男</DescriptionsItem>
  <DescriptionsItem label="备注" span={3}>VIP 客户，优先处理售后工单</DescriptionsItem>
</Descriptions>

// 数据驱动 + 边框表格态
<Descriptions
  bordered
  title="订单详情"
  extra={<a href="#edit">编辑</a>}
  items={[
    { label: "用户名", children: "zhangsan" },
    { label: "地址", children: "广东省广州市天河区某某路 88 号", span: 3 },
  ]}
/>
```

## 禁忌 / 坑

- `bordered` 表格态要求每行 `span` 之和恰好填满 `column`，否则会留空缺；用 `span` 让长字段(如地址、备注)整行占满。
- `items` 与 `DescriptionsItem` 子节点同时给时，`items` 优先(子节点被忽略)。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
