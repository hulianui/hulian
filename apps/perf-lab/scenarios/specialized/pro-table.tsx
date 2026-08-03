import { useState } from "react";

import { ProTable } from "@hulianui/ui/pro-table";
import type { ColumnDef, RowSelectionState, SortingState } from "@hulianui/ui/table";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { inputValue, invoke, nextPaint, rootFor, type ScenarioController } from "./shared";

export const proTableParameters = { rows: 1_000 } as const;
const id = "pro-table/stress";
const controller: ScenarioController = {};
const seed = Array.from({ length: proTableParameters.rows }, (_, index) => ({
  id: `pro-${index}`,
  name: `ProTable 数据 ${index}`,
  score: (index * 23) % 101,
}));
type RowData = (typeof seed)[number];
const columns: ColumnDef<RowData, any>[] = [
  { accessorKey: "name", header: "名称", meta: { filterable: true } },
  { accessorKey: "score", header: "分数" },
];

function Fixture() {
  const [data, setData] = useState(seed);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [tick, setTick] = useState(0);
  controller["sort"] = () => setSorting([{ id: "score", desc: false }]);
  controller["filter"] = () => {
    const input = rootFor(id).querySelector<HTMLInputElement>("thead input");
    if (!input) throw new Error("pro-table filter input is missing");
    inputValue(input, "ProTable 数据 9");
  };
  controller["select"] = () => setSelection({ "pro-9": true });
  controller["replace"] = () => setData((current) => [...current]);
  controller["parent"] = () => setTick((value) => value + 1);
  return (
    <div data-hulian-scan-scenario={id} data-parent-tick={tick}>
      <ProTable
        title="1000 行压力表格"
        toolbar={false}
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        sorting={sorting}
        onSortingChange={setSorting}
        virtual={{ enabled: true, height: 420, rowHeight: 44, overscan: 8 }}
      />
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const proTableScenario = definePerformanceScenario({
  id,
  component: "ProTable",
  entry: "@hulianui/ui/pro-table",
  category: "heavy",
  render: () => <Fixture />,
  steps: [
    {
      id: "sort-1000-rows",
      kind: "interaction",
      label: "Sort 1000 rows",
      run: () => action("sort"),
    },
    {
      id: "filter-1000-rows",
      kind: "interaction",
      label: "Filter 1000 rows",
      run: () => action("filter"),
    },
    { id: "select-row", kind: "interaction", label: "Select a row", run: () => action("select") },
    { id: "replace-data", kind: "props-update", run: () => action("replace") },
    { id: "stable-parent-update", kind: "parent-update", run: () => action("parent") },
  ],
  budgets: {},
});
