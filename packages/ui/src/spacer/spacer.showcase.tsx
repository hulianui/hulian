"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Spacer } from "./spacer";

const Box = ({ children }: { children?: string }) => (
  <span className="inline-flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-2 py-1 text-xs text-foreground">
    {children}
  </span>
);

export const spacerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "水平间距",
      description: "x 在两个行内元素之间撑出横向间隔（× 0.25rem，同 Tailwind spacing 刻度）。",
      code: `<span className="inline-flex items-center">
  <Box>A</Box>
  <Spacer x={8} />
  <Box>B</Box>
</span>`,
      render: () => (
        <span className="inline-flex items-center">
          <Box>A</Box>
          <Spacer x={8} />
          <Box>B</Box>
        </span>
      ),
    },
    {
      title: "垂直间距",
      description: "y 在纵向布局里撑出上下间隔。",
      code: `<span className="inline-flex flex-col">
  <Box>上</Box>
  <Spacer y={6} />
  <Box>下</Box>
</span>`,
      render: () => (
        <span className="inline-flex flex-col">
          <Box>上</Box>
          <Spacer y={6} />
          <Box>下</Box>
        </span>
      ),
    },
  ],
  controls: [
    { prop: "x", type: "number", defaultValue: 8 },
    { prop: "y", type: "number", defaultValue: 4 },
  ],
  states: [
    {
      name: "horizontal",
      render: () => (
        <span className="inline-flex items-center">
          <Box>A</Box>
          <Spacer x={8} />
          <Box>B</Box>
        </span>
      ),
    },
    {
      name: "vertical",
      render: () => (
        <span className="inline-flex flex-col">
          <Box>上</Box>
          <Spacer y={6} />
          <Box>下</Box>
        </span>
      ),
    },
  ],
  renderWithProps: (p) => (
    <span className="inline-flex items-center">
      <Box>A</Box>
      <Spacer x={(p.x as number) ?? 8} y={(p.y as number) ?? 4} />
      <Box>B</Box>
    </span>
  ),
  toCode: (p) => `<Spacer x={${(p.x as number) ?? 8}} y={${(p.y as number) ?? 4}} />`,
};
