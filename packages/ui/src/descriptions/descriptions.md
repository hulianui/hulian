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

> 在详情页里成组展示只读的键值对字段 · data-display/collection

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
| column | `number` | `3` | 每行**最多**几列。实际列数按容器宽度自动降档（见下） |
| layout | `"horizontal" \| "vertical"` | `"horizontal"` | horizontal=键左值右；vertical=键上值下 |
| bordered | `boolean` | `false` | 带边框分隔的表格态 |
| size | `"sm" \| "md"` | `"md"` | 密度档。sm 只收紧格内边距，不动字号 |
| labelWidth | `number \| string` | - | 钉死键列宽度（horizontal 专用）。不传时由整表最长的键名决定并逐列对齐；数字按 px |
| emptyText | `ReactNode` | `"—"` | 值为空时的占位。空=`null`/`undefined`/`""`/`false`，数字 `0` 照常渲染；传 `null` 关掉 |
| align | `"baseline" \| "start" \| "center"` | 跟布局走 | 键与值的纵向对齐。值区放图片/标签组时才需要显式指定 |
| items | `DescriptionsItemData[]` | - | 数据驱动备选；提供时优先于 `DescriptionsItem` 子节点 |

`DescriptionsItemProps`（复合用法里的 `<DescriptionsItem>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| label | `ReactNode` | - | 键名 |
| span | `number` | `1` | 跨列数 |

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

## 键列对齐与响应式

**键列宽度由整表统一决定，不是每格自己算。** 外层栅格按「键列 值列」成对开轨道，每一项用
`subgrid` 借用父轨道 —— 于是同一列上下行的值天然对齐，跟 `<table>` 一个效果，而消费方不必去
猜一个宽度值。只有一种场合要 `labelWidth`：**上下两张表要对齐**（如「基本信息」和「执行明细」
两块），它们各自算出来的键列宽不一样，得钉同一个数。

**列数按容器宽度降档，不看视口。** 详情页常被塞进抽屉 / 分栏，视口很宽而这块只有 380px，
视口断点在那里是错的判据。分档（容器宽度）：

| 容器宽度 | 实际列数 |
|---|---|
| < 32rem | 1 |
| 32-48rem | 2 |
| 48-64rem | 3 |
| ≥ 64rem | `column` |

跨列项在放不下的档位会**整项退成整行**（而不是按 `span` 去占并不存在的轨道，那会让栅格长出
隐式列、整张表错位）。所以 `column={3} span={2}` 在窄抽屉里是整行，不是半行。

## 值区放什么

`children` 是 `ReactNode`，库里任何组件都能直接放进去——**不需要额外的 prop**。要注意的只有
「比文字高的东西」会撑高整行，这时用 `align` 决定键跟着顶对齐还是居中：

```tsx
// 单张图 / 头像：值比键高，键居中读起来才不像掉在角上
<Descriptions bordered align="center">
  <DescriptionsItem label="证件照">
    <Image src={idCard} alt="身份证正面" width={120} height={76} />
  </DescriptionsItem>
  <DescriptionsItem label="头像"><Avatar src={user.avatar} /></DescriptionsItem>
</Descriptions>

// 一组缩略图：自己排一行，点开走 ImageViewer（受控：open/index 由你持有）
<DescriptionsItem label="工作照" span={2}>
  <div className="flex flex-wrap gap-2">
    {photos.map((p, i) => (
      <button key={p.src} type="button" onClick={() => setViewer({ open: true, index: i })}>
        <Image src={p.src} alt={p.alt} width={64} height={64} radius="sm" isZoomed />
      </button>
    ))}
  </div>
</DescriptionsItem>

// 状态：用 Tag 的语气档，不要自己涂色
<DescriptionsItem label="状态"><Tag tone="danger">已失效</Tag></DescriptionsItem>
<DescriptionsItem label="POS作废状态"><Tag tone="success">成功</Tag></DescriptionsItem>

// 值旁边挂动作（复制单号、跳详情）
<DescriptionsItem label="订单号">
  <span className="inline-flex items-center gap-1">{order.no}<CopyButton value={order.no} /></span>
</DescriptionsItem>
```

长文本不必特殊处理：值格已经是 `min-w-0`，超长会正常换行；要一行截断自己加 `truncate`。

## 禁忌 / 坑

- `bordered` 表格态要求每行 `span` 之和恰好填满 `column`，否则会留空缺；用 `span` 让长字段(如地址、备注)整行占满。
- `items` 与 `DescriptionsItem` 子节点同时给时，`items` 优先(子节点被忽略)。
- 键名**不折行**（折行的键列会跟着变宽变矮，整表的对齐基准就飘了）。键名确实很长时用 `labelWidth` 钉死列宽，别指望它自己换行。
- `align="baseline"` 在 `bordered` 下做不到（键格要撑满行高，底色才不会只包住文字），组件会在开发期点名并按 `start` 处理。要基线对齐就别开 `bordered`。
- `emptyText` 只认「空」，不认「假」：`0` 会照常渲染成 `0`。这是刻意的——「0 条记录」是事实，不是缺值。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
