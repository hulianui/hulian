import { describe, expect, it } from "vitest";
import { assignLayers, computeSankeyLayout } from "./sankey-geometry";

const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
const links = [
  { source: "a", target: "b", value: 6 },
  { source: "a", target: "c", value: 4 },
];

describe("assignLayers", () => {
  it("源在 0 层，目标在 1 层", () => {
    const m = assignLayers(nodes, links);
    expect(m.get("a")).toBe(0);
    expect(m.get("b")).toBe(1);
    expect(m.get("c")).toBe(1);
  });
  it("尊重显式 layer", () => {
    const m = assignLayers(
      [{ id: "a", layer: 2 }, { id: "b" }],
      [{ source: "a", target: "b", value: 1 }],
    );
    expect(m.get("a")).toBe(2);
    expect(m.get("b")).toBe(3);
  });
  it("三层链路按最长路径分层", () => {
    const m = assignLayers(
      [{ id: "a" }, { id: "b" }, { id: "c" }],
      [
        { source: "a", target: "b", value: 1 },
        { source: "b", target: "c", value: 1 },
      ],
    );
    expect(m.get("a")).toBe(0);
    expect(m.get("b")).toBe(1);
    expect(m.get("c")).toBe(2);
  });
  it("自环 / 悬挂 id 不崩", () => {
    const m = assignLayers(
      [{ id: "a" }],
      [
        { source: "a", target: "a", value: 1 },
        { source: "a", target: "ghost", value: 1 },
      ],
    );
    expect(m.get("a")).toBe(0);
  });
});

describe("computeSankeyLayout", () => {
  const layout = computeSankeyLayout(nodes, links, {
    width: 400,
    height: 200,
    nodeWidth: 16,
    nodePadding: 10,
  });
  it("层数正确", () => {
    expect(layout.layers).toBe(2);
  });
  it("节点高度按流量成比例（a 总流量=10，最高）", () => {
    const a = layout.nodes.find((n) => n.id === "a")!;
    const b = layout.nodes.find((n) => n.id === "b")!;
    expect(a.height).toBeGreaterThan(b.height);
  });
  it("每条 link 有非空 path 和正 width", () => {
    for (const l of layout.links) {
      expect(l.path).toMatch(/^M/);
      expect(l.width).toBeGreaterThan(0);
    }
  });
  it("link width 与 value 成比例（6 > 4）", () => {
    const ab = layout.links.find((l) => l.target === "b")!;
    const ac = layout.links.find((l) => l.target === "c")!;
    expect(ab.width).toBeGreaterThan(ac.width);
  });
  it("第 0 层节点 x=0，末层 x=width-nodeWidth", () => {
    const a = layout.nodes.find((n) => n.id === "a")!;
    const b = layout.nodes.find((n) => n.id === "b")!;
    expect(a.x).toBe(0);
    expect(b.x).toBeCloseTo(400 - 16);
  });
  it("节点高度未超出容器高（含 padding 守恒）", () => {
    for (const n of layout.nodes) {
      expect(n.height).toBeLessThanOrEqual(200);
      expect(n.y).toBeGreaterThanOrEqual(0);
    }
  });
  it("空输入不崩", () => {
    expect(
      computeSankeyLayout([], [], {
        width: 100,
        height: 100,
        nodeWidth: 16,
        nodePadding: 10,
      }).nodes,
    ).toEqual([]);
  });
  it("单节点无连线降级（layers=1, x=0）", () => {
    const single = computeSankeyLayout([{ id: "only" }], [], {
      width: 300,
      height: 100,
      nodeWidth: 16,
      nodePadding: 10,
    });
    expect(single.layers).toBe(1);
    expect(single.nodes[0].x).toBe(0);
    expect(single.links).toEqual([]);
  });
});
