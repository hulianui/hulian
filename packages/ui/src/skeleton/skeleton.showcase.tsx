"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Skeleton } from "./skeleton";
import { CardSkeleton, ListSkeleton } from "./skeleton-presets";

export const skeletonShowcase: ShowcaseSpec = {
  controls: [
    { prop: "shape", type: "select", options: ["text", "circle", "rect"], defaultValue: "text" },
  ],
  states: [
    { name: "text", render: () => <Skeleton className="w-32" /> },
    { name: "circle", render: () => <Skeleton shape="circle" className="size-10" /> },
    { name: "rect", render: () => <Skeleton shape="rect" className="h-16 w-32" /> },
    {
      name: "ListSkeleton 列表",
      render: () => (
        <div className="w-72">
          <ListSkeleton rows={3} />
        </div>
      ),
    },
    {
      name: "CardSkeleton 卡片网格",
      render: () => (
        <div className="w-full max-w-md">
          <CardSkeleton count={2} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <Skeleton shape={p.shape as "text" | "circle" | "rect"} className="h-12 w-32" />,
  toCode: (p) => `<Skeleton shape="${p.shape}" />`,
};
