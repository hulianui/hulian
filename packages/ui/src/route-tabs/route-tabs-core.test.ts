import { describe, expect, it } from "vitest";
import { affectedKeys, isClosable, nextActiveKey, orderTabs, reorderTabs } from "./route-tabs-core";
import type { RouteTabItem } from "./route-tabs.types";

const TABS: RouteTabItem[] = [
  { key: "home", label: "首页", pinned: true },
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
];

describe("orderTabs", () => {
  it("pinned 恒排在前，其余保持原序", () => {
    const items: RouteTabItem[] = [
      { key: "a", label: "A" },
      { key: "home", label: "首页", pinned: true },
      { key: "b", label: "B" },
    ];
    expect(orderTabs(items).map((t) => t.key)).toEqual(["home", "a", "b"]);
  });
});

describe("isClosable", () => {
  it("pinned 恒不可关", () => {
    expect(isClosable(TABS[0], TABS)).toBe(false);
  });
  it("显式 closable 优先于默认规则", () => {
    const items: RouteTabItem[] = [{ key: "a", label: "A", closable: false }, { key: "b", label: "B" }];
    expect(isClosable(items[0], items)).toBe(false);
  });
  it("只剩一个可关页签时不给关（免得内容区空白）", () => {
    const items: RouteTabItem[] = [{ key: "home", label: "首页", pinned: true }, { key: "a", label: "A" }];
    expect(isClosable(items[1], items)).toBe(false);
  });
  it("可关页签多于一个时可关", () => {
    expect(isClosable(TABS[1], TABS)).toBe(true);
  });
});

describe("affectedKeys", () => {
  it("close 只影响自己", () => {
    expect(affectedKeys("close", "a", TABS)).toEqual(["a"]);
  });
  it("close 对 pinned 返回空", () => {
    expect(affectedKeys("close", "home", TABS)).toEqual([]);
  });
  it("closeOthers 排除自己与 pinned", () => {
    expect(affectedKeys("closeOthers", "b", TABS)).toEqual(["a", "c"]);
  });
  it("closeAll 关全部可关的，含当前页（不是 closeOthers）", () => {
    expect(affectedKeys("closeAll", "b", TABS)).toEqual(["a", "b", "c"]);
  });
  it("closeLeft / closeRight 按展示顺序算", () => {
    expect(affectedKeys("closeLeft", "c", TABS)).toEqual(["a", "b"]);
    expect(affectedKeys("closeRight", "a", TABS)).toEqual(["b", "c"]);
  });
  it("最左侧 closeLeft 为空（除去 pinned 后没东西可关）", () => {
    expect(affectedKeys("closeLeft", "a", TABS)).toEqual([]);
  });
  it("refresh 不关任何东西", () => {
    expect(affectedKeys("refresh", "a", TABS)).toEqual([]);
  });
  it("未知 key 返回空", () => {
    expect(affectedKeys("closeOthers", "nope", TABS)).toEqual([]);
  });
  it("closable:false 的页签不进任何批量动作", () => {
    const items: RouteTabItem[] = [
      { key: "a", label: "A" },
      { key: "lock", label: "锁定", closable: false },
      { key: "b", label: "B" },
    ];
    expect(affectedKeys("closeAll", "a", items)).toEqual(["a", "b"]);
  });
});

describe("nextActiveKey", () => {
  it("当前页没被关就不动", () => {
    expect(nextActiveKey(TABS, ["a"], "b")).toBe("b");
  });
  it("当前页被关 → 优先取右侧幸存者", () => {
    expect(nextActiveKey(TABS, ["b"], "b")).toBe("c");
  });
  it("右侧全没了 → 往左找", () => {
    expect(nextActiveKey(TABS, ["b", "c"], "b")).toBe("a");
  });
  it("全关光 → undefined", () => {
    const items: RouteTabItem[] = [{ key: "a", label: "A" }, { key: "b", label: "B" }];
    expect(nextActiveKey(items, ["a", "b"], "a")).toBeUndefined();
  });
  it("closeAll 后落到 pinned 上", () => {
    expect(nextActiveKey(TABS, ["a", "b", "c"], "b")).toBe("home");
  });
});

describe("reorderTabs", () => {
  it("拖到目标之前", () => {
    expect(reorderTabs(TABS, "c", "a", true)).toEqual(["home", "c", "a", "b"]);
  });
  it("拖到目标之后", () => {
    expect(reorderTabs(TABS, "a", "c", false)).toEqual(["home", "b", "c", "a"]);
  });
  it("固定段与普通段不互相拖入（pinned 的语义就是钉在最前）", () => {
    expect(reorderTabs(TABS, "a", "home", true)).toEqual(["home", "a", "b", "c"]);
    expect(reorderTabs(TABS, "home", "b", true)).toEqual(["home", "a", "b", "c"]);
  });
  it("未知 key 原样返回展示顺序", () => {
    expect(reorderTabs(TABS, "nope", "a", true)).toEqual(["home", "a", "b", "c"]);
  });
});
