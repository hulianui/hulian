"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Skeleton } from "../../../../packages/ui/src/skeleton/skeleton";
import { CardSkeleton, ListSkeleton } from "../../../../packages/ui/src/skeleton/skeleton-presets";
export const skeletonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Shape",
            description: "shape supports text / circle / rect, and the size is controlled by className.",
            code: `<div className="flex items-center gap-4">
  <Skeleton className="w-32" />
  <Skeleton shape="circle" className="size-10" />
  <Skeleton shape="rect" className="h-16 w-32" />
</div>`,
            render: () => (<div className="flex items-center gap-4">
          <Skeleton className="w-32"/>
          <Skeleton shape="circle" className="size-10"/>
          <Skeleton shape="rect" className="h-16 w-32"/>
        </div>),
        },
        {
            title: "Avatar + Text line",
            description: "Combine circles and text blocks to simulate user information loading placeholders.",
            code: `<div className="flex items-center gap-3">
  <Skeleton shape="circle" className="size-10" />
  <div className="flex-1 space-y-2">
    <Skeleton className="w-24" />
    <Skeleton className="w-40" />
  </div>
</div>`,
            render: () => (<div className="flex w-72 items-center gap-3">
          <Skeleton shape="circle" className="size-10"/>
          <div className="flex-1 space-y-2">
            <Skeleton className="w-24"/>
            <Skeleton className="w-40"/>
          </div>
        </div>),
        },
        {
            title: "List Preset",
            description: "ListSkeleton Configure multiple rows of list placeholders in one row.",
            code: `<ListSkeleton rows={3} />`,
            render: () => (<div className="w-72">
          <ListSkeleton rows={3}/>
        </div>),
        },
        {
            title: "Card Grid Presets",
            description: "CardSkeleton Output card grid placeholder.",
            code: `<CardSkeleton count={2} />`,
            render: () => (<div className="w-full max-w-md">
          <CardSkeleton count={2}/>
        </div>),
        },
    ],
    controls: [
        { prop: "shape", type: "select", options: ["text", "circle", "rect"], defaultValue: "text" },
    ],
    states: [
        { name: "text", render: () => <Skeleton className="w-32"/> },
        { name: "circle", render: () => <Skeleton shape="circle" className="size-10"/> },
        { name: "rect", render: () => <Skeleton shape="rect" className="h-16 w-32"/> },
        {
            name: "ListSkeleton List",
            render: () => (<div className="w-72">
          <ListSkeleton rows={3}/>
        </div>),
        },
        {
            name: "CardSkeleton Card Grid",
            render: () => (<div className="w-full max-w-md">
          <CardSkeleton count={2}/>
        </div>),
        },
    ],
    renderWithProps: (p) => <Skeleton shape={p.shape as "text" | "circle" | "rect"} className="h-12 w-32"/>,
    toCode: (p) => `<Skeleton shape="${p.shape}" />`,
};
