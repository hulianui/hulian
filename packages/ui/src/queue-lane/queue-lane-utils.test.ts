import { describe, expect, it } from "vitest";
import { groupByLane } from "./queue-lane-utils";

const lanes = [{ id: "p0", label: "P0" }, { id: "p1", label: "P1" }];
const items = [
  { id: "1", laneId: "p0" }, { id: "2", laneId: "p1" }, { id: "3", laneId: "p0" },
];

describe("groupByLane", () => {
  it("按 lane 分组并保序", () => {
    const g = groupByLane(items, lanes);
    expect(g.map((x) => x.lane.id)).toEqual(["p0", "p1"]);
    expect(g[0].items.map((i) => i.id)).toEqual(["1", "3"]);
  });
  it("空道返回空 items 数组", () => {
    const g = groupByLane([{ id: "x", laneId: "p0" }], lanes);
    expect(g[1].items).toEqual([]);
  });
  it("未知 laneId 的 item 被丢弃（不崩）", () => {
    const g = groupByLane([{ id: "y", laneId: "zzz" }], lanes);
    expect(g.flatMap((x) => x.items)).toEqual([]);
  });
});
