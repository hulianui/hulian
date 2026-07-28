"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { RemoteSelect } from "./remote-select";
import type { RemoteSelectFetchContext, RemoteSelectRow } from "./remote-select.types";

type Size = "sm" | "md" | "lg";

// 演示用「后端表」：60 家门店。真实项目里换成接口即可。
const STORES: RemoteSelectRow[] = Array.from({ length: 60 }, (_, i) => ({
  store_id: String(1001 + i),
  store_name: `${["杭州", "上海", "北京", "广州", "成都", "武汉"][i % 6]}·${String(i + 1).padStart(2, "0")} 号店`,
  city: ["杭州", "上海", "北京", "广州", "成都", "武汉"][i % 6],
}));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 模拟远程分页搜索接口：延迟 + 关键词过滤 + 切片。 */
async function fakeFetch(query: string, ctx: RemoteSelectFetchContext) {
  await sleep(420);
  if (ctx.signal.aborted) throw new DOMException("aborted", "AbortError");
  const hit = query
    ? STORES.filter((s) => String(s.store_name).includes(query) || String(s.city).includes(query))
    : STORES;
  const start = (ctx.page - 1) * ctx.pageSize;
  return { options: hit.slice(start, start + ctx.pageSize), total: hit.length };
}

/** 模拟按 id 批量取详情的回显接口（与搜索接口是两个后端端点）。 */
async function fakeResolve(values: string[]) {
  await sleep(200);
  return STORES.filter((s) => values.includes(String(s.store_id)));
}

function Demo({
  placeholder = "搜索门店…",
  size = "md",
  disabled = false,
  invalid = false,
  clearable = true,
}: {
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
}) {
  return (
    <div className="w-72">
      <RemoteSelect
        fetcher={fakeFetch}
        resolveValue={fakeResolve}
        valueKey="store_id"
        labelKey="store_name"
        placeholder={placeholder}
        size={size}
        disabled={disabled}
        invalid={invalid}
        clearable={clearable}
      />
    </div>
  );
}

// 编辑表单：value 已有但不在首屏 20 条里（1055 号在第 3 页），靠 resolveValue 单独解 label。
function EchoDemo() {
  return (
    <div className="w-72">
      <RemoteSelect
        fetcher={fakeFetch}
        resolveValue={fakeResolve}
        valueKey="store_id"
        labelKey="store_name"
        defaultValue="1055"
        placeholder="搜索门店…"
      />
    </div>
  );
}

function MultipleDemo() {
  return (
    <div className="w-96">
      <RemoteSelect
        multiple
        fetcher={fakeFetch}
        resolveValue={fakeResolve}
        valueKey="store_id"
        labelKey="store_name"
        defaultValue={["1058", "1002"]}
        placeholder="搜索并添加门店…"
      />
    </div>
  );
}

function RichDemo() {
  return (
    <div className="w-80">
      <RemoteSelect
        fetcher={fakeFetch}
        valueKey="store_id"
        labelKey="store_name"
        pageSize={8}
        placeholder="搜索门店…"
        renderOption={(option) => (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-foreground">{option.label}</span>
            <span className="ml-auto shrink-0 text-xs text-muted">
              #{String(option.raw.store_id)}
            </span>
          </span>
        )}
      />
    </div>
  );
}

export const remoteSelectShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "输入即防抖搜索（300ms），滚到底自动追加下一页，本地不做二次过滤。",
      code: `<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  placeholder="搜索门店…"
  fetcher={async (query, { page, pageSize, signal }) => {
    const res = await fetch(\`/api/stores?q=\${query}&page=\${page}&size=\${pageSize}\`, { signal })
    const json = await res.json()
    return { options: json.list, total: json.total }
  }}
/>`,
      render: () => <Demo />,
    },
    {
      title: "初值回显（编辑表单必配）",
      description:
        "value 已有但不在首屏列表里时，用 resolveValue 按 id 批量解一次 label；不配就只能显示裸 id。",
      code: `<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  defaultValue="1055"
  fetcher={fetchStores}
  // 与 fetcher 分开：它按 id 取详情，不参与搜索/分页
  resolveValue={async (ids) => {
    const res = await fetch(\`/api/stores/batch?ids=\${ids.join(",")}\`)
    return (await res.json()).list
  }}
/>`,
      render: () => <EchoDemo />,
    },
    {
      title: "多选",
      description: "chip 严格按 value 顺序渲染；已选但未加载的项同样能回显文案。",
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
      title: "自定义选项行",
      description: "renderOption 可拿到 raw 原始行，渲染副标题 / 编号 / 标签等。",
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
      title: "尺寸 / 禁用 / 无效态",
      description: "size 控制字段高度；disabled 整体置灰；invalid 标红边框。",
      code: `<>
  <RemoteSelect size="sm" fetcher={fetchStores} placeholder="搜索门店…" />
  <RemoteSelect disabled fetcher={fetchStores} placeholder="搜索门店…" />
  <RemoteSelect invalid fetcher={fetchStores} placeholder="搜索门店…" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Demo size="sm" />
          <Demo disabled />
          <Demo invalid />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "搜索门店…", label: "占位文案" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "clearable", type: "boolean", defaultValue: true, label: "可清除" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "初值回显", render: () => <EchoDemo /> },
    { name: "多选", render: () => <MultipleDemo /> },
    { name: "自定义选项行", render: () => <RichDemo /> },
    { name: "禁用", render: () => <Demo disabled /> },
    { name: "无效态", render: () => <Demo invalid /> },
    { name: "small", render: () => <Demo size="sm" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={p.placeholder as string}
      size={p.size as Size}
      clearable={p.clearable as boolean}
      disabled={p.disabled as boolean}
      invalid={p.invalid as boolean}
    />
  ),
  toCode: (p) =>
    `<RemoteSelect\n  valueKey="store_id"\n  labelKey="store_name"\n  size="${p.size}"\n  placeholder="${p.placeholder}"\n  clearable={${p.clearable}}\n  fetcher={fetchStores}\n  resolveValue={resolveStores}\n/>`,
};
