"use client";
import { Folder } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tree } from "../../../../packages/ui/src/tree/tree";
import type { TreeNode } from "../../../../packages/ui/src/tree/tree-core";
const NODES: TreeNode[] = [
    {
        key: "design",
        label: "Design",
        icon: <Folder />,
        children: [
            { key: "tokens", label: "Tokens" },
            { key: "theme", label: "Theme" },
            { key: "motion", label: "Animation", disabled: true },
        ],
    },
    {
        key: "components",
        label: "Components",
        icon: <Folder />,
        children: [
            {
                key: "form",
                label: "Form",
                children: [
                    { key: "input", label: "Input" },
                    { key: "select", label: "Select" },
                ],
            },
            {
                key: "feedback",
                label: "Feedback",
                children: [
                    { key: "alert", label: "Alert" },
                    { key: "toast", label: "Toast" },
                ],
            },
        ],
    },
    { key: "docs", label: "Documentation" },
];
function Box({ children }: {
    children: React.ReactNode;
}) {
    return <div className="w-72 rounded-[var(--radius)] border border-border bg-surface p-2">{children}</div>;
}
export const treeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Radio highlight + arrow key navigation; defaultExpandedKeys controls the initial expansion of branches.",
            code: `<Tree
  nodes={nodes}
  defaultExpandedKeys={["design", "components"]}
  defaultSelectedKeys={["theme"]}
/>`,
            render: () => (<Box>
          <Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]}/>
        </Box>),
        },
        {
            title: "Check",
            description: "checkable Turn on the parent-child cascade check, and half-select will automatically show indeterminate.",
            code: `<Tree
  nodes={nodes}
  checkable
  defaultExpandedKeys={["design", "components", "form"]}
  defaultCheckedKeys={["tokens"]}
/>`,
            render: () => (<Box>
          <Tree nodes={NODES} checkable defaultExpandedKeys={["design", "components", "form"]} defaultCheckedKeys={["tokens"]}/>
        </Box>),
        },
        {
            title: "Connecting cable",
            description: "showLine displays hierarchical connection lines, making the structure hierarchy clearer.",
            code: `<Tree nodes={nodes} showLine defaultExpandedKeys={["components", "form"]} />`,
            render: () => (<Box>
          <Tree nodes={NODES} showLine defaultExpandedKeys={["components", "form"]}/>
        </Box>),
        },
        {
            title: "Search within the tree",
            description: "searchable provides a search box, where hit nodes are highlighted and ancestor paths are automatically expanded.",
            code: `<Tree nodes={nodes} searchable searchPlaceholder="Search component" />`,
            render: () => (<Box>
          <Tree nodes={NODES} searchable searchPlaceholder="Search component"/>
        </Box>),
        },
    ],
    controls: [
        { prop: "checkable", type: "boolean", defaultValue: false, label: "checkable (check)" },
        { prop: "showLine", type: "boolean", defaultValue: false, label: "showLine (connecting cable)" },
        { prop: "searchable", type: "boolean", defaultValue: false, label: "searchable (Search)" },
    ],
    states: [
        {
            name: "Default (single choice\u00B7expand two branches)",
            render: () => (<Box>
          <Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]}/>
        </Box>),
        },
        {
            name: "checkable (father-son cascade half selection)",
            render: () => (<Box>
          <Tree nodes={NODES} checkable defaultExpandedKeys={["design", "components", "form"]} defaultCheckedKeys={["tokens"]}/>
        </Box>),
        },
        {
            name: "showLine (connecting cable)",
            render: () => (<Box>
          <Tree nodes={NODES} showLine defaultExpandedKeys={["components", "form"]}/>
        </Box>),
        },
        {
            name: "searchable (Search within the tree)",
            render: () => (<Box>
          <Tree nodes={NODES} searchable searchPlaceholder="Search component"/>
        </Box>),
        },
    ],
    renderWithProps: (p) => (<Box>
      <Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]} checkable={p.checkable as boolean} showLine={p.showLine as boolean} searchable={p.searchable as boolean}/>
    </Box>),
    toCode: (p) => `<Tree
  nodes={nodes}
  defaultExpandedKeys={["design", "components"]}${p.checkable ? "\n  checkable" : ""}${p.showLine ? "\n  showLine" : ""}${p.searchable ? "\n  searchable" : ""}
/>`,
};
