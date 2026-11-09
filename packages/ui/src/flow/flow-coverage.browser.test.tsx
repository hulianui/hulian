import type { ReactNode } from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { flowShowcase } from "./flow.showcase";

/**
 * 官方「对照、扇出与交叉」必须真的交叉、真的共源，并且用同一份数据对照无 label / 空白 / 有文案。
 * 360/390 用文档列（px-4 + 示例 p-8），视口本身就是这个宽度。
 * 不要求跨边自动避碰：扇出中线和交叉对的「更靠近邻边」被记成限制，而不是失败。
 */

afterEach(cleanup);

const LONG = "把原始事件规范成可检索的归档记录，并保留来源与时间";

function DocsUsageColumn({ width, children }: { width: number; children: ReactNode }) {
  if (width >= 768) {
    return (
      <div style={{ width }} className="flex">
        <aside className="w-60 shrink-0" />
        <div className="min-w-0 flex-1 px-6 py-10">
          <div className="flex gap-10">
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-[var(--radius)] border border-border">
                <div className="flex flex-wrap items-center gap-4 bg-bg p-8">{children}</div>
              </div>
            </div>
            <aside className="w-44 shrink-0" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ width }}>
      <div className="px-4 py-8">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <div className="flex flex-wrap items-center gap-4 bg-bg p-8">{children}</div>
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

function samples(path: SVGPathElement) {
  const ctm = path.getScreenCTM();
  if (!ctm) return [];
  const len = path.getTotalLength();
  const step = Math.max(len / 28, 3);
  const points = [];
  for (let distance = 0; distance <= len; distance += step) {
    const point = path.getPointAtLength(distance);
    const screen = new DOMPoint(point.x, point.y).matrixTransform(ctm);
    points.push({ x: screen.x, y: screen.y });
  }
  return points;
}

function orient(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function segmentsCross(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  d: { x: number; y: number },
) {
  return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;
}

function polylinesCross(left: { x: number; y: number }[], right: { x: number; y: number }[]) {
  for (let i = 0; i < left.length - 1; i += 1) {
    for (let j = 0; j < right.length - 1; j += 1) {
      if (segmentsCross(left[i], left[i + 1], right[j], right[j + 1])) return true;
    }
  }
  return false;
}

function stroke(canvas: ParentNode, id: string) {
  const path = canvas.querySelector<SVGPathElement>(
    `[data-flow-edge="${id}"] [data-flow-edge-stroke]`,
  );
  expect(path).toBeTruthy();
  return path!;
}

describe("Flow 对照、扇出与交叉", () => {
  for (const viewportWidth of [360, 390, 1280]) {
    it(`${viewportWidth} 视口的文档列保留扇出、交叉和同数据对照`, async () => {
      await page.viewport(viewportWidth, 1100);
      const example = flowShowcase.examples?.find((item) => item.title === "对照、扇出与交叉");
      expect(example).toBeTruthy();
      render(<DocsUsageColumn width={viewportWidth}>{example!.render()}</DocsUsageColumn>);
      expect(window.innerWidth).toBe(viewportWidth);

      const on = document.querySelector<HTMLElement>("[data-coverage-mode='on']")!;
      const off = document.querySelector<HTMLElement>("[data-coverage-mode='off']")!;
      const blank = document.querySelector<HTMLElement>("[data-coverage-mode='blank']")!;
      await screen.findByRole("group", { name: LONG });

      expect(off.querySelectorAll("[data-flow-edge-label]")).toHaveLength(0);
      expect(blank.querySelectorAll("[data-flow-edge-label]")).toHaveLength(0);
      expect(on.querySelectorAll("[data-flow-edge]")).toHaveLength(8);
      expect(off.querySelectorAll("[data-flow-edge]")).toHaveLength(8);

      const canvas = on.querySelector<HTMLElement>('[role="application"]')!;
      const canvasBox = canvas.getBoundingClientRect();
      expect(canvasBox.width).toBeGreaterThan(230);
      expect(canvasBox.width).toBeLessThan(viewportWidth - 80);
      expect(canvas.querySelector<HTMLElement>("[style*='scale']")!.style.transform).toContain("scale(1)");

      for (const modeRoot of [on, off, blank]) {
        const frame = modeRoot.querySelector<HTMLElement>('[role="application"]')!;
        const frameBox = frame.getBoundingClientRect();
        for (const el of frame.querySelectorAll<HTMLElement>("[data-flow-node], [data-flow-handle]")) {
          expect(inside(el.getBoundingClientRect(), frameBox)).toBe(true);
        }
      }

      const labels = [...on.querySelectorAll<HTMLElement>("[data-flow-edge-label]")];
      const nodes = [...on.querySelectorAll<HTMLElement>("[data-flow-node]")];
      const ports = [...on.querySelectorAll<HTMLElement>("[data-flow-handle]")];
      for (const label of labels) {
        const box = label.getBoundingClientRect();
        expect(inside(box, canvasBox)).toBe(true);
        expect(getComputedStyle(label).fontSize).toBe("12px");
        for (const node of nodes) expect(intersects(box, node.getBoundingClientRect())).toBe(false);
        for (const port of ports) expect(intersects(box, port.getBoundingClientRect())).toBe(false);
      }

      const longLabel = on.querySelector<HTMLElement>("[data-flow-edge-label='long']")!;
      expect(longLabel.getAttribute("aria-label")).toBe(LONG);
      expect(longLabel.textContent).toBe(LONG);
      expect(longLabel.getBoundingClientRect().width).toBeGreaterThanOrEqual(140);
      expect(longLabel.getBoundingClientRect().height).toBeLessThan(longLabel.getBoundingClientRect().width);

      expect(polylinesCross(samples(stroke(on, "cross-ab")), samples(stroke(on, "cross-cd")))).toBe(true);
      const fanStarts = ["fan-up", "fan-mid", "fan-down"].map((id) => samples(stroke(on, id))[0]);
      expect(Math.hypot(fanStarts[0].x - fanStarts[1].x, fanStarts[0].y - fanStarts[1].y)).toBeLessThan(3);
      expect(Math.hypot(fanStarts[0].x - fanStarts[2].x, fanStarts[0].y - fanStarts[2].y)).toBeLessThan(3);
      const fanEnds = ["fan-up", "fan-mid", "fan-down"].map((id) => {
        const points = samples(stroke(on, id));
        return points[points.length - 1];
      });
      expect(Math.hypot(fanEnds[0].x - fanEnds[1].x, fanEnds[0].y - fanEnds[1].y)).toBeGreaterThan(40);

      const midY = (id: string) => {
        const points = samples(stroke(on, id));
        return points[Math.floor(points.length / 2)].y;
      };
      const adjacentGap = Math.abs(midY("near-1") - midY("near-2"));
      expect(adjacentGap).toBeGreaterThan(12);
      expect(adjacentGap).toBeLessThan(90);

      const port = on.querySelector<HTMLElement>("[data-flow-handle]")!;
      const portBox = port.getBoundingClientRect();
      const hit = document.elementFromPoint(portBox.left + portBox.width / 2, portBox.top + portBox.height / 2);
      expect(hit?.closest("[data-flow-edge-label]")).toBeNull();
    });
  }
});
