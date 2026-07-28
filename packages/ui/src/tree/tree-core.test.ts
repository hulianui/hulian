import { describe, expect, it } from "vitest";
import { buildIndex as buildIdx, canDropOn, isDescendant, resolveDropPosition } from "./tree-core";

// 拖拽落点判定：三条护栏都得成立，否则消费方拿到的是一份没法落库的指令
describe("拖拽落点", () => {
  const idx = buildIdx([
    {
      key: "a",
      label: "甲",
      children: [
        { key: "a1", label: "甲一", children: [{ key: "a11", label: "甲一一" }] },
        { key: "a2", label: "甲二" },
      ],
    },
    { key: "b", label: "乙" },
  ]);

  it("isDescendant 顺着 parentMap 往上找", () => {
    expect(isDescendant(idx, "a", "a11")).toBe(true);
    expect(isDescendant(idx, "a1", "a11")).toBe(true);
    expect(isDescendant(idx, "a2", "a11")).toBe(false);
    expect(isDescendant(idx, "a11", "a")).toBe(false);
  });

  it("不许丢到自己身上", () => {
    expect(canDropOn(idx, "a", "a", "before")).toBe(false);
  });

  it("不许丢进自己的子树（会成环）", () => {
    expect(canDropOn(idx, "a", "a11", "inside")).toBe(false);
    expect(canDropOn(idx, "a", "a1", "after")).toBe(false);
  });

  it("inside 到自己的直接父级视为无变化，挡掉", () => {
    expect(canDropOn(idx, "a1", "a", "inside")).toBe(false);
    // 但排到父级前后是真实的移动，放行
    expect(canDropOn(idx, "a1", "a", "before")).toBe(true);
  });

  it("跨子树移动放行", () => {
    expect(canDropOn(idx, "a11", "b", "inside")).toBe(true);
    expect(canDropOn(idx, "b", "a1", "after")).toBe(true);
  });

  it("resolveDropPosition 按上下四分之一 / 中间一半切", () => {
    expect(resolveDropPosition(2, 40)).toBe("before");
    expect(resolveDropPosition(20, 40)).toBe("inside");
    expect(resolveDropPosition(38, 40)).toBe("after");
  });

  it("不允许 inside 时退化成上下二分", () => {
    expect(resolveDropPosition(20, 40, false)).toBe("after");
    expect(resolveDropPosition(19, 40, false)).toBe("before");
  });

  it("行高为 0 时不炸（除零守卫）", () => {
    expect(resolveDropPosition(0, 0)).toBe("before");
  });

  it("坐标拿不到（NaN）时退回 before，不静默落到 inside", () => {
    // NaN 参与比较两个分支都为假，若不守卫就会掉进「改父级」这个最危险的落点
    expect(resolveDropPosition(Number.NaN, 40)).toBe("before");
    expect(resolveDropPosition(20, Number.NaN)).toBe("before");
  });
});
import {
  buildIndex,
  computeChecked,
  filterTree,
  flattenVisible,
  getCheckState,
  getNodePath,
  normalizeCheckedToLeaves,
  toggleChecked,
  type TreeNode,
} from "./tree-core";

const NODES: TreeNode[] = [
  {
    key: "a",
    label: "A",
    children: [
      { key: "a1", label: "A1" },
      { key: "a2", label: "A2", children: [{ key: "a2x", label: "A2X" }] },
    ],
  },
  { key: "b", label: "B", disabled: true },
  { key: "c", label: "C", children: [{ key: "c1", label: "C1", disabled: true }] },
];

describe("buildIndex", () => {
  it("建 parent/children/leafDescendants 表", () => {
    const idx = buildIndex(NODES);
    expect(idx.parentMap.get("a2x")).toBe("a2");
    expect(idx.parentMap.get("a")).toBeNull();
    expect(idx.childrenKeys.get("a")).toEqual(["a1", "a2"]);
    // leafDescendants 只含启用叶；a 下 a1 + a2x（a2 是枝不计；都启用）
    expect(idx.leafDescendants.get("a")).toEqual(["a1", "a2x"]);
    // c 下唯一叶 c1 是 disabled → 空
    expect(idx.leafDescendants.get("c")).toEqual([]);
    // 启用叶自身 leafDescendants = [自身]
    expect(idx.leafDescendants.get("a1")).toEqual(["a1"]);
  });
});

describe("flattenVisible", () => {
  it("只下钻展开枝，记录 depth/isLast", () => {
    const rows = flattenVisible(NODES, new Set(["a"]));
    expect(rows.map((r) => r.key)).toEqual(["a", "a1", "a2", "b", "c"]);
    const a = rows.find((r) => r.key === "a")!;
    expect(a.depth).toBe(0);
    expect(a.hasChildren).toBe(true);
    expect(a.expanded).toBe(true);
    const a2 = rows.find((r) => r.key === "a2")!;
    expect(a2.depth).toBe(1);
    expect(a2.isLast).toBe(true); // a 的子里 a2 是末项
    const c = rows.find((r) => r.key === "c")!;
    expect(c.isLast).toBe(true);
    expect(c.expanded).toBe(false); // 未在展开集
  });

  it("展开嵌套枝时继续下钻", () => {
    const rows = flattenVisible(NODES, new Set(["a", "a2"]));
    expect(rows.map((r) => r.key)).toEqual(["a", "a1", "a2", "a2x", "b", "c"]);
    const a2x = rows.find((r) => r.key === "a2x")!;
    expect(a2x.depth).toBe(2);
    expect(a2x.ancestorIsLast).toEqual([false, true]); // a 非末(后有b,c)、a2 末
  });
});

describe("getNodePath", () => {
  it("返回根到目标的节点链", () => {
    expect(getNodePath(NODES, "a2x").map((n) => n.key)).toEqual(["a", "a2", "a2x"]);
    expect(getNodePath(NODES, "b").map((n) => n.key)).toEqual(["b"]);
    expect(getNodePath(NODES, "nope")).toEqual([]);
  });
});

describe("勾选级联（叶为真源）", () => {
  const idx = buildIndex(NODES);

  it("toggleChecked 勾选枝 → 全部启用叶后代入集", () => {
    const next = toggleChecked("a", true, new Set(), idx);
    expect([...next].sort()).toEqual(["a1", "a2x"]);
  });

  it("toggleChecked 取消枝 → 移出其叶后代", () => {
    const start = new Set(["a1", "a2x", "x"]);
    const next = toggleChecked("a", false, start, idx);
    expect([...next].sort()).toEqual(["x"]);
  });

  it("toggleChecked 叶 → 切自身", () => {
    expect([...toggleChecked("a1", true, new Set(), idx)]).toEqual(["a1"]);
    expect([...toggleChecked("a1", false, new Set(["a1"]), idx)]).toEqual([]);
  });

  it("getCheckState 三态", () => {
    expect(getCheckState("a", new Set(["a1", "a2x"]), idx)).toBe("checked");
    expect(getCheckState("a", new Set(["a1"]), idx)).toBe("indeterminate");
    expect(getCheckState("a", new Set(), idx)).toBe("unchecked");
    expect(getCheckState("a1", new Set(["a1"]), idx)).toBe("checked");
    // c 唯一叶 disabled → leafDescendants 空 → 永远 unchecked
    expect(getCheckState("c", new Set(), idx)).toBe("unchecked");
  });

  it("computeChecked 派生含全选枝 + 半选枝", () => {
    const r = computeChecked(new Set(["a1", "a2x"]), idx);
    expect(r.checkedKeys.sort()).toEqual(["a", "a1", "a2", "a2x"]);
    expect(r.halfCheckedKeys).toEqual([]);
    const half = computeChecked(new Set(["a1"]), idx);
    expect(half.checkedKeys.sort()).toEqual(["a1"]);
    expect(half.halfCheckedKeys).toEqual(["a"]);
  });

  it("normalizeCheckedToLeaves 展开枝 key 成叶集（round-trip 稳定）", () => {
    const leaves = normalizeCheckedToLeaves(["a"], idx);
    expect([...leaves].sort()).toEqual(["a1", "a2x"]);
    // emit 的 checkedKeys 再 ingest → 同一叶集
    const emitted = computeChecked(leaves, idx).checkedKeys;
    const round = normalizeCheckedToLeaves(emitted, idx);
    expect([...round].sort()).toEqual(["a1", "a2x"]);
  });
});

describe("filterTree", () => {
  it("命中 label + 祖先自动展开", () => {
    const { matchedKeys, autoExpandKeys } = filterTree(NODES, "a2x");
    expect(matchedKeys.has("a2x")).toBe(true);
    expect([...autoExpandKeys].sort()).toEqual(["a", "a2"]);
  });
  it("不区分大小写", () => {
    expect(filterTree(NODES, "a1").matchedKeys.has("a1")).toBe(true);
  });
  it("空 query 不过滤", () => {
    const r = filterTree(NODES, "");
    expect(r.matchedKeys.size).toBe(0);
    expect(r.autoExpandKeys.size).toBe(0);
  });
});
