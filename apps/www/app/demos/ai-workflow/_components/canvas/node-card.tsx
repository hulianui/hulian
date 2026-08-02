import { copy } from "./node-card.content";
import type { ReactNode } from "react";
import { Play } from "lucide-react";
import { AspectRatio, Dot, Image, Spinner, Tag, cn } from "@hulianui/ui";
import type { FlowNode } from "@hulianui/ui";
import { meshGradient } from "../../_lib/artwork";
import { ACCENT, NODE_KIND_MAP } from "../../_data/node-kinds";
import { modelName, ratioMeta } from "../../_data/models";
import type { FlowNodeData, NodeResult, NodeStatus } from "../../_data/types";

function StatusBadge({ status }: { status: NodeStatus }) {
  if (status === "running") return <Spinner size="sm" tone="primary" />;
  if (status === "queued") return <Dot tone="warning" pulse aria-label={copy("queued")} />;
  if (status === "done") return <Dot tone="success" aria-label={copy("completed")} />;
  if (status === "error") return <Dot tone="danger" aria-label={copy("failed")} />;
  return <Dot tone="neutral" aria-label={copy("notRunning")} />;
}

/** 图/视频产物缩略。 */
function ResultThumb({ result, ratio = 1 }: { result: NodeResult; ratio?: number }) {
  if (result.type === "video") {
    return (
      <div className="relative overflow-hidden rounded-[var(--radius)]">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={result.poster ?? ""}
            alt={copy("videoProduct")}
            radius="none"
            className="size-full"
            imgClassName="size-full object-cover"
          />
        </AspectRatio>
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
            <Play className="size-4 translate-x-px fill-current" />
          </span>
        </div>
        {result.meta && (
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {result.meta}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-[var(--radius)]">
      <AspectRatio ratio={ratio}>
        <div className="size-full" style={{ background: meshGradient(result.seed ?? 1) }} />
      </AspectRatio>
      {result.meta && (
        <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {result.meta}
        </span>
      )}
    </div>
  );
}

function MetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">{children}</div>
  );
}

function NodeBody({ data }: { data: FlowNodeData }) {
  switch (data.kind) {
    case "prompt":
      return (
        <div className="space-y-2">
          <p className="line-clamp-3 text-xs leading-relaxed text-foreground">
            {data.positive || copy("emptyPrompt")}
          </p>
          {data.styles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.styles.map((s) => (
                <Tag key={s} size="sm" tone="brand" variant="soft">
                  {s}
                </Tag>
              ))}
            </div>
          )}
        </div>
      );
    case "image-input":
      return (
        <div className="space-y-2">
          <ResultThumb result={{ type: "image", seed: data.seed }} />
          <MetaRow>
            <span className="truncate">{data.fileName}</span>
          </MetaRow>
        </div>
      );
    case "model":
      return (
        <div className="space-y-1.5">
          <Tag size="sm" tone="brand" variant="soft">
            {modelName(data.model)}
          </Tag>
          <MetaRow>
            <span>{data.sampler}</span>
            <span>·</span>
            <span>
              {data.steps} {copy("step")}
            </span>
            <span>·</span>
            <span>CFG {data.cfg}</span>
            <span>·</span>
            <span>{ratioMeta(data.ratio).label}</span>
          </MetaRow>
        </div>
      );
    case "upscale":
      return (
        <MetaRow>
          <Tag size="sm" tone="warning" variant="soft">
            ×{data.factor} {copy("overscores")}
          </Tag>
          {data.faceRestore && (
            <Tag size="sm" tone="neutral" variant="outline">
              {copy("facialRepair")}
            </Tag>
          )}
        </MetaRow>
      );
    case "i2v":
      return (
        <MetaRow>
          <Tag size="sm" tone="danger" variant="soft">
            {data.duration}s · {data.fps}fps
          </Tag>
          <span>
            {data.motion === "subtle"
              ? copy("slightMirrorMovement")
              : data.motion === "dynamic"
              ? copy("strongExercise")
              : copy("moderateDynamic")}
          </span>
        </MetaRow>
      );
    case "output":
      return (
        <div className="space-y-2">
          <Tag size="sm" tone="neutral" variant="outline">
            {data.format === "video" ? copy("video") : copy("image")}
          </Tag>
        </div>
      );
  }
}

/** 画布节点卡：头部（拖拽手柄·图标+标题+状态）+ 摘要体 + 产物缩略。编辑在右侧检查器。 */
export function NodeCard({ node }: { node: FlowNode<FlowNodeData> }) {
  const data = node.data;
  const meta = NODE_KIND_MAP[data.kind];
  const accent = ACCENT[meta.accent];
  const Icon = meta.icon;
  const ratio = data.kind === "model" ? ratioMeta(data.ratio).w / ratioMeta(data.ratio).h : 1;
  const showResult = data.kind === "output" && data.result;

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)+0.25rem)]">
      <header className={cn("flex items-center gap-2 px-3 pt-2.5", "pb-2")}>
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-[var(--radius)]",
            accent.chip,
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {data.title}
        </span>
        <StatusBadge status={data.status} />
      </header>
      <div className="space-y-2 px-3 pb-3">
        <NodeBody data={data} />
        {showResult && data.result && (
          <ResultThumb result={data.result} ratio={data.result.type === "image" ? 1 : undefined} />
        )}
      </div>
    </div>
  );
}
