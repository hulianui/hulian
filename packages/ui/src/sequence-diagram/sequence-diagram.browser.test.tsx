import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { page, userEvent } from "@vitest/browser/context";
import { SequenceDiagram } from "./sequence-diagram";
import { layoutSequence } from "./sequence-diagram-layout";
import type { SequenceItem, SequenceParticipant } from "./sequence-diagram.types";
import { sequenceDiagramShowcase } from "./sequence-diagram.showcase";

/**
 * 箭头端点不靠测量，而是靠「消息层与生命线层共用同一套网格列 + 左右各让半列」推出来。
 * 这里在真实布局里核对这个推论，并核对长文案的排布：
 *  · 每条横向消息的箭头两端落在起止两条生命线的中心上
 *  · 长文案撑高所在的行，相邻行、文案与箭头互不重叠，文案不出自己那一格
 *  · 长参与者名称不压到相邻列
 *  · 窄宽度下只在图内横向滚动，页面不溢出；溢出时图可聚焦、焦点环可见
 * 宽度按官网实际可用列宽取：桌面示例区约 720px；手机 390/360 视口里示例区还要再减去
 * Layout.Content 的 px-4 和预览的 p-8，约剩 290 / 260px。整页手机验收另见 PR 里的真实视口截图。
 */

afterEach(cleanup);

const participants: SequenceParticipant[] = [
  { id: "mini", label: "微信小程序（门店扫码下单入口）", description: "WeChat Mini Program" },
  { id: "orch", label: "OrderFulfillmentOrchestrationService", description: "k8s · ns: fulfillment-prod" },
  { id: "carrier", label: "第三方物流平台开放接口网关" },
];

const messages: SequenceItem[] = [
  { id: "short", from: "mini", to: "orch", label: "下单" },
  {
    id: "long",
    from: "mini",
    to: "orch",
    label: "提交订单：12 个商品行、2 张优惠券、配送地址与期望送达时间段，附门店编号用于分账",
  },
  { id: "self", from: "orch", to: "orch", label: "重新计算分单策略：按仓库库存、距离和承运商时效综合打分" },
  {
    id: "url",
    from: "orch",
    to: "carrier",
    label: "POST /api/v2/fulfillment/orders/{orderId}/shipments?expand=items,packages,trackingEvents",
  },
  { id: "note", type: "note", over: ["mini", "carrier"], label: "整条履约链路要求 3 秒内返回，超时转入异步补偿任务" },
  { id: "back", from: "carrier", to: "mini", label: "运单号 SF1234567890123 与预计揽收时间", kind: "reply" },
  { id: "edge", from: "carrier", to: "carrier", label: "回写轨迹", kind: "async" },
];

const rowsData = layoutSequence(participants, messages);

/**
 * 可见文字实际排出来的范围（盒子不变、文字溢出盒子时，只有它能看出来）。
 * 跳过 sr-only 与 aria-hidden：读屏前缀被裁成 1px 但排版宽度还在，算进来会误报。
 */
function inkRect(el: Element) {
  let left = Infinity;
  let right = -Infinity;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest(".sr-only, [aria-hidden='true']")) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (r.width === 0) continue;
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
  }
  return { left, right };
}

function centerX(el: Element) {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
}

describe.each([
  { name: "desktop", viewport: 1280, column: 720, scrolls: false },
  { name: "390", viewport: 390, column: 294, scrolls: true },
  { name: "360", viewport: 360, column: 264, scrolls: true },
])("SequenceDiagram 布局 · $name", ({ viewport, column, name, scrolls }) => {
  it("箭头两端对齐生命线中心；长文案撑开行高且互不重叠", async () => {
    await page.viewport(viewport, 900);
    const { container } = render(
      <div style={{ width: column }}>
        <SequenceDiagram participants={participants} messages={messages} />
      </div>,
    );
    const figure = container.querySelector<HTMLElement>("[data-sequence-diagram]")!;
    const lifelines = [...container.querySelectorAll("[data-sequence-lifeline]")];
    expect(lifelines).toHaveLength(3);

    // 页面本身不横向溢出：多出来的宽度只在 figure 自己的滚动区里。
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(viewport);
    expect(figure.clientWidth).toBeLessThanOrEqual(column);
    expect(figure.scrollWidth > figure.clientWidth).toBe(scrolls);

    const items = [...container.querySelectorAll<HTMLElement>("ol > li")];
    expect(items).toHaveLength(rowsData.length);

    items.forEach((item, i) => {
      const row = rowsData[i];
      const box = item.getBoundingClientRect();
      const text = item.firstElementChild!.getBoundingClientRect();
      const ink = inkRect(item.firstElementChild!);
      // 文案（连同实际排出的文字）不出自己那一格
      expect(text.left).toBeGreaterThanOrEqual(box.left - 1);
      expect(text.right).toBeLessThanOrEqual(box.right + 1);
      expect(ink.left).toBeGreaterThanOrEqual(box.left - 1);
      expect(ink.right).toBeLessThanOrEqual(box.right + 1);
      // 相邻行不重叠：下一行的顶边不高于这一行的底边
      const next = items[i + 1]?.getBoundingClientRect();
      if (next) expect(next.top).toBeGreaterThanOrEqual(box.bottom - 0.5);

      if (row.type === "note") {
        // 横跨注释两端罩住起止生命线
        expect(text.left).toBeLessThan(centerX(lifelines[row.targets[0]]));
        expect(text.right).toBeGreaterThan(centerX(lifelines[row.targets[row.targets.length - 1]]));
        return;
      }
      const arrow = item.querySelector("[data-sequence-arrow]")!.getBoundingClientRect();
      // 箭头在文案下方，不被文案盖住
      expect(arrow.top).toBeGreaterThanOrEqual(text.bottom - 0.5);
      const fromX = centerX(lifelines[row.fromIndex]);
      const toX = centerX(lifelines[row.toIndex]);
      if (row.direction === "self") {
        expect(Math.abs(arrow.left - fromX)).toBeLessThanOrEqual(1);
        return;
      }
      expect(Math.abs(arrow.left - Math.min(fromX, toX))).toBeLessThanOrEqual(1);
      expect(Math.abs(arrow.right - Math.max(fromX, toX))).toBeLessThanOrEqual(1);
    });

    // 长文案撑开行高：同样跨两列，长那条明显比短那条高
    const [short, long] = items;
    expect(long.getBoundingClientRect().height).toBeGreaterThan(short.getBoundingClientRect().height + 10);

    // 参与者名片留在自己那一列里，相邻名片不重叠
    const cards = [...container.querySelectorAll("[data-sequence-participant]")].map((li) => ({
      cell: li.getBoundingClientRect(),
      card: li.firstElementChild!.getBoundingClientRect(),
      ink: inkRect(li.firstElementChild!),
    }));
    cards.forEach(({ cell, card, ink }, i) => {
      expect(card.left).toBeGreaterThanOrEqual(cell.left - 0.5);
      expect(card.right).toBeLessThanOrEqual(cell.right + 0.5);
      expect(ink.left).toBeGreaterThanOrEqual(card.left);
      expect(ink.right).toBeLessThanOrEqual(card.right);
      if (cards[i + 1]) expect(cards[i + 1].card.left).toBeGreaterThan(card.right);
    });

    await Promise.all(figure.getAnimations({ subtree: true }).map((a) => a.finished));
    await page.screenshot({ path: `__screenshots__/sequence-diagram-${name}.png`, element: figure });
  });
});

describe("SequenceDiagram 横向滚动的键盘可达", () => {
  it("溢出时可 Tab 聚焦且焦点环可见；宽度够时不进 Tab 顺序", async () => {
    await page.viewport(360, 900);
    const { container, rerender } = render(
      <div style={{ width: 264 }}>
        <button type="button">前</button>
        <SequenceDiagram participants={participants} messages={messages} />
      </div>,
    );
    const figure = container.querySelector<HTMLElement>("[data-sequence-diagram]")!;
    await expect.poll(() => figure.getAttribute("tabindex")).toBe("0");

    container.querySelector("button")!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(figure);
    expect(getComputedStyle(figure).boxShadow).not.toBe("none");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await expect.poll(() => figure.scrollLeft).toBeGreaterThan(0);

    rerender(
      <div style={{ width: 720 }}>
        <button type="button">前</button>
        <SequenceDiagram participants={participants} messages={messages} />
      </div>,
    );
    await expect.poll(() => figure.hasAttribute("tabindex")).toBe(false);
  });
});

describe("SequenceDiagram 官网示例", () => {
  it("每个示例在 360 宽下都不撑破页面", async () => {
    await page.viewport(360, 900);
    for (const example of sequenceDiagramShowcase.examples!) {
      const { unmount } = render(<div style={{ width: 264 }}>{example.render()}</div>);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
      unmount();
    }
  });
});

describe("SequenceDiagram 配色与动效", () => {
  const kinds: SequenceItem[] = [
    { id: "s", from: "mini", to: "orch", label: "同步" },
    { id: "a", from: "orch", to: "carrier", label: "异步", kind: "async" },
    { id: "r", from: "carrier", to: "mini", label: "返回", kind: "reply" },
    { id: "n", type: "note", over: "orch", label: "注释" },
  ];

  it.each(["light", "dark"])("三种消息的箭头颜色互不相同，注释有自己的底色 · %s", async (theme) => {
    await page.viewport(1280, 900);
    document.documentElement.dataset.theme = theme;
    try {
      const { container } = render(
        <div style={{ width: 720, padding: 16, background: "var(--color-bg)" }}>
          <SequenceDiagram participants={participants} messages={kinds} />
        </div>,
      );
      const colorOf = (sel: string) =>
        getComputedStyle(container.querySelector(`${sel} [data-sequence-arrow]`)!).color;
      const sync = colorOf("[data-kind='sync']");
      const async = colorOf("[data-kind='async']");
      const reply = colorOf("[data-kind='reply']");
      expect(new Set([sync, async, reply]).size).toBe(3);
      const note = container.querySelector("[data-sequence-note] > span")!;
      const figureBg = getComputedStyle(container.firstElementChild!).backgroundColor;
      expect(getComputedStyle(note).backgroundColor).not.toBe(figureBg);
      expect(getComputedStyle(note).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      await Promise.all(container.querySelector("figure")!.getAnimations({ subtree: true }).map((a) => a.finished));
      await page.screenshot({
        path: `__screenshots__/sequence-diagram-kinds-${theme}.png`,
        element: container.firstElementChild as HTMLElement,
      });
    } finally {
      document.documentElement.dataset.theme = "light";
    }
  });

  it("行按顺序入场、箭头线从发送方伸出，动画会结束在完全不透明的终态", async () => {
    await page.viewport(1280, 900);
    const { container } = render(
      <div style={{ width: 720 }}>
        <SequenceDiagram participants={participants} messages={kinds} />
      </div>,
    );
    const items = [...container.querySelectorAll<HTMLElement>("ol > li")];
    expect(items.map((li) => getComputedStyle(li).animationName)).toEqual(
      items.map(() => "hulian-sequence-in"),
    );
    expect(items.map((li) => parseFloat(getComputedStyle(li).animationDelay))).toEqual([0, 0.04, 0.08, 0.12]);
    const line = container.querySelector<HTMLElement>("[data-kind='reply'] [data-sequence-arrow] > span")!;
    expect(getComputedStyle(line).animationName).toBe("hulian-sequence-draw");
    // 返回消息向左：从右端（发送方）伸出
    expect(getComputedStyle(line).transformOrigin.startsWith(`${line.offsetWidth}px`)).toBe(true);

    await Promise.all(container.querySelector("figure")!.getAnimations({ subtree: true }).map((a) => a.finished));
    for (const li of items) expect(getComputedStyle(li).opacity).toBe("1");
  });

  it("activeId 变化时把当前一步横向滚进图里，页面不跟着滚", async () => {
    await page.viewport(360, 900);
    const wide: SequenceParticipant[] = ["a", "b", "c", "d", "e"].map((id) => ({ id, label: id.toUpperCase() }));
    const steps: SequenceItem[] = [
      { id: "1", from: "a", to: "b", label: "一" },
      { id: "2", from: "d", to: "e", label: "二" },
    ];
    const ui = (activeId: string) => (
      <div style={{ width: 264 }}>
        <SequenceDiagram participants={wide} messages={steps} activeId={activeId} />
      </div>
    );
    const { container, rerender } = render(ui("1"));
    const figure = container.querySelector<HTMLElement>("[data-sequence-diagram]")!;
    expect(figure.scrollLeft).toBe(0);
    const pageY = window.scrollY;
    rerender(ui("2"));
    await expect.poll(() => figure.scrollLeft).toBeGreaterThan(300);
    expect(window.scrollY).toBe(pageY);
  });
});
