"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Pagination } from "../pagination";
import { User } from "../user";
import { List, ListItem } from "./list";
import type { ListSize } from "./list.types";

interface Person {
  name: string;
  role: string;
  initials: string;
}

const PEOPLE: Person[] = [
  { name: "陈静", role: "产品经理", initials: "陈" },
  { name: "李伟", role: "前端工程师", initials: "李" },
  { name: "王芳", role: "设计师", initials: "王" },
  { name: "赵强", role: "后端工程师", initials: "赵" },
];

function PersonItem({ p }: { p: Person }) {
  return (
    <ListItem actions={[<Button key="e" variant="ghost" size="sm">编辑</Button>, <a key="m" className="cursor-pointer text-primary hover:underline">详情</a>]}>
      <ListItem.Meta
        avatar={<Avatar fallback={p.initials} />}
        title={p.name}
        description={p.role}
      />
    </ListItem>
  );
}

function BasicDemo({ size, bordered, split }: { size?: ListSize; bordered?: boolean; split?: boolean }) {
  return (
    <div className="w-96 max-w-full">
      <List
        size={size}
        bordered={bordered}
        split={split}
        items={PEOPLE}
        renderItem={(p) => <PersonItem p={p} />}
        header={<span>团队成员</span>}
        footer={<span>共 {PEOPLE.length} 人</span>}
      />
    </div>
  );
}

function GridDemo() {
  return (
    <div className="w-[34rem] max-w-full">
      <List
        grid={{ cols: 2, gap: 4 }}
        items={PEOPLE}
        renderItem={(p) => (
          <ListItem actions={[<Button key="v" variant="outline" size="sm">查看</Button>]}>
            <User name={p.name} description={p.role} avatarProps={{ fallback: p.initials }} />
          </ListItem>
        )}
      />
    </div>
  );
}

function LoadMoreDemo() {
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const visible = PEOPLE.slice(0, count);
  return (
    <div className="w-96 max-w-full">
      <List
        bordered
        items={visible}
        renderItem={(p) => <PersonItem p={p} />}
        loadMore={{
          loading,
          hasMore: count < PEOPLE.length,
          onLoadMore: () => {
            setLoading(true);
            setTimeout(() => {
              setCount((c) => Math.min(c + 2, PEOPLE.length));
              setLoading(false);
            }, 600);
          },
        }}
      />
    </div>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const pageItems = PEOPLE.slice((page - 1) * 2, page * 2);
  return (
    <div className="w-96 max-w-full">
      <List
        bordered
        items={pageItems}
        renderItem={(p) => <PersonItem p={p} />}
        pagination={<Pagination page={page} total={2} onPageChange={setPage} />}
      />
    </div>
  );
}

export const listShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    { prop: "bordered", type: "boolean", defaultValue: true, label: "边框" },
    { prop: "split", type: "boolean", defaultValue: true, label: "分隔线" },
  ],
  states: [
    { name: "基础(meta + 操作)", render: () => <BasicDemo bordered split /> },
    { name: "无边框 + 无分隔", render: () => <BasicDemo bordered={false} split={false} /> },
    {
      name: "无框 + inset（放进侧栏/面板）",
      render: () => (
        <div className="w-72 max-w-full rounded-[var(--radius)] border border-border bg-surface">
          <List
            inset
            items={PEOPLE}
            renderItem={(p) => <PersonItem p={p} />}
            header={<span className="text-sm text-muted">团队成员</span>}
          />
        </div>
      ),
    },
    { name: "栅格卡片态", render: () => <GridDemo /> },
    { name: "加载更多", render: () => <LoadMoreDemo /> },
    { name: "分页", render: () => <PaginationDemo /> },
    {
      name: "空态",
      render: () => (
        <div className="w-96 max-w-full">
          <List bordered items={[]} renderItem={(p: Person) => <PersonItem p={p} />} header={<span>团队成员</span>} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <BasicDemo
      size={(p.size as ListSize) ?? "md"}
      bordered={(p.bordered as boolean) ?? true}
      split={(p.split as boolean) ?? true}
    />
  ),
  toCode: (p) =>
    `<List\n  size="${p.size ?? "md"}"\n  bordered={${p.bordered ?? true}}\n  split={${p.split ?? true}}\n  items={people}\n  renderItem={(p) => (\n    <ListItem actions={[<Button variant="ghost" size="sm">编辑</Button>]}>\n      <ListItem.Meta avatar={<Avatar fallback={p.initials} />} title={p.name} description={p.role} />\n    </ListItem>\n  )}\n/>`,
};
