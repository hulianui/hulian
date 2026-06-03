"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Spacer } from "./spacer";

const Box = ({ children }: { children?: string }) => (
  <span className="inline-flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-2 py-1 text-xs text-foreground">
    {children}
  </span>
);

export const spacerShowcase: ShowcaseSpec = {
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
