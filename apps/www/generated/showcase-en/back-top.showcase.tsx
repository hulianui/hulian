"use client";
import { useRef, type ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BackTop } from "../../../../packages/ui/src/back-top/back-top";
function BackTopBox({ children }: {
    children?: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    return (<div className="relative w-full max-w-md">
      <div ref={ref} className="h-44 overflow-y-auto rounded-[var(--radius)] border border-border p-4">
        <div className="space-y-3">
          {Array.from({ length: 24 }).map((_, i) => (<p key={i} className="text-sm text-muted">
              Scroll content row {i + 1} —— After scrolling down to 80px, a back-to-top button appears in the lower right corner.
            </p>))}
        </div>
      </div>
      <BackTop target={() => ref.current} visibilityHeight={80} className="absolute bottom-3 right-3">
        {children}
      </BackTop>
    </div>);
}
export const backTopShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Monitors window by default. After scrolling beyond visibilityHeight, the back to top button fades into the lower right corner. Click to scroll smoothly back to the top.",
            code: `<BackTop visibilityHeight={400} />`,
            render: () => <BackTopBox />,
        },
        {
            title: "Custom content",
            description: "children replaces the default up arrow icon, and can place text or custom nodes.",
            code: `<BackTop visibilityHeight={400}>
  <span className="px-2 text-xs font-medium">Top</span>
</BackTop>`,
            render: () => (<BackTopBox>
          <span className="px-2 text-xs font-medium">Top</span>
        </BackTopBox>),
        },
        {
            title: "Specify scroll container",
            description: "When the page scrolling body is not window, target returns the container element, and both monitoring and backing fall on it.",
            code: `const ref = useRef<HTMLDivElement>(null);

<div ref={ref} className="h-44 overflow-y-auto">{/* Long content */}</div>
<BackTop target={() => ref.current} visibilityHeight={80} />`,
            render: () => <BackTopBox />,
        },
    ],
    controls: [],
    states: [
        { name: "Default (within scroll box)", render: () => <BackTopBox /> },
        {
            name: "Custom content",
            render: () => (<BackTopBox>
          <span className="px-2 text-xs font-medium">Top</span>
        </BackTopBox>),
        },
    ],
    renderWithProps: () => <BackTopBox />,
    toCode: () => `<BackTop visibilityHeight={400} />`,
};
