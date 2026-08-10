"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Avatar } from "../../../../packages/ui/src/avatar";
import { Button } from "../../../../packages/ui/src/button";
import { Pagination } from "../../../../packages/ui/src/pagination";
import { User } from "../../../../packages/ui/src/user";
import { List, ListItem } from "../../../../packages/ui/src/list/list";
import type { ListSize } from "../../../../packages/ui/src/list/list.types";
interface Person {
    name: string;
    role: string;
    initials: string;
}
const PEOPLE: Person[] = [
    { name: "Chen Jing", role: "Product Manager", initials: "Chen" },
    { name: "Li Wei", role: "Front-end Engineer", initials: "Li" },
    { name: "Wang Fang", role: "Designer", initials: "Wang" },
    { name: "Zhao Qiang", role: "Backend Engineer", initials: "Zhao" },
];
function PersonItem({ p }: {
    p: Person;
}) {
    return (<ListItem actions={[<Button key="e" variant="ghost" size="sm">Edit</Button>, <a key="m" className="cursor-pointer text-primary hover:underline">Details</a>]}>
      <ListItem.Meta avatar={<Avatar fallback={p.initials}/>} title={p.name} description={p.role}/>
    </ListItem>);
}
function BasicDemo({ size, bordered, split }: {
    size?: ListSize;
    bordered?: boolean;
    split?: boolean;
}) {
    return (<div className="w-96 max-w-full">
      <List size={size} bordered={bordered} split={split} items={PEOPLE} renderItem={(p) => <PersonItem p={p}/>} header={<span>Team Member</span>} footer={<span>Total {PEOPLE.length} People</span>}/>
    </div>);
}
function GridDemo() {
    return (<div className="w-[34rem] max-w-full">
      <List grid={{ cols: 2, gap: 4 }} items={PEOPLE} renderItem={(p) => (<ListItem actions={[<Button key="v" variant="outline" size="sm">View</Button>]}>
            <User name={p.name} description={p.role} avatarProps={{ fallback: p.initials }}/>
          </ListItem>)}/>
    </div>);
}
function LoadMoreDemo() {
    const [count, setCount] = useState(2);
    const [loading, setLoading] = useState(false);
    const visible = PEOPLE.slice(0, count);
    return (<div className="w-96 max-w-full">
      <List bordered items={visible} renderItem={(p) => <PersonItem p={p}/>} loadMore={{
            loading,
            hasMore: count < PEOPLE.length,
            onLoadMore: () => {
                setLoading(true);
                setTimeout(() => {
                    setCount((c) => Math.min(c + 2, PEOPLE.length));
                    setLoading(false);
                }, 600);
            },
        }}/>
    </div>);
}
function PaginationDemo() {
    const [page, setPage] = useState(1);
    const pageItems = PEOPLE.slice((page - 1) * 2, page * 2);
    return (<div className="w-96 max-w-full">
      <List bordered items={pageItems} renderItem={(p) => <PersonItem p={p}/>} pagination={<Pagination page={page} total={2} onPageChange={setPage}/>}/>
    </div>);
}
export const listShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Data driver: items + renderItem, with ListItem.Meta for avatar/title/description, and actions for right operation.",
            code: `<List
  bordered
  items={people}
  header={<span>Team Member</span>}
  footer={<span>Total {people.length} people</span>}
  renderItem={(p) => (
    <ListItem actions={[<Button key="e" variant="ghost" size="sm">Edit</Button>]}>
      <ListItem.Meta avatar={<Avatar fallback={p.initials} />} title={p.name} description={p.role} />
    </ListItem>
  )}
/>`,
            render: () => <BasicDemo bordered split/>,
        },
        {
            title: "No borders + no separation",
            description: "Remove the outer frame and row separators, suitable for embedding inside existing cards/panels.",
            code: `<List
  bordered={false}
  split={false}
  items={people}
  renderItem={(p) => (
    <ListItem>
      <ListItem.Meta avatar={<Avatar fallback={p.initials} />} title={p.name} description={p.role} />
    </ListItem>
  )}
/>`,
            render: () => <BasicDemo bordered={false} split={false}/>,
        },
        {
            title: "Grid card status",
            description: "grid switches to a card grid (reusing the Grid primitive), and each card has its own border.",
            code: `<List
  grid={{ cols: 2, gap: 4 }}
  items={people}
  renderItem={(p) => (
    <ListItem actions={[<Button key="v" variant="outline" size="sm">View</Button>]}>
      <User name={p.name} description={p.role} avatarProps={{ fallback: p.initials }} />
    </ListItem>
  )}
/>`,
            render: () => <GridDemo />,
        },
        {
            title: "Empty",
            description: "When items is an empty array, there is a built-in <Empty> placeholder.",
            code: `<List bordered items={[]} header={<span>Team Member</span>} renderItem={(p) => ...} />`,
            render: () => (<div className="w-96 max-w-full">
          <List bordered items={[]} renderItem={(p: Person) => <PersonItem p={p}/>} header={<span>Team Member</span>}/>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "Size" },
        { prop: "bordered", type: "boolean", defaultValue: true, label: "Border" },
        { prop: "split", type: "boolean", defaultValue: true, label: "Divider line" },
    ],
    states: [
        { name: "Basics (meta + Operation)", render: () => <BasicDemo bordered split/> },
        { name: "No borders + no separation", render: () => <BasicDemo bordered={false} split={false}/> },
        {
            name: "Frameless + inset (put into sidebar/panel)",
            render: () => (<div className="w-72 max-w-full rounded-[var(--radius)] border border-border bg-surface">
          <List inset items={PEOPLE} renderItem={(p) => <PersonItem p={p}/>} header={<span className="text-sm text-muted-foreground">Team Member</span>}/>
        </div>),
        },
        { name: "Grid card status", render: () => <GridDemo /> },
        { name: "Load more", render: () => <LoadMoreDemo /> },
        { name: "Pagination", render: () => <PaginationDemo /> },
        {
            name: "Empty",
            render: () => (<div className="w-96 max-w-full">
          <List bordered items={[]} renderItem={(p: Person) => <PersonItem p={p}/>} header={<span>Team Member</span>}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<BasicDemo size={(p.size as ListSize) ?? "md"} bordered={(p.bordered as boolean) ?? true} split={(p.split as boolean) ?? true}/>),
    toCode: (p) => `<List
  size="${p.size ?? "md"}"
  bordered={${p.bordered ?? true}}
  split={${p.split ?? true}}
  items={people}
  renderItem={(p) => (
    <ListItem actions={[<Button variant="ghost" size="sm">Edit</Button>]}>
      <ListItem.Meta avatar={<Avatar fallback={p.initials} />} title={p.name} description={p.role} />
    </ListItem>
  )}
/>`,
};
