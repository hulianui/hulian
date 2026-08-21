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

> Browses expandable files and folders with selection and version-control status badges.

## When to use

Use FileTree for IDE or developer-tool sidebars and pull-request file lists. It supports nested files and folders, Git-style change markers, controlled selection, expansion, and built-in search. Use [Tree] for arbitrary hierarchical data or [Table](../table/table.md) for two-dimensional data.

## Import
```ts
import { FileTree, fileStatusMeta, filterFileTree } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| nodes* | `FileNode[]` | - | Recursive file and folder data. |
| selectedPath | `string` | - | Controlled selected path. |
| expandedPaths | `string[]` | - | Controlled set of expanded folder paths. |
| defaultExpandedPaths | `string[]` | - | Initial uncontrolled paths, merged with each folder's `defaultExpanded`. |
| searchable | `boolean` | `false` | Shows an in-tree search field that filters matches and expands their ancestors. |
| searchPlaceholder | `string` | `"\u641c\u7d22\u6587\u4ef6"` ("Search files") | Search-field placeholder. |
| className | `string` | - | Custom class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(node: FileNode, path: string) => void` | Fires when a file or folder is selected, with the node and composed path. |
| onContextMenu | `(node: FileNode, path: string, e: React.MouseEvent) => void` | Fires on a row context menu; pair it with ContextMenu for cursor-anchored actions. |
| onExpandedChange | `(paths: string[]) => void` | Fires whenever expansion changes in either controlled or uncontrolled mode. |

`FileNode` is `{ name: string; type: "file"\|"folder"; status?: FileStatus; children?: FileNode[]; defaultExpanded?: boolean }`.
`FileStatus` is `"added"\|"modified"\|"deleted"\|"untracked"\|"renamed"`, rendered as an A/M/D/U/R marker.

## Examples
```tsx
const [selected, setSelected] = useState("src/index.ts");
<FileTree
  nodes={[
    { name: "src", type: "folder", defaultExpanded: true, children: [
      { name: "index.ts", type: "file", status: "modified" },
      { name: "legacy.ts", type: "file", status: "deleted" },
    ]},
    { name: "README.md", type: "file", status: "renamed" },
  ]}
  selectedPath={selected}
  onSelect={(node, path) => setSelected(path)}
/>
```

## Pitfalls

- Selection and expansion match composed paths such as `src/components/button.tsx`, not `name`. `selectedPath` and the path returned by `onSelect` use the same rules.
- Passing `expandedPaths` enables controlled mode and requires `onExpandedChange` to write changes back. Otherwise, `defaultExpandedPaths` and folder-level `defaultExpanded` initialize uncontrolled state.
- `status` is meaningful only for files, while `children` is meaningful only for folders.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
