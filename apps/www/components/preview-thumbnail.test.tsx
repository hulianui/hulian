import { render, act } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PreviewThumbnail } from "./preview-thumbnail";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

// 装一个可手动触发的 IntersectionObserver，用来断言「进入视口前后」两种状态。
function stubIntersectionObserver() {
  const instances: Array<{ cb: IntersectionObserverCallback; disconnected: boolean }> = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      cb: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb;
        instances.push(this as never);
      }
      observe() {}
      disconnect() {
        (this as never as { disconnected: boolean }).disconnected = true;
      }
    },
  );
  return {
    enter: () =>
      act(() => {
        for (const i of instances) i.cb([{ isIntersecting: true }] as never, null as never);
      }),
    get count() {
      return instances.length;
    },
    get disconnected() {
      return instances.every((i) => i.disconnected);
    },
  };
}

describe("PreviewThumbnail", () => {
  it("视觉缩略图用 inert 阻止内部交互元素获得焦点", () => {
    const { container } = render(
      <PreviewThumbnail lazy={false}>
        <button type="button">不可操作</button>
      </PreviewThumbnail>,
    );
    expect(container.firstElementChild?.hasAttribute("inert")).toBe(true);
  });

  it("默认按需挂载：进入近视口前 children 完全不进 DOM", () => {
    const io = stubIntersectionObserver();
    const { container } = render(
      <PreviewThumbnail>
        <button type="button">活预览</button>
      </PreviewThumbnail>,
    );
    // 这是 #40 的核心断言：不是「渲染了但 inert」，而是压根没渲染 —— 没有 effect、没有计时器、没有请求。
    expect(container.querySelector("button")).toBeNull();
    expect(container.firstElementChild?.hasAttribute("data-mounted")).toBe(false);
    expect(io.count).toBe(1);

    io.enter();
    expect(container.querySelector("button")).not.toBeNull();
    expect(container.firstElementChild?.hasAttribute("data-mounted")).toBe(true);
  });

  it("挂载后断开观察，不再来回卸载", () => {
    const io = stubIntersectionObserver();
    render(
      <PreviewThumbnail>
        <span>x</span>
      </PreviewThumbnail>,
    );
    io.enter();
    expect(io.disconnected).toBe(true);
  });

  it("lazy=false 立即挂载（详情页这类必须马上可见的单个预览）", () => {
    stubIntersectionObserver();
    const { container } = render(
      <PreviewThumbnail lazy={false}>
        <button type="button">立即可见</button>
      </PreviewThumbnail>,
    );
    expect(container.querySelector("button")).not.toBeNull();
  });

  it("环境无 IntersectionObserver 时回落为立即挂载（宁可多渲染也不能让画廊空着）", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(
      <PreviewThumbnail>
        <button type="button">回落</button>
      </PreviewThumbnail>,
    );
    expect(container.querySelector("button")).not.toBeNull();
  });
});
