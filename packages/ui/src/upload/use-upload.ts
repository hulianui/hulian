"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UploadFile, UseUploadOptions, UseUploadReturn } from "./upload.types";

// 传输层（与皮肤解耦）：队列 + 并发闸门 + 进度回填 + 取消。
// 刻意**不认识任何后端形状**——没有 action / headers / withCredentials / transformResponse，
// 只吃一个 request(file, { onProgress, signal }) => Promise<{ url }>，
// 鉴权、信封解包、重试策略全部留在应用层闭包里。库是 MIT 通用库，不给某一家后端开后门。

let seq = 0;
const nextId = () => `hu-upload-${++seq}`;

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function errorText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return "上传失败";
}

function isAbort(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/**
 * 受控上传控制器：把 `files` 喂给 `<Upload>`，把 `add`/`remove`/`reorder` 接到它的事件上。
 *
 * ```tsx
 * const up = useUpload({
 *   request: async (file, { onProgress, signal }) => {
 *     const fd = new FormData();
 *     fd.append("file", file);
 *     const res = await fetch("/api/upload", { method: "POST", body: fd, signal });
 *     onProgress(100);
 *     return { url: (await res.json()).data.url }; // 信封解包在应用层
 *   },
 *   concurrency: 3,
 * });
 * <Upload multiple files={up.files} onSelect={up.add} onRemove={up.remove} />
 * ```
 */
export function useUpload(options: UseUploadOptions): UseUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);

  // files 的同步镜像：队列在 async 回调里读写，靠它避开 setState 的异步滞后
  const filesRef = useRef<UploadFile[]>(files);
  // 选项存 ref，保证 add/remove/... 的函数标识稳定（可直接当 props 传下去）
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const queueRef = useRef<string[]>([]);
  const runningRef = useRef(0);
  const abortsRef = useRef(new Map<string, AbortController>());
  const rawRef = useRef(new Map<string, File>());

  const commit = useCallback((updater: (prev: UploadFile[]) => UploadFile[]) => {
    const next = updater(filesRef.current);
    if (next === filesRef.current) return;
    filesRef.current = next;
    setFiles(next);
    optionsRef.current.onChange?.(next);
  }, []);

  const patch = useCallback(
    (id: string, part: Partial<UploadFile>) => {
      commit((prev) => {
        const i = prev.findIndex((f) => f.id === id);
        if (i < 0) return prev; // 已被移除：丢弃这次回填，不复活僵尸行
        const next = prev.slice();
        next[i] = { ...next[i], ...part };
        return next;
      });
    },
    [commit],
  );

  // start / pump 互相引用，用 ref 打环
  const pumpRef = useRef<() => void>(() => {});

  const start = useCallback(
    async (id: string) => {
      const raw = rawRef.current.get(id);
      if (!raw) return;
      runningRef.current += 1;
      const controller = new AbortController();
      abortsRef.current.set(id, controller);
      patch(id, { status: "uploading", progress: 0, error: undefined });
      try {
        const result = await optionsRef.current.request(raw, {
          signal: controller.signal,
          onProgress: (percent) => {
            if (controller.signal.aborted) return;
            patch(id, { status: "uploading", progress: clampPercent(percent) });
          },
        });
        // 取消后到达的成功响应不写回（remove 已经把行删了，写回也只会污染回调）
        if (controller.signal.aborted) return;
        patch(id, { status: "success", progress: 100, url: result?.url, error: undefined });
        const done = filesRef.current.find((f) => f.id === id);
        if (done) optionsRef.current.onSuccess?.(done, result);
      } catch (err) {
        if (controller.signal.aborted || isAbort(err)) return;
        patch(id, { status: "error", error: errorText(err) });
        const failed = filesRef.current.find((f) => f.id === id);
        if (failed) optionsRef.current.onError?.(failed, err);
      } finally {
        abortsRef.current.delete(id);
        runningRef.current -= 1;
        pumpRef.current();
      }
    },
    [patch],
  );

  const pump = useCallback(() => {
    const limit = Math.max(1, optionsRef.current.concurrency ?? 3);
    while (runningRef.current < limit && queueRef.current.length > 0) {
      const id = queueRef.current.shift();
      if (id) void start(id);
    }
  }, [start]);
  pumpRef.current = pump;

  const add = useCallback(
    (picked: File[]) => {
      if (!picked.length) return;
      const entries: UploadFile[] = picked.map((file) => {
        const id = nextId();
        rawRef.current.set(id, file);
        return { id, name: file.name, size: file.size, status: "ready", progress: 0, raw: file };
      });
      commit((prev) => [...prev, ...entries]);
      queueRef.current.push(...entries.map((e) => e.id));
      pump();
    },
    [commit, pump],
  );

  const drop = useCallback((id: string) => {
    abortsRef.current.get(id)?.abort();
    abortsRef.current.delete(id);
    rawRef.current.delete(id);
    queueRef.current = queueRef.current.filter((q) => q !== id);
  }, []);

  const remove = useCallback(
    (id: string) => {
      drop(id);
      commit((prev) => prev.filter((f) => f.id !== id));
    },
    [commit, drop],
  );

  const retry = useCallback(
    (id: string) => {
      if (!rawRef.current.has(id)) return;
      // 正在传或已在队列里就别重复入列
      if (abortsRef.current.has(id) || queueRef.current.includes(id)) return;
      patch(id, { status: "ready", progress: 0, error: undefined });
      queueRef.current.push(id);
      pump();
    },
    [patch, pump],
  );

  const reorder = useCallback(
    (next: UploadFile[]) => {
      commit(() => next);
    },
    [commit],
  );

  const clear = useCallback(() => {
    for (const c of abortsRef.current.values()) c.abort();
    abortsRef.current.clear();
    rawRef.current.clear();
    queueRef.current = [];
    commit(() => []);
  }, [commit]);

  // 卸载即取消：避免请求挂着继续往已卸载组件回填
  useEffect(() => {
    const aborts = abortsRef.current;
    return () => {
      for (const c of aborts.values()) c.abort();
      aborts.clear();
    };
  }, []);

  const uploading = files.some((f) => f.status === "uploading" || f.status === "ready");

  return { files, add, remove, retry, reorder, clear, uploading };
}
