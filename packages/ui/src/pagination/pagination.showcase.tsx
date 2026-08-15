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

// 每页条数切换：pageSize 也归消费方持有（组件只回值不自持），页码归位由组件负责。
function SizeDemo({ totalItems = 5151 }: { totalItems?: number }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  return (
    <Pagination
      page={page}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setPage}
      pageSizeOptions={[20, 50, 100]}
      onPageSizeChange={setPageSize}
      showTotal
    />
  );
}

export const paginationShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "受控组件：自行持有 page 状态，onPageChange 回写。点击页码 / 上下页切换。",
      code: `const [page, setPage] = useState(1);

<Pagination page={page} total={10} onPageChange={setPage} />`,
      render: () => <Demo total={10} />,
    },
    {
      title: "两侧省略",
      description: "总页数较多时，当前页两侧之外自动折叠为省略号，首末页恒显。",
      code: `<Pagination page={page} total={20} onPageChange={setPage} />`,
      render: () => <Demo total={20} initial={10} />,
    },
    {
      title: "首末页跳转",
      description: "showFirstLast 显示「跳到首页 / 末页」双箭头按钮。",
      code: `<Pagination page={page} total={20} onPageChange={setPage} showFirstLast />`,
      render: () => <Demo total={20} initial={10} showFirstLast />,
    },
    {
      title: "更宽窗口",
      description: "siblingCount 控制当前页左右各显示的页码数，默认 1。",
      code: `<Pagination page={page} total={20} onPageChange={setPage} siblingCount={2} />`,
      render: () => <Demo total={20} initial={10} siblingCount={2} />,
    },
    {
      title: "每页条数",
      description:
        "pageSizeOptions 与 onPageSizeChange 同传才渲染切换器。切档后当前页若越界，组件会补发一次 onPageChange 夹到新末页。",
      code: `const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);

<Pagination
  page={page}
  totalItems={5151}
  pageSize={pageSize}
  onPageChange={setPage}
  pageSizeOptions={[20, 50, 100]}
  onPageSizeChange={setPageSize}
  showTotal
/>`,
      render: () => <SizeDemo />,
    },
    {
      title: "禁用态",
      description: "disabled 禁用整个分页器，所有按钮不可点。",
      code: `<Pagination page={page} total={10} onPageChange={setPage} disabled />`,
      render: () => <Demo total={10} initial={3} disabled />,
    },
  ],
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
      name: "每页条数切换（pageSizeOptions）",
      render: () => <SizeDemo />,
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
