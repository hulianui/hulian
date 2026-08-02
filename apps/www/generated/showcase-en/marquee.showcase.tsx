"use client";
import type { ReactNode } from "react";
import { Code2, Folder, File, Gauge, Search, Calendar, Wrench, Link } from "../../../../packages/ui/src/_icons";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Marquee } from "../../../../packages/ui/src/marquee/marquee";
function Chip({ children }: {
    children: ReactNode;
}) {
    return (<span className="whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground">
      {children}
    </span>);
}
function LogoTile({ children }: {
    children: ReactNode;
}) {
    return (<span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted shadow-sm">
      {children}
    </span>);
}
const items = ["React", "Vue", "Svelte", "Solid", "Angular", "Qwik"];
const logos = [Code2, Folder, File, Gauge, Search, Calendar, Wrench, Link];
export const marqueeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Children scroll left in a seamless loop, pauseOnHover pauses when hovering.",
            code: `<Marquee pauseOnHover>
  {items.map((c) => (
    <Chip key={c}>{c}</Chip>
  ))}
</Marquee>`,
            render: () => (<Marquee className="w-80" pauseOnHover>
          {items.map((c) => (<Chip key={c}>{c}</Chip>))}
        </Marquee>),
        },
        {
            title: "Icon wall (fade fades out)",
            description: "fade Add mask at both ends to fade, and add icon sub-items to make logo / icon wall look and feel.",
            code: `<Marquee fade pauseOnHover gap="1.25rem">
  {logos.map((Icon, i) => (
    <LogoTile key={i}>
      <Icon className="size-6" />
    </LogoTile>
  ))}
</Marquee>`,
            render: () => (<Marquee className="w-80" fade pauseOnHover gap="1.25rem">
          {logos.map((Icon, i) => (<LogoTile key={i}>
              <Icon className="size-6"/>
            </LogoTile>))}
        </Marquee>),
        },
        {
            title: "Direction and speed",
            description: "direction controls the direction, the bigger duration is, the slower it is.",
            code: `<Marquee direction="right" duration={30} fade>
  {items.map((c) => (
    <Chip key={c}>{c}</Chip>
  ))}
</Marquee>`,
            render: () => (<Marquee className="w-80" direction="right" duration={30} fade>
          {items.map((c) => (<Chip key={c}>{c}</Chip>))}
        </Marquee>),
        },
        {
            title: "Vertical scroll (vertical)",
            description: "vertical rolls along the Y axis, and the height of the container needs to be fixed.",
            code: `<Marquee className="h-56" vertical fade pauseOnHover>
  {items.map((c) => (
    <Chip key={c}>{c}</Chip>
  ))}
</Marquee>`,
            render: () => (<Marquee className="h-56" vertical fade pauseOnHover>
          {items.map((c) => (<Chip key={c}>{c}</Chip>))}
        </Marquee>),
        },
    ],
    controls: [
        { prop: "direction", type: "select", options: ["left", "right"], defaultValue: "left" },
        { prop: "duration", type: "number", defaultValue: 20 },
        { prop: "pauseOnHover", type: "boolean", defaultValue: true },
        { prop: "fade", type: "boolean", defaultValue: true },
    ],
    states: [
        {
            name: "default (left \u00B7 hover pause)",
            render: () => (<Marquee className="w-80" pauseOnHover>
          {items.map((c) => (<Chip key={c}>{c}</Chip>))}
        </Marquee>),
        },
        {
            name: "Icon wall (fade fade \u00B7 icon sub-item)",
            render: () => (<Marquee className="w-80" fade pauseOnHover gap="1.25rem">
          {logos.map((Icon, i) => (<LogoTile key={i}>
              <Icon className="size-6"/>
            </LogoTile>))}
        </Marquee>),
        },
        {
            name: "Right \u00B7 Slow \u00B7 fade",
            render: () => (<Marquee className="w-80" direction="right" duration={30} fade>
          {items.map((c) => (<Chip key={c}>{c}</Chip>))}
        </Marquee>),
        },
        {
            name: "Vertical (vertical \u00B7 fade)",
            render: () => (<Marquee className="h-56" vertical fade pauseOnHover>
          {items.map((c) => (<Chip key={c}>{c}</Chip>))}
        </Marquee>),
        },
    ],
    renderWithProps: (p) => (<Marquee className="w-80" direction={p.direction as "left" | "right"} duration={p.duration as number} pauseOnHover={p.pauseOnHover as boolean} fade={p.fade as boolean}>
      {items.map((c) => (<Chip key={c}>{c}</Chip>))}
    </Marquee>),
    toCode: (p) => `<Marquee direction="${p.direction}" duration={${p.duration}} pauseOnHover={${p.pauseOnHover}} fade={${p.fade}}>
  {items}
</Marquee>`,
};
