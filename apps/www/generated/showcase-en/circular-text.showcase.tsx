"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CircularText } from "../../../../packages/ui/src/circular-text/circular-text";
const DEMO_TEXT = "HULIAN \u00B7 HULIAN UI \u00B7 Design system \u00B7 ";
export const circularTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Each word is arranged on the circumference according to the equal angle, and the whole rotates at a constant speed; hovering accelerates by default.",
            code: `<CircularText
  text="HULIAN \u00B7 HULIAN UI \u00B7 Design System \u00B7 "
  className="text-sm font-semibold tracking-widest text-primary"
/>`,
            render: () => (<div className="flex justify-center py-6">
          <CircularText text={DEMO_TEXT} className="text-sm font-semibold tracking-widest text-primary"/>
        </div>),
        },
        {
            title: "Hover Pause \u00B7 Slow Base",
            description: "spinDuration slows down the rotation speed, onHover=\"pause\" hovers to freeze the rotation.",
            code: `<CircularText
  text="HULIAN \u00B7 HULIAN UI \u00B7 Design System \u00B7 "
  spinDuration={36}
  onHover="pause"
  className="text-sm font-semibold tracking-widest text-foreground"
/>`,
            render: () => (<div className="flex justify-center py-6">
          <CircularText text={DEMO_TEXT} spinDuration={36} onHover="pause" className="text-sm font-semibold tracking-widest text-foreground"/>
        </div>),
        },
        {
            title: "Dark Badge \u00B7 Crazy Mode",
            description: "radius shrinks to make a small badge, onHover=\"goBonkers\" hovers and accelerates like crazy.",
            code: `<div className="flex items-center justify-center rounded-full bg-foreground p-2">
  <CircularText
    text="\u2605 HULIAN \u2605 STUDIO \u2605 "
    spinDuration={14}
    onHover="goBonkers"
    radius={64}
    className="text-xs font-bold tracking-[0.2em] text-bg"
  />
</div>`,
            render: () => (<div className="flex justify-center py-6">
          <div className="flex items-center justify-center rounded-full bg-foreground p-2">
            <CircularText text="★ HULIAN ★ STUDIO ★ " spinDuration={14} onHover="goBonkers" radius={64} className="text-xs font-bold tracking-[0.2em] text-bg"/>
          </div>
        </div>),
        },
    ],
    controls: [
        { prop: "spinDuration", type: "number", defaultValue: 20, label: "Seconds for one revolution" },
        {
            prop: "onHover",
            type: "select",
            options: ["speedUp", "slow", "pause", "goBonkers"],
            defaultValue: "speedUp",
            label: "Hover behavior",
        },
        { prop: "radius", type: "number", defaultValue: 80, label: "Text circle radius px" },
    ],
    states: [
        {
            name: "default (hover acceleration)",
            render: () => (<div className="flex justify-center py-6">
          <CircularText text={DEMO_TEXT} className="text-sm font-semibold tracking-widest text-primary"/>
        </div>),
        },
        {
            name: "Hover Pause \u00B7 Slow Base",
            render: () => (<div className="flex justify-center py-6">
          <CircularText text={DEMO_TEXT} spinDuration={36} onHover="pause" className="text-sm font-semibold tracking-widest text-foreground"/>
        </div>),
        },
        {
            name: "Dark Badge \u00B7 Crazy Mode",
            render: () => (<div className="flex justify-center py-6">
          <div className="flex items-center justify-center rounded-full bg-foreground p-2">
            <CircularText text="★ HULIAN ★ STUDIO ★ " spinDuration={14} onHover="goBonkers" radius={64} className="text-xs font-bold tracking-[0.2em] text-bg"/>
          </div>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="flex justify-center py-6">
      <CircularText text={DEMO_TEXT} spinDuration={p.spinDuration as number} onHover={p.onHover as "speedUp"} radius={p.radius as number} className="text-sm font-semibold tracking-widest text-primary"/>
    </div>),
    toCode: (p) => `<CircularText text="HULIAN \u00B7 HULIAN UI \u00B7 " spinDuration={${p.spinDuration}} onHover="${p.onHover}" radius={${p.radius}} />`,
};
