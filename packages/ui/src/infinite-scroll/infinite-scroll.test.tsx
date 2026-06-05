import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InfiniteScroll } from "./infinite-scroll";

// jsdom 无 IntersectionObserver → 手搓 mock，捕获回调供测试手动触发相交。
let triggers: Array<(intersecting: boolean) => void> = [];
class MockIO {
  cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    triggers.push((intersecting) =>
      this.cb([{ isIntersecting: intersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver),
    );
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  triggers = [];
  vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("InfiniteScroll", () => {
  it("哨兵相交时调 onLoadMore", async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    render(
      <InfiniteScroll onLoadMore={onLoadMore} hasMore>
        <div>列表</div>
      </InfiniteScroll>,
    );
    triggers.forEach((t) => t(true));
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledOnce());
  });

  it("加载中不重复触发（ref 锁）", async () => {
    let resolve!: () => void;
    const onLoadMore = vi.fn().mockReturnValue(new Promise<void>((r) => (resolve = r)));
    render(
      <InfiniteScroll onLoadMore={onLoadMore} hasMore>
        <div>列表</div>
      </InfiniteScroll>,
    );
    triggers.forEach((t) => t(true));
    triggers.forEach((t) => t(true));
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledOnce());
    resolve();
  });

  it("hasMore=false 显示完结文案且不观察", () => {
    const onLoadMore = vi.fn();
    const { getByText } = render(
      <InfiniteScroll onLoadMore={onLoadMore} hasMore={false}>
        <div>列表</div>
      </InfiniteScroll>,
    );
    expect(getByText("没有更多了")).toBeTruthy();
    triggers.forEach((t) => t(true));
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});
