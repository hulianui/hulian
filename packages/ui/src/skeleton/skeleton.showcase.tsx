"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Skeleton } from "./skeleton";

export const skeletonShowcase: ShowcaseSpec = {
  controls: [
    { prop: "shape", type: "select", options: ["text", "circle", "rect"], defaultValue: "text" },
  ],
  states: [
    { name: "text", render: () => <Skeleton className="w-32" /> },
    { name: "circle", render: () => <Skeleton shape="circle" className="size-10" /> },
    { name: "rect", render: () => <Skeleton shape="rect" className="h-16 w-32" /> },
    {
      name: "卡片骨架",
      render: () => (
        <div className="flex w-48 items-center gap-3">
          <Skeleton shape="circle" className="size-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-1/2" />
          </div>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <Skeleton shape={p.shape as "text" | "circle" | "rect"} className="h-12 w-32" />,
  toCode: (p) => `<Skeleton shape="${p.shape}" />`,
};
