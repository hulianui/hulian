import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Gantt } from "./gantt";

afterEach(cleanup);

// #347：甘特图的横向滚动条得真的画出来。皮肤里 scrollbar-width / scrollbar-color 一旦裸写，
// Chromium 121+ 会整体忽略 ::-webkit-scrollbar*，macOS 上一条都不画 —— 只有真实浏览器量
// offsetHeight-clientHeight 才知道（vitest.config 已去掉 headless 默认的 --hide-scrollbars）。
describe("Gantt 横向滚动条（真实浏览器）", () => {
  it("时间轴超出容器宽度：滚动条占据真实高度，标准属性在 Chromium 下保持 auto", () => {
    const { container } = render(
      <div style={{ width: 400 }}>
        <Gantt
          tasks={[{ id: "a", name: "需求评审", start: "2026-01-01", end: "2026-03-31" }]}
          rangeStart="2026-01-01"
          rangeEnd="2026-03-31"
        />
      </div>,
    );
    const scroller = container.querySelector<HTMLElement>(".overflow-x-auto")!;
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    expect(scroller.offsetHeight - scroller.clientHeight).toBeGreaterThan(0);
    expect(getComputedStyle(scroller).scrollbarWidth).toBe("auto");
  });
});
