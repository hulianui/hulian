"use client";
import { useId, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../lib/cn";
import type { UploadFile, UploadProps, UploadRejection } from "./upload.types";

// 自研零依赖上传（表现层）：dropzone/button 形态 + accept/maxSize/limit 校验 + 受控文件列表。
// 依然**不做网络传输**——只发 onSelect(File[])，状态/进度由消费者回填到 files；
// 需要自动上传/进度/并发请配 useUpload（传输函数由应用层提供，库内不认识任何后端信封形状）。

export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((tok) => {
    if (tok.startsWith(".")) return name.endsWith(tok); // 扩展名
    if (tok.endsWith("/*")) return type.startsWith(tok.slice(0, -1)); // "image/*" → "image/"
    return type === tok; // 精确 mime
  });
}

/** 把 activeId 移到 overId 的位置，返回新数组（不改原数组）；id 不存在或原地则原样返回。 */
export function moveUploadFile(files: UploadFile[], activeId: string, overId: string): UploadFile[] {
  const from = files.findIndex((f) => f.id === activeId);
  const to = files.findIndex((f) => f.id === overId);
  if (from < 0 || to < 0 || from === to) return files;
  return arrayMove(files, from, to);
}

function formatBytes(n?: number): string {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const STATUS_DOT: Record<NonNullable<UploadFile["status"]>, string> = {
  ready: "bg-border",
  uploading: "bg-primary",
  success: "bg-success",
  error: "bg-danger",
};

const ROW_CLASS =
  "flex items-center gap-3 rounded-[min(var(--radius),0.5rem)] border border-border bg-surface px-3 py-2 text-sm";

interface RowProps {
  file: UploadFile;
  renderPreview?: UploadProps["renderPreview"];
  onRemove?: (id: string) => void;
}

/** 行内容（无 hook，静态行与可拖行共用）。 */
function RowBody({ file: f, renderPreview, onRemove }: RowProps) {
  const dot = STATUS_DOT[f.status ?? "ready"];
  const preview = renderPreview?.(f);
  const pct = f.progress == null ? 0 : Math.min(100, Math.max(0, f.progress));

  return (
    <>
      {preview ? (
        // 有预览：缩略图占位，状态点降级为右下角标（ring 用 surface 与卡片底色对齐，明暗两态都成立）
        <span className="relative size-10 shrink-0 overflow-hidden rounded-[min(var(--radius),0.375rem)] border border-hairline bg-surface-hover [&_img]:size-full [&_img]:object-cover">
          {preview}
          <span
            className={cn("absolute bottom-0.5 right-0.5 size-2 rounded-full ring-2 ring-surface", dot)}
            aria-hidden
          />
        </span>
      ) : (
        <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-foreground">{f.name}</span>
        {f.status === "uploading" && f.progress != null ? (
          <span className="mt-1 flex items-center gap-2">
            <span
              role="progressbar"
              aria-label={`${f.name} 上传进度`}
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="block h-1 flex-1 overflow-hidden rounded-full bg-surface-hover"
            >
              <span
                className="block h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted">{Math.round(pct)}%</span>
          </span>
        ) : f.status === "error" && f.error ? (
          <span className="mt-0.5 block text-xs text-danger">{f.error}</span>
        ) : (
          f.size != null && <span className="mt-0.5 block text-xs text-muted">{formatBytes(f.size)}</span>
        )}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(f.id)}
          aria-label={`移除 ${f.name}`}
          className="shrink-0 rounded-[min(var(--radius),0.375rem)] p-1 text-muted outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </>
  );
}

function StaticRow(props: RowProps) {
  return (
    <li className={ROW_CLASS}>
      <RowBody {...props} />
    </li>
  );
}

/** 可拖调序的行：手柄式 activator（行内有移除按钮，整行可拖会吞掉点击）。 */
function SortableRow(props: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props.file.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(ROW_CLASS, "select-none", isDragging && "relative z-10 shadow-lg ring-1 ring-border")}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`拖拽排序 ${props.file.name}`}
        className="-ml-1 shrink-0 cursor-grab touch-none rounded text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <RowBody {...props} />
    </li>
  );
}

export function Upload({
  accept,
  multiple = false,
  disabled = false,
  maxSize,
  limit,
  variant = "dropzone",
  files,
  renderPreview,
  sortable = false,
  onSort,
  onSelect,
  onReject,
  onRemove,
  label = "点击或拖拽文件到此处",
  hint,
  buttonLabel = "选择文件",
  children,
  className,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const listId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const count = files?.length ?? 0;
  // 达到 limit 后触发器整体不可交互（比"能点开却全被拒"更诚实）
  const atLimit = limit != null && count >= limit;
  const blocked = disabled || atLimit;

  function process(fileList: FileList | File[]) {
    const accepted: File[] = [];
    const rejected: UploadRejection[] = [];
    for (const f of Array.from(fileList)) {
      if (!matchesAccept(f, accept)) rejected.push({ file: f, reason: "type" });
      else if (maxSize != null && f.size > maxSize) rejected.push({ file: f, reason: "size" });
      else accepted.push(f);
    }
    const capped = multiple ? accepted : accepted.slice(0, 1);
    // 名额按受控 files 当前长度算：剩余名额之外的一律 reason="limit"
    const room = limit == null ? capped.length : Math.max(0, limit - count);
    const picked = capped.slice(0, room);
    for (const f of capped.slice(room)) rejected.push({ file: f, reason: "limit" });
    if (picked.length) onSelect?.(picked);
    if (rejected.length) onReject?.(rejected);
  }

  function openDialog() {
    if (!blocked) inputRef.current?.click();
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={blocked}
      className="sr-only"
      aria-hidden
      tabIndex={-1}
      onChange={(e) => {
        if (e.target.files) process(e.target.files);
        e.target.value = ""; // 允许重复选同一文件
      }}
    />
  );

  const rows = files?.map((f) =>
    sortable && onSort ? (
      <SortableRow key={f.id} file={f} renderPreview={renderPreview} onRemove={onRemove} />
    ) : (
      <StaticRow key={f.id} file={f} renderPreview={renderPreview} onRemove={onRemove} />
    ),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || !files || active.id === over.id) return;
    const next = moveUploadFile(files, String(active.id), String(over.id));
    if (next !== files) onSort?.(next);
  }

  const listEl = files && files.length > 0 && (
    <ul id={listId} className="mt-3 flex flex-col gap-2">
      {rows}
    </ul>
  );

  const fileList =
    listEl && sortable && onSort ? (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {listEl}
        </SortableContext>
      </DndContext>
    ) : (
      listEl
    );

  const counter = limit != null && (
    <div className="mt-2 text-xs text-muted">
      已选 {count}/{limit}
    </div>
  );

  if (variant === "button") {
    return (
      <div className={cn(className)}>
        {input}
        <button
          type="button"
          disabled={blocked}
          onClick={openDialog}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] border border-hairline bg-surface px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <path d="M10 13V4M6 8l4-4 4 4M4 15h12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {buttonLabel}
        </button>
        {fileList}
        {counter}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {input}
      <div
        role="button"
        tabIndex={blocked ? -1 : 0}
        aria-disabled={blocked || undefined}
        aria-describedby={hint ? `${listId}-hint` : undefined}
        onClick={openDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
        onDragOver={(e) => {
          if (blocked) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!blocked && e.dataTransfer.files) process(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed px-6 py-8 text-center outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          dragging ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-surface-hover",
          blocked && "pointer-events-none opacity-50",
        )}
      >
        {children ?? (
          <>
            <svg viewBox="0 0 24 24" className="size-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path d="M12 16V5M7 10l5-5 5 5M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm font-medium text-foreground">{label}</div>
            {hint && (
              <div id={`${listId}-hint`} className="text-xs text-muted">
                {hint}
              </div>
            )}
          </>
        )}
      </div>
      {fileList}
      {counter}
    </div>
  );
}
