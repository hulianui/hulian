"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Pagination } from "./pagination";

// 受控页码态由内部 Demo 持有（分页器本身受控 only）；showcase 各 state 预置不同 total/起始页/参数。
function Demo({
  total,
  initial = 1,
  siblingCount,
  showFirstLast,
  disabled,
}: {
  total: number;
  initial?: number;
  siblingCount?: number;
  showFirstLast?: boolean;
  disabled?: boolean;
}) {
  const [page, setPage] = useState(initial);
  return (
    <Pagination
      page={page}
      total={total}
      onPageChange={setPage}
      siblingCount={siblingCount}
      showFirstLast={showFirstLast}
      disabled={disabled}
    />
  );
}

export const paginationShowcase: ShowcaseSpec = {
  controls: [
    { prop: "total", type: "number", defaultValue: 10, label: "总页数" },
    { prop: "siblingCount", type: "number", defaultValue: 1, label: "当前页两侧页码数" },
    { prop: "showFirstLast", type: "boolean", defaultValue: false, label: "首末页跳转" },
  ],
  states: [
    {
      name: "基础（10 页，点页码切换）",
      render: () => <Demo total={10} />,
    },
    {
      name: "两侧省略（20 页，停在中间）",
      render: () => <Demo total={20} initial={10} />,
    },
    {
      name: "头部边界（上一页禁用）",
      render: () => <Demo total={20} initial={1} />,
    },
    {
      name: "尾部边界（下一页禁用）",
      render: () => <Demo total={20} initial={20} />,
    },
    {
      name: "首末页跳转（showFirstLast）",
      render: () => <Demo total={20} initial={10} showFirstLast />,
    },
    {
      name: "更宽窗口（siblingCount=2）",
      render: () => <Demo total={20} initial={10} siblingCount={2} />,
    },
    {
      name: "少页不省略（3 页）",
      render: () => <Demo total={3} initial={2} />,
    },
    {
      name: "禁用态",
      render: () => <Demo total={10} initial={3} disabled />,
    },
  ],
  renderWithProps: (p) => (
    <Demo
      total={Math.max(1, Number(p.total) || 1)}
      initial={1}
      siblingCount={Number(p.siblingCount) || 0}
      showFirstLast={Boolean(p.showFirstLast)}
    />
  ),
  toCode: (p) => {
    const sib = Number(p.siblingCount);
    const sibAttr = sib !== 1 ? ` siblingCount={${sib}}` : "";
    const flAttr = p.showFirstLast ? " showFirstLast" : "";
    return `<Pagination page={page} total={${
      Math.max(1, Number(p.total) || 1)
    }} onPageChange={setPage}${sibAttr}${flAttr} />`;
  },
};
