import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Danmaku } from "./danmaku";
import type { DanmakuItem } from "./danmaku.types";

afterEach(cleanup);

// jsdom 下 clientWidth/Height 恒为 0，stub 成有效尺寸让消费逻辑生效。
function stubSize(w = 800, h = 400) {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(w);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(h);
}

describe("Danmaku", () => {
  it("渲染滚动弹幕文本", () => {
    stubSize();
    const items: DanmakuItem[] = [{ id: "1", text: "你好弹幕" }];
    const { getByText } = render(<Danmaku items={items} />);
    expect(getByText("你好弹幕")).toBeTruthy();
  });

  it("顶部模式弹幕也渲染", () => {
    stubSize();
    const items: DanmakuItem[] = [{ id: "t1", text: "置顶消息", mode: "top" }];
    const { getByText } = render(<Danmaku items={items} />);
    expect(getByText("置顶消息")).toBeTruthy();
  });

  it("已上屏 id 不重复入场（受控只增）", () => {
    stubSize();
    const items: DanmakuItem[] = [{ id: "x", text: "唯一" }];
    const { rerender, getAllByText } = render(<Danmaku items={items} />);
    rerender(<Danmaku items={[...items]} />); // 同 id 再传
    expect(getAllByText("唯一").length).toBe(1);
  });

  it("容器自带 pointer-events-none（穿透到底层视频）", () => {
    stubSize();
    const { container } = render(<Danmaku items={[]} />);
    expect(container.firstElementChild?.className).toContain("pointer-events-none");
  });

  it("low 密度轨道占满后丢弃新弹幕，不抛错", () => {
    stubSize(400, 60); // 高度仅够 1 轨
    const items: DanmakuItem[] = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, text: `弹${i}` }));
    expect(() => act(() => void render(<Danmaku items={items} density="low" />))).not.toThrow();
  });
});
