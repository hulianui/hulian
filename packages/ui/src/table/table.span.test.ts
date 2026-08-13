import { describe, it, expect } from "vitest";
import { planCellSpans, planHeaderRows, spanKey } from "./table.span";

describe("planCellSpans（#176）", () => {
  it("不返回跨度时既不写 span 也不藏格", () => {
    const plan = planCellSpans(3, 3, () => undefined);
    expect(plan.spans.size).toBe(0);
    expect(plan.hidden.size).toBe(0);
  });

  it("rowSpan=3 在首格落跨度，被盖住的两格判为不渲染", () => {
    const plan = planCellSpans(3, 2, (r, c) => (r === 0 && c === 0 ? { rowSpan: 3 } : undefined));
    expect(plan.spans.get(spanKey(0, 0))).toEqual({ rowSpan: 3, colSpan: 1 });
    expect(plan.hidden.has(spanKey(1, 0))).toBe(true);
    expect(plan.hidden.has(spanKey(2, 0))).toBe(true);
    expect(plan.hidden.has(spanKey(1, 1))).toBe(false); // 只盖自己那一列
  });

  it("被盖住的格子不再回调（消费方不必自己判断「我是不是被合掉的那格」）", () => {
    const seen: string[] = [];
    planCellSpans(3, 1, (r, c) => {
      seen.push(spanKey(r, c));
      return r === 0 ? { rowSpan: 3 } : undefined;
    });
    expect(seen).toEqual([spanKey(0, 0)]);
  });

  it("colSpan 横跨：右侧格子被盖", () => {
    const plan = planCellSpans(1, 4, (_r, c) => (c === 1 ? { colSpan: 2 } : undefined));
    expect(plan.spans.get(spanKey(0, 1))).toEqual({ rowSpan: 1, colSpan: 2 });
    expect(plan.hidden.has(spanKey(0, 2))).toBe(true);
    expect(plan.hidden.has(spanKey(0, 3))).toBe(false);
  });

  it("矩形合并：rowSpan × colSpan 覆盖的格子全藏，只留左上角", () => {
    const plan = planCellSpans(2, 2, (r, c) => (r === 0 && c === 0 ? { rowSpan: 2, colSpan: 2 } : undefined));
    expect(plan.spans.size).toBe(1);
    expect([...plan.hidden].sort()).toEqual([spanKey(0, 1), spanKey(1, 0), spanKey(1, 1)].sort());
  });

  it("跨度按剩余行/列封顶，不会画出表外", () => {
    const plan = planCellSpans(2, 2, (r, c) => (r === 1 && c === 1 ? { rowSpan: 99, colSpan: 99 } : undefined));
    // 剩余各 1 → 退化成不合并，故不写 span 属性
    expect(plan.spans.size).toBe(0);
    expect(plan.hidden.size).toBe(0);
  });

  it("返回 0（el-table 的 [0,0] 写法）表示该格不渲染", () => {
    const plan = planCellSpans(2, 1, (r) => (r === 0 ? { rowSpan: 2 } : { rowSpan: 0, colSpan: 0 }));
    expect(plan.hidden.has(spanKey(1, 0))).toBe(true);
  });

  it("小数跨度向下取整，不产生非法属性值", () => {
    const plan = planCellSpans(3, 1, (r) => (r === 0 ? { rowSpan: 2.7 } : undefined));
    expect(plan.spans.get(spanKey(0, 0))).toEqual({ rowSpan: 2, colSpan: 1 });
    expect(plan.hidden.has(spanKey(2, 0))).toBe(false);
  });
});

// ── 表头跨度（#261）──────────────────────────────────────────────────────
// 这里造的是 TanStack `getHeaderGroups()` 的最小形状（只留 planHeaderRows 读的字段），
// 真实结构在 table.test.tsx 里用 useReactTable 跑过一遍，两层各守各的。
type FakeHeader = { id: string; column: { id: string }; isPlaceholder: boolean; colSpan: number };
const h = (id: string, colSpan = 1, isPlaceholder = false): FakeHeader => ({
  id,
  column: { id },
  isPlaceholder,
  colSpan,
});
const plan = (rows: FakeHeader[][]) =>
  planHeaderRows(rows.map((headers, i) => ({ id: `g${i}`, headers })) as never).map((row) =>
    row.map((c) => [c.header.id, c.colSpan, c.rowSpan] as const),
  );

describe("planHeaderRows（#261 多级表头）", () => {
  it("单级表头逐格 1×1：DOM 与加这个函数之前一致", () => {
    expect(plan([[h("a"), h("b")]])).toEqual([[["a", 1, 1], ["b", 1, 1]]]);
  });

  it("分组列落 colSpan：组名占满它的叶子列数，而不是 1 格", () => {
    expect(
      plan([
        [h("wecom", 2), h("mini", 2)],
        [h("dept"), h("users"), h("store"), h("pos")],
      ]),
    ).toEqual([
      [["wecom", 2, 1], ["mini", 2, 1]],
      [["dept", 1, 1], ["users", 1, 1], ["store", 1, 1], ["pos", 1, 1]],
    ]);
  });

  it("混排：不在组里的列纵向跨满，且下面各行不再为它出格（否则那行会多一格）", () => {
    const out = plan([
      [h("solo", 1, true), h("wecom", 2)],
      [h("solo"), h("dept"), h("users")],
    ]);
    expect(out[0]).toEqual([["solo", 1, 2], ["wecom", 2, 1]]);
    expect(out[1]).toEqual([["dept", 1, 1], ["users", 1, 1]]);
  });

  it("三层表头：半深列从它第一次出现那行跨到底", () => {
    const out = plan([
      [h("g1", 1, true), h("g2", 2)],
      [h("g1", 1, true), h("sub", 2)],
      [h("g1"), h("x"), h("y")],
    ]);
    expect(out[0]).toEqual([["g1", 1, 3], ["g2", 2, 1]]);
    expect(out[1]).toEqual([["sub", 2, 1]]);
    expect(out[2]).toEqual([["x", 1, 1], ["y", 1, 1]]);
  });

  it("每行格子数 × 跨度加起来等于叶子列数（错位就是这条不成立）", () => {
    const out = plan([
      [h("solo", 1, true), h("wecom", 2), h("mini", 2)],
      [h("solo"), h("dept"), h("users"), h("store"), h("pos")],
    ]);
    const width = (row: (readonly [string, number, number])[]) =>
      row.reduce((n, [, colSpan]) => n + colSpan, 0);
    // 第二行少了被上面接管的 solo，所以按 colSpan 求和是 4；补回跨行的那 1 格才是 5
    expect(width(out[0]!)).toBe(5);
    expect(width(out[1]!) + 1).toBe(5);
  });
});
