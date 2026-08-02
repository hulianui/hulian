"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScrollReveal } from "../../../../packages/ui/src/scroll-reveal/scroll-reveal";
export const scrollRevealShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "As the container scrolls across the viewport, the entire paragraph is first slightly rotated back to the straight line, and then word by word is parsed from blurry to clear (scroll down in the box to observe).",
            code: `<ScrollReveal className="text-xl font-semibold">
  When you scroll this block the words resolve from blur to focus one by one.
</ScrollReveal>`,
            render: () => (<div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40"/>
          <ScrollReveal className="text-xl font-semibold">
            When you scroll this block the words resolve from blur to focus one by one.
          </ScrollReveal>
          <div className="h-40"/>
        </div>),
        },
        {
            title: "No blur \u00B7 Large rotation angle",
            description: "enableBlur={false} only does transparency and rotation, baseRotation increases the initial rotation angle to enhance depth.",
            code: `<ScrollReveal
  enableBlur={false}
  baseRotation={6}
  className="text-xl font-semibold"
>
  Pure transparency and rotation, suitable for title paragraphs that pursue restrained texture
</ScrollReveal>`,
            render: () => (<div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40"/>
          <ScrollReveal enableBlur={false} baseRotation={6} className="text-xl font-semibold">
            Pure transparency and rotation, suitable for title paragraphs that pursue restrained texture
          </ScrollReveal>
          <div className="h-40"/>
        </div>),
        },
        {
            title: "Strong contrast analysis",
            description: "baseOpacity Turn it down to make the rest darker, blurStrength turn it up to make the blur heavier and create stronger entrance contrast.",
            code: `<ScrollReveal
  baseOpacity={0.05}
  blurStrength={8}
  className="text-xl font-semibold"
>
  Scroll this text and each word will be gradually resolved from deep fuzzy to clear.
</ScrollReveal>`,
            render: () => (<div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40"/>
          <ScrollReveal baseOpacity={0.05} blurStrength={8} className="text-xl font-semibold">
            Scroll this text and each word will be gradually resolved from deep fuzzy to clear.
          </ScrollReveal>
          <div className="h-40"/>
        </div>),
        },
    ],
    controls: [
        { prop: "baseOpacity", type: "number", defaultValue: 0.12, label: "Basic Transparency" },
        { prop: "baseRotation", type: "number", defaultValue: 3, label: "Initial rotation angle deg" },
        { prop: "enableBlur", type: "boolean", defaultValue: true, label: "Fuzzy analysis" },
        { prop: "blurStrength", type: "number", defaultValue: 4, label: "Blur radius px" },
    ],
    states: [
        {
            name: "default (rolling word-by-word development)",
            render: () => (<div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40"/>
          <ScrollReveal className="text-xl font-semibold">
            When you scroll this block the words resolve from blur to focus one by one.
          </ScrollReveal>
          <div className="h-40"/>
        </div>),
        },
        {
            name: "No blur \u00B7 Large rotation angle",
            render: () => (<div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40"/>
          <ScrollReveal enableBlur={false} baseRotation={6} className="text-xl font-semibold">
            Pure transparency and rotation, suitable for title paragraphs that pursue restrained texture
          </ScrollReveal>
          <div className="h-40"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
      <div className="h-40"/>
      <ScrollReveal baseOpacity={p.baseOpacity as number} baseRotation={p.baseRotation as number} enableBlur={p.enableBlur as boolean} blurStrength={p.blurStrength as number} className="text-xl font-semibold">
        Scroll this text and each word will gradually resolve from blur to clear focus.
      </ScrollReveal>
      <div className="h-40"/>
    </div>),
    toCode: (p) => `<ScrollReveal baseOpacity={${p.baseOpacity}} baseRotation={${p.baseRotation}} enableBlur={${p.enableBlur}} blurStrength={${p.blurStrength}}>
  Scroll to develop paragraphs word by word
</ScrollReveal>`,
};
