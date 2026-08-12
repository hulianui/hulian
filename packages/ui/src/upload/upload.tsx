"use client";
import { useCallback, useId, useRef, useState } from "react";
import { GripVertical, RotateCw } from "lucide-react";
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

import { useComponentLocale } from "../config/locale-context";
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
export function moveUploadFile(
  files: UploadFile[],
  activeId: string,
  overId: string,
): UploadFile[] {
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

/** ConfigProvider 没配 upload 节时的兜底文案（RowBody / SortableRow / Upload 三处共用一份）。 */
const LOCALE_FALLBACK = {
  dropLabel: "点击或拖拽文件到此处",
  buttonLabel: "选择文件",
  progress: (name: string) => `${name} 上传进度`,
  remove: (name: string) => `移除 ${name}`,
  reorder: (name: string) => `拖拽排序 ${name}`,
  retry: (name: string) => `重新上传 ${name}`,
  selected: (count: number, limit: number) => `已选 ${count}/${limit}`,
};

// 尺寸档（#243）：落区高度此前写死，同一个应用里「页面主入口的大落区」与「弹窗里的小落区」
// 只能在每个调用处贴 className="h-44" 去撤销组件刚给的内边距——那正是文档反对的覆盖。
// md 一档的数值与 0.39.0 逐字相同，不传 size 的调用点渲染不变。
const DROPZONE_SIZE_CLASS = { sm: "gap-1.5 px-4 py-4", md: "gap-2 px-6 py-8", lg: "gap-3 px-8 py-12" };
// button 形态与 Button 的同名档逐字等高（button-base.ts 的 BUTTON_SIZE_CLASS）。刻意不 import：
// 那份表还带 icon/xs 等本组件用不到的档，而这三行的全部意义就是「和旁边那颗按钮对齐」。
const BUTTON_SIZE_CLASS = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };
const DROPZONE_ICON_CLASS = { sm: "size-6", md: "size-7", lg: "size-9" };
const DROPZONE_LABEL_CLASS = { sm: "text-sm", md: "text-sm", lg: "text-base" };

interface RowProps {
  file: UploadFile;
  renderPreview?: UploadProps["renderPreview"];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}

/** 行内容（无 hook，静态行与可拖行共用）。 */
function RowBody({ file: f, renderPreview, onRemove, onRetry }: RowProps) {
  const locale = useComponentLocale().upload ?? LOCALE_FALLBACK;
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
            className={cn(
              "absolute bottom-0.5 right-0.5 size-2 rounded-full ring-2 ring-surface",
              dot,
            )}
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
              aria-label={locale.progress(f.name)}
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
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
          </span>
        ) : f.status === "error" && f.error ? (
          <span className="mt-0.5 block text-xs text-danger">{f.error}</span>
        ) : (
          f.size != null && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{formatBytes(f.size)}</span>
          )
        )}
      </span>
      {onRetry && f.status === "error" && (
        // 只挂在失败行上：#242 —— useUpload 早就有 retry，但组件这侧一个入口都没有，
        // 用户遇到网络抖动只能「移除 → 重新选一遍整个文件」。
        <button
          type="button"
          onClick={() => onRetry(f.id)}
          aria-label={locale.retry(f.name)}
          className="shrink-0 rounded-[min(var(--radius),0.375rem)] p-1 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCw className="size-4" aria-hidden />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(f.id)}
          aria-label={locale.remove(f.name)}
          className="shrink-0 rounded-[min(var(--radius),0.375rem)] p-1 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
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
  const locale = useComponentLocale().upload ?? LOCALE_FALLBACK;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.file.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        ROW_CLASS,
        "select-none",
        isDragging && "relative z-10 shadow-lg ring-1 ring-border",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={locale.reorder(props.file.name)}
        className="-ml-1 shrink-0 cursor-grab touch-none rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
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
  size = "md",
  name,
  required,
  inputRef: inputRefProp,
  resetInputAfterSelect,
  files,
  renderPreview,
  sortable = false,
  onSort,
  onSelect,
  onReject,
  onRemove,
  onRetry,
  label,
  hint,
  buttonLabel,
  children,
  className,
}: UploadProps) {
  const locale = useComponentLocale().upload ?? LOCALE_FALLBACK;
  const resolvedLabel = label ?? locale.dropLabel;
  const resolvedButtonLabel = buttonLabel ?? locale.buttonLabel;
  // 取消 aria-hidden 之后 input 就成了「暴露给辅助技术但没有名字」的表单控件。
  // label/buttonLabel 是 ReactNode，只有它本来就是字符串时才能直接当无障碍名，否则回落到 locale。
  const inputAriaLabel =
    variant === "button"
      ? typeof buttonLabel === "string"
        ? buttonLabel
        : locale.buttonLabel
      : typeof label === "string"
        ? label
        : locale.dropLabel;
  const inputRef = useRef<HTMLInputElement>(null);
  // 内部仍要自己持有 input（openDialog 要点它），所以 inputRef 走「两边都写」的回调 ref。
  // useCallback 是必要的：回调 ref 的函数标识每次变都会被 React 先以 null 再以节点回调一次，
  // 消费方的 ref 会在每次渲染中途瞬间变空。
  const setInputEl = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof inputRefProp === "function") inputRefProp(node);
      else if (inputRefProp) (inputRefProp as { current: HTMLInputElement | null }).current = node;
    },
    [inputRefProp],
  );
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

  function process(fileList: FileList | File[]): File[] {
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
    return picked;
  }

  function openDialog() {
    if (!blocked) inputRef.current?.click();
  }

  /**
   * 把「本次通过校验的文件」写回 `input.files`，让原生 `new FormData(form)` 读得到（#234）。
   *
   * 只在挂了 `name` 时做——没有 name 的 input 压根不进 FormData，回写纯属多余副作用。
   * 两条路都要写：拖入的文件本来就不会进 `input.files`；点选的文件会进，但被 accept/maxSize/limit
   * 拒掉的那些也在里面，不重写就等于「界面说拒了、表单照样提交」。
   * 环境不支持 DataTransfer 构造器（老浏览器 / jsdom）就静默跳过：onSelect 那条路不受影响。
   */
  function syncInputFiles(picked: File[]) {
    const el = inputRef.current;
    if (!el || name == null) return;
    try {
      const dt = new DataTransfer();
      for (const f of picked) dt.items.add(f);
      el.files = dt.files;
    } catch {
      /* 不支持就维持浏览器给的原样 */
    }
  }

  // 清 value 是为了「同一个文件能重复选」，但清了之后 FormData 就永远读不到文件。
  // 挂了 name = 明确走原生表单提交，默认翻转成不清；两种默认都可被 resetInputAfterSelect 显式覆盖。
  const resetInput = resetInputAfterSelect ?? name == null;

  const input = (
    <input
      ref={setInputEl}
      type="file"
      name={name}
      required={required}
      accept={accept}
      multiple={multiple}
      // 达上限时**不**连带禁用带 name 的 input：禁用控件会被 FormData 整个跳过，
      // 已选中的文件会在提交时凭空消失。触发器那侧照旧 blocked，点不开选择框。
      disabled={name == null ? blocked : disabled}
      className="sr-only"
      // 有 name 就不是纯装饰了：它是这个表单里真实存在、会被提交、会被浏览器校验的控件，
      // 对辅助技术藏起来会让 required 拦下提交时无从解释。可聚焦性仍留给落区（tabIndex=-1
      // 是为了不产生「落区 + input」两个指向同一动作的 Tab 停靠点）。
      aria-hidden={name == null || undefined}
      aria-label={name == null ? undefined : inputAriaLabel}
      tabIndex={-1}
      onChange={(e) => {
        const picked = e.target.files ? process(e.target.files) : [];
        if (resetInput) e.target.value = ""; // 允许重复选同一文件
        else syncInputFiles(picked);
      }}
    />
  );

  const rows = files?.map((f) =>
    sortable && onSort ? (
      <SortableRow
        key={f.id}
        file={f}
        renderPreview={renderPreview}
        onRemove={onRemove}
        onRetry={onRetry}
      />
    ) : (
      <StaticRow
        key={f.id}
        file={f}
        renderPreview={renderPreview}
        onRemove={onRemove}
        onRetry={onRetry}
      />
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
    <div className="mt-2 text-xs text-muted-foreground">{locale.selected(count, limit)}</div>
  );

  if (variant === "button") {
    return (
      <div className={cn(className)}>
        {input}
        <button
          type="button"
          disabled={blocked}
          onClick={openDialog}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-hairline bg-surface font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
            BUTTON_SIZE_CLASS[size],
          )}
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <path d="M10 13V4M6 8l4-4 4 4M4 15h12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {resolvedButtonLabel}
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
          if (!blocked && e.dataTransfer.files) syncInputFiles(process(e.dataTransfer.files));
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed text-center outline-none transition-colors",
          DROPZONE_SIZE_CLASS[size],
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-surface hover:bg-surface-hover",
          blocked && "pointer-events-none opacity-50",
        )}
      >
        {children ?? (
          <>
            <svg
              viewBox="0 0 24 24"
              className={cn(DROPZONE_ICON_CLASS[size], "text-muted-foreground")}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                d="M12 16V5M7 10l5-5 5 5M4 19h16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className={cn(DROPZONE_LABEL_CLASS[size], "font-medium text-foreground")}>
              {resolvedLabel}
            </div>
            {hint && (
              <div id={`${listId}-hint`} className="text-xs text-muted-foreground">
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
