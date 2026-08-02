import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { GiftFeed } from "./gift-feed";
import type { GiftEvent } from "./gift-feed.types";
import { ConfigProvider, enUS } from "../config";

afterEach(cleanup);

const mk = (id: string, combo: number): GiftEvent => ({
  id,
  user: { name: "土豪哥" },
  gift: { name: "火箭", icon: "🚀" },
  combo,
});

describe("GiftFeed", () => {
  it("渲染礼物横幅与连击数", () => {
    const { getByText } = render(<GiftFeed events={[mk("a", 3)]} />);
    expect(getByText("土豪哥")).toBeTruthy();
    expect(getByText(/送出 火箭/)).toBeTruthy();
    expect(getByText("×3")).toBeTruthy();
  });

  it("追加同 id 更高 combo → 更新连击数", () => {
    const evs = [mk("a", 1)];
    const { rerender, getByText } = render(<GiftFeed events={evs} />);
    rerender(<GiftFeed events={[...evs, mk("a", 7)]} />);
    expect(getByText("×7")).toBeTruthy();
  });

  it("events 整体重置成更短数组后，新事件仍能渲染（不被陈旧计数吞掉）", () => {
    const { rerender, getByText, queryByText } = render(
      <GiftFeed events={[mk("a", 1), mk("b", 1), mk("c", 1)]} />,
    );
    // 消费方清空 / 切直播间：替换成更短数组
    rerender(<GiftFeed events={[mk("x", 5)]} />);
    expect(getByText("×5")).toBeTruthy();
    // 重置后继续追加，新连击照常生效
    rerender(<GiftFeed events={[mk("x", 5), mk("y", 9)]} />);
    expect(getByText("×9")).toBeTruthy();
    expect(queryByText("×5")).toBeTruthy();
  });

  it("pointer-events-none 不挡底层交互", () => {
    const { container } = render(<GiftFeed events={[]} />);
    expect(container.firstElementChild?.className).toContain("pointer-events-none");
  });

  it("ConfigProvider locale=enUS localizes the gift action", () => {
    const event: GiftEvent = {
      id: "english",
      user: { name: "Alex" },
      gift: { name: "Rocket", icon: "🚀" },
      combo: 1,
    };
    const { getByText, queryByText } = render(
      <ConfigProvider locale={enUS}>
        <GiftFeed events={[event]} />
      </ConfigProvider>,
    );

    expect(getByText(/sent Rocket/)).toBeTruthy();
    expect(queryByText(/送出/)).toBeNull();
  });
});
