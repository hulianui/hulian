"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SearchForm } from "../../../../packages/ui/src/search-form/search-form";
import type { SearchField } from "../../../../packages/ui/src/search-form/search-form.types";
const fields: SearchField[] = [
    { name: "keyword", label: "Keywords", placeholder: "Order number/Customer name" },
    {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "All",
        options: [
            { value: "pending", label: "Pending" },
            { value: "done", label: "Completed" },
            { value: "canceled", label: "Canceled" },
        ],
    },
    {
        name: "channel",
        label: "Channel",
        type: "select",
        placeholder: "All",
        options: [
            { value: "app", label: "APP" },
            { value: "web", label: "Webpage" },
            { value: "wechat", label: "WeChat" },
        ],
    },
    { name: "range", label: "Creation time", type: "date-range", colSpan: 2 },
    { name: "owner", label: "Person in charge", placeholder: "Name" },
    { name: "city", label: "City", placeholder: "City" },
];
const orgTree = [
    {
        key: "south",
        label: "South China region",
        children: [
            { key: "gz", label: "Guangzhou", children: [{ key: "gz-01", label: "Tianhe store" }, { key: "gz-02", label: "Yuexiu store" }] },
            { key: "sz", label: "Shenzhen", children: [{ key: "sz-01", label: "Nanshan store" }] },
        ],
    },
    {
        key: "east",
        label: "East China region",
        children: [{ key: "sh", label: "Shanghai", children: [{ key: "sh-01", label: "Jing'an store" }] }],
    },
];
const pathFields: SearchField[] = [
    { name: "store", label: "Store", type: "cascader", options: orgTree, changeOnSelect: true },
    { name: "area", label: "Region", type: "region" },
];
function Demo({ collapsible = true }: {
    collapsible?: boolean;
}) {
    const [values, setValues] = useState<Record<string, unknown>>({});
    const [searched, setSearched] = useState<string | null>(null);
    return (<div className="w-[44rem] max-w-full space-y-3">
      <SearchForm fields={collapsible ? fields : fields.slice(0, 3)} values={values} onChange={setValues} onSearch={(v) => setSearched(JSON.stringify(v))} onReset={() => setSearched(null)} collapsible={collapsible}/>
      {searched && <p className="text-xs text-muted-foreground">Query parameters:{searched}</p>}
    </div>);
}
export const searchFormShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "fields configuration driver; omit values/onChange to enter the internal uncontrolled state. Enter/query trigger onSearch.",
            code: `<SearchForm
  fields={[
    { name: "keyword", label: "Keywords", placeholder: "Order number / customer name" },
    { name: "status", label: "Status", type: "select", placeholder: "All",
      options: [{ value: "pending", label: "Pending" }, { value: "done", label: "Completed" }] },
    { name: "owner", label: "Responsible Person", placeholder: "Name" },
  ]}
  onSearch={(v) => console.log(v)}
  onReset={() => {}}
/>`,
            render: () => (<div className="w-[44rem] max-w-full">
          <SearchForm fields={fields.slice(0, 3)} onSearch={() => { }} onReset={() => { }}/>
        </div>),
        },
        {
            title: "Foldable + Spanning Columns",
            description: "The field can be folded when it is filled with multiple rows (only the first row is displayed when collapsed by default); date-range uses colSpan to span two columns.",
            code: `<SearchForm
  fields={fields} // 6+ fields
  collapsible // Enough fields to automatically enable "expand/collapse"
  onSearch={(v) => console.log(v)}
/>`,
            render: () => (<div className="w-[44rem] max-w-full">
          <SearchForm fields={fields} collapsible onSearch={() => { }} onReset={() => { }}/>
        </div>),
        },
        {
            title: "Customize the number of columns and copywriting",
            description: "columns controls the number of desktop columns, submitText / resetText covers the button copy.",
            code: `<SearchForm
  fields={fields}
  columns={2}
  submitText="Search"
  resetText="Clear"
  onSearch={(v) => console.log(v)}
/>`,
            render: () => (<div className="w-[44rem] max-w-full">
          <SearchForm fields={fields.slice(0, 3)} columns={2} submitText="Search" resetText="Clear" onSearch={() => { }} onReset={() => { }}/>
        </div>),
        },
        {
            title: "Hierarchical fields: cascader and region",
            description: "cascader takes an options tree such as an org chart or a category tree, while region ships with Chinese administrative divisions and loads them on demand. Both produce a path array as their value.",
            code: `const fields: SearchField[] = [
  {
    name: "store",
    label: "Store",
    type: "cascader",
    options: orgTree, // TreeNode[], same as the nodes of Cascader
    changeOnSelect: true, // allow filtering down to only a region or a city
  },
  { name: "area", label: "Region", type: "region" },
];

<SearchForm fields={fields} columns={2} onSearch={(v) => console.log(v)} />`,
            render: () => (<div className="w-[44rem] max-w-full">
          <SearchForm fields={pathFields} columns={2} onSearch={() => { }} onReset={() => { }}/>
        </div>),
        },
    ],
    controls: [{ prop: "collapsible", type: "boolean", defaultValue: true }],
    states: [
        { name: "Folded by default", render: () => <Demo /> },
        { name: "Few fields (cannot be folded)", render: () => <Demo collapsible={false}/> },
    ],
    renderWithProps: (p) => <Demo collapsible={Boolean(p.collapsible)}/>,
    toCode: () => `<SearchForm
  fields={fields}
  values={values}
  onChange={setValues}
  onSearch={(v) => console.log(v)}
  onReset={() => {}}
/>`,
};
