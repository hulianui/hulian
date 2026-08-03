"use client";
import { useRef } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { VariableProximity } from "../../../../packages/ui/src/variable-proximity/variable-proximity";
import type { VariableProximityFalloff } from "../../../../packages/ui/src/variable-proximity/variable-proximity.types";
function Stage({ from, to, radius, falloff, dark = true, }: {
    from: string;
    to: string;
    radius: number;
    falloff: VariableProximityFalloff;
    dark?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    return (<div ref={ref} className="relative flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border px-6 text-center" style={{ background: dark ? "oklch(0.16 0.02 255)" : "oklch(0.98 0.005 255)" }}>
      <VariableProximity label="Move the mouse here Hover me" fromFontVariationSettings={from} toFontVariationSettings={to} containerRef={ref} radius={radius} falloff={falloff} className={dark ? "text-3xl font-medium text-white" : "text-3xl font-medium"}/>
    </div>);
}
const FROM = "'wght' 400, 'opsz' 9";
const TO = "'wght' 900, 'opsz' 40";
export const variableProximityShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Use containerRef to base the distance on the container coordinate system; moving the mouse closer to the glyph interpolates the weight/visual size verbatim.",
            code: `const ref = useRef<HTMLDivElement>(null);

<div ref={ref} className="relative">
  <VariableProximity
    label="Move the mouse here Hover me"
    fromFontVariationSettings="'wght' 400, 'opsz' 9"
    toFontVariationSettings="'wght' 900, 'opsz' 40"
    containerRef={ref}
    radius={90}
    falloff="linear"
  />
</div>`,
            render: () => <Stage from={FROM} to={TO} radius={90} falloff="linear"/>,
        },
        {
            title: "Gaussian attenuation",
            description: "falloff=\"gaussian\" makes the center closer together, the transition softer, and more natural with a larger radius.",
            code: `<VariableProximity
  label="Move the mouse here Hover me"
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 900, 'opsz' 40"
  containerRef={ref}
  radius={120}
  falloff="gaussian"
/>`,
            render: () => <Stage from={FROM} to={TO} radius={120} falloff="gaussian"/>,
        },
        {
            title: "Exponential decay \u00B7 Small radius",
            description: "falloff=\"exponential\" The growth is steeper, and the change is obvious only when it is close to the glyph with a small radius.",
            code: `<VariableProximity
  label="Move the mouse here Hover me"
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 900, 'opsz' 40"
  containerRef={ref}
  radius={55}
  falloff="exponential"
/>`,
            render: () => <Stage from={FROM} to={TO} radius={55} falloff="exponential"/>,
        },
        {
            title: "Light base",
            description: "It is also available on light backgrounds, and the text color token automatically adapts to light and dark.",
            code: `<div ref={ref} className="relative">
  <VariableProximity
    label="Move the mouse here Hover me"
    fromFontVariationSettings="'wght' 400, 'opsz' 9"
    toFontVariationSettings="'wght' 900, 'opsz' 40"
    containerRef={ref}
    radius={90}
    falloff="linear"
    className="text-3xl font-medium"
  />
</div>`,
            render: () => (<Stage from={FROM} to={TO} radius={90} falloff="linear" dark={false}/>),
        },
    ],
    controls: [
        { prop: "radius", type: "number", defaultValue: 90, label: "Influence radius px" },
        {
            prop: "falloff",
            type: "select",
            options: ["linear", "exponential", "gaussian"],
            defaultValue: "linear",
            label: "Decay curve",
        },
    ],
    states: [
        {
            name: "default (dark bottom \u00B7 linear)",
            render: () => <Stage from={FROM} to={TO} radius={90} falloff="linear"/>,
        },
        {
            name: "gaussian (center gathered and soft)",
            render: () => <Stage from={FROM} to={TO} radius={120} falloff="gaussian"/>,
        },
        {
            name: "exponential \u00B7 Small radius (changes when closer)",
            render: () => <Stage from={FROM} to={TO} radius={55} falloff="exponential"/>,
        },
        {
            name: "Light base",
            render: () => <Stage from={FROM} to={TO} radius={90} falloff="linear" dark={false}/>,
        },
    ],
    renderWithProps: (p) => (<Stage from={FROM} to={TO} radius={p.radius as number} falloff={p.falloff as VariableProximityFalloff}/>),
    toCode: (p) => [
        `const ref = useRef<HTMLDivElement>(null);`,
        `<div ref={ref} className="relative">`,
        `  <VariableProximity`,
        `    label="Move the mouse here Hover me"`,
        `    fromFontVariationSettings="${FROM}"`,
        `    toFontVariationSettings="${TO}"`,
        `    containerRef={ref}`,
        `    radius={${p.radius}}`,
        `    falloff="${p.falloff}"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
