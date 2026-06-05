"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Bell, Moon, Sun, UploadCloud } from "lucide-react";
import {
  Alert,
  Button,
  Empty,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  User,
  useTheme,
  toast,
} from "@hulianui/ui";
import { useMockData } from "../../lib/async";
import { useVault, type VaultApi } from "../_data/vault";
import type { ViewMode } from "../_data/types";
import { VaultTree } from "./vault-tree";
import { CenterPane } from "./center-pane";
import { DetailPanel } from "./detail-panel";
import { MoveDialog } from "./move-dialog";

// ───── 共享上下文：VaultApi + 选中/视图态 + 移动对话框，避免逐层透传 ─────
interface KnowledgeCtx {
  v: VaultApi;
  selectedId: string | null;
  select: (id: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  /** 文件模式多选（image/file id 集合）。 */
  picked: string[];
  setPicked: (ids: string[]) => void;
  /** 打开移动对话框（单或多个 id）。 */
  openMove: (ids: string[]) => void;
}

const Ctx = createContext<KnowledgeCtx | null>(null);
export function useKnowledge() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useKnowledge 必须在 KnowledgeShell 内使用");
  return c;
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        库
      </span>
      <span className="truncate text-[15px] font-semibold tracking-tight">瀚库 HanVault</span>
      <span className="ml-1 hidden text-xs text-muted sm:inline">团队知识库</span>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="sm" onClick={toggle} aria-label={theme === "dark" ? "切换到亮色" : "切换到暗色"} className="size-9 px-0">
            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>
        }
      />
      <TooltipContent>{theme === "dark" ? "亮色模式" : "暗色模式"}</TooltipContent>
    </Tooltip>
  );
}

function ThreeColSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px]">
      <div className="space-y-2 border-r border-border p-3">
        <Skeleton className="h-8 w-full" />
        {["w-3/4", "w-5/6", "w-2/3", "w-11/12", "w-3/5", "w-4/5", "w-2/3", "w-5/6"].map((w, i) => (
          <Skeleton key={i} className={`h-6 ${w}`} />
        ))}
      </div>
      <div className="space-y-3 p-5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-3 border-l border-border p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function Inner() {
  const v = useVault();
  const [selectedId, setSelectedId] = useState<string | null>("d-arch");
  const [viewMode, setViewMode] = useState<ViewMode>("doc");
  const [picked, setPicked] = useState<string[]>([]);
  const [moveIds, setMoveIds] = useState<string[] | null>(null);

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      setPicked([]);
      const node = id ? v.get(id) : undefined;
      // 选中文档 → 文档模式；选中文件夹 → 文件模式（其内容网格）。
      if (node?.kind === "doc") setViewMode("doc");
      else if (node?.kind === "folder") setViewMode("file");
    },
    [v],
  );

  const openMove = useCallback((ids: string[]) => {
    if (ids.length) setMoveIds(ids);
  }, []);

  const ctx = useMemo<KnowledgeCtx>(
    () => ({ v, selectedId, select, viewMode, setViewMode, picked, setPicked, openMove }),
    [v, selectedId, select, viewMode, picked, openMove],
  );

  return (
    <Ctx.Provider value={ctx}>
      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px]">
        <VaultTree />
        <CenterPane />
        <DetailPanel />
      </div>
      <MoveDialog
        ids={moveIds}
        onClose={() => setMoveIds(null)}
        onConfirm={(ids, targetFolderId) => {
          const res = v.move(ids, targetFolderId);
          toast({ title: res.message, description: res.detail, tone: "info" });
          setMoveIds(null);
          setPicked([]);
        }}
      />
    </Ctx.Provider>
  );
}

export function KnowledgeShell() {
  // 首屏加载态 + 一次失败重试（演完整生命周期）。
  const { loading, error, reload } = useMockData(true, { delay: 650, failOnce: true });

  return (
    <div className="flex h-dvh flex-col bg-bg text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
        <Brand />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="sm" aria-label="通知" className="size-9 px-0">
                  <Bell className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>通知</TooltipContent>
          </Tooltip>
          <div className="mx-1 h-6 w-px bg-border" aria-hidden />
          <User name="林屿" description="前端 Lead" avatarProps={{ fallback: "林", src: "/demo/avatar-1.jpg" }} />
        </div>
      </header>

      {loading ? (
        <ThreeColSkeleton />
      ) : error ? (
        <div className="grid flex-1 place-items-center p-8">
          <Alert
            tone="danger"
            title="知识库加载失败"
            className="w-full max-w-md"
            action={
              <Button size="sm" onClick={reload}>
                <UploadCloud className="size-4" />
                重试
              </Button>
            }
          >
            {error}
          </Alert>
        </div>
      ) : (
        <Inner />
      )}
    </div>
  );
}

/** 中栏 / 详情面板共用的「未选中」空态。 */
export function NothingSelected({ hint }: { hint?: ReactNode }) {
  return (
    <div className="grid h-full place-items-center p-8">
      <Empty title="未选择内容" description={hint ?? "从左侧目录树选择一个文档或文件夹"} />
    </div>
  );
}
