import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { Flow } from "./flow";
import type { FlowEdge, FlowHandleSpec, FlowNode } from "./flow.types";

/**
 * 标签是否压住连接桩只能在真实布局里验。jsdom 的 getBoundingClientRect 恒为 0，
 * 几何单测锁的是放置函数，这里锁的是换行之后的真实盒子。
 */

afterEach(cleanup);

interface D {
  label: string;
}

const LONG = "把原始事件规范成可检索的归档记录，并保留来源与时间";

const nodes: FlowNode<D>[] = [
  { id: "ingest", position: { x: 8, y: 96 }, width: 80, data: { label: "采集" } },
  { id: "archive", position: { x: 228, y: 96 }, width: 80, data: { label: "归档" } },
  { id: "router", position: { x: 8, y: 248 }, width: 80, data: { label: "分流" } },
  { id: "queue", position: { x: 228, y: 196 }, width: 80, data: { label: "队列" } },
  { id: "alert", position: { x: 228, y: 260 }, width: 80, data: { label: "告警" } },
  { id: "audit", position: { x: 228, y: 324 }, width: 80, data: { label: "审计" } },
];

const edges: FlowEdge[] = [
  { id: "long", source: "ingest", target: "archive", label: LONG },
  { id: "queue", source: "router", target: "queue", label: "入队" },
  { id: "alert", source: "router", target: "alert", label: "告警" },
  { id: "audit", source: "router", target: "audit", label: "留痕" },
  { id: "bare", source: "ingest", target: "queue" },
];

const handles = (node: FlowNode<D>): FlowHandleSpec[] =>
  node.id === "ingest" || node.id === "router"
    ? [{ id: "out", type: "source" }]
    : [{ id: "in", type: "target" }];

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

describe("Flow 连线标签（真实布局）", () => {
  it("长标签换行可读，密边的标签都不压连接桩，名字在隐藏 SVG 之外", async () => {
    render(
      <div style={{ width: 360, height: 460 }}>
        <Flow<D>
          className="h-[460px]"
          nodes={nodes}
          edges={edges}
          getHandles={handles}
          controls={false}
          renderNode={(node) => <div className="px-2.5 py-2 text-xs">{node.data.label}</div>}
        />
      </div>,
    );

    const longLabel = await screen.findByRole("group", { name: LONG });
    expect(longLabel.closest("svg")).toBeNull();
    expect(longLabel.closest('[aria-hidden="true"]')).toBeNull();
    expect(longLabel.getAttribute("aria-label")).toBe(LONG);

    const box = longLabel.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(48);
    expect(box.width).toBeLessThanOrEqual(160);
    expect(box.height).toBeGreaterThan(box.width * 0.45);

    const labels = [...document.querySelectorAll<HTMLElement>("[data-flow-edge-label]")];
    const ports = [...document.querySelectorAll<HTMLElement>("[data-flow-handle]")];
    expect(labels).toHaveLength(4);
    expect(ports.length).toBeGreaterThan(0);
    for (const label of labels) {
      const labelBox = label.getBoundingClientRect();
      expect(labelBox.width).toBeGreaterThan(0);
      expect(labelBox.height).toBeGreaterThan(0);
      for (const port of ports) {
        expect(intersects(labelBox, port.getBoundingClientRect())).toBe(false);
      }
    }
  });
});
