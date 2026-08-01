import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RouteTabs } from "./route-tabs";
import type { RouteTabItem } from "./route-tabs.types";

afterEach(cleanup);

const TABS: RouteTabItem[] = [
  { key: "home", label: "首页", pinned: true },
  { key: "a", label: "订单" },
  { key: "b", label: "商品" },
  { key: "c", label: "会员" },
];

const tabOf = (label: string) => screen.getByText(label).closest('[role="tab"]')! as HTMLElement;
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

async function dispatchDrag(
  target: Element,
  type: "dragstart" | "dragover" | "drop",
  dataTransfer: DataTransfer,
  clientX: number,
) {
  await act(async () => {
    target.dispatchEvent(
      new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer, clientX }),
    );
    await nextFrame();
  });
}

describe("RouteTabs 拖拽调序（真实浏览器）", () => {
  it("目标页签有真实横向尺寸", () => {
    render(<RouteTabs items={TABS} activeKey="a" sortable onReorder={() => {}} />);
    const rect = tabOf("订单").getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });

  it("拖到目标左半区 → 排到它之前", async () => {
    const onReorder = vi.fn();
    render(<RouteTabs items={TABS} activeKey="a" sortable onReorder={onReorder} />);
    const from = tabOf("会员");
    const to = tabOf("订单");
    const rect = to.getBoundingClientRect();
    const dataTransfer = new DataTransfer();

    await dispatchDrag(from, "dragstart", dataTransfer, from.getBoundingClientRect().left);
    await dispatchDrag(to, "dragover", dataTransfer, rect.left + rect.width * 0.2);
    await dispatchDrag(to, "drop", dataTransfer, rect.left + rect.width * 0.2);

    expect(onReorder).toHaveBeenCalledWith(["home", "c", "a", "b"]);
  });
});
