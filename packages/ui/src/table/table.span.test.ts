import { describe, it, expect } from "vitest";
import { planCellSpans, spanKey } from "./table.span";

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
