"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Link } from "../../../../packages/ui/src/link/link";
type Tone = "primary" | "foreground" | "danger";
type Underline = "always" | "hover" | "none";
export const linkShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default main color link, underline appears when hovering.",
            code: `<Link href="#">Hulian Document</Link>`,
            render: () => <Link href="#">Hulian Documentation</Link>,
        },
        {
            title: "Tone",
            description: "tone Switch foreground color: primary / foreground / danger.",
            code: `<>
  <Link href="#" tone="primary">Main color link</Link>
  <Link href="#" tone="foreground">Foreground color link</Link>
  <Link href="#" tone="danger">Dangerous link</Link>
</>`,
            render: () => (<div className="flex gap-4">
          <Link href="#" tone="primary">Main color link</Link>
          <Link href="#" tone="foreground">Foreground color link</Link>
          <Link href="#" tone="danger">Dangerous link</Link>
        </div>),
        },
        {
            title: "Underline",
            description: "underline Control underline timing: hover (default) / always / none.",
            code: `<>
  <Link href="#" underline="hover">Hover underline</Link>
  <Link href="#" underline="always">Always underline</Link>
  <Link href="#" underline="none">No underline</Link>
</>`,
            render: () => (<div className="flex gap-4">
          <Link href="#" underline="hover">Hover underline</Link>
          <Link href="#" underline="always">Always underline</Link>
          <Link href="#" underline="none">No underline</Link>
        </div>),
        },
        {
            title: "External link",
            description: "external automatically adds target=_blank + rel security attributes, and attaches external link icons.",
            code: `<Link href="https://base-ui.com" external>Base UI official website</Link>`,
            render: () => (<Link href="https://base-ui.com" external>
          Base UI official website
        </Link>),
        },
    ],
    controls: [
        { prop: "tone", type: "select", options: ["primary", "foreground", "danger"], defaultValue: "primary" },
        { prop: "underline", type: "select", options: ["hover", "always", "none"], defaultValue: "hover" },
    ],
    states: [
        { name: "default", render: () => <Link href="#">Hulian Documentation</Link> },
        { name: "always-underline", render: () => <Link href="#" underline="always">Always underline</Link> },
        { name: "external", render: () => <Link href="https://base-ui.com" external>Base UI official website</Link> },
        { name: "foreground", render: () => <Link href="#" tone="foreground">Foreground color link</Link> },
    ],
    renderWithProps: (p) => (<Link href="#" tone={(p.tone as Tone) ?? "primary"} underline={(p.underline as Underline) ?? "hover"}>
      Example link
    </Link>),
    toCode: (p) => `<Link href="#"${p.tone && p.tone !== "primary" ? ` tone="${p.tone}"` : ""}${p.underline && p.underline !== "hover" ? ` underline="${p.underline}"` : ""}>Link</Link>`,
};
