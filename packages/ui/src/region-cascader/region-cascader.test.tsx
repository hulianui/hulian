import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RegionCascader } from "./region-cascader";
import { sliceLevel } from "./region-cascader.logic";
import { cnDivisions } from "./cn-divisions.data";

describe("cnDivisions 数据完整性", () => {
  it("省级非空且 code 唯一", () => {
    expect(cnDivisions.length).toBeGreaterThanOrEqual(31);
    const codes = cnDivisions.map((p) => p.key);
    expect(new Set(codes).size).toBe(codes.length);
  });
  it("三级结构齐全（北京 → 市 → 区县）", () => {
    const bj = cnDivisions.find((p) => p.key === "11");
    expect(bj?.label).toBe("北京市");
    expect(bj?.children?.length).toBeGreaterThan(0);
    expect(bj?.children?.[0].children?.length).toBeGreaterThan(0);
  });
});

describe("sliceLevel", () => {
  it("level=2 砍掉第三层（区县）", () => {
    const two = sliceLevel(cnDivisions, 2);
    const bj = two.find((p) => p.key === "11");
    expect(bj?.children?.length).toBeGreaterThan(0);
    expect(bj?.children?.[0].children).toBeUndefined();
  });
  it("level=3 原样返回引用", () => {
    expect(sliceLevel(cnDivisions, 3)).toBe(cnDivisions);
  });
});

describe("RegionCascader 组件", () => {
  it("渲染触发器 + placeholder", () => {
    const { getByText } = render(<RegionCascader placeholder="选择地区" />);
    expect(getByText("选择地区")).toBeTruthy();
  });
  it("默认值回显名称路径", () => {
    const { container } = render(<RegionCascader defaultValue={["11", "1101", "110105"]} />);
    expect(container.textContent).toContain("北京市");
    expect(container.textContent).toContain("朝阳区");
  });
});
