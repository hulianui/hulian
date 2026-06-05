"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FileNode } from "@hulian/ui";
import { vaultImage } from "./images";
import type { VaultKind, VaultNode, VersionEntry, ViewMode } from "./types";

// ───────────────────────── mock 目录树 ─────────────────────────
// 瀚库 HanVault 研发团队知识库：研发中心 / 设计规范 / 产品文档 / 素材库 / 归档(空目录演示)。
// folder 也可带 content（landing 说明文档）；doc 带 markdown；image 带程序化 SVG。

const ARCH_MD = `# 前端架构总览

瀚库前端基于 **Next.js App Router** + \`@hulian/ui\` 组件库，强约束「100% dogfood」。

## 分层

- **L1 设计 Token**：单一真源，所有颜色/圆角/间距走 CSS 变量。
- **L2 组件库**：零依赖自研为主，复杂交互薄包 Base UI。
- **L3 业务**：demo / 内部后台，只消费 L2，不手搓等价物。

## 约定

1. 撞缺口 → 回库修组件，不在业务层打 CSS 补丁。
2. 每个增删改动作都要有 \`toast\` 反馈。
3. 危险操作走 Popconfirm / AlertDialog 二次确认。

> 详见 [组件库规范](#) 与 [接口约定](#)。
`;

const TOKEN_MD = `# 设计 Token 规范

设计 Token 是瀚库视觉的**单一真源**。禁止在业务层硬编码颜色。

## 语义色

| Token | 用途 |
| --- | --- |
| \`--primary\` | 主色 / 强调 |
| \`--surface\` | 卡片 / 面板背景 |
| \`--danger\` | 危险 / 删除 |

## 圆角

统一 \`--radius\`，小方控件用 \`min(var(--radius), ...)\` 防变成正圆。
`;

const PRD_MD = `# PRD · 团队知识库 v2

## 背景

研发资料散落在 IM、网盘、本地，检索成本高。需要一个**带搜索 / 版本 / 协作**的统一知识库。

## 核心功能

- [x] 目录树导航 + 树内搜索
- [x] 文档在线编辑（Markdown）
- [x] 文件上传 + 图片全屏预览
- [ ] 全文检索（二期）

## 非目标

- 不做实时多人协同编辑（二期评估）。
`;

const FOLDER_RD_MD = `# 研发中心

研发中心的架构文档、组件规范与接口约定都在这里。新人请先读 **前端架构总览**。
`;

interface Seed extends Omit<VaultNode, "id"> {
  id: string;
}

const SEED: Seed[] = [
  // 根级文件夹
  { id: "f-rd", name: "研发中心", kind: "folder", parentId: null, updatedAt: "2026-06-04 17:20", author: "林屿", content: FOLDER_RD_MD, collaborators: ["林屿", "陈墨", "孙昊"] },
  { id: "f-design", name: "设计规范", kind: "folder", parentId: null, updatedAt: "2026-06-03 10:05", author: "杨舒", collaborators: ["杨舒"] },
  { id: "f-prd", name: "产品文档", kind: "folder", parentId: null, updatedAt: "2026-06-02 14:40", author: "周琦", collaborators: ["周琦", "林屿"] },
  { id: "f-asset", name: "素材库", kind: "folder", parentId: null, updatedAt: "2026-06-01 09:12", author: "杨舒", collaborators: ["杨舒", "陈墨"] },
  { id: "f-archive", name: "归档", kind: "folder", parentId: null, updatedAt: "2026-05-20 18:00", author: "林屿" },

  // 研发中心/
  { id: "d-arch", name: "前端架构总览.md", kind: "doc", parentId: "f-rd", status: "modified", updatedAt: "2026-06-04 17:18", author: "林屿", content: ARCH_MD, tags: ["架构", "必读"], collaborators: ["林屿", "孙昊"] },
  { id: "d-comp", name: "组件库规范.md", kind: "doc", parentId: "f-rd", updatedAt: "2026-05-30 11:02", author: "陈墨", content: "# 组件库规范\n\n所有组件零依赖优先，复杂交互薄包 Base UI。命名 kebab-case，导出走 barrel。", tags: ["规范"], collaborators: ["陈墨"] },
  { id: "f-api", name: "接口约定", kind: "folder", parentId: "f-rd", updatedAt: "2026-05-28 16:30", author: "孙昊" },
  { id: "d-rest", name: "REST 设计.md", kind: "doc", parentId: "f-api", updatedAt: "2026-05-28 16:28", author: "孙昊", content: "# REST 设计\n\n资源用复数名词，动作用 HTTP 方法。错误体统一 `{ code, message }`。" },
  { id: "d-errcode", name: "错误码表.md", kind: "doc", parentId: "f-api", status: "added", updatedAt: "2026-06-04 09:40", author: "钱文", content: "# 错误码表\n\n| code | 含义 |\n| --- | --- |\n| 40001 | 参数缺失 |\n| 40101 | 未登录 |" },

  // 设计规范/
  { id: "d-token", name: "设计 Token.md", kind: "doc", parentId: "f-design", status: "added", updatedAt: "2026-06-03 10:02", author: "杨舒", content: TOKEN_MD, tags: ["Token", "必读"], collaborators: ["杨舒", "墨瑾"] },
  { id: "i-palette", name: "品牌色板.png", kind: "image", parentId: "f-design", updatedAt: "2026-06-02 15:20", author: "墨瑾", size: 248_000, src: vaultImage("品牌色板", "设计稿", 800, 600) },
  { id: "d-visual", name: "组件视觉规范.md", kind: "doc", parentId: "f-design", updatedAt: "2026-05-29 13:10", author: "杨舒", content: "# 组件视觉规范\n\n卡片留白 16px，阴影分三档。图标线宽 1.5。" },

  // 产品文档/
  { id: "d-prd", name: "PRD-知识库 v2.md", kind: "doc", parentId: "f-prd", updatedAt: "2026-06-02 14:38", author: "周琦", content: PRD_MD, tags: ["PRD"], collaborators: ["周琦", "林屿"] },
  { id: "d-compete", name: "竞品分析.md", kind: "doc", parentId: "f-prd", status: "renamed", updatedAt: "2026-05-26 10:00", author: "王雅", content: "# 竞品分析\n\nNotion / 语雀 / Confluence 对比：编辑体验、权限粒度、检索能力。" },

  // 素材库/
  { id: "i-poster", name: "首页海报.png", kind: "image", parentId: "f-asset", updatedAt: "2026-06-01 09:10", author: "墨瑾", size: 512_000, src: vaultImage("产品发布海报", "海报", 800, 1000) },
  { id: "i-banner", name: "Banner 设计稿.png", kind: "image", parentId: "f-asset", updatedAt: "2026-05-31 16:44", author: "杨舒", size: 386_000, src: vaultImage("活动 Banner", "设计稿", 1000, 600) },
  { id: "i-shot", name: "原型截图.png", kind: "image", parentId: "f-asset", status: "untracked", updatedAt: "2026-05-30 11:20", author: "陈墨", size: 174_000, src: vaultImage("编辑器原型", "原型", 900, 650) },
  { id: "i-illus", name: "空状态插画.png", kind: "image", parentId: "f-asset", updatedAt: "2026-05-28 09:00", author: "墨瑾", size: 96_000, src: vaultImage("空状态插画", "插画", 800, 700) },
  { id: "x-spec", name: "交互规格.pdf", kind: "file", parentId: "f-asset", updatedAt: "2026-05-25 14:30", author: "周琦", size: 1_280_000 },
];

// 版本历史（右栏 Timeline）按文档 id mock，缺省给通用三条。
const VERSIONS: Record<string, VersionEntry[]> = {
  "d-arch": [
    { rev: "v4", author: "林屿", at: "2026-06-04 17:18", note: "补充 L2 引擎优先原则" },
    { rev: "v3", author: "孙昊", at: "2026-05-22 10:00", note: "新增接口约定链接" },
    { rev: "v2", author: "林屿", at: "2026-05-10 09:30", note: "重写分层章节" },
    { rev: "v1", author: "林屿", at: "2026-04-28 14:00", note: "初稿" },
  ],
  "d-token": [
    { rev: "v3", author: "杨舒", at: "2026-06-03 10:02", note: "补圆角防正圆约定" },
    { rev: "v2", author: "墨瑾", at: "2026-05-20 15:40", note: "语义色表" },
    { rev: "v1", author: "杨舒", at: "2026-05-08 11:00", note: "初稿" },
  ],
};

export function versionsOf(id: string): VersionEntry[] {
  return (
    VERSIONS[id] ?? [
      { rev: "v2", author: "系统", at: "2026-06-01 10:00", note: "更新内容" },
      { rev: "v1", author: "系统", at: "2026-05-15 09:00", note: "创建" },
    ]
  );
}

// ───────────────────────── useVault hook ─────────────────────────

const KIND_ORDER: Record<VaultKind, number> = { folder: 0, doc: 1, image: 2, file: 3 };

export interface VaultActionResult {
  ok: boolean;
  message: string;
  detail?: string;
}

export function useVault() {
  const [nodes, setNodes] = useState<Record<string, VaultNode>>(() => {
    const map: Record<string, VaultNode> = {};
    for (const s of SEED) map[s.id] = { ...s };
    return map;
  });
  const idSeq = useRef(1);
  const newId = (prefix: string) => `${prefix}-${idSeq.current++}-n`;

  const list = useMemo(() => Object.values(nodes), [nodes]);

  const childrenOf = useCallback(
    (parentId: string | null) =>
      list
        .filter((n) => n.parentId === parentId)
        .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.name.localeCompare(b.name, "zh")),
    [list],
  );

  // VaultNode 树 → FileTree 的 FileNode[]（folder→folder，其余→file，带 status 角标）。
  const fileNodes = useMemo<FileNode[]>(() => {
    const build = (parentId: string | null): FileNode[] =>
      list
        .filter((n) => n.parentId === parentId)
        .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.name.localeCompare(b.name, "zh"))
        .map((n) => ({
          name: n.name,
          type: n.kind === "folder" ? "folder" : "file",
          status: n.status,
          defaultExpanded: false,
          children: n.kind === "folder" ? build(n.id) : undefined,
        }));
    return build(null);
  }, [list]);

  // path(name 拼接) ↔ id 双向映射（FileTree 用 path，hook 用 id）。
  const pathOfId = useMemo(() => {
    const m = new Map<string, string>();
    const walk = (parentId: string | null, prefix: string) => {
      for (const n of childrenOf(parentId)) {
        const p = prefix ? `${prefix}/${n.name}` : n.name;
        m.set(n.id, p);
        if (n.kind === "folder") walk(n.id, p);
      }
    };
    walk(null, "");
    return m;
  }, [childrenOf]);

  const idOfPath = useMemo(() => {
    const m = new Map<string, string>();
    for (const [id, p] of pathOfId) m.set(p, id);
    return m;
  }, [pathOfId]);

  // 面包屑：从根到该节点。
  const breadcrumbOf = useCallback(
    (id: string | null): VaultNode[] => {
      const chain: VaultNode[] = [];
      let cur = id ? nodes[id] : null;
      while (cur) {
        chain.unshift(cur);
        cur = cur.parentId ? nodes[cur.parentId] : null;
      }
      return chain;
    },
    [nodes],
  );

  /** 所有文件夹（移动目标选择器用）。 */
  const folders = useMemo(() => list.filter((n) => n.kind === "folder"), [list]);

  // ── 动作（均返回 VaultActionResult 供 UI toast）──
  const createDoc = useCallback((parentId: string | null, name = "未命名文档.md"): { id: string; res: VaultActionResult } => {
    const id = newId("d");
    setNodes((prev) => ({
      ...prev,
      [id]: { id, name, kind: "doc", parentId, status: "added", updatedAt: "刚刚", author: "林屿", content: `# ${name.replace(/\.md$/, "")}\n\n开始编写……` },
    }));
    return { id, res: { ok: true, message: "已新建文档", detail: name } };
  }, []);

  const createFolder = useCallback((parentId: string | null, name = "新建文件夹"): { id: string; res: VaultActionResult } => {
    const id = newId("f");
    setNodes((prev) => ({
      ...prev,
      [id]: { id, name, kind: "folder", parentId, updatedAt: "刚刚", author: "林屿" },
    }));
    return { id, res: { ok: true, message: "已新建文件夹", detail: name } };
  }, []);

  const rename = useCallback((id: string, name: string): VaultActionResult => {
    const old = nodes[id]?.name;
    setNodes((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], name, status: "modified" } } : prev));
    return { ok: true, message: "已重命名", detail: `${old} → ${name}` };
  }, [nodes]);

  const remove = useCallback((id: string): VaultActionResult => {
    const target = nodes[id];
    if (!target) return { ok: false, message: "节点不存在" };
    // 递归收集子孙
    const toDelete = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of Object.values(nodes)) {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          grew = true;
        }
      }
    }
    setNodes((prev) => {
      const next = { ...prev };
      for (const d of toDelete) delete next[d];
      return next;
    });
    return { ok: true, message: "已删除", detail: target.name };
  }, [nodes]);

  const move = useCallback((ids: string[], targetFolderId: string | null): VaultActionResult => {
    setNodes((prev) => {
      const next = { ...prev };
      for (const id of ids) if (next[id]) next[id] = { ...next[id], parentId: targetFolderId };
      return next;
    });
    const target = targetFolderId ? nodes[targetFolderId]?.name : "根目录";
    return { ok: true, message: `已移动 ${ids.length} 项`, detail: `至「${target}」` };
  }, [nodes]);

  const upload = useCallback((parentId: string | null, files: { name: string; size: number; isImage: boolean }[]): { ids: string[]; res: VaultActionResult } => {
    const created: string[] = [];
    setNodes((prev) => {
      const next = { ...prev };
      for (const f of files) {
        const id = newId("up");
        created.push(id);
        next[id] = {
          id,
          name: f.name,
          kind: f.isImage ? "image" : "file",
          parentId,
          status: "added",
          updatedAt: "刚刚",
          author: "林屿",
          size: f.size,
          src: f.isImage ? vaultImage(f.name.replace(/\.[^.]+$/, ""), "截图", 900, 650) : undefined,
        };
      }
      return next;
    });
    return { ids: created, res: { ok: true, message: `已上传 ${files.length} 个文件` } };
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    setNodes((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], content, status: "modified", updatedAt: "刚刚" } } : prev));
  }, []);

  const updateTags = useCallback((id: string, tags: string[]) => {
    setNodes((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], tags } } : prev));
  }, []);

  return {
    nodes,
    list,
    fileNodes,
    childrenOf,
    folders,
    pathOfId,
    idOfPath,
    breadcrumbOf,
    get: (id: string | null) => (id ? nodes[id] : undefined),
    createDoc,
    createFolder,
    rename,
    remove,
    move,
    upload,
    updateContent,
    updateTags,
  };
}

export type VaultApi = ReturnType<typeof useVault>;
export type { VaultNode, ViewMode };
