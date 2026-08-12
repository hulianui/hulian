---
slug: empty
name: Empty
category: data-display
group: placeholder
tags: []
exports: [Empty]
status: enriched
---

# Empty

> 空状态 · 图标+标题+描述+操作槽 + 内置空箱图标 + 加载中档 + sm/md(零依赖·RSC) · data-display/placeholder

## 何时用

列表/表格/搜索结果无数据时用，给用户「为什么空 + 下一步做什么」（通过 `children` 放操作按钮）。防泄密遮罩用 [Watermark](../watermark/watermark.md)；表格自带空态可直接用 [Table](../table/table.md)/[ProTable](../pro-table/pro-table.md)。

### 列表区四态各用什么

同一块列表区通常要表达四种状态，它们**不是同一个组件的四种文案**，选错了读屏念出来的语义就是错的：

| 状态 | 用什么 | 说明 |
|------|--------|------|
| 加载中 | `<Empty loading />`，或 [Skeleton](../skeleton/skeleton.md) | 已知列表形状（几行几列）就用 Skeleton 占位，视觉更稳；形状未知或只是一小块区域用 `Empty loading`。**不要**用不带 `loading` 的 Empty 顶加载中：那会被读屏念成「暂无数据」 |
| 空（确实没有数据） | `<Empty title="暂无数据">新建…</Empty>` | `children` 放「去创建」这类下一步动作 |
| 筛选/搜索无结果 | `<Empty title="没有匹配的结果">清空筛选</Empty>` | 与「空」用同一个组件但文案与动作不同：这里该给的是「清空筛选/换关键词」，不是「新建」 |
| 出错 | [Result](../result/result.md)（`status="error"`）+ 重试 | 出错不是空：它需要说明原因并给重试入口，用 Empty 会把一次失败伪装成「本来就没有数据」 |

## 导入
```ts
import { Empty } from "@hulianui/ui"
```

## Props

继承 `div` 的所有原生属性（`title` 除外，已重定义为 ReactNode）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" \| "md"` | `"md"` | 尺寸 |
| loading | `boolean` | `false` | 加载中。图标区换成 spinner（不再是「空」插画），容器打上 `aria-busy="true"`；「正在加载」由 spinner 自带的 `role="status"` + 本地化 aria-label 播报。`icon={null}` 时图标区仍然整个不渲染 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 自定义插画/图标。默认内置空箱图标，传 `null` 则不渲染图标区 |
| title | `ReactNode` | 主标题 |
| description | `ReactNode` | 辅助描述 |
| children | `ReactNode` | 操作区（按钮等），渲染在描述下方 |

## 示例
```tsx
// 默认
<Empty title="暂无数据" description="当前列表还没有任何内容" />

// 带操作
<Empty title="还没有项目" description="创建第一个项目开始使用">
  <Button size="sm">新建项目</Button>
</Empty>

// 加载中：只传 loading，文案交给 spinner 的本地化 aria-label
<Empty loading />

// 加载中带文案：文案跟着状态走，别沿用空态那份
<Empty loading title="正在加载项目" description="第一次打开会慢一点" />

// 一块区域里的三态（出错交给 Result）
{loading ? (
  <Empty loading title="正在加载项目" />
) : items.length === 0 ? (
  <Empty title="还没有项目" description="创建第一个项目开始使用">
    <Button size="sm">新建项目</Button>
  </Empty>
) : (
  <ProjectList items={items} />
)}
```

## 禁忌 / 坑

- 别把「整个列表区是否渲染」和 Empty 绑死成 `if (!data.length) return <Empty/>`——若同区域有需保活的持久子组件（如已挂载的滚动容器、表单），条件 return 会把它们卸载重挂。参见 [[conditional-empty-return-unmounts-persistent-children]]。
- 别在加载中沿用空态文案。`loading` 只接管图标区，`title` / `description` / `children` 照传照渲染 —— 写成 `<Empty loading={loading} title="暂无数据" />` 的话，加载中会一边转圈一边写着「暂无数据」。文案要跟着状态走。
- 加载中不要留着「新建 / 重试」这类操作按钮：数据还没到，用户对着它做的决定都是盲的；「新建」属于空态，「重试」属于出错态（用 [Result](../result/result.md)）。

## 相关
[Skeleton](../skeleton/skeleton.md) · [Spinner](../spinner/spinner.md) · [Result](../result/result.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
