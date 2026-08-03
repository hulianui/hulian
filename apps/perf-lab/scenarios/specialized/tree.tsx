import { useState } from "react";

import { Tree, type TreeNode } from "@hulianui/ui/tree";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { invoke, nextPaint, type ScenarioController } from "./shared";

export const treeParameters = { nodes: 1_000, branchNodes: 100 } as const;
const id = "tree/stress";
const controller: ScenarioController = {};
const nodes: TreeNode[] = Array.from({ length: 10 }, (_, branch) => ({
  key: `branch-${branch}`,
  label: `分支 ${branch}`,
  children: Array.from({ length: 99 }, (_, child) => ({
    key: `branch-${branch}-node-${child}`,
    label: `节点 ${branch}-${child}`,
  })),
}));

function Fixture() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  controller["expand"] = () => setExpanded(["branch-0"]);
  controller["collapse"] = () => setExpanded([]);
  controller["select"] = () => setSelected(["branch-0-node-50"]);
  controller["parent"] = () => setTick((value) => value + 1);
  return (
    <div data-hulian-scan-scenario={id} data-parent-tick={tick}>
      <Tree
        nodes={nodes}
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        selectedKeys={selected}
        onSelect={(keys) => setSelected(keys)}
        expandTrigger="icon"
        virtual={{ height: 420, itemHeight: 36, overscan: 8 }}
      />
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const treeScenario = definePerformanceScenario({
  id,
  component: "Tree",
  entry: "@hulianui/ui/tree",
  category: "heavy",
  render: () => <Fixture />,
  steps: [
    {
      id: "expand-100-node-branch",
      kind: "interaction",
      label: "Expand a 100-node branch",
      run: () => action("expand"),
    },
    {
      id: "select-node",
      kind: "interaction",
      label: "Select a tree node",
      run: () => action("select"),
    },
    {
      id: "collapse-100-node-branch",
      kind: "interaction",
      label: "Collapse a 100-node branch",
      run: () => action("collapse"),
    },
    { id: "stable-parent-update", kind: "parent-update", run: () => action("parent") },
  ],
  budgets: {},
});
