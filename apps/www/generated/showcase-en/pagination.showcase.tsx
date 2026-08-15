"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Pagination } from "../../../../packages/ui/src/pagination/pagination";
function Demo({ total, initial = 1, siblingCount, showFirstLast, disabled, }: {
    total: number;
    initial?: number;
    siblingCount?: number;
    showFirstLast?: boolean;
    disabled?: boolean;
}) {
    const [page, setPage] = useState(initial);
    return (<Pagination page={page} total={total} onPageChange={setPage} siblingCount={siblingCount} showFirstLast={showFirstLast} disabled={disabled}/>);
}
function SizeDemo({ totalItems = 5151 }: {
    totalItems?: number;
}) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    return (<Pagination page={page} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} pageSizeOptions={[20, 50, 100]} onPageSizeChange={setPageSize} showTotal/>);
}
export const paginationShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Controlled component: holds page status by itself, onPageChange writes back. Click the page number/to switch between previous and next pages.",
            code: `const [page, setPage] = useState(1);

<Pagination page={page} total={10} onPageChange={setPage} />`,
            render: () => <Demo total={10}/>,
        },
        {
            title: "Omit both sides",
            description: "When the total number of pages is large, the outside of both sides of the current page will be automatically folded into ellipses, and the first and last pages will always be displayed.",
            code: `<Pagination page={page} total={20} onPageChange={setPage} />`,
            render: () => <Demo total={20} initial={10}/>,
        },
        {
            title: "Jump to the first and last pages",
            description: "showFirstLast Displays the \"Go to Home/Last Page\" double arrow button.",
            code: `<Pagination page={page} total={20} onPageChange={setPage} showFirstLast />`,
            render: () => <Demo total={20} initial={10} showFirstLast/>,
        },
        {
            title: "Wider window",
            description: "siblingCount Controls the number of page numbers displayed on the left and right of the current page, the default is 1.",
            code: `<Pagination page={page} total={20} onPageChange={setPage} siblingCount={2} />`,
            render: () => <Demo total={20} initial={10} siblingCount={2}/>,
        },
        {
            title: "Items per page",
            description: "The switcher renders only when pageSizeOptions and onPageSizeChange are both supplied. If the current page falls outside the new page count after a switch, the component fires onPageChange as well, clamping to the new last page.",
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
            title: "Disabled",
            description: "disabled disables the entire pager and all buttons are unclickable.",
            code: `<Pagination page={page} total={10} onPageChange={setPage} disabled />`,
            render: () => <Demo total={10} initial={3} disabled/>,
        },
    ],
    controls: [
        { prop: "total", type: "number", defaultValue: 10, label: "Total pages" },
        { prop: "siblingCount", type: "number", defaultValue: 1, label: "Number of pages on both sides of the current page" },
        { prop: "showFirstLast", type: "boolean", defaultValue: false, label: "Jump to the first and last pages" },
    ],
    states: [
        {
            name: "Basics (10 pages, click the page number to switch)",
            render: () => <Demo total={10}/>,
        },
        {
            name: "Both sides omitted (20 pages, stop in the middle)",
            render: () => <Demo total={20} initial={10}/>,
        },
        {
            name: "Header boundary (disabled on previous page)",
            render: () => <Demo total={20} initial={1}/>,
        },
        {
            name: "Trailing border (disabled on next page)",
            render: () => <Demo total={20} initial={20}/>,
        },
        {
            name: "Jump to the first and last pages (showFirstLast)",
            render: () => <Demo total={20} initial={10} showFirstLast/>,
        },
        {
            name: "Wider window (siblingCount=2)",
            render: () => <Demo total={20} initial={10} siblingCount={2}/>,
        },
        {
            name: "Do not omit missing pages (3 pages)",
            render: () => <Demo total={3} initial={2}/>,
        },
        {
            name: "Page-size switcher (pageSizeOptions)",
            render: () => <SizeDemo />,
        },
        {
            name: "Disabled",
            render: () => <Demo total={10} initial={3} disabled/>,
        },
    ],
    renderWithProps: (p) => (<Demo total={Math.max(1, Number(p.total) || 1)} initial={1} siblingCount={Number(p.siblingCount) || 0} showFirstLast={Boolean(p.showFirstLast)}/>),
    toCode: (p) => {
        const sib = Number(p.siblingCount);
        const sibAttr = sib !== 1 ? ` siblingCount={${sib}}` : "";
        const flAttr = p.showFirstLast ? " showFirstLast" : "";
        return `<Pagination page={page} total={${Math.max(1, Number(p.total) || 1)}} onPageChange={setPage}${sibAttr}${flAttr} />`;
    },
};
