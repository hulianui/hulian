import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { sequenceDiagramShowcase } from "./sequence-diagram.showcase";

/**
 * 箭头端点不靠测量，而是靠「消息层与生命线层共用同一套网格列 + 左右各让半列」推出来。
 * 这里在真实布局里核对这个推论：每条横向消息的箭头两端，必须落在起止两条生命线的中心上。
 * 宽度按官网实际可用列宽取：桌面示例区约 720px；手机 390/360 视口里示例区还要再减去
 * Layout.Content 的 px-4 和预览的 p-8，约剩 290 / 260px。
 */

afterEach(cleanup);

const basic = sequenceDiagramShowcase.examples![0];

function centerX(el: Element) {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
}

describe.each([
  { name: "desktop", viewport: 1280, column: 720 },
  { name: "390", viewport: 390, column: 294 },
  { name: "360", viewport: 360, column: 264 },
])("SequenceDiagram 布局 · $name", ({ viewport, column, name }) => {
  it("横向消息的箭头两端对齐生命线中心；窄屏只在图内横向滚动", async () => {
    await page.viewport(viewport, 900);
    const { container } = render(<div style={{ width: column }}>{basic.render()}</div>);
    const figure = container.querySelector<HTMLElement>("[data-sequence-diagram]")!;
    const lifelines = [...container.querySelectorAll("[data-sequence-lifeline]")];
    expect(lifelines).toHaveLength(4);

    // 页面本身不横向溢出：多出来的宽度只在 figure 自己的滚动区里。
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(viewport);
    expect(figure.clientWidth).toBeLessThanOrEqual(column);

    const order = ["app", "gateway", "auth", "db"];
    const rows = [...container.querySelectorAll<HTMLElement>("[data-sequence-message]")];
    const messages = [
      ["app", "gateway"],
      ["gateway", "auth"],
      ["auth", "db"],
      ["db", "auth"],
      ["auth", "auth"],
      ["auth", "gateway"],
      ["gateway", "app"],
      ["auth", "db"],
    ];
    rows.forEach((row, i) => {
      const [from, to] = messages[i];
      const arrow = row.querySelector("[data-sequence-arrow]")!.getBoundingClientRect();
      const fromX = centerX(lifelines[order.indexOf(from)]);
      const toX = centerX(lifelines[order.indexOf(to)]);
      if (from === to) {
        // 回环从自己的生命线出发
        expect(Math.abs(arrow.left - fromX)).toBeLessThanOrEqual(1);
        return;
      }
      expect(Math.abs(arrow.left - Math.min(fromX, toX))).toBeLessThanOrEqual(1);
      expect(Math.abs(arrow.right - Math.max(fromX, toX))).toBeLessThanOrEqual(1);
    });

    // 文案不被挤出自己那一格：每条消息文案的宽度不超过它占据的网格区域。
    for (const row of rows) {
      const text = row.firstElementChild!.getBoundingClientRect();
      const box = row.getBoundingClientRect();
      expect(text.left).toBeGreaterThanOrEqual(box.left - 1);
      expect(text.right).toBeLessThanOrEqual(box.right + 1);
    }

    await page.screenshot({ path: `__screenshots__/sequence-diagram-${name}.png`, element: figure });
  });
});
