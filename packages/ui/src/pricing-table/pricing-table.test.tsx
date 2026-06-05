import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingTable } from "./pricing-table";
import type { PricingColumn, PricingRow } from "./pricing-table.types";

const columns: PricingColumn[] = [
  { key: "a", title: "GPT-5.5" },
  { key: "b", title: "Claude Opus 4.7", highlight: true, badge: "推荐" },
];
const rows: PricingRow[] = [
  { key: "in", label: "输入价", values: { a: "$5", b: "$5" } },
  { key: "out", label: "输出价", values: { a: "$30", b: "$25" } },
];

describe("PricingTable", () => {
  it("渲染列标题与单元格", () => {
    const { getByText } = render(<PricingTable columns={columns} rows={rows} />);
    expect(getByText("GPT-5.5")).toBeTruthy();
    expect(getByText("$25")).toBeTruthy();
  });
  it("highlight 列显角标", () => {
    const { getByText } = render(<PricingTable columns={columns} rows={rows} />);
    expect(getByText("推荐")).toBeTruthy();
  });
  it("行 label 作首列", () => {
    const { getByText } = render(<PricingTable columns={columns} rows={rows} />);
    expect(getByText("输入价")).toBeTruthy();
    expect(getByText("输出价")).toBeTruthy();
  });
});
