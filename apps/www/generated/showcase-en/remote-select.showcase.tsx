"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RemoteSelect } from "../../../../packages/ui/src/remote-select/remote-select";
import type { RemoteSelectFetchContext, RemoteSelectRow } from "../../../../packages/ui/src/remote-select/remote-select.types";
type Size = "sm" | "md" | "lg";
const STORES: RemoteSelectRow[] = Array.from({ length: 60 }, (_, i) => ({
    store_id: String(1001 + i),
    store_name: `${["Hangzhou", "Shanghai", "Beijing", "Guangzhou", "Chengdu", "Wuhan"][i % 6]}\u00B7${String(i + 1).padStart(2, "0")} Store`,
    city: ["Hangzhou", "Shanghai", "Beijing", "Guangzhou", "Chengdu", "Wuhan"][i % 6],
}));
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function fakeFetch(query: string, ctx: RemoteSelectFetchContext) {
    await sleep(420);
    if (ctx.signal.aborted)
        throw new DOMException("aborted", "AbortError");
    const hit = query
        ? STORES.filter((s) => String(s.store_name).includes(query) || String(s.city).includes(query))
        : STORES;
    const start = (ctx.page - 1) * ctx.pageSize;
    return { options: hit.slice(start, start + ctx.pageSize), total: hit.length };
}
async function fakeResolve(values: string[]) {
    await sleep(200);
    return STORES.filter((s) => values.includes(String(s.store_id)));
}
function Demo({ placeholder = "Search store...", size = "md", disabled = false, invalid = false, clearable = true, }: {
    placeholder?: string;
    size?: Size;
    disabled?: boolean;
    invalid?: boolean;
    clearable?: boolean;
}) {
    return (<div className="w-72">
      <RemoteSelect fetcher={fakeFetch} resolveValue={fakeResolve} valueKey="store_id" labelKey="store_name" placeholder={placeholder} size={size} disabled={disabled} invalid={invalid} clearable={clearable}/>
    </div>);
}
function EchoDemo() {
    return (<div className="w-72">
      <RemoteSelect fetcher={fakeFetch} resolveValue={fakeResolve} valueKey="store_id" labelKey="store_name" defaultValue="1055" placeholder="Search store..."/>
    </div>);
}
function MultipleDemo() {
    return (<div className="w-96">
      <RemoteSelect multiple fetcher={fakeFetch} resolveValue={fakeResolve} valueKey="store_id" labelKey="store_name" defaultValue={["1058", "1002"]} placeholder="Search and add stores..."/>
    </div>);
}
function RichDemo() {
    return (<div className="w-80">
      <RemoteSelect fetcher={fakeFetch} valueKey="store_id" labelKey="store_name" pageSize={8} placeholder="Search store..." renderOption={(option) => (<span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-foreground">{option.label}</span>
            <span className="ml-auto shrink-0 text-xs text-muted">
              #{String(option.raw.store_id)}
            </span>
          </span>)}/>
    </div>);
}
export const remoteSelectShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Enter the anti-shake search (300ms), scroll to the end and automatically add the next page, without secondary filtering locally.",
            code: `<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  placeholder="Search store..."
  fetcher={async (query, { page, pageSize, signal }) => {
    const res = await fetch(\`/api/stores?q=\${query}&page=\${page}&size=\${pageSize}\`, { signal })
    const json = await res.json()
    return { options: json.list, total: json.total }
  }}
/>`,
            render: () => <Demo />,
        },
        {
            title: "Initial value echo (required for editing form)",
            description: "When value already exists but is not in the first screen list, use resolveValue and press id to batch solve label once; if it is not matched, only bare id will be displayed.",
            code: `<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  defaultValue="1055"
  fetcher={fetchStores}
  // Separate from fetcher: it gets details by id and does not participate in search/pagination
  resolveValue={async (ids) => {
    const res = await fetch(\`/api/stores/batch?ids=\${ids.join(",")}\`)
    return (await res.json()).list
  }}
/>`,
            render: () => <EchoDemo />,
        },
        {
            title: "Multiple choice",
            description: "chip is rendered strictly in the order of value; items that are selected but not loaded can also echo the copy.",
            code: `<RemoteSelect
  multiple
  valueKey="store_id"
  labelKey="store_name"
  defaultValue={["1058", "1002"]}
  fetcher={fetchStores}
  resolveValue={resolveStores}
/>`,
            render: () => <MultipleDemo />,
        },
        {
            title: "Customized line options",
            description: "renderOption can get the original row of raw and render the subtitle/number/label, etc.",
            code: `<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  pageSize={8}
  fetcher={fetchStores}
  renderOption={(option) => (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span className="truncate text-foreground">{option.label}</span>
      <span className="ml-auto shrink-0 text-xs text-muted">#{String(option.raw.store_id)}</span>
    </span>
  )}
/>`,
            render: () => <RichDemo />,
        },
        {
            title: "size / disabled / invalid state",
            description: "size controls the height of the field; disabled is grayed out; invalid is marked with a red border.",
            code: `<>
  <RemoteSelect size="sm" fetcher={fetchStores} placeholder="Search store..." />
  <RemoteSelect disabled fetcher={fetchStores} placeholder="Search store..." />
  <RemoteSelect invalid fetcher={fetchStores} placeholder="Search store..." />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Demo size="sm"/>
          <Demo disabled/>
          <Demo invalid/>
        </div>),
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Search store...", label: "Placeholder copywriting" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "Invalid state" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Initial value echo", render: () => <EchoDemo /> },
        { name: "Multiple choice", render: () => <MultipleDemo /> },
        { name: "Customized line options", render: () => <RichDemo /> },
        { name: "Disabled", render: () => <Demo disabled/> },
        { name: "Invalid state", render: () => <Demo invalid/> },
        { name: "small", render: () => <Demo size="sm"/> },
    ],
    renderWithProps: (p) => (<Demo placeholder={p.placeholder as string} size={p.size as Size} clearable={p.clearable as boolean} disabled={p.disabled as boolean} invalid={p.invalid as boolean}/>),
    toCode: (p) => `<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  size="${p.size}"
  placeholder="${p.placeholder}"
  clearable={${p.clearable}}
  fetcher={fetchStores}
  resolveValue={resolveStores}
/>`,
};
