"use client";
import { useState, type ReactNode } from "react";
import { Download, Play, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  Button,
  Dialog,
  DialogContent,
  Heading,
  Image,
  Masonry,
  Segmented,
  Skeleton,
  Tag,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Video,
  cn,
  toast,
} from "@hulianui/ui";
import { meshGradient } from "../../_lib/artwork";
import { ratioMeta } from "../../_data/models";
import { ARTIFACTS } from "../../_data/artifacts";
import { useMockData } from "../../../lib/async";
import type { Artifact } from "../../_data/types";

const FILTERS = [
  { value: "all", label: "全部" },
  { value: "image", label: "图片" },
  { value: "video", label: "视频" },
];

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" role="status" aria-label="加载中">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-[calc(var(--radius)+0.25rem)]" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function Tile({ art, onOpen }: { art: Artifact; onOpen: (a: Artifact) => void }) {
  const r = ratioMeta(art.ratio);
  return (
    <button
      type="button"
      onClick={() => onOpen(art)}
      className="group relative block w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="w-full" style={{ aspectRatio: `${r.w} / ${r.h}` }}>
        {art.type === "video" ? (
          <Image src={art.poster ?? ""} alt={art.title} radius="none" className="size-full" imgClassName="size-full object-cover" />
        ) : (
          <div className="size-full" style={{ background: meshGradient(art.seed ?? 1) }} />
        )}
      </div>

      {/* 类型角标 */}
      <span className="absolute left-2 top-2">
        <Tag size="sm" tone={art.type === "video" ? "danger" : "neutral"} variant="solid">
          {art.type === "video" ? "视频" : "图片"}
        </Tag>
      </span>
      {art.type === "video" && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-transform group-hover:scale-110">
            <Play className="size-5 translate-x-px fill-current" />
          </span>
        </span>
      )}

      {/* hover 信息条 */}
      <div className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/75 to-transparent p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <div className="text-sm font-semibold text-white">{art.title}</div>
        <div className="text-xs text-white/70">{art.model} · {art.ratio}</div>
      </div>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 text-sm">
      <span className="w-16 shrink-0 text-muted">{label}</span>
      <span className="min-w-0 flex-1 text-foreground">{value}</span>
    </div>
  );
}

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Artifact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Artifact | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { data: allArtifacts, loading } = useMockData(ARTIFACTS, { delay: 600 });

  const list = (allArtifacts ?? [])
    .filter((a) => !deletedIds.has(a.id))
    .filter((a) => filter === "all" || a.type === filter);

  const handleDownload = (art: Artifact) => {
    toast({ title: `「${art.title}」已下载`, description: `${art.type === "video" ? "视频" : "图片"} · ${art.ratio}`, tone: "info" });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeletedIds((prev) => new Set([...prev, deleteTarget.id]));
    toast({ title: `「${deleteTarget.title}」已删除`, tone: "neutral" });
    if (active?.id === deleteTarget.id) setActive(null);
    setDeleteTarget(null);
  };

  return (
    <TooltipProvider delay={200}>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Heading level={1} size="2xl">
                产物画廊
              </Heading>
              <Text tone="muted" className="mt-1.5">
                历次工作流运行生成的图片与视频。点击查看详情与生成参数。
              </Text>
            </div>
            <Segmented items={FILTERS} value={filter} onValueChange={setFilter} />
          </header>

          {loading ? (
            <GallerySkeleton />
          ) : (
            <Masonry
              items={list}
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              gap={16}
              renderItem={(a) => <Tile art={a} onOpen={setActive} />}
            />
          )}
        </div>

        {/* 详情弹窗 */}
        <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <DialogContent title={active?.title ?? "产物详情"} className="max-w-3xl">
            {active && (
              <div className="grid items-start gap-5 sm:grid-cols-[1.4fr_1fr]">
                <div className="overflow-hidden rounded-[var(--radius)] border border-border">
                  {active.type === "video" ? (
                    <Video src={active.videoUrl ?? ""} poster={active.poster} title={active.title} />
                  ) : (
                    <div className="w-full" style={{ aspectRatio: `${ratioMeta(active.ratio).w} / ${ratioMeta(active.ratio).h}`, background: meshGradient(active.seed ?? 1) }} />
                  )}
                </div>
                <div className={cn("flex flex-col")}>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <Tag size="sm" tone="brand" variant="soft">{active.model}</Tag>
                    <Tag size="sm" tone="neutral" variant="outline">{active.ratio}</Tag>
                  </div>
                  <DetailRow label="工作流" value={active.workflow} />
                  <DetailRow label="提示词" value={active.prompt} />
                  {active.seed != null && <DetailRow label="种子" value={String(active.seed).padStart(6, "0")} />}
                  <DetailRow label="生成时间" value={active.createdAt} />

                  <div className="mt-4 flex gap-2">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(active)}
                            aria-label="下载产物"
                          />
                        }
                      >
                        <Download className="size-4" />
                        下载
                      </TooltipTrigger>
                      <TooltipContent side="top">下载到本地</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            tone="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(active)}
                            aria-label="删除产物"
                          />
                        }
                      >
                        <Trash2 className="size-4" />
                        删除
                      </TooltipTrigger>
                      <TooltipContent side="top">从画廊中删除</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 删除确认 */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent
            title="删除产物"
            description={`确认删除「${deleteTarget?.title}」吗？此操作无法撤销。`}
          >
            <AlertDialogClose render={<Button variant="outline" size="sm" />}>取消</AlertDialogClose>
            <Button tone="danger" size="sm" onClick={handleDeleteConfirm}>
              确认删除
            </Button>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
