import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Tree } from "./tree";
import type { TreeNode } from "./tree-core";
import { ConfigProvider, enUS } from "../config";

const NODES: TreeNode[] = [
  {
    key: "a",
    label: "甲",
    children: [
      { key: "a1", label: "甲一" },
      { key: "a2", label: "甲二" },
    ],
  },
  { key: "b", label: "乙" },
];

describe("Tree", () => {
  it("enUS localizes the default tree and search labels plus empty result", () => {
    render(
      <ConfigProvider locale={enUS}>
        <Tree nodes={NODES} searchable />
      </ConfigProvider>,
    );
    expect(screen.getByRole("tree", { name: "Tree" })).toBeTruthy();
    const search = screen.getByRole("textbox", { name: "Search" });
    expect(search.getAttribute("placeholder")).toBe("Search");
    fireEvent.change(search, { target: { value: "missing" } });
    expect(screen.getByText("No matching items")).toBeTruthy();
  });

  it("explicit accessible and search labels override enUS defaults", () => {
    render(
      <ConfigProvider locale={enUS}>
        <Tree nodes={NODES} searchable aria-label="Knowledge folders" searchPlaceholder="Find folders" />
      </ConfigProvider>,
    );
    expect(screen.getByRole("tree", { name: "Knowledge folders" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Find folders" })).toBeTruthy();
  });

  it("a legacy custom locale without tree keeps the Chinese defaults", () => {
    const locale = { ...enUS, components: { ...enUS.components!, tree: undefined } };
    render(
      <ConfigProvider locale={locale}>
        <Tree nodes={NODES} searchable />
      </ConfigProvider>,
    );
    expect(screen.getByRole("tree", { name: "树" })).toBeTruthy();
    const search = screen.getByRole("textbox", { name: "搜索" });
    fireEvent.change(search, { target: { value: "missing" } });
    expect(screen.getByText("无匹配项")).toBeTruthy();
  });

  it("渲染 treeitem + aria-level", () => {
    render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBe(4); // 甲 甲一 甲二 乙
    const jiaYi = screen.getByText("甲一").closest('[role="treeitem"]')!;
    expect(jiaYi.getAttribute("aria-level")).toBe("2");
  });

  it("枝出 aria-expanded，点击切展开（grid-rows 收起：子在 DOM 但容器塌缩）", () => {
    render(<Tree nodes={NODES} aria-label="t" />);
    const jia = screen.getByText("甲").closest('[role="treeitem"]')!;
    expect(jia.getAttribute("aria-expanded")).toBe("false");
    // grid-rows 策略：子始终挂载（便于高度过渡测量），收起时外层容器 grid-rows-[0fr]
    const grid = screen.getByText("甲一").closest('[role="group"]')!.parentElement!.parentElement!;
    expect(grid.className).toContain("grid-rows-[0fr]");
    fireEvent.click(jia);
    expect(jia.getAttribute("aria-expanded")).toBe("true");
    expect(grid.className).toContain("grid-rows-[1fr]");
  });

  it("roving tabindex：仅 active 行 0", () => {
    render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
    const items = screen.getAllByRole("treeitem");
    const zero = items.filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero.length).toBe(1);
  });

  it("→ 展开枝，← 收起枝（键盘）", () => {
    render(<Tree nodes={NODES} aria-label="t" />);
    const tree = screen.getByRole("tree");
    const jia = screen.getByText("甲").closest('[role="treeitem"]')!;
    fireEvent.focus(jia);
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(jia.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(tree, { key: "ArrowLeft" });
    expect(jia.getAttribute("aria-expanded")).toBe("false");
  });

  it("单选 onSelect", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={NODES} onSelect={onSelect} aria-label="t" />);
    fireEvent.click(screen.getByText("乙").closest('[role="treeitem"]')!);
    expect(onSelect).toHaveBeenCalledWith(["b"], expect.objectContaining({ key: "b" }));
  });

  it("checkable：点父级联子 + 父变 checked", () => {
    const onCheck = vi.fn();
    render(<Tree nodes={NODES} checkable defaultExpandedKeys={["a"]} onCheck={onCheck} aria-label="t" />);
    // 第一个 checkbox = 甲
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[0]);
    expect(onCheck).toHaveBeenCalled();
    const info = onCheck.mock.calls.at(-1)![0];
    expect(info.checkedKeys.sort()).toEqual(["a", "a1", "a2"]);
  });

  it("checkable：点一个子 → 父 indeterminate（aria-checked mixed）", () => {
    render(<Tree nodes={NODES} checkable defaultExpandedKeys={["a"]} aria-label="t" />);
    const boxes = screen.getAllByRole("checkbox");
    // boxes: [甲, 甲一, 甲二, 乙]
    fireEvent.click(boxes[1]); // 甲一
    expect(boxes[0].getAttribute("aria-checked")).toBe("mixed");
  });

  // ── expandTrigger：默认 "row" 下有子节点的行永远选不中，"icon" 解开这条 ──
  describe("expandTrigger", () => {
    it('默认 "row"：点父节点只展开，不触发 onSelect', () => {
      const onSelect = vi.fn();
      render(<Tree nodes={NODES} onSelect={onSelect} aria-label="t" />);
      const parent = screen.getByText("甲").closest('[role="treeitem"]')!;
      fireEvent.click(parent);
      expect(parent.getAttribute("aria-expanded")).toBe("true");
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('"icon"：点父节点行 → 选中它，展开态不变', () => {
      const onSelect = vi.fn();
      render(<Tree nodes={NODES} expandTrigger="icon" onSelect={onSelect} aria-label="t" />);
      const parent = screen.getByText("甲").closest('[role="treeitem"]')!;
      fireEvent.click(parent);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.calls[0][0]).toEqual(["a"]);
      expect(parent.getAttribute("aria-expanded")).toBe("false");
      expect(parent.getAttribute("aria-selected")).toBe("true");
    });

    it('"icon"：点箭头只展开，不触发 onSelect', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Tree nodes={NODES} expandTrigger="icon" onSelect={onSelect} aria-label="t" />,
      );
      const parent = screen.getByText("甲").closest('[role="treeitem"]')!;
      // 箭头是行内第一个 span（size-4 占位/容器）
      fireEvent.click(container.querySelector('[role="treeitem"] > span')!);
      expect(parent.getAttribute("aria-expanded")).toBe("true");
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  // ── disabled 只挡选中，不挡展开：此前禁用父节点的整棵子树彻底不可达 ──
  it("disabled 父节点仍可展开，但不触发 onSelect", () => {
    const onSelect = vi.fn();
    const nodes: TreeNode[] = [
      { key: "p", label: "禁用父", disabled: true, children: [{ key: "c", label: "子" }] },
    ];
    render(<Tree nodes={nodes} onSelect={onSelect} aria-label="t" />);
    const parent = screen.getByText("禁用父").closest('[role="treeitem"]')!;
    fireEvent.click(parent);
    expect(parent.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("子")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("disabled 叶子点了什么都不发生", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={[{ key: "x", label: "禁用叶", disabled: true }]} onSelect={onSelect} aria-label="t" />);
    fireEvent.click(screen.getByText("禁用叶").closest('[role="treeitem"]')!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  // ── 拖拽排序（原生 HTML5 拖放；数据仍归消费方）──
  describe("draggable", () => {
    const rowOf = (text: string) => screen.getByText(text).closest('[role="treeitem"]')! as HTMLElement;

    it("不开 draggable 时行上没有 draggable 属性", () => {
      render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
      expect(rowOf("甲").getAttribute("draggable")).toBeNull();
    });

    it("只传 draggable 不传 onDrop 时不启用（拖了也没人接）", () => {
      render(<Tree nodes={NODES} draggable defaultExpandedKeys={["a"]} aria-label="t" />);
      expect(rowOf("甲").getAttribute("draggable")).toBeNull();
    });

    it("disabled 节点不可拖", () => {
      const onDrop = vi.fn();
      const nodes: TreeNode[] = [
        { key: "x", label: "禁用项", disabled: true },
        { key: "y", label: "普通项" },
      ];
      render(<Tree nodes={nodes} draggable onDrop={onDrop} aria-label="t" />);
      expect(rowOf("禁用项").getAttribute("draggable")).toBeNull();
      expect(rowOf("普通项").getAttribute("draggable")).toBe("true");
    });
  });

  // ── 虚拟滚动：几百节点的权限树用 ──
  // jsdom 无 ResizeObserver 且 getBoundingClientRect 恒 0 → tanstack 量不到视口、渲 0 行。
  // 照 virtual-list.test.tsx 的范式：observe 时立刻回一个有高度的 entry + 兜底 rect。
  describe("virtual", () => {
    class FiringResizeObserver {
      cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe(el: Element) {
        const box = [{ inlineSize: 300, blockSize: 320 }] as unknown as ReadonlyArray<ResizeObserverSize>;
        this.cb(
          [
            {
              target: el,
              contentRect: { width: 300, height: 320, top: 0, left: 0, right: 300, bottom: 320, x: 0, y: 0 } as DOMRectReadOnly,
              borderBoxSize: box,
              contentBoxSize: box,
              devicePixelContentBoxSize: box,
            },
          ],
          this as unknown as ResizeObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    }

    let rectSpy: ReturnType<typeof vi.spyOn>;
    beforeAll(() => {
      vi.stubGlobal("ResizeObserver", FiringResizeObserver);
      rectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        width: 300, height: 320, top: 0, left: 0, right: 300, bottom: 320, x: 0, y: 0, toJSON() {},
      } as DOMRect);
    });
    afterAll(() => {
      rectSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    const many: TreeNode[] = Array.from({ length: 500 }, (_, i) => ({ key: `n${i}`, label: `节点 ${i}` }));

    it("不开时全量渲染", () => {
      render(<Tree nodes={many} aria-label="t" />);
      expect(screen.getAllByRole("treeitem")).toHaveLength(500);
    });

    it("开了之后只渲染视口内的一小截，远端行被裁掉", () => {
      render(<Tree nodes={many} virtual aria-label="t" />);
      const rendered = screen.getAllByRole("treeitem").length;
      expect(rendered).toBeGreaterThan(0);
      expect(rendered).toBeLessThan(500);
      expect(screen.queryByText("节点 0")).not.toBeNull();
      expect(screen.queryByText("节点 499")).toBeNull();
    });

    it("总高占位为 行数 × itemHeight", () => {
      const { container } = render(<Tree nodes={many} virtual={{ itemHeight: 40 }} aria-label="t" />);
      const ul = container.querySelector('[role="tree"]') as HTMLElement;
      expect(ul.style.height).toBe("20000px"); // 500 × 40
    });

    it("虚拟态仍带展开箭头（区别于搜索平铺态）", () => {
      render(<Tree nodes={NODES} virtual aria-label="t" />);
      expect(screen.getByText("甲").closest('[role="treeitem"]')!.querySelector("svg")).toBeTruthy();
    });
  });

  // ── searchText：label 是 ReactNode 时，搜索此前退化成拿 key 去匹配 ──
  it("label 为 ReactNode 时用 searchText 搜得到", () => {
    const nodes: TreeNode[] = [
      { key: "n-001", label: <b>研发中心</b>, searchText: "研发中心" },
      { key: "n-002", label: <b>市场部</b>, searchText: "市场部" },
    ];
    render(<Tree nodes={nodes} searchable aria-label="t" />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "研发" } });
    expect(screen.getByText("研发中心")).toBeTruthy();
    expect(screen.queryByText("市场部")).toBeNull();
  });
});

// 可选 prop 收到 null 时须回落默认值（解构默认只认 undefined）——见 hulianui/hulian#107。
describe("Tree · null 回落", () => {
  it("defaultExpandedKeys/virtual 传 null 不抛错", () => {
    const { container } = render(
      <Tree
        nodes={NODES}
        defaultExpandedKeys={null as never}
        defaultSelectedKeys={null as never}
        defaultCheckedKeys={null as never}
        virtual={null as never}
      />,
    );
    expect(container.querySelector('[role="tree"]')).not.toBeNull();
  });
});
