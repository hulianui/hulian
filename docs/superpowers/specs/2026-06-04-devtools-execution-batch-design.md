# Devtools / 执行态 组件批：LogViewer · CodeDiff · FileTree

> 日期：2026-06-04 · 状态：已批准（用户"都做"）· 承 TaskRunner 打开的"执行/运行态"品类
> 准则：缺件就加、件有问题就修、100% dogfood @hulianui/ui、绝不在 demo 打 CSS 补丁

## 背景

TaskRunner 打开了"执行/运行态"品类。这批补三个 AI/devtools/CI 高频件，填补库在"运行输出可视化"上的薄弱面。全部纯展示数据驱动 + dogfood 既有原语。

复用面已核实：
- `_icons` 缺 Folder/File → 已补（lucide v1 path 内联）。
- `Conversation` 贴底法（ref + `scrollTop=scrollHeight` on render）→ LogViewer 复用。
- `ScrollArea` orientation vertical/horizontal/both。
- `Tree`（data-display/collection·通用递归树）→ FileTree 不硬套，做文件语义+状态轻量件。
- `CodeBlock`（typography/code）→ CodeDiff 共用等宽/容器 token。

---

## ① LogViewer（data-display/collection · "use client"）

真·流式日志输出（区别 `Terminal` mac 外壳动画 mockup）。

```ts
export type LogLevel = "info" | "warn" | "error" | "debug" | "success";
export interface LogLine {
  level?: LogLevel;       // @default "info"
  message: ReactNode;
  timestamp?: string;     // "12:00:03"
  source?: string;        // "[build]"
}
export interface LogViewerProps {
  lines: LogLine[];
  showTimestamp?: boolean;   // @default false
  autoScroll?: boolean;      // @default true，新行贴底
  wrap?: boolean;            // @default false → 长行横滚
  height?: number | string;  // @default 320
  className?: string;
}
```

- 等宽、深色感面（`bg-surface`/`bg-muted` token），逐行：`timestamp`(muted) + `source`(muted) + message 按 level 着色。
- level 色：info=foreground / warn=warning / error=danger / debug=muted / success=success。纯函数 `levelClass(level)` 可测。
- autoScroll 复用 Conversation 法（ref + effect 每渲染贴底）。
- wrap=false → `whitespace-pre` + 横向滚动；wrap=true → `whitespace-pre-wrap`。

## ② CodeDiff（typography/code）

代码前后对比。

```ts
export type DiffLineType = "add" | "del" | "context";
export interface DiffRow {
  type: DiffLineType;
  oldNo: number | null;
  newNo: number | null;
  text: string;
}
// 零依赖行级 LCS diff（纯函数·重点单测）
export function diffLines(oldText: string, newText: string): DiffRow[];

export interface CodeDiffProps {
  oldText: string;
  newText: string;
  mode?: "unified" | "split";   // @default "unified"
  filename?: string;            // 头部文件名条
  showLineNumbers?: boolean;    // @default true
  className?: string;
}
```

- `diffLines`：行级 LCS（DP 求最长公共子序列 → 回溯成 del/add/context 序列），分离为纯函数 `code-diff.diff.ts` 便于单测。
- unified：逐行 gutter `+`/`-`/空 + 行号槽 + 行底色（add=success/10、del=danger/10、context 无）。
- split：左右两列（左 old 含 del+context，右 new 含 add+context，对齐补空行）。
- 等宽、横向滚动长行；filename 头条。dogfood CodeBlock token 风格。

## ③ FileTree（data-display/collection · "use client"）

文件树 + 改动状态角标。先补 `_icons` Folder/File（已做）。

```ts
export type FileStatus = "added" | "modified" | "deleted" | "untracked" | "renamed";
export interface FileNode {
  name: string;
  type: "file" | "folder";
  status?: FileStatus;
  children?: FileNode[];
  defaultExpanded?: boolean;
}
export interface FileTreeProps {
  nodes: FileNode[];
  selectedName?: string;                       // 受控高亮（按 name）
  onSelect?: (node: FileNode, path: string) => void;
  className?: string;
}
```

- 递归渲染，文件夹 Chevron 展开/折叠（内部 state，`defaultExpanded` 初值）+ Folder 图标；文件 File 图标。
- 状态字母角标：added=`A`/success、modified=`M`/warning、deleted=`D`/danger、untracked=`U`/muted、renamed=`R`/brand。纯函数 `statusMeta(status)` → {letter, toneClass} 可测。
- 深度缩进 + 选中行高亮（复用 surface-hover）。`onSelect` 回传 node + 由 name 拼接的 path。

---

## 接线 + 验收

每件四件套 + index.ts barrel → 主 `index.ts` 导出 / `showcase.ts` 注册 / `registry.tsx`(import+specBySlug) / `manifest.ts` 条目。共享文件带他人 WIP → python hunk 过滤 `git apply --cached` 只暂存含自己标记的 hunk。

测试：
- LogViewer：levelClass 映射 / autoScroll 贴底 / timestamp 显隐 / wrap 切换
- CodeDiff：**diffLines 纯函数**（纯增/纯删/混合/无变化/空输入）/ unified 行底色 / split 两列 / 行号
- FileTree：statusMeta 映射 / 文件夹展开折叠 / onSelect 回传 / 选中高亮 / 嵌套渲染

门槛：ui 测试全绿 + tsc 干净 + manifest 校验 + Playwright 实机三页自证（明暗）。
