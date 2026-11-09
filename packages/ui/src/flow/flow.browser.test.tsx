import type { ReactNode } from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { flowShowcase } from "./flow.showcase";

/**
 * 官网手机列宽不是「画布自己有 360px」。
 * Layout.Content 是 px-4，示例预览再套 p-8，360 视口里 Flow 大约只剩 260px。
 * 这里按这两层真实间距把官方「连线标签」示例放进同样的列，并真的把视口设成 360 / 390。
 */

afterEach(cleanup);

const LONG = "把原始事件规范成可检索的归档记录，并保留来源与时间";

function DocsUsageColumn({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div style={{ width }}>
      <div className="px-4 py-8">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <div className="bg-bg p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function inside(inner: DOMRect, outer: DOMRect) {
  return (
    inner.left >= outer.left - 1 &&
    inner.top >= outer.top - 1 &&
    inner.right <= outer.right + 1 &&
    inner.bottom <= outer.bottom + 1
  );
}

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function strokeDistance(label: HTMLElement, path: SVGPathElement) {
  const box = label.getBoundingClientRect();
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const ctm = path.getScreenCTM();
  if (!ctm) return Number.POSITIVE_INFINITY;
  const len = path.getTotalLength();
  const step = Math.max(len / 48, 2);
  let best = Number.POSITIVE_INFINITY;
  for (let distance = 0; distance <= len; distance += step) {
    const point = path.getPointAtLength(distance);
    const screen = new DOMPoint(point.x, point.y).matrixTransform(ctm);
    best = Math.min(best, Math.hypot(screen.x - cx, screen.y - cy));
  }
  return best;
}

describe("Flow 连线标签在文档列宽里", () => {
  for (const viewportWidth of [360, 390]) {
    it(`${viewportWidth} 视口的文档列里，节点、标签和桩都在画布内且可滚到`, async () => {
      await page.viewport(viewportWidth, 900);
      const example = flowShowcase.examples?.find((item) => item.title === "连线标签");
      expect(example).toBeTruthy();
      render(<DocsUsageColumn width={viewportWidth}>{example!.render()}</DocsUsageColumn>);

      const longLabel = await screen.findByRole("group", { name: LONG });
      expect(window.innerWidth).toBe(viewportWidth);
      expect(longLabel.getAttribute("aria-label")).toBe(LONG);
      expect(longLabel.textContent).toBe(LONG);
      expect(longLabel.closest("svg")).toBeNull();
      expect(getComputedStyle(longLabel).fontSize).toBe("12px");
      expect(longLabel.scrollWidth).toBeLessThanOrEqual(longLabel.clientWidth + 1);

      const canvas = longLabel.closest<HTMLElement>('[role="application"]')!;
      const canvasBox = canvas.getBoundingClientRect();
      // 列宽必须是文档壳吃掉边距之后的宽度，而不是把 360 整页都给画布。
      expect(canvasBox.width).toBeGreaterThan(230);
      expect(canvasBox.width).toBeLessThan(viewportWidth - 80);
      const world = canvas.querySelector<HTMLElement>("[style*='scale']")!;
      expect(world.style.transform).toContain("scale(1)");

      const nodes = [...canvas.querySelectorAll<HTMLElement>("[data-flow-node]")];
      const ports = [...canvas.querySelectorAll<HTMLElement>("[data-flow-handle]")];
      const labels = [...canvas.querySelectorAll<HTMLElement>("[data-flow-edge-label]")];
      expect(nodes).toHaveLength(8);
      expect(ports).toHaveLength(8);
      expect(labels.map((label) => label.getAttribute("aria-label"))).toEqual([
        LONG,
        "入队",
        "告警",
        "留痕",
      ]);

      for (const el of [...nodes, ...ports, ...labels]) {
        const box = el.getBoundingClientRect();
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(inside(box, canvas.getBoundingClientRect())).toBe(true);
      }
      for (const el of [...nodes, ...ports, ...labels]) {
        el.scrollIntoView({ block: "center" });
        const reached = el.getBoundingClientRect();
        expect(reached.top).toBeGreaterThanOrEqual(-1);
        expect(reached.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
        expect(inside(reached, canvas.getBoundingClientRect())).toBe(true);
      }

      for (const label of labels) {
        const box = label.getBoundingClientRect();
        for (const node of nodes) {
          const nodeBox = node.getBoundingClientRect();
          if (intersects(box, nodeBox)) {
            throw new Error(
              `${label.getAttribute("data-flow-edge-label")} overlaps ${node.getAttribute("data-flow-node")} label=${Math.round(box.left)},${Math.round(box.top)},${Math.round(box.right)},${Math.round(box.bottom)} node=${Math.round(nodeBox.left)},${Math.round(nodeBox.top)},${Math.round(nodeBox.right)},${Math.round(nodeBox.bottom)}`,
            );
          }
        }
        for (const port of ports) {
          const portBox = port.getBoundingClientRect();
          if (intersects(box, portBox)) {
            throw new Error(
              `${label.getAttribute("data-flow-edge-label")} overlaps port ${port.getAttribute("data-node-id")}:${port.getAttribute("data-flow-handle")} label=${Math.round(box.left)},${Math.round(box.top)},${Math.round(box.right)},${Math.round(box.bottom)} port=${Math.round(portBox.left)},${Math.round(portBox.top)},${Math.round(portBox.right)},${Math.round(portBox.bottom)}`,
            );
          }
        }
      }

      const shortLabels = labels.filter((label) => label.getAttribute("aria-label") !== LONG);
      for (const label of shortLabels) {
        const ownId = label.getAttribute("data-flow-edge-label")!;
        const strokes = [
          ...canvas.querySelectorAll<SVGPathElement>("[data-flow-edge] [data-flow-edge-stroke]"),
        ];
        const distances = strokes.map((path) => ({
          id: path.closest("[data-flow-edge]")!.getAttribute("data-flow-edge")!,
          distance: strokeDistance(label, path),
        }));
        const own = distances.find((item) => item.id === ownId)!;
        const others = distances.filter((item) => item.id !== ownId);
        const nearestOther = Math.min(...others.map((item) => item.distance));
        if (!(own.distance < nearestOther - 8)) {
          throw new Error(
            `${ownId} own=${own.distance.toFixed(1)} others=${others
              .map((item) => `${item.id}:${item.distance.toFixed(1)}`)
              .join(",")}`,
          );
        }
      }
    });
  }
});
