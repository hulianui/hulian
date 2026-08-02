"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Grid, GridItem } from "../../../../packages/ui/src/grid/grid";
const Box = ({ children }: {
    children?: string;
}) => (<span className="flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-3 py-3 text-xs text-foreground">
    {children}
  </span>);
export const gridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "cols passes the number to fix the number of columns, gap controls the row and column spacing in units of 0.25rem.",
            code: `<Grid cols={3} gap={3}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</Grid>`,
            render: () => (<Grid cols={3} gap={3} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (<Box key={n}>{n}</Box>))}
        </Grid>),
        },
        {
            title: "Cross column",
            description: "Make cells span multiple columns using colSpan of GridItem.",
            code: `<Grid cols={3} gap={3}>
  <GridItem colSpan={2}>across 2 columns</GridItem>
  <div>3</div>
  <div>4</div>
  <GridItem colSpan={2}>across 2 columns</GridItem>
</Grid>`,
            render: () => (<Grid cols={3} gap={3} className="w-72">
          <GridItem colSpan={2}>
            <Box>Spanning 2 columns</Box>
          </GridItem>
          <Box>3</Box>
          <Box>4</Box>
          <GridItem colSpan={2}>
            <Box>Spanning 2 columns</Box>
          </GridItem>
        </Grid>),
        },
        {
            title: "Responsive columns",
            description: "cols passes {base, sm, md, lg}, and press the breakpoint to switch the column number (static Tailwind class).",
            code: `<Grid cols={{ base: 1, sm: 2, md: 3 }} gap={3}>
  {items.map((it) => <Card key={it.id} {...it} />)}
</Grid>`,
            render: () => (<Grid cols={{ base: 1, sm: 2, md: 3 }} gap={3} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (<Box key={n}>{n}</Box>))}
        </Grid>),
        },
        {
            title: "Separation of row and row spacing",
            description: "colGap / rowGap can cover gap respectively to create different horizontal and vertical spacing.",
            code: `<Grid cols={3} colGap={4} rowGap={2}>
  {/* 1rem between columns, 0.5rem between rows */}
</Grid>`,
            render: () => (<Grid cols={3} colGap={4} rowGap={2} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (<Box key={n}>{n}</Box>))}
        </Grid>),
        },
    ],
    controls: [
        { prop: "cols", type: "number", defaultValue: 3 },
        { prop: "gap", type: "number", defaultValue: 3 },
    ],
    states: [
        {
            name: "3 columns",
            render: () => (<Grid cols={3} gap={3} className="w-72">
          {["1", "2", "3", "4", "5", "6"].map((n) => (<Box key={n}>{n}</Box>))}
        </Grid>),
        },
        {
            name: "Cross columns and rows",
            render: () => (<Grid cols={3} gap={3} className="w-72">
          <GridItem colSpan={2}>
            <Box>Spanning 2 columns</Box>
          </GridItem>
          <Box>3</Box>
          <Box>4</Box>
          <GridItem colSpan={2}>
            <Box>Spanning 2 columns</Box>
          </GridItem>
        </Grid>),
        },
    ],
    renderWithProps: (p) => (<Grid cols={(p.cols as number) ?? 3} gap={(p.gap as number) ?? 3} className="w-72">
      {Array.from({ length: ((p.cols as number) ?? 3) * 2 }, (_, i) => (<Box key={i}>{String(i + 1)}</Box>))}
    </Grid>),
    toCode: (p) => `<Grid cols={${(p.cols as number) ?? 3}} gap={${(p.gap as number) ?? 3}}>
  <div>1</div>
  <GridItem colSpan={2}>across 2 columns</GridItem>
</Grid>`,
};
