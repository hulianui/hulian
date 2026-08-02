"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScrollVelocity } from "../../../../packages/ui/src/scroll-velocity/scroll-velocity";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface py-6">
      {children}
    </div>);
}
export const scrollVelocityShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A single-line text marquee that drifts at a constant speed when stationary and accelerates/changes direction with the scrolling speed of the page.",
            code: `<ScrollVelocity texts={["Hulian Component Library"]} velocity={80} />`,
            render: () => (<Stage>
          <ScrollVelocity texts={["Hulian component library"]} velocity={80}/>
        </Stage>),
        },
        {
            title: "Double row alternating direction",
            description: "texts When there are multiple lines, the even-numbered lines are to the left and the odd-numbered lines are to the right, resulting in parallax misalignment.",
            code: `<ScrollVelocity
  texts={["Enterprise level \u00B7 High quality", "Native adaptation \u00B7 Theme awareness"]}
  velocity={70}
/>`,
            render: () => (<Stage>
          <ScrollVelocity texts={["Enterprise level \u00B7 High quality", "Native adaptation \u00B7 Theme awareness"]} velocity={70}/>
        </Stage>),
        },
        {
            title: "Highlight main color + fast",
            description: "Improve velocity accelerated drift, className transparently transmits the text color to the main color.",
            code: `<ScrollVelocity
  texts={["SCROLL VELOCITY"]}
  velocity={140}
  className="text-primary"
/>`,
            render: () => (<Stage>
          <ScrollVelocity texts={["SCROLL VELOCITY"]} velocity={140} className="text-primary"/>
        </Stage>),
        },
        {
            title: "Weaken the text color",
            description: "Use text-muted to weaken the text color, slow down the speed, and use it as atmospheric background text.",
            code: `<ScrollVelocity
  texts={["Continuous scrolling atmosphere background text"]}
  velocity={50}
  className="text-muted"
/>`,
            render: () => (<Stage>
          <ScrollVelocity texts={["Continuous scrolling atmosphere background text"]} velocity={50} className="text-muted"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "velocity", type: "number", defaultValue: 80, label: "Basic speed px/s" },
        { prop: "damping", type: "number", defaultValue: 50, label: "Spring damping" },
        { prop: "stiffness", type: "number", defaultValue: 400, label: "Spring stiffness" },
        { prop: "numCopies", type: "number", defaultValue: 6, label: "Number of copies" },
    ],
    states: [
        {
            name: "default (single row uniform drift)",
            render: () => (<Stage>
          <ScrollVelocity texts={["Hulian component library"]} velocity={80}/>
        </Stage>),
        },
        {
            name: "Two rows of alternating directions (parallax)",
            render: () => (<Stage>
          <ScrollVelocity texts={["Enterprise level \u00B7 High quality", "Native adaptation \u00B7 Theme awareness"]} velocity={70}/>
        </Stage>),
        },
        {
            name: "Highlight main color + fast",
            render: () => (<Stage>
          <ScrollVelocity texts={["SCROLL VELOCITY"]} velocity={140} className="text-primary"/>
        </Stage>),
        },
        {
            name: "Weaken the text color (muted)",
            render: () => (<Stage>
          <ScrollVelocity texts={["Continuous scrolling atmosphere background text"]} velocity={50} className="text-muted"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ScrollVelocity texts={["HULIAN"]} velocity={p.velocity as number} damping={p.damping as number} stiffness={p.stiffness as number} numCopies={p.numCopies as number}/>
    </Stage>),
    toCode: (p) => [
        `<ScrollVelocity`,
        `  texts={["HULIAN"]}`,
        `  velocity={${p.velocity}}`,
        `  damping={${p.damping}}`,
        `  stiffness={${p.stiffness}}`,
        `  numCopies={${p.numCopies}}`,
        `/>`,
    ].join("\n"),
};
