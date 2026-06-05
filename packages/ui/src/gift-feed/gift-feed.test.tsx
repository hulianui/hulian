import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { GiftFeed } from "./gift-feed";
import type { GiftEvent } from "./gift-feed.types";

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
    expect(getByText("×3")).toBeTruthy();
  });

  it("追加同 id 更高 combo → 更新连击数", () => {
    const evs = [mk("a", 1)];
    const { rerender, getByText } = render(<GiftFeed events={evs} />);
    rerender(<GiftFeed events={[...evs, mk("a", 7)]} />);
    expect(getByText("×7")).toBeTruthy();
  });

  it("pointer-events-none 不挡底层交互", () => {
    const { container } = render(<GiftFeed events={[]} />);
    expect(container.firstElementChild?.className).toContain("pointer-events-none");
  });
});
