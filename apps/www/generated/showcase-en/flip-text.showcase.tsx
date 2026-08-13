import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FlipText } from "../../../../packages/ui/src/flip-text/flip-text";
export const flipTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Page heading",
            description: "The most common usage: the heading is the h1 itself (no wrapper) and its characters flip when the pointer enters. The copy goes straight into children, expressions included.",
            code: `<FlipText as="h1" className="text-2xl font-semibold tracking-tight">
  AI status
</FlipText>`,
            render: () => (<FlipText as="h1" className="text-2xl font-semibold tracking-tight">
          AI status
        </FlipText>),
        },
        {
            title: "Four flip directions",
            description: "direction names the side the new face **enters** from: top presses down from above, left turns in from the left, and so on.",
            code: `<FlipText direction="top">From the top</FlipText>
<FlipText direction="bottom">From the bottom</FlipText>
<FlipText direction="left">From the left</FlipText>
<FlipText direction="right">From the right</FlipText>`,
            render: () => (<div className="flex flex-wrap gap-6 text-xl font-medium">
          <FlipText direction="top">From the top</FlipText>
          <FlipText direction="bottom">From the bottom</FlipText>
          <FlipText direction="left">From the left</FlipText>
          <FlipText direction="right">From the right</FlipText>
        </div>),
        },
        {
            title: "Timing: duration and stagger",
            description: "duration is how many seconds one character takes to flip; stagger is the delay between neighbours in milliseconds. A larger stagger makes the wave travel more slowly and more visibly.",
            code: `<FlipText duration={0.8} stagger={90} className="text-xl">
  A slower wave
</FlipText>`,
            render: () => (<FlipText duration={0.8} stagger={90} className="text-xl font-medium">
          A slower wave
        </FlipText>),
        },
        {
            title: "Split Latin headings on words",
            description: "splitType=\"word\" splits on whitespace so a long word is not broken apart in a narrow box. Chinese is fine on the default char.",
            code: `<FlipText splitType="word" as="h2" className="text-xl font-semibold">
  Deploy in seconds
</FlipText>`,
            render: () => (<FlipText splitType="word" as="h2" className="text-xl font-semibold">
          Deploy in seconds
        </FlipText>),
        },
    ],
    controls: [
        { prop: "direction", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "top" },
        { prop: "splitType", type: "select", options: ["char", "word"], defaultValue: "char" },
        { prop: "duration", type: "number", defaultValue: 0.5 },
        { prop: "stagger", type: "number", defaultValue: 30 },
    ],
    states: [
        {
            name: "default (hover the heading to see the flip)",
            render: () => (<FlipText as="h1" className="text-2xl font-semibold tracking-tight">
          AI status
        </FlipText>),
        },
        {
            name: "direction=left",
            render: () => (<FlipText direction="left" className="text-2xl font-semibold">
          From the left
        </FlipText>),
        },
        {
            name: "splitType=word",
            render: () => (<FlipText splitType="word" className="text-2xl font-semibold">
          Deploy in seconds
        </FlipText>),
        },
    ],
    renderWithProps: (p) => (<FlipText as="h1" className="text-2xl font-semibold tracking-tight" direction={p.direction as "top" | "bottom" | "left" | "right"} splitType={p.splitType as "char" | "word"} duration={p.duration as number} stagger={p.stagger as number}>
      AI status
    </FlipText>),
    toCode: (p) => `<FlipText as="h1" direction="${p.direction}" splitType="${p.splitType}" duration={${p.duration}} stagger={${p.stagger}}>AI status</FlipText>`,
};
