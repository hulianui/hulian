"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Glimpse } from "../../../../packages/ui/src/glimpse/glimpse";
const cover = (hue: number) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue} 70% 55%)'/><stop offset='1' stop-color='hsl(${hue + 40} 70% 45%)'/></linearGradient></defs><rect width='320' height='160' fill='url(%23g)'/></svg>`)}`;
export const glimpseShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Link preview",
            description: "Hover the inline link to pop up a preview card: cover image + title + description + domain name. When href is passed in, the trigger renders it as an external link.",
            code: `<p>
  Our design system is based on {" "}
  <Glimpse
    href="#"
    image={coverUrl}
    title="Hulian Design Token"
    description="A set of semantic color/spacing/rounding variables, with light and dark modes available out of the box."
  >
    Semantics token
  </Glimpse>{" "}
  Build, hover the link to preview.
</p>`,
            render: () => (<p className="max-w-md leading-7 text-foreground">
          Our design system is based on{" "}
          <Glimpse href="#" image={cover(210)} title="Hulian Design Token" description="A set of semantic color/spacing/rounding variables, light and dark modes available out of the box, and a single source of truth for all components.">
            Semantics token
          </Glimpse>{" "}
          Build, hover the link to preview.
        </p>),
        },
        {
            title: "Plain text term",
            description: "When image / href is not passed, it degrades to a pure terminology explanation card (no cover, no domain name), and the trigger is span in the line.",
            code: `<p>
  This is a {" "}
  <Glimpse title="Dogfood" description="I use my own products. The documentation site is all built with @hulianui/ui's own components.">
    dogfood
  </Glimpse>{" "}
  .
Details of
</p>`,
            render: () => (<p className="max-w-md leading-7 text-foreground">
          This is a{" "}
          <Glimpse title="Dogfood" description="Use your own products. The documentation site is all built with @hulianui/ui's own components.">
            dogfood
          </Glimpse>{" "}
          .
Details of
        </p>),
        },
        {
            title: "Multiple side by side",
            description: "Multiple inline links in the same paragraph are previewed independently without interfering with each other.",
            code: `<p>
  Recommended reading{" "}
  <Glimpse href="#" image={coverA} title="Component Overview" description="160+ component classification index.">
    Component Overview
  </Glimpse>
  ,
  <Glimpse href="#" image={coverB} title="Theme customization" description="Change one thing token Site-wide reskin ">
    Theme customization
  </Glimpse>{" "}
  Two articles.
</p>`,
            render: () => (<p className="max-w-lg leading-7 text-foreground">
          Recommended reading{" "}
          <Glimpse href="#" image={cover(140)} title="Component Overview" description="160+ component classification index.">
            Component Overview
          </Glimpse>
          ,
          <Glimpse href="#" image={cover(280)} title="Theme customization" description="Change one place token and reskin the entire site.">
            Theme customization
          </Glimpse>{" "}
          Two articles.
        </p>),
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "bottom" },
    ],
    states: [
        {
            name: "Link preview (image + title + description + domain name)",
            render: () => (<p className="max-w-md leading-7 text-foreground">
          Our design system is based on{" "}
          <Glimpse href="#" image={cover(210)} title="Hulian Design Token" description="A set of semantic color/spacing/rounding variables, light and dark modes available out of the box, and a single source of truth for all components.">
            Semantics token
          </Glimpse>{" "}
          Build, hover the link to preview.
        </p>),
        },
        {
            name: "Plain text terms (no pictures and no links)",
            render: () => (<p className="max-w-md leading-7 text-foreground">
          This is a{" "}
          <Glimpse title="Dogfood" description="Use your own products. The documentation site is all built with @hulianui/ui's own components.">
            dogfood
          </Glimpse>{" "}
          .
Details of
        </p>),
        },
        {
            name: "Multiple side by side",
            render: () => (<p className="max-w-lg leading-7 text-foreground">
          Recommended reading{" "}
          <Glimpse href="#" image={cover(140)} title="Component Overview" description="160+ component classification index.">
            Component Overview
          </Glimpse>
          ,
          <Glimpse href="#" image={cover(280)} title="Theme customization" description="Change one place token and reskin the entire site.">
            Theme customization
          </Glimpse>{" "}
          Two articles.
        </p>),
        },
    ],
    renderWithProps: (p) => (<p className="leading-7 text-foreground">
      Hover to view{" "}
      <Glimpse side={(p.side as "top" | "bottom" | "left" | "right") ?? "bottom"} href="#" image={cover(210)} title="Preview title" description="This is the description text for the link preview card.">
        This link
      </Glimpse>
    </p>),
    toCode: (p) => `<Glimpse${p.side && p.side !== "bottom" ? ` side="${p.side}"` : ""} href="#" image={cover} title="Title" description="Description">
  Link text
</Glimpse>`,
};
