"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Stack } from "./stack";

const Box = ({ children }: { children?: string }) => (
  <span className="inline-flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-3 py-2 text-xs text-foreground">
    {children}
  </span>
);

export const stackShowcase: ShowcaseSpec = {
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
      render: () => (
        <Stack direction="row" gap={3}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      ),
    },
    {
      name: "column",
      render: () => (
        <Stack direction="column" gap={2}>
          <Box>上</Box>
          <Box>中</Box>
          <Box>下</Box>
        </Stack>
      ),
    },
    {
      name: "justify-between",
      render: () => (
        <Stack direction="row" justify="between" className="w-64">
          <Box>左</Box>
          <Box>右</Box>
        </Stack>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Stack
      direction={(p.direction as "row" | "column") ?? "row"}
      gap={(p.gap as number) ?? 3}
      align={p.align as never}
      justify={p.justify as never}
      wrap={(p.wrap as boolean) ?? false}
      className="w-64"
    >
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </Stack>
  ),
  toCode: (p) =>
    `<Stack direction="${(p.direction as string) ?? "row"}" gap={${(p.gap as number) ?? 3}}${
      p.align ? ` align="${p.align as string}"` : ""
    }${p.justify ? ` justify="${p.justify as string}"` : ""}${p.wrap ? " wrap" : ""}>\n  <Box>A</Box>\n  <Box>B</Box>\n</Stack>`,
};
