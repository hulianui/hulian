"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Container } from "../../../../packages/ui/src/container/container";
const Box = ({ children }: {
    children: React.ReactNode;
}) => (<div className="rounded-lg border border-dashed border-border bg-surface py-4 text-center text-sm text-muted-foreground">
    {children}
  </div>);
export const containerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Limit the maximum width of the content, horizontally center it, and add left and right safety padding, and close the most frequent page container template in the entire site.",
            code: `<Container>
  <YourContent />
</Container>`,
            render: () => (<Container>
          <Box>Default xl (max-w-5xl) · Centered · Including left and right padding</Box>
        </Container>),
        },
        {
            title: "Maximum width of each file",
            description: "size: sm=2xl / md=3xl / lg=4xl / xl=5xl, relax step by step.",
            code: `<Container size="sm">\u2026</Container>
<Container size="md">\u2026</Container>
<Container size="lg">\u2026</Container>
<Container size="xl">\u2026</Container>`,
            render: () => (<div className="space-y-3">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (<Container key={s} size={s}>
              <Box>size = {s}</Box>
            </Container>))}
        </div>),
        },
        {
            title: "Semantic tags",
            description: "as renders containers into semantic tags (section / main / article), decoupling layout and semantics.",
            code: `<Container as="section" size="lg">
  <YourContent />
</Container>`,
            render: () => (<Container as="section" size="lg">
          <Box>renders as &lt;section&gt;</Box>
        </Container>),
        },
    ],
    controls: [{ prop: "size", type: "select", options: ["sm", "md", "lg", "xl", "full"], defaultValue: "xl" }],
    states: [
        {
            name: "Maximum width of each file",
            render: () => (<div className="space-y-3">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (<Container key={s} size={s}>
              <Box>size = {s}</Box>
            </Container>))}
        </div>),
        },
    ],
    renderWithProps: (p) => (<Container size={p.size as "sm" | "md" | "lg" | "xl" | "full"}>
      <Box>size = {String(p.size)}</Box>
    </Container>),
    toCode: (p) => `<Container size="${p.size}">\u2026</Container>`,
};
