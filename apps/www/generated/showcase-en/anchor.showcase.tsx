"use client";
import { useRef } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Anchor } from "../../../../packages/ui/src/anchor/anchor";
import type { AnchorItem } from "../../../../packages/ui/src/anchor/anchor.types";
const docItems: AnchorItem[] = [
    { href: "#sec-overview", title: "Overview" },
    {
        href: "#sec-guide",
        title: "Get started quickly",
        children: [
            { href: "#sec-install", title: "Installation" },
            { href: "#sec-usage", title: "Basic usage" },
            { href: "#sec-nested", title: "Secondary anchor point" },
        ],
    },
    {
        href: "#sec-api",
        title: "API",
        children: [
            { href: "#sec-api-items", title: "items" },
            { href: "#sec-api-offset", title: "offsetTop" },
            { href: "#sec-api-container", title: "getContainer" },
        ],
    },
    { href: "#sec-faq", title: "FAQ" },
];
const sections: {
    id: string;
    title: string;
    level: 2 | 3;
    paras: string[];
}[] = [
    {
        id: "sec-overview",
        title: "Overview",
        level: 2,
        paras: [
            "Anchor navigation follows the reading progress to highlight the current chapter and smoothly scrolls to the target position when clicked. It is suitable for any reading page with \"catalog on the left + long text on the right\": API document, privacy agreement, product description, section form of settings page.",
            "Its core is a zero-dependency scrollspy: Internally, IntersectionObserver is used to observe each section, and the \"frontmost visible item in the document sequence\" is taken as the current anchor point; the sliding indicator bar on the left reuses the same \"Write active geometry into\" Tabs \"CSS variable, pure CSS transition smooth transition\" technique, does not rely on any animation library when running.",
            "Scroll down this text, and you will see the highlight and indicator bar of the table of contents on the left move with the chapter you are currently reading; click on any item in the table of contents, and the right side will scroll smoothly to the corresponding section.",
        ],
    },
    {
        id: "sec-guide",
        title: "Get started quickly",
        level: 2,
        paras: ["Divided into three steps: installation, adding id to each chapter in the content area, and feeding the same structure to items of Anchor."],
    },
    {
        id: "sec-install",
        title: "Installation",
        level: 3,
        paras: [
            "After installing the component library through the package manager, you can import it on demand: import { Anchor } from \"@hulianui/ui\". The component comes with the \"use client\" mark and can be used directly as a client island in the React Server Component page.",
            "No need to introduce additional style files or animation runtimes - indicator bars and highlights are all semantic token, automatically adapting to light and dark themes.",
        ],
    },
    {
        id: "sec-usage",
        title: "Basic usage",
        level: 3,
        paras: [
            "Give each chapter element a unique id, and then pass the corresponding { href, title } list to items. href is in the shape of \"#section-id\", which corresponds one-to-one to id of the element on the page.",
            "When there are many chapters and long content, it is recommended to fix the table of contents sticky to the side of the viewport so that the table of contents is always visible when scrolling the text - this is what is done on the left side of this example.",
        ],
    },
    {
        id: "sec-nested",
        title: "Secondary anchor point",
        level: 3,
        paras: [
            "Provide children on a certain item to form a secondary directory, which will be automatically indented during rendering. scrollspy will flatten the parent and child items together to participate in the calculation, so scroll to any subsection, the corresponding second-level item will be highlighted, and the indicator bar will slide to it.",
            "There is a deliberate restriction within the second level: directories with more than two levels will quickly lose readability in narrow side columns. It is better to use a collapsible tree navigation instead.",
        ],
    },
    {
        id: "sec-api",
        title: "API",
        level: 2,
        paras: ["Three core attributes cover most scenarios."],
    },
    {
        id: "sec-api-items",
        title: "items",
        level: 3,
        paras: [
            "AnchorItem[]. Required. Each item contains href, title, and children is optional to form the second level. title accepts ReactNode so you can plug an icon or logo.",
        ],
    },
    {
        id: "sec-api-offset",
        title: "offsetTop",
        level: 3,
        paras: [
            "number, default 0. Set it when the page has a fixed header: it will not only reserve this distance for the top of the target to avoid occlusion when clicking to scroll, but also shrink the observation upper edge of scrollspy synchronously to align the highlight judgment with vision.",
        ],
    },
    {
        id: "sec-api-container",
        title: "getContainer",
        level: 3,
        paras: [
            "() => HTMLElement | null, optional. By default, the viewport/window is the scroll root. When the real scrolling body of the page is not window (such as the container of inner overflow-y-auto), the observation root and click scrolling of scrollspy, the function that returns the container, will fall on it.",
            "The right side of this example is an independent scrolling container: Anchor points to it through getContainer, so highlight follow and click jump are established inside this box without scrolling the entire page.",
        ],
    },
    {
        id: "sec-faq",
        title: "FAQ",
        level: 2,
        paras: [
            "Can't click on the directory? Most likely, the real scrolling body of the page is not window - just use getContainer to point to the overflow container.",
            "The highlight is always half a beat slower than the visual or misaligned? Check whether offsetTop is equal to the height of the fixed header.",
            "Want to use the browser's native hash scrolling? Connect onChange to the route and let the anchor point change be written back to URL, so that you can obtain a shareable deep link without destroying scrollspy.",
        ],
    },
];
function AnchorDemo({ offsetTop = 8 }: {
    offsetTop?: number;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    return (<div className="flex w-full max-w-2xl gap-6 rounded-[var(--radius)] border border-border p-4">
      <Anchor items={docItems} offsetTop={offsetTop} getContainer={() => scrollRef.current} className="sticky top-0 w-40 shrink-0 self-start"/>
      <div ref={scrollRef} className="h-80 min-w-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-2">
        {sections.map((s) => (<section key={s.id} id={s.id} className="scroll-mt-2">
            {s.level === 2 ? (<h3 className="mb-2 text-base font-semibold text-foreground">{s.title}</h3>) : (<h4 className="mb-1.5 font-medium text-foreground">{s.title}</h4>)}
            {s.paras.map((p, i) => (<p key={i} className="mb-2 text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>))}
          </section>))}
      </div>
    </div>);
}
export const anchorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Linkage of table of contents and long articles",
            description: "sticky directory on the left + independent scrolling container on the right. When scrolling the text, the highlight and indicator bar follow the current chapter, and click the table of contents to jump smoothly.",
            code: `const ref = useRef<HTMLDivElement>(null);

<div className="flex gap-6">
  <Anchor items={items} getContainer={() => ref.current} className="sticky top-0 w-40" />
  <div ref={ref} className="h-80 overflow-y-auto">
    {/* Each chapter has id corresponding to href */}
  </div>
</div>`,
            render: () => <AnchorDemo />,
        },
        {
            title: "Secondary anchor point",
            description: "Providing children on an item will form a second-level directory, which will be automatically indented during rendering, and scrollspy will be flattened to participate in the calculation.",
            code: `<Anchor
  items={[
    { href: "#sec-overview", title: "Overview" },
    {
      href: "#sec-guide",
      title: "Get started quickly",
      children: [
        { href: "#sec-install", title: "Installation" },
        { href: "#sec-usage", title: "Basic usage" },
      ],
    },
  ]}
  className="w-48"
/>`,
            render: () => (<div className="rounded-[var(--radius)] border border-border p-4">
          <Anchor items={docItems} className="w-48"/>
        </div>),
        },
        {
            title: "Avoid fixed header",
            description: "When the page has a fixed header, set offsetTop=header height, click to scroll to reserve this distance, and highlight to determine synchronization alignment.",
            code: `const ref = useRef<HTMLDivElement>(null);

<Anchor items={items} offsetTop={64} getContainer={() => ref.current} />`,
            render: () => <AnchorDemo offsetTop={32}/>,
        },
    ],
    controls: [
        {
            prop: "offsetTop",
            type: "number",
            defaultValue: 8,
            label: "offsetTop (offset within container px)",
        },
    ],
    states: [
        {
            name: "Table of contents + long article linkage (scroll the container on the right, highlight and indicator bar follow; click to jump smoothly)",
            render: () => <AnchorDemo />,
        },
        {
            name: "Structure Overview (Level 2 Indentation + Static)",
            render: () => (<div className="rounded-[var(--radius)] border border-border p-4">
          <Anchor items={docItems} className="w-48"/>
        </div>),
        },
    ],
    renderWithProps: (p) => <AnchorDemo offsetTop={Number(p.offsetTop) || 0}/>,
    toCode: (p) => {
        const off = Number(p.offsetTop) || 0;
        return [
            "// Inner scrolling container scene: getContainer points to the real scrolling body",
            "const ref = useRef<HTMLDivElement>(null);",
            "",
            "<div className=\"flex gap-6\">",
            `  <Anchor items={items}${off ? ` offsetTop={${off}}` : ""} getContainer={() => ref.current} className="sticky top-0" />`,
            "  <div ref={ref} className=\"h-80 overflow-y-auto\">{/* Chapters with id */}</div>",
            "</div>",
        ].join("\n");
    },
};
