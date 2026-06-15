"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Stack } from "./stack";

const Box = ({ children }: { children?: string }) => (
  <span className="inline-flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-3 py-2 text-xs text-foreground">
    {children}
  </span>
);

export const stackShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "横向排列",
      description: "direction=\"row\" 水平排列，gap 以 0.25rem 为单位（同 Tailwind spacing）。",
      code: `<Stack direction="row" gap={3}>
  <Box>A</Box>
  <Box>B</Box>
  <Box>C</Box>
</Stack>`,
      render: () => (
        <Stack direction="row" gap={3}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      ),
    },
    {
      title: "纵向排列",
      description: "direction=\"column\" 垂直堆叠。",
      code: `<Stack direction="column" gap={2}>
  <Box>上</Box>
  <Box>中</Box>
  <Box>下</Box>
</Stack>`,
      render: () => (
        <Stack direction="column" gap={2}>
          <Box>上</Box>
          <Box>中</Box>
          <Box>下</Box>
        </Stack>
      ),
    },
    {
      title: "主轴对齐",
      description: "justify 控制主轴分布，常用 between 把首尾顶到两端。",
      code: `<Stack direction="row" justify="between" className="w-64">
  <Box>左</Box>
  <Box>右</Box>
</Stack>`,
      render: () => (
        <Stack direction="row" justify="between" className="w-64">
          <Box>左</Box>
          <Box>右</Box>
        </Stack>
      ),
    },
    {
      title: "交叉轴对齐",
      description: "align 控制交叉轴对齐，center 让不等高子项垂直居中。",
      code: `<Stack direction="row" gap={3} align="center">
  <Box>A</Box>
  <Box>B</Box>
  <Box>C</Box>
</Stack>`,
      render: () => (
        <Stack direction="row" gap={3} align="center">
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      ),
    },
    {
      title: "换行",
      description: "wrap 让 row 在空间不足时折行（仅 row 有意义）。",
      code: `<Stack direction="row" gap={2} wrap className="w-48">
  <Box>1</Box>
  <Box>2</Box>
  <Box>3</Box>
  <Box>4</Box>
  <Box>5</Box>
  <Box>6</Box>
</Stack>`,
      render: () => (
        <Stack direction="row" gap={2} wrap className="w-48">
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
          <Box>4</Box>
          <Box>5</Box>
          <Box>6</Box>
        </Stack>
      ),
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
