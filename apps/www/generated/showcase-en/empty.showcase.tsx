"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Empty } from "../../../../packages/ui/src/empty/empty";
export const emptyShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Built-in empty box icon + title + description.",
            code: `<Empty title="No data yet" description="There is no content in the current list" />`,
            render: () => <Empty title="No data yet" description="There is currently no content in the list"/>,
        },
        {
            title: "With operation",
            description: "children Rendered below the description, where the guide button is always placed.",
            code: `<Empty title="No project yet" description="Create your first project to get started">
  <Button size="sm">New project</Button>
</Empty>`,
            render: () => (<Empty title="No projects yet" description="Create your first project to get started">
          <Button size="sm">New project</Button>
        </Empty>),
        },
        {
            title: "Small size",
            description: "size=\"sm\" Tighten the spacing and font size, suitable for in-card/drop-down empty states.",
            code: `<Empty size="sm" title="No results" description="Try other keywords" />`,
            render: () => <Empty size="sm" title="No results" description="Try other keywords"/>,
        },
        {
            title: "No icon",
            description: "icon={null} Hides the icon area, leaving only the copy.",
            code: `<Empty icon={null} title="No notification yet" description="New messages will appear here" />`,
            render: () => <Empty icon={null} title="No notification yet" description="New news will appear here when it is available"/>,
        },
    ],
    controls: [
        { prop: "title", type: "text", defaultValue: "No data yet" },
        { prop: "description", type: "text", defaultValue: "There is currently no content in the list" },
        { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
    ],
    states: [
        {
            name: "Default",
            render: () => <Empty title="No data yet" description="There is currently no content in the list"/>,
        },
        {
            name: "With operation",
            render: () => (<Empty title="No projects yet" description="Create your first project to get started">
          <Button size="sm">New project</Button>
        </Empty>),
        },
        {
            name: "small",
            render: () => <Empty size="sm" title="No results" description="Try other keywords"/>,
        },
    ],
    renderWithProps: (p) => (<Empty title={(p.title as string) || undefined} description={(p.description as string) || undefined} size={(p.size as "sm" | "md") ?? "md"}/>),
    toCode: (p) => `<Empty
  title="${(p.title as string) ?? "No data yet"}"
  description="${(p.description as string) ?? ""}"
  size="${(p.size as string) ?? "md"}"
/>`,
};
