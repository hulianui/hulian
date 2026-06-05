# 瀚库 HanVault 团队知识库 / 网盘 — Demo 设计

- 日期：2026-06-05
- slug：`knowledge` · category：中后台 · status：done（目标）
- 路由：`/demos/knowledge`（单路由客户端 SPA，三栏全内存态联动）
- 目标：一举点亮零使用的 **Tree / FileTree / TreeSelect**，并让 **MarkdownEditor 第一次当主角**；ImageViewer / Upload / Transfer 强化复用。

## 0. 第一性目标

这个 demo 是「文件 / 知识库」品类的教学样板：经典三栏（目录树 + 主区 + 详情），
让用户照抄出一个带搜索 / 右键 / 上传 / 全屏预览 / 在线编辑 / 版本协作的网盘式工作台。
合格线 = 演完真实知识库会经历的完整交互生命周期 + 尽可能多地展示库内 collection / forms 组件真实用例。

## 1. 三栏布局

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 顶栏  [库]瀚库 HanVault  /  研发中心 / 设计规范   🔍全局搜索  ⤴上传 ☾主题 用户 │
├──────────────┬──────────────────────────────────────────┬────────────────────┤
│ 左 280px      │ 中栏 (主区 flex-1)                         │ 右 320px            │
│ FileTree      │ ┌工具条 面包屑 · [文档|文件]Segmented·新建┐ │ 详情面板            │
│  ·搜索框      │ │ 文档模式 → MarkdownEditor(主角)         │ │ ·名称/作者/改动时间 │
│  ·目录/文档树 │ │   自动保存态·字数·最后编辑人            │ │ ·协作者 AvatarGroup │
│  ·A/M/D 角标  │ │ 文件模式 → 网格卡片(多选)               │ │ ·版本 Timeline      │
│  ·右键菜单    │ │   图片点开 → ImageViewer 全屏           │ │ ·标签 Tag           │
│  ·Upload落区  │ │   选中多个 → 批量移动 Transfer          │ │ ·访问权限 Tree(级联)│
│              │ └─────────────────────────────────────────┘ │                     │
└──────────────┴──────────────────────────────────────────┴────────────────────┘
```

## 2. 组件落点（dogfood 清单）

| 区域 | 组件 | 新点亮 |
|---|---|---|
| 左栏目录树 | **FileTree**（回库增强：searchable + onContextMenu + 受控展开） | ✅ 0→1 |
| 行右键菜单 | **ContextMenu**（新建/重命名/移动/删除·danger） | |
| 左栏上传 | **Upload** dropzone（走 `lib/async` 进度回填） | |
| 顶栏 / 工具条 | **Breadcrumb** 路径导航 | |
| 模式切换 | **Segmented**（文档 / 文件） | |
| 中栏文档模式 | **MarkdownEditor**（首次当主角）+ 自动保存态 | |
| 中栏文件模式 | Card 网格 + 多选 + 程序化图片缩略 | |
| 图片预览 | **ImageViewer** 全屏 lightbox | |
| 单文档移动 | **TreeSelect**「移动到文件夹」内联选择器 | ✅ 0→1 |
| 批量移动 | **Transfer** 多选穿梭 | |
| 右栏访问权限 | **Tree** checkable（组织架构·父子级联半选） | ✅ 0→1 |
| 右栏协作者 / 版本 / 标签 | AvatarGroup / **Timeline** / **Tag** | |
| 删除·批量移动确认 | **Popconfirm** / AlertDialog | |
| 全程操作反馈 | **toast**（成功 info / 失败 danger） | |
| 首屏 / 空目录 / 失败 | **Skeleton** / **Empty** / **Alert**+重试（`useMockData` failOnce） | |
| 纯图标按钮 | **Tooltip** | |

## 3. 回库增强 FileTree（撞缺口反哺，非 demo 打补丁）

依据记忆 `fix-component-not-demo-css-patch`：demo 撞缺口 → 回 `@hulian/ui` 修组件。

1. **`searchable?` + `searchPlaceholder?`** —— 内置搜索框，过滤 + 祖先保留 + 命中自动展开。
   新增纯函数 **`filterFileTree(nodes, query): { matchedPaths: Set<string>; autoExpandPaths: Set<string> }`** + 单测（仿 `tree-core.ts` 的 `filterTree`）。
2. **`onContextMenu?: (node: FileNode, path: string, e: React.MouseEvent) => void`** —— 行右键回调；
   demo 配库里 `ContextMenu` 锚到光标弹菜单。
3. **受控展开** `expandedPaths?: string[]` / `defaultExpandedPaths?: string[]` / `onExpandedChange?: (paths: string[]) => void`。
   - 当前每行 `useState(node.defaultExpanded)` 自管，搜索自动展开必须提升为受控。
   - **向后兼容铁律**：三类受控 props 全不传时，保持现有「per-node `defaultExpanded` + 行内 useState」行为，
     不破坏现有 `file-tree.showcase.tsx`（用 defaultExpanded + selectedPath/onSelect）。
   - 实现：FileTree 顶层维护 `expanded: Set<string>`（受控/非受控对称）；初值由各 folder `defaultExpanded` 收集的 path 集合 ∪ `defaultExpandedPaths`。Row 不再自管 open，读顶层集合。
4. 搜索激活时：用 `filterFileTree` 算可见集 + 自动展开集（与用户展开集合并），未命中节点隐藏。

FileTree 单测补：`filterFileTree` 纯函数（命中叶 / 命中夹自动展开祖先 / 空 query / 大小写）；组件层受控展开切换。

## 4. 数据模型与资源

```ts
type VaultKind = "folder" | "doc" | "image" | "file";
interface VaultNode {
  id: string;
  name: string;
  kind: VaultKind;
  parentId: string | null;      // 树由 parentId 构建
  status?: FileStatus;          // 复用 FileTree A/M/D/U/R 语义（近期改动角标）
  updatedAt: string;            // 固定字符串，避免 Date.now（静态可复现）
  author: string;
  size?: number;                // file/image 字节
  tags?: string[];
  content?: string;             // kind=doc 的 markdown 正文
  src?: string;                 // kind=image 的程序化 SVG data-URI
  collaborators?: string[];     // 协作者名
}
```

- 内存 hook `useVault`：维护节点表 + 增（新建文档/文件夹/上传）/ 删 / 改名 / 移动；派生 FileTree 的 `FileNode[]`、面包屑、当前选中。
- **图片程序化生成**：`_data/images.ts` 仿 `projects/_data/photos.ts` 的 `photoArt()`，按语义（标题/类别）配色生成 mesh / 几何 SVG data-URI，零外链（铁律四）。
- 版本历史、协作者、组织架构（权限 Tree 数据源）均内存 mock。

## 5. 完整交互生命周期（铁律二）

```
首屏 Skeleton（三栏骨架）
  → 空目录 Empty（引导新建 / 上传）
    → 一次加载失败 Alert + 重试（useMockData failOnce）
      → 操作：新建文档 / 新建文件夹 / 重命名 / 单/批量移动 / 删除 / 上传 / 编辑保存
        → 反馈：每个动作 toast（成功 info / 失败 danger）
          → 危险：删除 / 批量移动 → Popconfirm 行内 / AlertDialog 二次确认
```

- 文档模式：MarkdownEditor 受控 value，编辑触发「自动保存中… → 已保存」态（用 `usePending`/防抖），字数统计，最后编辑人。
- 文件模式：网格多选（勾选角标），单图点开 ImageViewer，多选后批量移动（Transfer）/批量删除（Popconfirm）。

## 6. 文件结构

```
apps/www/app/demos/knowledge/
  page.tsx                       # 单路由 client 入口（"use client"）
  _data/
    types.ts                     # VaultNode / 视图态类型
    vault.ts                     # mock 节点 + useVault hook + 树/面包屑派生
    images.ts                    # 程序化 SVG data-URI（photoArt 风格）
    org.ts                       # 权限 Tree 的组织架构 mock
  _components/
    knowledge-shell.tsx          # 三栏骨架 + 顶栏 + 状态根（持 useVault）
    vault-tree.tsx               # 左：FileTree(增强) + 搜索 + ContextMenu + Upload
    doc-editor.tsx               # 中-文档：MarkdownEditor + 自动保存态
    file-grid.tsx                # 中-文件：网格 + 多选 + ImageViewer
    detail-panel.tsx             # 右：协作者 / Timeline 版本 / Tag / 权限 Tree
    move-dialog.tsx              # 移动：TreeSelect(单) / Transfer(批量)
```

`lib/demos.ts`（SSOT）追加 `knowledge` 条目（done）。

## 7. 约束与坑（同 README + 记忆）

- 100% dogfood，零手搓等价物；撞缺口回库（本设计已含 FileTree 增强）。
- 零外链：图片程序化 SVG。`demos:coverage` 远程资源门禁必须过。
- 共享文件（`lib/demos.ts`、`lib/manifest.ts` 等）落盘用 **hunk 级 `git apply --cached`**，避免卷走他人 WIP（记忆 `parallel-session-git-add-all-sweeps-your-staged-files`）。
- 预览用 `pnpm --filter www dev`（勿根目录 `pnpm dev`，会杀 5514，记忆 `hulian-pnpm-dev-killstale-kills-5514`）。
- 视觉验证用真实浏览器（headless 截图全空白，记忆 `www-msw-gate-blanks-headless-screenshots`）；MCP 被占起隔离 Chrome-for-Testing（记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）。

## 8. DoD

1. `demos:coverage` 让 Tree / FileTree / TreeSelect / MarkdownEditor / ImageViewer 从未覆盖变覆盖，覆盖率只升不降。
2. README §2 交互态清单逐条过（Skeleton / toast / Popconfirm / Tooltip / Empty / Alert+重试 / 零外链）。
3. FileTree 增强含单测，`packages/ui` 测试全绿（不破坏现有 showcase / 测试）。
4. 真实浏览器实机截图自证：三栏 + 文档编辑 + 文件预览(ImageViewer) + 上传态 + 权限 Tree + 移动选择器，零 console error。
5. 本地 commit（spec + FileTree 增强 + demo），hunk 级暂存避卷他人 WIP。
```
