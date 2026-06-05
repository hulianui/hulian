# 瀚库 HanVault 知识库 Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `apps/www/app/demos/knowledge/` 建一个三栏知识库/网盘 demo，点亮零使用的 Tree/FileTree/TreeSelect，让 MarkdownEditor 当主角，并回库增强 FileTree（搜索/右键/受控展开）。

**Architecture:** 单路由客户端 SPA。FileTree 先回库增强（TDD），再建数据层（VaultNode + useVault 内存态 + 程序化 SVG），最后三栏 UI 组合，全 dogfood `@hulianui/ui`。

**Tech Stack:** Next.js App Router（output:export）, React client components, `@hulianui/ui`, vitest（FileTree 单测）。

---

## Task 1: FileTree 回库增强（纯函数 filterFileTree + 单测）

**Files:**
- Create: `packages/ui/src/file-tree/file-tree-core.ts`
- Create: `packages/ui/src/file-tree/file-tree-core.test.ts`

`filterFileTree` 仿 `tree/tree-core.ts` 的 `filterTree`，但按 FileNode（name/type/children）+ 拼接 path。

- [ ] **Step 1: 写失败测试** `file-tree-core.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { filterFileTree } from "./file-tree-core";
import type { FileNode } from "./file-tree.types";

const nodes: FileNode[] = [
  { name: "src", type: "folder", children: [
    { name: "button.tsx", type: "file" },
    { name: "card.tsx", type: "file" },
  ]},
  { name: "docs", type: "folder", children: [
    { name: "readme.md", type: "file" },
  ]},
];

describe("filterFileTree", () => {
  it("空 query 返回空集（不过滤）", () => {
    const r = filterFileTree(nodes, "");
    expect(r.matchedPaths.size).toBe(0);
    expect(r.autoExpandPaths.size).toBe(0);
  });
  it("命中叶 → 叶 path 进 matched，祖先 path 进 autoExpand", () => {
    const r = filterFileTree(nodes, "button");
    expect(r.matchedPaths.has("src/button.tsx")).toBe(true);
    expect(r.matchedPaths.has("src/card.tsx")).toBe(false);
    expect(r.autoExpandPaths.has("src")).toBe(true);
    expect(r.autoExpandPaths.has("docs")).toBe(false);
  });
  it("命中文件夹名 → 文件夹自身 matched 且 autoExpand（展开看子项）", () => {
    const r = filterFileTree(nodes, "docs");
    expect(r.matchedPaths.has("docs")).toBe(true);
    expect(r.autoExpandPaths.has("docs")).toBe(true);
  });
  it("大小写不敏感", () => {
    expect(filterFileTree(nodes, "BUTTON").matchedPaths.has("src/button.tsx")).toBe(true);
  });
});
```

- [ ] **Step 2: 跑测试确认失败** `pnpm --filter @hulianui/ui test file-tree-core` → FAIL（filterFileTree 未定义）

- [ ] **Step 3: 实现** `file-tree-core.ts`

```ts
import type { FileNode } from "./file-tree.types";

/** 过滤文件树：返回命中节点 path 与需自动展开（祖先 + 命中夹自身）的 path。path 为 name 拼接（与 FileTree 内部一致）。 */
export function filterFileTree(
  nodes: FileNode[],
  query: string,
): { matchedPaths: Set<string>; autoExpandPaths: Set<string> } {
  const matchedPaths = new Set<string>();
  const autoExpandPaths = new Set<string>();
  const q = query.trim().toLowerCase();
  if (!q) return { matchedPaths, autoExpandPaths };

  const dfs = (list: FileNode[], parentPath: string, ancestors: string[]): boolean => {
    let anyMatch = false;
    for (const node of list) {
      const path = parentPath ? `${parentPath}/${node.name}` : node.name;
      const selfMatch = node.name.toLowerCase().includes(q);
      const childMatch = node.children?.length
        ? dfs(node.children, path, [...ancestors, path])
        : false;
      if (selfMatch) matchedPaths.add(path);
      if (selfMatch || childMatch) {
        anyMatch = true;
        if (selfMatch) for (const a of ancestors) autoExpandPaths.add(a);
        if (childMatch) autoExpandPaths.add(path);
      }
    }
    return anyMatch;
  };
  dfs(nodes, "", []);
  return { matchedPaths, autoExpandPaths };
}
```

- [ ] **Step 4: 跑测试确认通过** `pnpm --filter @hulianui/ui test file-tree-core` → PASS

- [ ] **Step 5: Commit** `git add packages/ui/src/file-tree/file-tree-core.* && git commit -m "feat(ui): FileTree 新增 filterFileTree 纯函数(树内搜索+祖先自动展开)"`

---

## Task 2: FileTree 组件接入 searchable / onContextMenu / 受控展开

**Files:**
- Modify: `packages/ui/src/file-tree/file-tree.types.ts`
- Modify: `packages/ui/src/file-tree/file-tree.tsx`
- Modify: `packages/ui/src/file-tree/index.ts`（导出 filterFileTree）
- Modify: `packages/ui/src/file-tree/file-tree.test.tsx`（补受控展开 + 搜索 + 右键测试）

**关键约束（向后兼容）：** 三类展开 props 全不传时，行为与现状一致（per-node defaultExpanded + 自管）。实现方式：FileTree 顶层维护 `expanded: Set<string>`（受控/非受控对称），初值 = 各 folder `defaultExpanded` 收集的 path ∪ `defaultExpandedPaths`。Row 不再 useState，读顶层集合并 toggle。

- [ ] **Step 1: 改 types** —— 在 `FileTreeProps` 增：

```ts
  /** 受控展开的 folder path 集合。 */
  expandedPaths?: string[];
  /** 非受控初始展开（与各 folder 的 defaultExpanded 合并）。 */
  defaultExpandedPaths?: string[];
  onExpandedChange?: (paths: string[]) => void;
  /** 树内搜索框（过滤 + 命中祖先自动展开）。 */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** 行右键回调（消费者配 ContextMenu 锚光标弹菜单）。 */
  onContextMenu?: (node: FileNode, path: string, e: React.MouseEvent) => void;
```

- [ ] **Step 2: 改 file-tree.tsx** —— 顶层管理 expanded/搜索，Row 改为受控展开 + onContextMenu。完整实现：

```tsx
"use client";
import { useMemo, useState, type MouseEvent } from "react";
import { ChevronRight, Folder, File } from "../_icons";
import { cn } from "../lib/cn";
import { filterFileTree } from "./file-tree-core";
import type { FileNode, FileStatus, FileTreeProps } from "./file-tree.types";

const STATUS_META: Record<FileStatus, { letter: string; toneClass: string }> = {
  added: { letter: "A", toneClass: "text-success" },
  modified: { letter: "M", toneClass: "text-warning" },
  deleted: { letter: "D", toneClass: "text-danger" },
  untracked: { letter: "U", toneClass: "text-muted" },
  renamed: { letter: "R", toneClass: "text-primary" },
};
export function fileStatusMeta(status: FileStatus) { return STATUS_META[status]; }

function StatusBadge({ status }: { status?: FileStatus }) {
  if (!status) return null;
  const m = STATUS_META[status];
  return <span className={cn("ml-auto shrink-0 pl-2 font-mono text-xs font-medium", m.toneClass)}>{m.letter}</span>;
}

// 收集所有 defaultExpanded folder 的 path（向后兼容初值）。
function collectDefaultExpanded(nodes: FileNode[], parent: string, acc: Set<string>) {
  for (const n of nodes) {
    const path = parent ? `${parent}/${n.name}` : n.name;
    if (n.type === "folder") {
      if (n.defaultExpanded) acc.add(path);
      if (n.children) collectDefaultExpanded(n.children, path, acc);
    }
  }
}

interface RowProps {
  node: FileNode; depth: number; path: string;
  selectedPath?: string;
  expandedSet: Set<string>;
  toggle: (path: string) => void;
  onSelect?: FileTreeProps["onSelect"];
  onContextMenu?: FileTreeProps["onContextMenu"];
  visible?: Set<string> | null; // 搜索激活时的可见 path 白名单
}

function Row({ node, depth, path, selectedPath, expandedSet, toggle, onSelect, onContextMenu, visible }: RowProps) {
  if (visible && !visible.has(path)) return null;
  const isFolder = node.type === "folder";
  const open = isFolder && expandedSet.has(path);
  const selected = selectedPath === path;
  return (
    <li>
      <button
        type="button"
        onClick={() => { if (isFolder) toggle(path); onSelect?.(node, path); }}
        onContextMenu={(e: MouseEvent) => { onContextMenu?.(node, path, e); }}
        aria-expanded={isFolder ? open : undefined}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-sm text-foreground hover:bg-surface-hover",
          selected && "bg-surface-hover",
        )}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-muted">
          {isFolder ? <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} aria-hidden /> : null}
        </span>
        <span className="shrink-0 text-muted [&>svg]:size-4">{isFolder ? <Folder aria-hidden /> : <File aria-hidden />}</span>
        <span className="truncate">{node.name}</span>
        <StatusBadge status={node.status} />
      </button>
      {isFolder && open && node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child, i) => (
            <Row key={i} node={child} depth={depth + 1} path={`${path}/${child.name}`}
              selectedPath={selectedPath} expandedSet={expandedSet} toggle={toggle}
              onSelect={onSelect} onContextMenu={onContextMenu} visible={visible} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({
  nodes, selectedPath, onSelect, onContextMenu, className,
  expandedPaths, defaultExpandedPaths, onExpandedChange,
  searchable, searchPlaceholder = "搜索文件",
}: FileTreeProps) {
  const [query, setQuery] = useState("");
  const defaultExpanded = useMemo(() => {
    const s = new Set<string>(defaultExpandedPaths ?? []);
    collectDefaultExpanded(nodes, "", s);
    return s;
  }, [nodes, defaultExpandedPaths]);

  const [uncontrolled, setUncontrolled] = useState<Set<string>>(defaultExpanded);
  const controlled = expandedPaths != null;
  const userExpanded = controlled ? new Set(expandedPaths) : uncontrolled;

  const search = useMemo(() => (searchable ? filterFileTree(nodes, query) : null), [searchable, nodes, query]);

  // 搜索激活：可见集 = 命中 path + 其所有祖先；展开集 = 用户展开 ∪ 自动展开。
  const { visible, expandedSet } = useMemo(() => {
    if (!search || query.trim() === "") return { visible: null as Set<string> | null, expandedSet: userExpanded };
    const vis = new Set<string>();
    for (const p of search.matchedPaths) {
      const parts = p.split("/");
      let acc = "";
      for (const part of parts) { acc = acc ? `${acc}/${part}` : part; vis.add(acc); }
    }
    for (const p of search.autoExpandPaths) vis.add(p);
    return { visible: vis, expandedSet: new Set([...userExpanded, ...search.autoExpandPaths]) };
  }, [search, query, userExpanded]);

  const toggle = (path: string) => {
    const next = new Set(userExpanded);
    if (next.has(path)) next.delete(path); else next.add(path);
    if (!controlled) setUncontrolled(next);
    onExpandedChange?.([...next]);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {searchable && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1.5 text-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
      )}
      <ul className="rounded-[var(--radius)] border border-border bg-surface p-1.5">
        {nodes.map((node, i) => (
          <Row key={i} node={node} depth={0} path={node.name}
            selectedPath={selectedPath} expandedSet={expandedSet} toggle={toggle}
            onSelect={onSelect} onContextMenu={onContextMenu} visible={visible} />
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: 导出 filterFileTree** —— `index.ts` 增 `export { filterFileTree } from "./file-tree-core";`

- [ ] **Step 4: 补组件测试** —— 在 `file-tree.test.tsx` 末尾追加：

```tsx
import { filterFileTree } from "./file-tree-core";

describe("FileTree 受控/搜索/右键", () => {
  it("searchable 过滤出命中并自动展开祖先", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<FileTree nodes={nodes} searchable />);
    fireEvent.change(getByPlaceholderText("搜索文件"), { target: { value: "old" } });
    expect(getByText("old.ts")).toBeTruthy(); // lib 自动展开
    expect(queryByText("index.ts")).toBeNull(); // 未命中隐藏
  });
  it("onContextMenu 右键回传 node+path", () => {
    const onCtx = vi.fn();
    const { getByText } = render(<FileTree nodes={nodes} onContextMenu={onCtx} />);
    fireEvent.contextMenu(getByText("index.ts"));
    expect(onCtx).toHaveBeenCalledWith(expect.objectContaining({ name: "index.ts" }), "src/index.ts", expect.anything());
  });
  it("受控 expandedPaths 控制展开", () => {
    const { queryByText, rerender } = render(<FileTree nodes={nodes} expandedPaths={[]} />);
    expect(queryByText("index.ts")).toBeNull();
    rerender(<FileTree nodes={nodes} expandedPaths={["src"]} />);
    expect(queryByText("index.ts")).toBeTruthy();
  });
});
```

- [ ] **Step 5: 跑全量 file-tree 测试 + 确认旧测试不破** `pnpm --filter @hulianui/ui test file-tree` → 全 PASS（含旧 5 项）

- [ ] **Step 6: Commit** `git add packages/ui/src/file-tree/ && git commit -m "feat(ui): FileTree 接入 searchable/onContextMenu/受控展开(向后兼容 per-node defaultExpanded)"`

---

## Task 3: 数据层 — types / 程序化图片 / org

**Files:**
- Create: `apps/www/app/demos/knowledge/_data/types.ts`
- Create: `apps/www/app/demos/knowledge/_data/images.ts`
- Create: `apps/www/app/demos/knowledge/_data/org.ts`

- [ ] **Step 1: types.ts** —— VaultNode（见 spec §4）+ 视图态类型（ViewMode="doc"|"file"、Collaborator、VersionEntry）。
- [ ] **Step 2: images.ts** —— 仿 `projects/_data/photos.ts` 的 `photoArt()`：`vaultImage(seed,w,h): string` 返回 data-URI SVG（mesh 渐变 + 居中标题 + 类别配色），导出若干命名图（封面/海报/截图）。零外链。
- [ ] **Step 3: org.ts** —— 权限 Tree 的 TreeNode 组织架构（产品部/研发中心/设计组 → 成员），导出 `ORG_TREE: TreeNode[]`（来自 `@hulianui/ui` 的 TreeNode 类型）。
- [ ] **Step 4: Commit** `git commit -m "feat(www): knowledge demo 数据层 types/程序化图片/org"`

---

## Task 4: useVault 内存态 hook + mock 节点树

**Files:**
- Create: `apps/www/app/demos/knowledge/_data/vault.ts`

- [ ] **Step 1:** 写 mock `VaultNode[]`（研发中心 / 设计规范 / 产品文档 / 素材库 多级目录，含 doc 带 markdown 正文、image 带程序化 src、含一个空目录、若干 status 角标）。
- [ ] **Step 2:** `useVault()` hook：
  - state：nodes（Record<id,VaultNode>）、selectedId、viewMode、expandedPaths、selectedFileIds（文件模式多选）。
  - 派生：`toFileNodes()`（VaultNode→FileTree 的 FileNode[]，doc/image/file=file、folder=folder，按 path）、`breadcrumb`、`currentFolder` 内容列表、`selectedNode`。
  - 动作：`createDoc/createFolder/rename/remove/move(ids,targetFolderId)/upload(files)/updateContent(id,md)`，每个返回供 UI toast。
- [ ] **Step 3: Commit** `git commit -m "feat(www): knowledge useVault 内存态 hook + mock 目录树"`

---

## Task 5: 三栏骨架 knowledge-shell + 顶栏 + 加载/空/失败态

**Files:**
- Create: `apps/www/app/demos/knowledge/_components/knowledge-shell.tsx`
- Create: `apps/www/app/demos/knowledge/page.tsx`

- [ ] **Step 1:** `page.tsx`（"use client"）渲染 `<KnowledgeShell />`。
- [ ] **Step 2:** shell：`useMockData(seed,{delay,failOnce})` 驱动首屏 → 三栏 Skeleton；失败 → Alert+重试；成功后挂 useVault。顶栏 Brand「[库]瀚库 HanVault」+ Breadcrumb（当前 path）+ 全局搜索 Input + 上传按钮 + 主题切换 + User。三栏 grid：左 280 / 中 flex / 右 320，各栏边框。空目录中栏 Empty。
- [ ] **Step 3: Commit** `git commit -m "feat(www): knowledge 三栏骨架 + 顶栏 + 加载/空/失败态"`

---

## Task 6: 左栏 vault-tree（FileTree 增强 + ContextMenu + Upload）

**Files:**
- Create: `apps/www/app/demos/knowledge/_components/vault-tree.tsx`

- [ ] **Step 1:** FileTree `searchable` + `selectedPath` + `onSelect`（切当前节点）+ `onContextMenu`（记录 active node，弹库 `ContextMenu`：新建文档/新建文件夹/重命名/移动/删除，删除 danger 配 Popconfirm/AlertDialog 二次确认）。
- [ ] **Step 2:** 底部 `Upload` dropzone：onSelect → `usePending` 包装上传，进度回填 UploadFile，完成 toast。
- [ ] **Step 3:** 纯图标按钮（新建/折叠）配 Tooltip。
- [ ] **Step 4: Commit** `git commit -m "feat(www): knowledge 左栏 FileTree+右键菜单+Upload"`

---

## Task 7: 中栏 doc-editor（MarkdownEditor 主角） + file-grid（ImageViewer 多选）

**Files:**
- Create: `apps/www/app/demos/knowledge/_components/doc-editor.tsx`
- Create: `apps/www/app/demos/knowledge/_components/file-grid.tsx`

- [ ] **Step 1: doc-editor** —— Segmented 文档/文件切换在工具条；文档模式 `MarkdownEditor` value=当前 doc.content，onChange → 防抖「保存中…→已保存」态（usePending/sleep）+ 字数 + 最后编辑人，保存 toast。
- [ ] **Step 2: file-grid** —— 当前文件夹的 image/file 网格卡片，勾选多选（角标）；image 点击 → `ImageViewer`（受控 index，images 来自当前文件夹图片）；多选后工具条出「批量移动」「批量删除（Popconfirm）」。空 → Empty。
- [ ] **Step 3: Commit** `git commit -m "feat(www): knowledge 中栏 MarkdownEditor 主角 + 文件网格 ImageViewer"`

---

## Task 8: 右栏 detail-panel + move-dialog（TreeSelect / Transfer）

**Files:**
- Create: `apps/www/app/demos/knowledge/_components/detail-panel.tsx`
- Create: `apps/www/app/demos/knowledge/_components/move-dialog.tsx`

- [ ] **Step 1: detail-panel** —— 选中节点信息（名/作者/改动时间/大小）+ 协作者 AvatarGroup + 版本 Timeline + 标签 Tag（可加/删）+ 访问权限 `Tree` checkable（数据 ORG_TREE，父子级联半选，onCheck → toast 权限更新）。无选中 → Empty。
- [ ] **Step 2: move-dialog** —— Drawer/Dialog：单文档移动用 `TreeSelect`（树=文件夹结构，选目标文件夹）；批量（多文件）移动用 `Transfer`（dataSource=可移动项，targetKeys=入选）。确认 → useVault.move + toast。
- [ ] **Step 3:** 接进 shell（右栏 + 移动对话框由 context/props 触发）。
- [ ] **Step 4: Commit** `git commit -m "feat(www): knowledge 右栏详情(Tree权限/Timeline版本) + 移动 TreeSelect/Transfer"`

---

## Task 9: 注册 demos.ts + 覆盖率 + 实机自证 + 收尾 commit

**Files:**
- Modify: `apps/www/app/demos/lib/demos.ts`（hunk 级暂存）

- [ ] **Step 1:** demos.ts 追加 `knowledge` 条目（category 中后台，tags `["FileTree","Tree","MarkdownEditor","ImageViewer","TreeSelect"]`，status done）。
- [ ] **Step 2:** `pnpm --filter www demos:coverage` —— 确认 Tree/FileTree/TreeSelect/MarkdownEditor 从未覆盖变覆盖，覆盖率较改造前只升不降；远程资源门禁过（0 外链）。
- [ ] **Step 3:** `pnpm --filter @hulianui/ui test`（FileTree 增强不破其它）+ www typecheck/build 局部验证。
- [ ] **Step 4: 实机自证** —— `pnpm --filter www dev` 起预览；隔离 Chrome-for-Testing（记忆 mcp-browser-busy…）截：三栏首屏 / 文档编辑 / 文件 ImageViewer 全屏 / 上传态 / 右键菜单 / 权限 Tree / 移动选择器，确认零 console error；加载态截加载中帧。
- [ ] **Step 5: 收尾 commit** —— demo 全量 + demos.ts（hunk 级 `git apply --cached` 避卷他人 WIP），message `feat(www): 瀚库 HanVault 知识库 demo(点亮 Tree/FileTree/TreeSelect + MarkdownEditor 主角)`。

---

## Self-Review

- **Spec 覆盖**：FileTree 增强(T1-2)/数据层(T3-4)/三栏(T5-8)/Tree 权限(T8)/TreeSelect+Transfer 移动(T8)/MarkdownEditor 主角(T7)/ImageViewer(T7)/Upload(T6)/生命周期 Skeleton·Empty·Alert·toast·Popconfirm·Tooltip(T5-8)/coverage+实机(T9) —— 逐项有任务。
- **向后兼容**：T2 明确三类展开 props 不传 = 现状行为，旧 showcase/test 不破（T2 Step5 跑旧测试）。
- **零外链**：T3 程序化 SVG，T9 coverage 门禁兜底。
- **落盘安全**：T9 共享文件 hunk 级暂存。
