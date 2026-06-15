---
slug: json-viewer
name: JsonViewer
category: data-display
group: collection
tags: []
exports: [JsonViewer, valueType, jsonPath]
status: enriched
---

# JsonViewer

> 折叠 JSON 树(只读) · 递归零依赖 + 语法着色(key/string/number/bool/null) + 行级展开折叠 + 折叠态 {…} N keys/[…] N items + depth<阈值初始展开/大对象懒展开 + hover 复制节点值与 JSON path(网关请求/响应日志检查器刚需·导出 valueType/jsonPath 纯函数) · data-display/collection

## 何时用

只读检视任意 JSON 结构时用——网关请求/响应日志、API 调试器、配置预览。需要把 JSON 喂进表单做编辑用别的；纯键值对详情页(扁平、无嵌套)用 [Descriptions](../descriptions/descriptions.md) 更合适，本组件专攻深层嵌套的可折叠树。

## 导入
```ts
import { JsonViewer, valueType, jsonPath } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `unknown` | — | 任意 JSON 值 |
| rootName | `string` | — | 根节点标签(如 `"response"`) |
| defaultExpandedDepth | `number` | `1` | 初始展开深度：嵌套节点 `depth < defaultExpandedDepth` 时初始展开(根的直接子节点 depth=1) |
| maxAutoExpandKeys | `number` | `50` | 大对象/数组懒展开阈值：子项数超过则初始折叠保护 |
| onCopyPath | `(path: string) => void` | — | 复制节点 JSON path 回调(同时把节点值复制到剪贴板) |
| className | `string` | — | — |

## 示例
```tsx
<JsonViewer data={response} />

// 多层全展开
<JsonViewer data={usage} defaultExpandedDepth={3} />
```

## 禁忌 / 坑

- 只读组件，不接受编辑回调；`onCopyPath` 只是 hover 复制 path/值，不改 `data`。
- 超过 `maxAutoExpandKeys`(默认 50)子项的大对象会初始折叠以保护性能，需要手动展开——别误以为数据没渲染出来。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
