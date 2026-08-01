import { useState } from "react";

import {
  Table,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@hulianui/ui/table";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { inputValue, invoke, nextPaint, rootFor, type ScenarioController } from "./shared";

export const tableParameters = { rows: 1_000 } as const;
const id = "table/stress";

interface RowData {
  id: string;
  name: string;
  score: number;
}

const initialRows: RowData[] = Array.from({ length: tableParameters.rows }, (_, index) => ({
  id: `row-${index}`,
  name: `性能数据 ${index}`,
  score: (index * 17) % 101,
}));
const columns: ColumnDef<RowData, any>[] = [
  { accessorKey: "name", header: "名称", meta: { filterable: true } },
  { accessorKey: "score", header: "分数" },
];
const controller: ScenarioController = {};

function Fixture() {
  const [rows, setRows] = useState(initialRows);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [parentTick, setParentTick] = useState(0);
  controller["sort"] = () => setSorting([{ id: "score", desc: true }]);
  controller["filter"] = () => {
    const input = rootFor(id).querySelector<HTMLInputElement>("thead input");
    if (!input) throw new Error("table filter input is missing");
    inputValue(input, "性能数据 99");
  };
  controller["select"] = () => setSelection({ "row-99": true });
  controller["replace"] = () => setRows((current) => [...current]);
  controller["parent"] = () => setParentTick((value) => value + 1);
  return (
    <div data-hulian-scan-scenario={id} data-parent-tick={parentTick}>
      <Table
        columns={columns}
        data={rows}
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

export const tableScenario = definePerformanceScenario({
  id,
  component: "Table",
  entry: "@hulianui/ui/table",
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
