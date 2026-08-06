import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DiffStat } from "../../../../packages/ui/src/diff-stat/diff-stat";
import type { DiffStatStatus } from "../../../../packages/ui/src/diff-stat/diff-stat.types";
export const diffStatShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "+N \u2212M Number + green and red grid bars filled according to the addition and deletion ratio, PR is just needed for list/code review.",
            code: `<DiffStat additions={24} deletions={6} />`,
            render: () => <DiffStat additions={24} deletions={6}/>,
        },
        {
            title: "Status Logo",
            description: "status Rendering Add/Modify/Delete/Rename Logo (renamed Borrow primary Blue Difference modified).",
            code: `<>
  <DiffStat additions={142} deletions={0} status="added" />
  <DiffStat additions={24} deletions={6} status="modified" />
  <DiffStat additions={0} deletions={88} status="deleted" />
  <DiffStat additions={3} deletions={3} status="renamed" />
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <DiffStat additions={142} deletions={0} status="added"/>
          <DiffStat additions={24} deletions={6} status="modified"/>
          <DiffStat additions={0} deletions={88} status="deleted"/>
          <DiffStat additions={3} deletions={3} status="renamed"/>
        </div>),
        },
        {
            title: "Grid strips only",
            description: "showCounts={false} hides the numbers, leaving only compact green and red grid bars.",
            code: `<DiffStat additions={7} deletions={2} showCounts={false} />`,
            render: () => <DiffStat additions={7} deletions={2} showCounts={false}/>,
        },
        {
            title: "Size",
            description: "size=\"sm\" Reduce the grid and follow the text within the line.",
            code: `<>
  <DiffStat additions={10} deletions={4} size="sm" />
  <DiffStat additions={10} deletions={4} size="md" />
</>`,
            render: () => (<div className="flex items-center gap-4">
          <DiffStat additions={10} deletions={4} size="sm"/>
          <DiffStat additions={10} deletions={4} size="md"/>
        </div>),
        },
    ],
    controls: [
        { prop: "additions", type: "number", defaultValue: 24, label: "Added lines" },
        { prop: "deletions", type: "number", defaultValue: 6, label: "Removed lines" },
        {
            prop: "status",
            type: "select",
            options: ["added", "modified", "deleted", "renamed"],
            defaultValue: "modified",
        },
        { prop: "blocks", type: "number", defaultValue: 5, label: "Number of grids" },
        { prop: "showCounts", type: "boolean", defaultValue: true, label: "Display numbers" },
    ],
    states: [
        { name: "Mixed changes", render: () => <DiffStat additions={24} deletions={6} status="modified"/> },
        { name: "New file", render: () => <DiffStat additions={142} deletions={0} status="added"/> },
        { name: "Delete files", render: () => <DiffStat additions={0} deletions={88} status="deleted"/> },
        { name: "Rename", render: () => <DiffStat additions={3} deletions={3} status="renamed"/> },
        { name: "Grid strips only", render: () => <DiffStat additions={7} deletions={2} showCounts={false}/> },
        { name: "Small size", render: () => <DiffStat additions={10} deletions={4} size="sm"/> },
    ],
    renderWithProps: (p) => (<DiffStat additions={Number(p.additions)} deletions={Number(p.deletions)} status={p.status as DiffStatStatus} blocks={Number(p.blocks)} showCounts={p.showCounts as boolean}/>),
    toCode: (p) => `<DiffStat additions={${Number(p.additions)}} deletions={${Number(p.deletions)}} status="${p.status}" blocks={${Number(p.blocks)}}${p.showCounts ? "" : " showCounts={false}"} />`,
};
