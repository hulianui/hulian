import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUpload } from "./use-upload";
import type { UploadRequest, UploadRequestContext } from "./upload.types";

const file = (name: string, size = 10) => new File([new Uint8Array(size)], name, { type: "image/png" });

/** 可手动落定的 request 桩：记录每次调用的 ctx，便于驱动进度/成败。 */
function deferredRequest() {
  const calls: { file: File; ctx: UploadRequestContext }[] = [];
  const settlers: { resolve: (r: { url: string }) => void; reject: (e: unknown) => void }[] = [];
  const request: UploadRequest = (f, ctx) => {
    calls.push({ file: f, ctx });
    return new Promise((resolve, reject) => {
      settlers.push({ resolve, reject });
    });
  };
  return { request, calls, settlers };
}

/** 让内部 await 链推进一拍。 */
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe("useUpload · 并发控制", () => {
  it("concurrency=2：同时最多 2 个在飞，落定一个补一个", async () => {
    const { request, calls, settlers } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 2 }));

    act(() => result.current.add([file("a"), file("b"), file("c"), file("d"), file("e")]));
    expect(calls).toHaveLength(2);
    expect(result.current.files).toHaveLength(5);
    expect(result.current.files.map((f) => f.status)).toEqual([
      "uploading",
      "uploading",
      "ready",
      "ready",
      "ready",
    ]);
    expect(result.current.uploading).toBe(true);

    await act(async () => settlers[0].resolve({ url: "/a.png" }));
    await flush();
    expect(calls).toHaveLength(3);

    await act(async () => settlers[1].resolve({ url: "/b.png" }));
    await flush();
    expect(calls).toHaveLength(4);
  });

  it("concurrency=1：严格串行", async () => {
    const { request, calls, settlers } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1 }));
    act(() => result.current.add([file("a"), file("b"), file("c")]));
    expect(calls).toHaveLength(1);
    await act(async () => settlers[0].resolve({ url: "/a" }));
    await flush();
    expect(calls).toHaveLength(2);
  });

  it("默认并发为 3", () => {
    const { request, calls } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request }));
    act(() => result.current.add([file("a"), file("b"), file("c"), file("d")]));
    expect(calls).toHaveLength(3);
  });

  it("concurrency=0 被兜到 1（不会死锁）", () => {
    const { request, calls } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 0 }));
    act(() => result.current.add([file("a"), file("b")]));
    expect(calls).toHaveLength(1);
  });
});

describe("useUpload · 进度与结果回填", () => {
  it("onProgress 写进 UploadFile.progress 并 clamp", async () => {
    const { request, calls } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1 }));
    act(() => result.current.add([file("a")]));

    act(() => calls[0].ctx.onProgress(45));
    expect(result.current.files[0].progress).toBe(45);
    expect(result.current.files[0].status).toBe("uploading");

    act(() => calls[0].ctx.onProgress(300));
    expect(result.current.files[0].progress).toBe(100);
    act(() => calls[0].ctx.onProgress(-20));
    expect(result.current.files[0].progress).toBe(0);
  });

  it("成功 → status=success + url 落到 UploadFile，触发 onSuccess", async () => {
    const { request, settlers } = deferredRequest();
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1, onSuccess }));
    act(() => result.current.add([file("a")]));
    await act(async () => settlers[0].resolve({ url: "https://cdn.test/a.png" }));
    await flush();

    expect(result.current.files[0].status).toBe("success");
    expect(result.current.files[0].url).toBe("https://cdn.test/a.png");
    expect(result.current.files[0].progress).toBe(100);
    expect(result.current.uploading).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("失败 → status=error + error 文案，触发 onError；retry 可重传", async () => {
    const { request, calls, settlers } = deferredRequest();
    const onError = vi.fn();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1, onError }));
    act(() => result.current.add([file("a")]));
    await act(async () => settlers[0].reject(new Error("网络异常")));
    await flush();

    expect(result.current.files[0].status).toBe("error");
    expect(result.current.files[0].error).toBe("网络异常");
    expect(onError).toHaveBeenCalledTimes(1);

    act(() => result.current.retry(result.current.files[0].id));
    expect(calls).toHaveLength(2);
    expect(result.current.files[0].status).toBe("uploading");
    expect(result.current.files[0].error).toBeUndefined();
  });

  it("raw 挂在 UploadFile 上供 renderPreview 取本地缩略图", () => {
    const { request } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1 }));
    const f = file("cover.png", 88);
    act(() => result.current.add([f]));
    expect(result.current.files[0].raw).toBe(f);
    expect(result.current.files[0].size).toBe(88);
    expect(result.current.files[0].name).toBe("cover.png");
  });

  it("onChange 在每次 files 变化时收到最新数组", () => {
    const { request } = deferredRequest();
    const onChange = vi.fn();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1, onChange }));
    act(() => result.current.add([file("a")]));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)![0]).toHaveLength(1);
  });
});

describe("useUpload · 取消与顺序", () => {
  it("remove 进行中的项 → abort signal 并从 files 移除；迟到的 resolve 不复活", async () => {
    const { request, calls, settlers } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1 }));
    act(() => result.current.add([file("a")]));
    const id = result.current.files[0].id;

    act(() => result.current.remove(id));
    expect(calls[0].ctx.signal.aborted).toBe(true);
    expect(result.current.files).toHaveLength(0);

    await act(async () => settlers[0].resolve({ url: "/late.png" }));
    await flush();
    expect(result.current.files).toHaveLength(0);
  });

  it("remove 排队中的项 → 不会再发起请求", async () => {
    const { request, calls, settlers } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 1 }));
    act(() => result.current.add([file("a"), file("b")]));
    expect(calls).toHaveLength(1);

    act(() => result.current.remove(result.current.files[1].id));
    await act(async () => settlers[0].resolve({ url: "/a" }));
    await flush();
    expect(calls).toHaveLength(1);
    expect(result.current.files).toHaveLength(1);
  });

  it("clear 取消全部并清空", () => {
    const { request, calls } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 2 }));
    act(() => result.current.add([file("a"), file("b"), file("c")]));
    act(() => result.current.clear());
    expect(calls.every((c) => c.ctx.signal.aborted)).toBe(true);
    expect(result.current.files).toHaveLength(0);
    expect(result.current.uploading).toBe(false);
  });

  it("reorder 只换顺序，不影响进行中的任务", async () => {
    const { request, calls } = deferredRequest();
    const { result } = renderHook(() => useUpload({ request, concurrency: 2 }));
    act(() => result.current.add([file("a"), file("b")]));
    const [a, b] = result.current.files;

    act(() => result.current.reorder([b, a]));
    expect(result.current.files.map((f) => f.name)).toEqual(["b", "a"]);
    expect(calls.some((c) => c.ctx.signal.aborted)).toBe(false);
  });

  it("卸载时 abort 所有在飞请求", () => {
    const { request, calls } = deferredRequest();
    const { result, unmount } = renderHook(() => useUpload({ request, concurrency: 2 }));
    act(() => result.current.add([file("a"), file("b")]));
    unmount();
    expect(calls.every((c) => c.ctx.signal.aborted)).toBe(true);
  });
});
