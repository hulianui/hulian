"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Container } from "./container";

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-dashed border-border bg-surface py-4 text-center text-sm text-muted">
    {children}
  </div>
);

export const containerShowcase: ShowcaseSpec = {
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
