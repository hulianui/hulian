"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Container } from "./container";

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-dashed border-border bg-surface py-4 text-center text-sm text-muted-foreground">
    {children}
  </div>
);

export const containerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "限制内容最大宽度、水平居中并加左右安全内距，收口全站最高频的页面容器样板。",
      code: `<Container>
  <YourContent />
</Container>`,
      render: () => (
        <Container>
          <Box>默认 xl（max-w-5xl）· 居中 · 含左右内距</Box>
        </Container>
      ),
    },
    {
      title: "各档最大宽度",
      description: "size：sm=2xl / md=3xl / lg=4xl / xl=5xl，逐档放宽。",
      code: `<Container size="sm">…</Container>
<Container size="md">…</Container>
<Container size="lg">…</Container>
<Container size="xl">…</Container>`,
      render: () => (
        <div className="space-y-3">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <Container key={s} size={s}>
              <Box>size = {s}</Box>
            </Container>
          ))}
        </div>
      ),
    },
    {
      title: "语义标签",
      description: "as 把容器渲染成语义标签（section / main / article），布局与语义解耦。",
      code: `<Container as="section" size="lg">
  <YourContent />
</Container>`,
      render: () => (
        <Container as="section" size="lg">
          <Box>渲染为 &lt;section&gt;</Box>
        </Container>
      ),
    },
  ],
  controls: [{ prop: "size", type: "select", options: ["sm", "md", "lg", "xl", "full"], defaultValue: "xl" }],
  states: [
    {
      name: "各档最大宽度",
      render: () => (
        <div className="space-y-3">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <Container key={s} size={s}>
              <Box>size = {s}</Box>
            </Container>
          ))}
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Container size={p.size as "sm" | "md" | "lg" | "xl" | "full"}>
      <Box>size = {String(p.size)}</Box>
    </Container>
  ),
  toCode: (p) => `<Container size="${p.size}">…</Container>`,
};
