"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Magnet } from "../../../../packages/ui/src/magnet/magnet";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-56 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
function Pill({ label = "Pull me over" }: {
    label?: string;
}) {
    return (<span className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md">
      {label}
    </span>);
}
export const magnetShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap any content, the pointer will be magnetically attracted to follow when it is close to the sensing area, and will return smoothly when it leaves.",
            code: `<Magnet padding={100} magnetStrength={2}>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    Pull me over
  </button>
</Magnet>`,
            render: () => (<Stage>
          <Magnet padding={100} magnetStrength={2}>
            <Pill />
          </Magnet>
        </Stage>),
        },
        {
            title: "Strong suction",
            description: "magnetStrength The smaller the value, the stronger the suction; when it is 1, the content almost sticks to the pointer.",
            code: `<Magnet padding={140} magnetStrength={1}>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    Strong magnetic attraction
  </button>
</Magnet>`,
            render: () => (<Stage>
          <Magnet padding={140} magnetStrength={1}>
            <Pill label="Strong magnetic attraction"/>
          </Magnet>
        </Stage>),
        },
        {
            title: "Large sensing area + weak suction",
            description: "padding Turn up the \"Long Range Sensing\", magnetStrength turn it up to make the displacement more restrained.",
            code: `<Magnet padding={180} magnetStrength={5}>
  <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border bg-surface shadow-md">
    \u2726
  </span>
</Magnet>`,
            render: () => (<Stage>
          <Magnet padding={180} magnetStrength={5}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-foreground shadow-md">
              ✦
            </span>
          </Magnet>
        </Stage>),
        },
        {
            title: "Disable magnetic suction",
            description: "Stop pulling when disabled, the content remains centered, and the structure of DOM remains unchanged.",
            code: `<Magnet disabled>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    Disabled
  </button>
</Magnet>`,
            render: () => (<Stage>
          <Magnet disabled>
            <Pill label="Disabled"/>
          </Magnet>
        </Stage>),
        },
    ],
    controls: [
        { prop: "padding", type: "number", defaultValue: 100, label: "Sensing radius px" },
        { prop: "magnetStrength", type: "number", defaultValue: 2, label: "Strength Divisor" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disable magnetic suction" },
    ],
    states: [
        {
            name: "default (Default parameters\u00B7Move the pointer closer)",
            render: () => (<Stage>
          <Magnet padding={100} magnetStrength={2}>
            <Pill />
          </Magnet>
        </Stage>),
        },
        {
            name: "Strong suction (strength=1\u00B7Almost sticks to the pointer)",
            render: () => (<Stage>
          <Magnet padding={140} magnetStrength={1}>
            <Pill label="Strong magnetic attraction"/>
          </Magnet>
        </Stage>),
        },
        {
            name: "Weak suction + large sensing area (strength=5)",
            render: () => (<Stage>
          <Magnet padding={180} magnetStrength={5}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-foreground shadow-md">
              ✦
            </span>
          </Magnet>
        </Stage>),
        },
        {
            name: "disabled (no follow\u00B7still center)\nWhen",
            render: () => (<Stage>
          <Magnet disabled>
            <Pill label="Disabled"/>
          </Magnet>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Magnet padding={p.padding as number} magnetStrength={p.magnetStrength as number} disabled={p.disabled as boolean}>
        <Pill />
      </Magnet>
    </Stage>),
    toCode: (p) => [
        `<Magnet`,
        `  padding={${p.padding}}`,
        `  magnetStrength={${p.magnetStrength}}`,
        `  disabled={${p.disabled}}`,
        `>`,
        `  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">`,
        `    Pull me over`,
        `  </button>`,
        `</Magnet>`,
    ].join("\n"),
};
