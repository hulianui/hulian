"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Grid, GridItem } from "./grid";

const Box = ({ children }: { children?: string }) => (
  <span className="flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-3 py-3 text-xs text-foreground">
    {children}
  </span>
);

export const gridShowcase: ShowcaseSpec = {
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
