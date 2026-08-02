"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Spacer } from "../../../../packages/ui/src/spacer/spacer";
const Box = ({ children }: {
    children?: string;
}) => (<span className="inline-flex items-center justify-center rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-2 py-1 text-xs text-foreground">
    {children}
  </span>);
export const spacerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Horizontal spacing",
            description: "x creates a horizontal gap between two inline elements (\u00D7 0.25rem, same as Tailwind spacing scale).",
            code: `<span className="inline-flex items-center">
  <Box>A</Box>
  <Spacer x={8} />
  <Box>B</Box>
</span>`,
            render: () => (<span className="inline-flex items-center">
          <Box>A</Box>
          <Spacer x={8}/>
          <Box>B</Box>
        </span>),
        },
        {
            title: "Vertical Spacing",
            description: "y Providing upper and lower space in the vertical layout.",
            code: `<span className="inline-flex flex-col">
  <Box>Up</Box>
  <Spacer y={6} />
  <Box>Down</Box>
</span>`,
            render: () => (<span className="inline-flex flex-col">
          <Box>on</Box>
          <Spacer y={6}/>
          <Box>Next</Box>
        </span>),
        },
    ],
    controls: [
        { prop: "x", type: "number", defaultValue: 8 },
        { prop: "y", type: "number", defaultValue: 4 },
    ],
    states: [
        {
            name: "horizontal",
            render: () => (<span className="inline-flex items-center">
          <Box>A</Box>
          <Spacer x={8}/>
          <Box>B</Box>
        </span>),
        },
        {
            name: "vertical",
            render: () => (<span className="inline-flex flex-col">
          <Box>on</Box>
          <Spacer y={6}/>
          <Box>Next</Box>
        </span>),
        },
    ],
    renderWithProps: (p) => (<span className="inline-flex items-center">
      <Box>A</Box>
      <Spacer x={(p.x as number) ?? 8} y={(p.y as number) ?? 4}/>
      <Box>B</Box>
    </span>),
    toCode: (p) => `<Spacer x={${(p.x as number) ?? 8}} y={${(p.y as number) ?? 4}} />`,
};
