import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PullToRefresh } from "./pull-to-refresh";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

afterEach(cleanup);

function scroller(c: HTMLElement) {
  return c.querySelector('[style*="translateY"]') as HTMLElement;
}

describe("PullToRefresh", () => {
  it("渲染子内容", () => {
    const { getByText } = render(
      <PullToRefresh onRefresh={() => {}}>
        <div>内容</div>
      </PullToRefresh>,
    );
    expect(getByText("内容")).toBeTruthy();
  });

  it("下拉越过阈值进入 armed（显示释放刷新）", () => {
    const { container, getByText } = render(
      <PullToRefresh onRefresh={() => {}} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    const el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 200 }); // 200*0.5=100 ≥ 64
    expect(getByText("释放刷新")).toBeTruthy();
  });

  it("未过阈值显示下拉刷新", () => {
    const { container, getByText } = render(
      <PullToRefresh onRefresh={() => {}} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    const el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 40 }); // 20 < 64
    expect(getByText("下拉刷新")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS localizes the default pulling text", () => {
    const { container, getByText } = render(
      <ConfigProvider locale={enUS}>
        <PullToRefresh onRefresh={() => {}} threshold={64}>
          <div>content</div>
        </PullToRefresh>
      </ConfigProvider>,
    );
    const el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 40 });
    expect(getByText("Pull to refresh")).toBeTruthy();
  });

  it("legacy locale falls back to Chinese while explicit text overrides enUS", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, pullToRefresh: undefined } };
    const { container, getByText, rerender } = render(
      <ConfigProvider locale={legacy}>
        <PullToRefresh onRefresh={() => {}} threshold={64}>
          <div>content</div>
        </PullToRefresh>
      </ConfigProvider>,
    );
    let el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 40 });
    expect(getByText("下拉刷新")).toBeTruthy();
    rerender(
      <ConfigProvider locale={enUS}>
        <PullToRefresh onRefresh={() => {}} threshold={64} pullingText="Drag to reload">
          <div>content</div>
        </PullToRefresh>
      </ConfigProvider>,
    );
    el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 40 });
    expect(getByText("Drag to reload")).toBeTruthy();
  });

  it("armed 后松手触发 onRefresh，结束回弹归零", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    const el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 200 });
    fireEvent.pointerUp(el);
    expect(onRefresh).toHaveBeenCalledOnce();
    await waitFor(() => expect(el.style.transform).toBe("translateY(0px)"));
  });

  it("未过阈值松手不触发刷新", () => {
    const onRefresh = vi.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    const el = scroller(container);
    fireEvent.pointerDown(el, { clientY: 0 });
    fireEvent.pointerMove(el, { clientY: 40 });
    fireEvent.pointerUp(el);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("桌面滚轮：置顶继续上滚(overscroll)累积下拉，停后过阈触发 onRefresh", () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    const el = scroller(container); // jsdom scrollTop 默认 0 = 置顶
    fireEvent.wheel(el, { deltaY: -200 }); // 自然滚动下拉：-200×0.5=100 ≥ 64
    vi.advanceTimersByTime(160); // 过 140ms 停止防抖
    expect(onRefresh).toHaveBeenCalledOnce();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("桌面滚轮：未过阈值不触发", () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    fireEvent.wheel(scroller(container), { deltaY: -40 }); // 20 < 64
    vi.advanceTimersByTime(160);
    expect(onRefresh).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("桌面滚轮：向下滚(正常滚动)不触发刷新", () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh} threshold={64}>
        <div>内容</div>
      </PullToRefresh>,
    );
    fireEvent.wheel(scroller(container), { deltaY: 200 }); // deltaY>0 = 向下滚，放行原生滚动
    vi.advanceTimersByTime(160);
    expect(onRefresh).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
