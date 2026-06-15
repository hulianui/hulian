"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Grid, GridItem } from "./grid";

const Box = ({ children }: { children?: string }) => (
  <span className="flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-3 py-3 text-xs text-foreground">
    {children}
  </span>
);

export const gridShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "cols 传数字固定列数，gap 以 0.25rem 为单位控制行列间距。",
      code: `<Grid cols={3} gap={3}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</Grid>`,
      render: () => (
        <Grid cols={3} gap={3} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (
            <Box key={n}>{n}</Box>
          ))}
        </Grid>
      ),
    },
    {
      title: "跨列",
      description: "用 GridItem 的 colSpan 让单元格横跨多列。",
      code: `<Grid cols={3} gap={3}>
  <GridItem colSpan={2}>跨 2 列</GridItem>
  <div>3</div>
  <div>4</div>
  <GridItem colSpan={2}>跨 2 列</GridItem>
</Grid>`,
      render: () => (
        <Grid cols={3} gap={3} className="w-72">
          <GridItem colSpan={2}>
            <Box>跨 2 列</Box>
          </GridItem>
          <Box>3</Box>
          <Box>4</Box>
          <GridItem colSpan={2}>
            <Box>跨 2 列</Box>
          </GridItem>
        </Grid>
      ),
    },
    {
      title: "响应式列数",
      description: "cols 传 {base,sm,md,lg}，按断点切换列数（走静态 Tailwind 类）。",
      code: `<Grid cols={{ base: 1, sm: 2, md: 3 }} gap={3}>
  {items.map((it) => <Card key={it.id} {...it} />)}
</Grid>`,
      render: () => (
        <Grid cols={{ base: 1, sm: 2, md: 3 }} gap={3} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (
            <Box key={n}>{n}</Box>
          ))}
        </Grid>
      ),
    },
    {
      title: "行列间距分离",
      description: "colGap / rowGap 可分别覆盖 gap，做出不同的横纵间距。",
      code: `<Grid cols={3} colGap={4} rowGap={2}>
  {/* 列间 1rem，行间 0.5rem */}
</Grid>`,
      render: () => (
        <Grid cols={3} colGap={4} rowGap={2} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (
            <Box key={n}>{n}</Box>
          ))}
        </Grid>
      ),
    },
  ],
  controls: [
    { prop: "cols", type: "number", defaultValue: 3 },
    { prop: "gap", type: "number", defaultValue: 3 },
  ],
  states: [
    {
      name: "3 列",
      render: () => (
        <Grid cols={3} gap={3} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (
            <Box key={n}>{n}</Box>
          ))}
        </Grid>
      ),
    },
    {
      name: "跨列跨行",
      render: () => (
        <Grid cols={3} gap={3} className="w-72">
          <GridItem colSpan={2}>
            <Box>跨 2 列</Box>
          </GridItem>
          <Box>3</Box>
          <Box>4</Box>
          <GridItem colSpan={2}>
            <Box>跨 2 列</Box>
          </GridItem>
        </Grid>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Grid cols={(p.cols as number) ?? 3} gap={(p.gap as number) ?? 3} className="w-72">
      {Array.from({ length: ((p.cols as number) ?? 3) * 2 }, (_, i) => (
        <Box key={i}>{String(i + 1)}</Box>
      ))}
    </Grid>
  ),
  toCode: (p) =>
    `<Grid cols={${(p.cols as number) ?? 3}} gap={${(p.gap as number) ?? 3}}>\n  <div>1</div>\n  <GridItem colSpan={2}>跨 2 列</GridItem>\n</Grid>`,
};
