"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Stack, StackItem } from "../../../../packages/ui/src/stack/stack";
const Box = ({ children }: {
    children?: string;
}) => (<span className="inline-flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-3 py-2 text-xs text-foreground">
    {children}
  </span>);
export const stackShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Horizontal arrangement",
            description: "direction=\"row\" Arranged horizontally, gap is in units of 0.25rem (same as Tailwind spacing).",
            code: `<Stack direction="row" gap={3}>
  <Box>A</Box>
  <Box>B</Box>
  <Box>C</Box>
</Stack>`,
            render: () => (<Stack direction="row" gap={3}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>),
        },
        {
            title: "Vertically arranged",
            description: "direction=\"column\" Vertically stacked.",
            code: `<Stack direction="column" gap={2}>
  <Box>Up</Box>
  <Box>Medium</Box>
  <Box>Down</Box>
</Stack>`,
            render: () => (<Stack direction="column" gap={2}>
          <Box>on</Box>
          <Box>Medium</Box>
          <Box>Next</Box>
        </Stack>),
        },
        {
            title: "Spindle Alignment",
            description: "justify controls the spindle distribution. between is commonly used to push the head and tail to both ends.",
            code: `<Stack direction="row" justify="between" className="w-64">
  <Box>Left</Box>
  <Box>right</Box>
</Stack>`,
            render: () => (<Stack direction="row" justify="between" className="w-64">
          <Box>Left</Box>
          <Box>Right</Box>
        </Stack>),
        },
        {
            title: "Cross-axis alignment",
            description: "align controls cross-axis alignment, and center vertically centers unequal height children.",
            code: `<Stack direction="row" gap={3} align="center">
  <Box>A</Box>
  <Box>B</Box>
  <Box>C</Box>
</Stack>`,
            render: () => (<Stack direction="row" gap={3} align="center">
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>),
        },
        {
            title: "Line break",
            description: "wrap Make row wrap when there is insufficient space (only meaningful for row).",
            code: `<Stack direction="row" gap={2} wrap className="w-48">
  <Box>1</Box>
  <Box>2</Box>
  <Box>3</Box>
  <Box>4</Box>
  <Box>5</Box>
  <Box>6</Box>
</Stack>`,
            render: () => (<Stack direction="row" gap={2} wrap className="w-48">
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
          <Box>4</Box>
          <Box>5</Box>
          <Box>6</Box>
        </Stack>),
        },
        {
            title: "StackItem sizing",
            description: "grow lets the title take the remaining space, minWidth={0} lets long text shrink, and shrink={false} keeps the action width.",
            code: `<Stack direction="row" align="center" gap={3} className="w-80">
  <StackItem grow minWidth={0}>
    <span className="block truncate">A long title that leaves room for the action on the right</span>
  </StackItem>
  <StackItem shrink={false}>
    <Box>Actions</Box>
  </StackItem>
</Stack>`,
            render: () => (<Stack direction="row" align="center" gap={3} className="w-80">
          <StackItem grow minWidth={0}>
            <span className="block truncate">A long title that leaves room for the action on the right</span>
          </StackItem>
          <StackItem shrink={false}>
            <Box>Actions</Box>
          </StackItem>
        </Stack>),
        },
    ],
    controls: [
        { prop: "direction", type: "select", options: ["row", "column"], defaultValue: "row" },
        { prop: "gap", type: "number", defaultValue: 3 },
        { prop: "align", type: "select", options: ["start", "center", "end", "stretch", "baseline"], defaultValue: "center" },
        { prop: "justify", type: "select", options: ["start", "center", "end", "between", "around", "evenly"], defaultValue: "start" },
        { prop: "wrap", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "row",
            render: () => (<Stack direction="row" gap={3}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>),
        },
        {
            name: "column",
            render: () => (<Stack direction="column" gap={2}>
          <Box>on</Box>
          <Box>Medium</Box>
          <Box>Next</Box>
        </Stack>),
        },
        {
            name: "justify-between",
            render: () => (<Stack direction="row" justify="between" className="w-64">
          <Box>Left</Box>
          <Box>Right</Box>
        </Stack>),
        },
    ],
    renderWithProps: (p) => (<Stack direction={(p.direction as "row" | "column") ?? "row"} gap={(p.gap as number) ?? 3} align={p.align as never} justify={p.justify as never} wrap={(p.wrap as boolean) ?? false} className="w-64">
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </Stack>),
    toCode: (p) => `<Stack direction="${(p.direction as string) ?? "row"}" gap={${(p.gap as number) ?? 3}}${p.align ? ` align="${p.align as string}"` : ""}${p.justify ? ` justify="${p.justify as string}"` : ""}${p.wrap ? " wrap" : ""}>
  <Box>A</Box>
  <Box>B</Box>
</Stack>`,
};
