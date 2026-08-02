"use client";
import { copy } from "./vault.content";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FileNode } from "@hulianui/ui";
import { vaultImage } from "./images";
import type { VaultKind, VaultNode, VersionEntry, ViewMode } from "./types";

// ───────────────────────── mock 目录树 ─────────────────────────
// 瀚库 HanVault 研发团队知识库：研发中心 / 设计规范 / 产品文档 / 素材库 / 归档(空目录演示)。
// folder 也可带 content（landing 说明文档）；doc 带 markdown；image 带程序化 SVG。

const ARCH_MD = copy("frontEndArchitectureOverviewTheHankuFrontEndIsBased");

const TOKEN_MD = copy("designTokenSpecificationTheDesignTokenIsTheSingleSource");

const PRD_MD = copy("prdTeamKnowledgeBaseVBackgroundTheResearchAndDevelopment");

const FOLDER_RD_MD = copy("rDCenterTheRDCenterSArchitectureDocuments");

interface Seed extends Omit<VaultNode, "id"> {
  id: string;
}

const SEED: Seed[] = [
  // 根级文件夹
  {
    id: "f-rd",
    name: copy("rDCenter"),
    kind: "folder",
    parentId: null,
    updatedAt: "2026-06-04 17:20",
    author: copy("forestIsland"),
    content: FOLDER_RD_MD,
    collaborators: [copy("forestIsland"), copy("chenMo"), copy("sunHao")],
  },
  {
    id: "f-design",
    name: copy("designSpecifications"),
    kind: "folder",
    parentId: null,
    updatedAt: "2026-06-03 10:05",
    author: copy("yangShu"),
    collaborators: [copy("yangShu")],
  },
  {
    id: "f-prd",
    name: copy("productDocumentation"),
    kind: "folder",
    parentId: null,
    updatedAt: "2026-06-02 14:40",
    author: copy("zhouQi"),
    collaborators: [copy("zhouQi"), copy("forestIsland")],
  },
  {
    id: "f-asset",
    name: copy("materialLibrary"),
    kind: "folder",
    parentId: null,
    updatedAt: "2026-06-01 09:12",
    author: copy("yangShu"),
    collaborators: [copy("yangShu"), copy("chenMo")],
  },
  {
    id: "f-archive",
    name: copy("archive"),
    kind: "folder",
    parentId: null,
    updatedAt: "2026-05-20 18:00",
    author: copy("forestIsland"),
  },

  // 研发中心/
  {
    id: "d-arch",
    name: copy("frontendArchitectureOverviewMd"),
    kind: "doc",
    parentId: "f-rd",
    status: "modified",
    updatedAt: "2026-06-04 17:18",
    author: copy("forestIsland"),
    content: ARCH_MD,
    tags: [copy("architecture"), copy("requiredReading")],
    collaborators: [copy("forestIsland"), copy("sunHao")],
  },
  {
    id: "d-comp",
    name: copy("componentLibrarySpecificationMd"),
    kind: "doc",
    parentId: "f-rd",
    updatedAt: "2026-05-30 11:02",
    author: copy("chenMo"),
    content: copy("componentLibrarySpecificationsZeroDependencyOnAllComponentsIsPreferred"),
    tags: [copy("specification")],
    collaborators: [copy("chenMo")],
  },
  {
    id: "f-api",
    name: copy("interfaceConventions"),
    kind: "folder",
    parentId: "f-rd",
    updatedAt: "2026-05-28 16:30",
    author: copy("sunHao"),
  },
  {
    id: "d-rest",
    name: copy("restDesignMd"),
    kind: "doc",
    parentId: "f-api",
    updatedAt: "2026-05-28 16:28",
    author: copy("sunHao"),
    content: copy("restDesignResourcesUsePluralNounsAndActOnHTTP"),
  },
  {
    id: "d-errcode",
    name: copy("errorCodeTableMd"),
    kind: "doc",
    parentId: "f-api",
    status: "added",
    updatedAt: "2026-06-04 09:40",
    author: copy("qianWen"),
    content: copy("errorCodeTableCodeMeaningMissingParameterNotLoggedIn"),
  },

  // 设计规范/
  {
    id: "d-token",
    name: copy("designTokenMd"),
    kind: "doc",
    parentId: "f-design",
    status: "added",
    updatedAt: "2026-06-03 10:02",
    author: copy("yangShu"),
    content: TOKEN_MD,
    tags: ["Token", copy("requiredReading")],
    collaborators: [copy("yangShu"), copy("moJin")],
  },
  {
    id: "i-palette",
    name: copy("brandSwatchesPng"),
    kind: "image",
    parentId: "f-design",
    updatedAt: "2026-06-02 15:20",
    author: copy("moJin"),
    size: 248_000,
    src: vaultImage(copy("brandSwatches"), "设计稿", 800, 600),
  },
  {
    id: "d-visual",
    name: copy("componentVisualSpecificationMd"),
    kind: "doc",
    parentId: "f-design",
    updatedAt: "2026-05-29 13:10",
    author: copy("yangShu"),
    content: copy("componentVisionSpecificationLeaveTheCardBlankFor16pxAnd"),
  },

  // 产品文档/
  {
    id: "d-prd",
    name: copy("prdKnowledgeBaseVMd"),
    kind: "doc",
    parentId: "f-prd",
    updatedAt: "2026-06-02 14:38",
    author: copy("zhouQi"),
    content: PRD_MD,
    tags: ["PRD"],
    collaborators: [copy("zhouQi"), copy("forestIsland")],
  },
  {
    id: "d-compete",
    name: copy("competitorAnalysisMd"),
    kind: "doc",
    parentId: "f-prd",
    status: "renamed",
    updatedAt: "2026-05-26 10:00",
    author: copy("wangYa"),
    content: copy(
      "competitorAnalysisNotionSparrowConfluenceComparisonEditingExperiencePermissionGranularity",
    ),
  },

  // 素材库/
  {
    id: "i-poster",
    name: copy("homePosterPng"),
    kind: "image",
    parentId: "f-asset",
    updatedAt: "2026-06-01 09:10",
    author: copy("moJin"),
    size: 512_000,
    src: vaultImage(copy("productLaunchPoster"), "海报", 800, 1000),
  },
  {
    id: "i-banner",
    name: copy("bannerDesignDraftPng"),
    kind: "image",
    parentId: "f-asset",
    updatedAt: "2026-05-31 16:44",
    author: copy("yangShu"),
    size: 386_000,
    src: vaultImage(copy("eventBanner"), "设计稿", 1000, 600),
  },
  {
    id: "i-shot",
    name: copy("prototypeScreenshotPng"),
    kind: "image",
    parentId: "f-asset",
    status: "untracked",
    updatedAt: "2026-05-30 11:20",
    author: copy("chenMo"),
    size: 174_000,
    src: vaultImage(copy("editorPrototype"), "原型", 900, 650),
  },
  {
    id: "i-illus",
    name: copy("emptyStateIllustrationPng"),
    kind: "image",
    parentId: "f-asset",
    updatedAt: "2026-05-28 09:00",
    author: copy("moJin"),
    size: 96_000,
    src: vaultImage(copy("emptyStateIllustration"), "插画", 800, 700),
  },
  {
    id: "x-spec",
    name: copy("interactionSpecificationsPdf"),
    kind: "file",
    parentId: "f-asset",
    updatedAt: "2026-05-25 14:30",
    author: copy("zhouQi"),
    size: 1_280_000,
  },
];

// 版本历史（右栏 Timeline）按文档 id mock，缺省给通用三条。
const VERSIONS: Record<string, VersionEntry[]> = {
  "d-arch": [
    {
      rev: "v4",
      author: copy("forestIsland"),
      at: "2026-06-04 17:18",
      note: copy("supplementalLEnginePriorityPrinciple"),
    },
    {
      rev: "v3",
      author: copy("sunHao"),
      at: "2026-05-22 10:00",
      note: copy("addInterfaceConventionLink"),
    },
    {
      rev: "v2",
      author: copy("forestIsland"),
      at: "2026-05-10 09:30",
      note: copy("rewriteLayeredChapters"),
    },
    { rev: "v1", author: copy("forestIsland"), at: "2026-04-28 14:00", note: copy("firstDraft") },
  ],
  "d-token": [
    {
      rev: "v3",
      author: copy("yangShu"),
      at: "2026-06-03 10:02",
      note: copy("roundingCornerAntiRoundingConvention"),
    },
    { rev: "v2", author: copy("moJin"), at: "2026-05-20 15:40", note: copy("semanticColorChart") },
    { rev: "v1", author: copy("yangShu"), at: "2026-05-08 11:00", note: copy("firstDraft") },
  ],
};

export function versionsOf(id: string): VersionEntry[] {
  return (
    VERSIONS[id] ?? [
      { rev: "v2", author: copy("system"), at: "2026-06-01 10:00", note: copy("updates") },
      { rev: "v1", author: copy("system"), at: "2026-05-15 09:00", note: copy("create") },
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
        .sort(
          (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.name.localeCompare(b.name, "zh"),
        ),
    [list],
  );

  // VaultNode 树 → FileTree 的 FileNode[]（folder→folder，其余→file，带 status 角标）。
  const fileNodes = useMemo<FileNode[]>(() => {
    const build = (parentId: string | null): FileNode[] =>
      list
        .filter((n) => n.parentId === parentId)
        .sort(
          (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.name.localeCompare(b.name, "zh"),
        )
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
  const createDoc = useCallback(
    (
      parentId: string | null,
      name = copy("untitledDocumentMd"),
    ): { id: string; res: VaultActionResult } => {
      const id = newId("d");
      setNodes((prev) => ({
        ...prev,
        [id]: {
          id,
          name,
          kind: "doc",
          parentId,
          status: "added",
          updatedAt: copy("justNow"),
          author: copy("forestIsland"),
          content: copy("newDocumentTemplate", name.replace(/\.md$/, "")),
        },
      }));
      return { id, res: { ok: true, message: copy("newDocumentCreated"), detail: name } };
    },
    [],
  );

  const createFolder = useCallback(
    (parentId: string | null, name = copy("newFolder")): { id: string; res: VaultActionResult } => {
      const id = newId("f");
      setNodes((prev) => ({
        ...prev,
        [id]: {
          id,
          name,
          kind: "folder",
          parentId,
          updatedAt: copy("justNow"),
          author: copy("forestIsland"),
        },
      }));
      return { id, res: { ok: true, message: copy("newFolderCreated"), detail: name } };
    },
    [],
  );

  const rename = useCallback(
    (id: string, name: string): VaultActionResult => {
      const old = nodes[id]?.name;
      setNodes((prev) =>
        prev[id] ? { ...prev, [id]: { ...prev[id], name, status: "modified" } } : prev,
      );
      return { ok: true, message: copy("renamed"), detail: `${old} → ${name}` };
    },
    [nodes],
  );

  const remove = useCallback(
    (id: string): VaultActionResult => {
      const target = nodes[id];
      if (!target) return { ok: false, message: copy("nodeDoesNotExist") };
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
      return { ok: true, message: copy("deleted"), detail: target.name };
    },
    [nodes],
  );

  const move = useCallback(
    (ids: string[], targetFolderId: string | null): VaultActionResult => {
      setNodes((prev) => {
        const next = { ...prev };
        for (const id of ids) if (next[id]) next[id] = { ...next[id], parentId: targetFolderId };
        return next;
      });
      const target = targetFolderId ? nodes[targetFolderId]?.name : copy("rootDirectory");
      return {
        ok: true,
        message: copy("movedItemCount", ids.length),
        detail: copy("to", target),
      };
    },
    [nodes],
  );

  const upload = useCallback(
    (
      parentId: string | null,
      files: { name: string; size: number; isImage: boolean }[],
    ): { ids: string[]; res: VaultActionResult } => {
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
            updatedAt: copy("justNow"),
            author: copy("forestIsland"),
            size: f.size,
            src: f.isImage
              ? vaultImage(f.name.replace(/\.[^.]+$/, ""), "截图", 900, 650)
              : undefined,
          };
        }
        return next;
      });
      return {
        ids: created,
        res: { ok: true, message: copy("uploadedFileCount", files.length) },
      };
    },
    [],
  );

  const updateContent = useCallback((id: string, content: string) => {
    setNodes((prev) =>
      prev[id]
        ? {
            ...prev,
            [id]: { ...prev[id], content, status: "modified", updatedAt: copy("justNow") },
          }
        : prev,
    );
  }, []);

  const updateTags = useCallback((id: string, tags: string[]) => {
    setNodes((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], tags } } : prev));
  }, []);

  const updateCollaborators = useCallback((id: string, collaborators: string[]) => {
    setNodes((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], collaborators } } : prev));
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
    updateCollaborators,
  };
}

export type VaultApi = ReturnType<typeof useVault>;
export type { VaultNode, ViewMode };
