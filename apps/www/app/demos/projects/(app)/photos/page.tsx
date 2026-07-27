"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  Button,
  Empty,
  Image,
  ImageViewer,
  Masonry,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Spinner,
  Tag,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@hulianui/ui";
import { photos as all, PHOTO_TAGS } from "../../_data/photos";
import { projects } from "../../_data/projects";
import { photoTagTone } from "../../_data/status";
import type { Photo } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

const PROJECT_OPTIONS = [
  { value: "", label: "全部项目" },
  ...projects.map((p) => ({ value: p.id, label: p.name })),
];

export default function PhotosPage() {
  const { data, loading } = useMockData(all);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projectId, setProjectId] = useState("");
  const [tag, setTag] = useState("all");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [uploadPending, runUpload] = usePending();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) setPhotos(data);
  }, [data]);

  const filtered = useMemo<Photo[]>(() => {
    return photos.filter((p) => {
      if (projectId && p.projectId !== projectId) return false;
      if (tag !== "all" && p.tag !== tag) return false;
      return true;
    });
  }, [photos, projectId, tag]);

  const images = filtered.map((p) => ({
    src: p.src,
    alt: p.caption,
    caption: `${p.projectName} · ${p.stage} · ${p.takenAt} · ${p.uploader}`,
  }));

  const openAt = (i: number) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  const handleUpload = () => {
    void runUpload(() => {
      toast({ title: "照片上传成功", description: "已加入工作照片库", tone: "success" });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 筛选区 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select items={PROJECT_OPTIONS} value={projectId} onValueChange={(v) => setProjectId(v as string)}>
              <SelectTrigger />
              <SelectContent>
                {PROJECT_OPTIONS.map((o) => (
                  <SelectItem key={o.value || "all"} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Segmented
            size="sm"
            value={tag}
            onValueChange={setTag}
            items={[
              { value: "all", label: "全部" },
              ...PHOTO_TAGS.map((t) => ({ value: t, label: t })),
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <Text size="sm" tone="muted">
            共 {filtered.length} 张
          </Text>
          {/* 隐藏 input 仅 demo 用 */}
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" aria-hidden />
          <Tooltip>
            <TooltipTrigger render={
              <Button
                size="sm"
                variant="outline"
                aria-label="上传照片"
                disabled={uploadPending}
                onClick={handleUpload}
              >
                {uploadPending ? <Spinner size="sm" /> : <Upload className="size-3.5" />}
              </Button>
            } />
            <TooltipContent>上传工作照片</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* 加载中 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* 瀑布流照片墙 */}
      {!loading && (filtered.length > 0 ? (
        <Masonry<Photo>
          items={filtered}
          columns={{ base: 2, md: 3, lg: 4 }}
          gap={14}
          renderItem={(p, i) => (
            <button
              type="button"
              onClick={() => openAt(i)}
              className="group block w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-left outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: 1 / p.ratio }}>
                <Image src={p.src} alt={p.caption} radius="none" isZoomed className="block size-full" />
                <span className="absolute left-2 top-2">
                  <Tag tone={photoTagTone(p.tag)} size="sm">
                    {p.tag}
                  </Tag>
                </span>
              </div>
              <div className="p-2.5">
                <div className="truncate text-sm font-medium text-foreground">{p.caption}</div>
                <div className="mt-0.5 truncate text-xs text-muted">
                  {p.projectName} · {p.stage}
                </div>
              </div>
            </button>
          )}
        />
      ) : (
        <Empty description="该筛选下暂无照片" />
      ))}

      <ImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        images={images}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
      />
    </div>
  );
}
