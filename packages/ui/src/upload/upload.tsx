"use client";
import { useId, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { UploadFile, UploadProps, UploadRejection } from "./upload.types";

// 自研零依赖上传（表现层）：dropzone/button 形态 + accept/maxSize 校验 + 受控文件列表。
// 不做网络传输——只发 onSelect(File[])，状态/进度由消费者回填到 files。

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

export function Upload({
  accept,
  multiple = false,
  disabled = false,
  maxSize,
  variant = "dropzone",
  files,
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

  function process(fileList: FileList | File[]) {
    const accepted: File[] = [];
    const rejected: UploadRejection[] = [];
    for (const f of Array.from(fileList)) {
      if (!matchesAccept(f, accept)) rejected.push({ file: f, reason: "type" });
      else if (maxSize != null && f.size > maxSize) rejected.push({ file: f, reason: "size" });
      else accepted.push(f);
    }
    const picked = multiple ? accepted : accepted.slice(0, 1);
    if (picked.length) onSelect?.(picked);
    if (rejected.length) onReject?.(rejected);
  }

  function openDialog() {
    if (!disabled) inputRef.current?.click();
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className="sr-only"
      aria-hidden
      tabIndex={-1}
      onChange={(e) => {
        if (e.target.files) process(e.target.files);
        e.target.value = ""; // 允许重复选同一文件
      }}
    />
  );

  const fileList = files && files.length > 0 && (
    <ul id={listId} className="mt-3 flex flex-col gap-2">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center gap-3 rounded-[min(var(--radius),0.5rem)] border border-border bg-surface px-3 py-2 text-sm"
        >
          <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[f.status ?? "ready"])} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-foreground">{f.name}</span>
            {f.status === "uploading" && f.progress != null ? (
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-hover" aria-hidden>
                <span
                  className="block h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.min(100, Math.max(0, f.progress))}%` }}
                />
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
        </li>
      ))}
    </ul>
  );

  if (variant === "button") {
    return (
      <div className={cn(className)}>
        {input}
        <button
          type="button"
          disabled={disabled}
          onClick={openDialog}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <path d="M10 13V4M6 8l4-4 4 4M4 15h12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {buttonLabel}
        </button>
        {fileList}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {input}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={hint ? `${listId}-hint` : undefined}
        onClick={openDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files) process(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed px-6 py-8 text-center outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          dragging ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-surface-hover",
          disabled && "pointer-events-none opacity-50",
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
    </div>
  );
}
