import type { ShowcaseSpec } from "../showcase/types";
import { DiffStat } from "./diff-stat";
import type { DiffStatStatus } from "./diff-stat.types";

export const diffStatShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "+N −M 数字 + 按增删比例填充的绿红格子条，PR 列表/代码审查刚需。",
      code: `<DiffStat additions={24} deletions={6} />`,
      render: () => <DiffStat additions={24} deletions={6} />,
    },
    {
      title: "状态徽标",
      description: "status 渲染 新增/修改/删除/重命名 徽标（renamed 借 primary 蓝区别 modified）。",
      code: `<>
  <DiffStat additions={142} deletions={0} status="added" />
  <DiffStat additions={24} deletions={6} status="modified" />
  <DiffStat additions={0} deletions={88} status="deleted" />
  <DiffStat additions={3} deletions={3} status="renamed" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <DiffStat additions={142} deletions={0} status="added" />
          <DiffStat additions={24} deletions={6} status="modified" />
          <DiffStat additions={0} deletions={88} status="deleted" />
          <DiffStat additions={3} deletions={3} status="renamed" />
        </div>
      ),
    },
    {
      title: "仅格子条",
      description: "showCounts={false} 隐藏数字，只留紧凑的绿红格子条。",
      code: `<DiffStat additions={7} deletions={2} showCounts={false} />`,
      render: () => <DiffStat additions={7} deletions={2} showCounts={false} />,
    },
    {
      title: "尺寸",
      description: "size=\"sm\" 缩小格子，行内随文跟随。",
      code: `<>
  <DiffStat additions={10} deletions={4} size="sm" />
  <DiffStat additions={10} deletions={4} size="md" />
</>`,
      render: () => (
        <div className="flex items-center gap-4">
          <DiffStat additions={10} deletions={4} size="sm" />
          <DiffStat additions={10} deletions={4} size="md" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "additions", type: "number", defaultValue: 24, label: "新增行" },
    { prop: "deletions", type: "number", defaultValue: 6, label: "删除行" },
    {
      prop: "status",
      type: "select",
      options: ["added", "modified", "deleted", "renamed"],
      defaultValue: "modified",
    },
    { prop: "blocks", type: "number", defaultValue: 5, label: "格子数" },
    { prop: "showCounts", type: "boolean", defaultValue: true, label: "显示数字" },
  ],
  states: [
    { name: "混合改动", render: () => <DiffStat additions={24} deletions={6} status="modified" /> },
    { name: "新增文件", render: () => <DiffStat additions={142} deletions={0} status="added" /> },
    { name: "删除文件", render: () => <DiffStat additions={0} deletions={88} status="deleted" /> },
    { name: "重命名", render: () => <DiffStat additions={3} deletions={3} status="renamed" /> },
    { name: "仅格子条", render: () => <DiffStat additions={7} deletions={2} showCounts={false} /> },
    { name: "小尺寸", render: () => <DiffStat additions={10} deletions={4} size="sm" /> },
  ],
  renderWithProps: (p) => (
    <DiffStat
      additions={Number(p.additions)}
      deletions={Number(p.deletions)}
      status={p.status as DiffStatStatus}
      blocks={Number(p.blocks)}
      showCounts={p.showCounts as boolean}
    />
  ),
  toCode: (p) =>
    `<DiffStat additions={${Number(p.additions)}} deletions={${Number(p.deletions)}} status="${p.status}" blocks={${Number(p.blocks)}}${p.showCounts ? "" : " showCounts={false}"} />`,
};
