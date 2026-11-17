import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SectionHeader } from "../../../../packages/ui/src/section-header/section-header";
import type { SectionHeaderProps } from "../../../../packages/ui/src/section-header/section-header.types";
export const sectionHeaderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "An eyebrow, a title, an accented second half, and a lead paragraph: the group that opens each section on a marketing page or docs home.",
            code: `<SectionHeader
  eyebrow="Products"
  title="From one button,"
  accent="to a whole back office"
  accentBreak="mobile"
  description="Four layers, one design language. Copy what you need."
/>`,
            render: () => (<SectionHeader eyebrow="Products" title="From one button," accent="to a whole back office" accentBreak="mobile" description="Four layers, one design language. Copy what you need."/>),
        },
        {
            title: "Centered",
            description: "align=\"center\" centers the title and lead text together, for a closing CTA or a centered intro.",
            code: `<SectionHeader
  align="center"
  eyebrow="Design"
  title="Carefully designed defaults,"
  accent="free to change"
  accentBreak="none"
  description="Every component ships with defaults ready for production."
/>`,
            render: () => (<SectionHeader align="center" eyebrow="Design" title="Carefully designed defaults," accent="free to change" accentBreak="none" description="Every component ships with defaults ready for production."/>),
        },
        {
            title: "Breaking before the accent",
            description: "accentBreak decides how the title joins the accented half: always breaks the line, mobile breaks only on narrow screens, space adds a space (English), and none joins directly.",
            code: `<SectionHeader eyebrow="AI native" title="Your AI assistant," accent="fluent in your UI kit" />
<SectionHeader eyebrow="In production" title="Built natively" accent="on Hulian UI" accentBreak="space" />`,
            render: () => (<div className="space-y-10">
          <SectionHeader eyebrow="AI native" title="Your AI assistant," accent="fluent in your UI kit"/>
          <SectionHeader eyebrow="In production" title="Built natively" accent="on Hulian UI" accentBreak="space"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "accentBreak",
            type: "select",
            options: ["always", "mobile", "space", "none"],
            defaultValue: "always",
        },
        { prop: "align", type: "select", options: ["start", "center"], defaultValue: "start" },
    ],
    states: [
        {
            name: "Align left",
            render: () => <SectionHeader eyebrow="Products" title="From one button," accent="to a whole back office"/>,
        },
        {
            name: "Centered",
            render: () => (<SectionHeader align="center" title="Start now, " accent="build software that looks good and works well" accentBreak="none"/>),
        },
    ],
    renderWithProps: (p) => (<SectionHeader eyebrow="Products" title="From one button," accent="to a whole back office" accentBreak={p.accentBreak as SectionHeaderProps["accentBreak"]} align={p.align as SectionHeaderProps["align"]} description="Four layers, one design language. Copy what you need."/>),
    toCode: (p) => `<SectionHeader
  eyebrow="Products"
  title="From one button,"
  accent="to a whole back office"
  accentBreak="${p.accentBreak}"
  align="${p.align}"
  description="Four layers, one design language. Copy what you need."
/>`,
};
