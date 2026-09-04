import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Table } from "./table";
import type { ColumnDef } from "./table.types";

afterEach(cleanup);

interface Row {
  a: string;
  b: string;
  c: string;
  d: string;
}
const data: Row[] = [{ a: "甲", b: "乙", c: "丙", d: "丁" }];
const columns: ColumnDef<Row, any>[] = (["a", "b", "c", "d"] as const).map((key) => ({
  accessorKey: key,
  header: key,
  size: 240,
}));

// #347 / 0.63.3：scrollbar="always" 的经典滚动条得真的画出来。皮肤里 scrollbar-width /
// scrollbar-color 一旦裸写，Chromium 121+ 会整体忽略 ::-webkit-scrollbar*，macOS 上一条都不画
// （0.63.2 就是这么回归的）。类名对不对 jsdom 看得见，「画没画」只有真实浏览器量
// offsetHeight-clientHeight 才知道（vitest.config 已去掉 headless 默认的 --hide-scrollbars）。
describe("Table 横向滚动条（真实浏览器）", () => {
  const renderWide = (props: { scrollbar?: "auto" | "always" }) => {
    const { container } = render(
      <div style={{ width: 400 }}>
        <Table columns={columns} data={data} minWidth={960} {...props} />
      </div>,
    );
    return container.firstElementChild!.firstElementChild as HTMLElement;
  };

  it('scrollbar="always"：外壳滚动条占据真实高度，标准属性在 Chromium 下保持 auto', () => {
    const shell = renderWide({ scrollbar: "always" });
    expect(shell.scrollWidth).toBeGreaterThan(shell.clientWidth);
    expect(shell.offsetHeight - shell.clientHeight).toBeGreaterThan(0);
    expect(getComputedStyle(shell).scrollbarWidth).toBe("auto");
  });

  it('默认 scrollbar="auto"：交给浏览器，不套皮肤', () => {
    const shell = renderWide({});
    expect(shell.scrollWidth).toBeGreaterThan(shell.clientWidth);
    expect(shell.className).not.toContain("[&::-webkit-scrollbar]:h-2.5");
  });
});
