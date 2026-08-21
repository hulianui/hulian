---
slug: file-tree
name: FileTree
category: data-display
group: collection
tags: []
exports: [FileTree, fileStatusMeta, filterFileTree]
status: enriched
---

# FileTree

> 浏览文件和目录，带展开、选中和改动状态标记 · data-display/collection

## 何时用

渲染递归文件/文件夹树（IDE/devtools 左栏、PR 改动文件列表），带 git status 风格的 A/M/D/U/R 改动角标、展开折叠、选中高亮、内置搜索。本组件是层级文件结构专用；要任意层级数据树用 [Tree]，要二维表格用 [Table](../table/table.md)。

## 导入
```ts
import { FileTree, fileStatusMeta, filterFileTree } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| nodes* | `FileNode[]` | - | 树数据（递归 file/folder） |
| selectedPath | `string` | - | 受控高亮当前选中（按拼接 path 匹配） |
| expandedPaths | `string[]` | - | 受控展开的 folder path 集合（传入即受控） |
| defaultExpandedPaths | `string[]` | - | 非受控初始展开（与各 folder 的 defaultExpanded 合并） |
| searchable | `boolean` | `false` | 树内搜索框（过滤 + 命中祖先自动展开） |
| searchPlaceholder | `string` | `"搜索文件"` | 搜索框占位符 |
| className | `string` | - | 自定义类 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(node: FileNode, path: string) => void` | 点击文件/文件夹回调，回传节点与拼接 path |
| onContextMenu | `(node: FileNode, path: string, e: React.MouseEvent) => void` | 行右键回调（消费者配 ContextMenu 锚光标弹菜单） |
| onExpandedChange | `(paths: string[]) => void` | 展开变化回调（受控/非受控都回调） |

`FileNode`：`{ name: string; type: "file"｜"folder"; status?: FileStatus; children?: FileNode[]; defaultExpanded?: boolean }`。
`FileStatus`：`"added"｜"modified"｜"deleted"｜"untracked"｜"renamed"`（渲染为右侧 A/M/D/U/R 着色字母角标）。

## 示例
```tsx
const [sel, setSel] = useState("src/index.ts");
<FileTree
  nodes={[
    { name: "src", type: "folder", defaultExpanded: true, children: [
      { name: "index.ts", type: "file", status: "modified" },
      { name: "legacy.ts", type: "file", status: "deleted" },
    ]},
    { name: "README.md", type: "file", status: "renamed" },
  ]}
  selectedPath={sel}
  onSelect={(node, path) => setSel(path)}
/>
```

## 禁忌 / 坑

- 选中/展开都按「拼接 path」（如 `src/components/button.tsx`）匹配，不是 `name`——`selectedPath` 与 `onSelect` 回传的 path 是同一套拼接规则。
- 展开两态：传 `expandedPaths` 即受控（须配 `onExpandedChange` 回写）；否则用 `defaultExpandedPaths` + 各 folder 的 `defaultExpanded` 合并的非受控态。
- `status` 仅对 file 有 git 语义；`children` 仅 folder 有意义。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
