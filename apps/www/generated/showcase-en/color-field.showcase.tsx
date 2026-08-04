"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ColorField } from "../../../../packages/ui/src/color-field/color-field";
function Controlled() {
    const [hex, setHex] = useState("#38e8ff");
    return (<span className="inline-flex items-center gap-3">
      <ColorField value={hex} onValueChange={setHex} className="w-40" aria-label="Main color"/>
      <span className="font-mono text-sm text-muted">{hex}</span>
    </span>);
}
export const colorFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Controlled",
            description: "value + onValueChange controlled. The callback parameter is always the normalized #rrggbb - input #abc will throw #aabbcc.",
            code: `const [hex, setHex] = useState("#38e8ff");
<ColorField value={hex} onValueChange={setHex} className="w-40" aria-label="Main Color" />`,
            render: () => <Controlled />,
        },
        {
            title: "Three sizes",
            description: "sm / md / lg, the color block is scaled accordingly, and it is the same shell variant as Input.",
            code: `<ColorField size="sm" defaultValue="#38e8ff" className="w-32" />
<ColorField size="md" defaultValue="#7c5cff" className="w-36" />
<ColorField size="lg" defaultValue="#34e8a4" className="w-40" />`,
            render: () => (<span className="inline-flex items-end gap-3">
          <ColorField size="sm" defaultValue="#38e8ff" className="w-32" aria-label="Small"/>
          <ColorField size="md" defaultValue="#7c5cff" className="w-36" aria-label="Medium"/>
          <ColorField size="lg" defaultValue="#34e8a4" className="w-40" aria-label="Large"/>
        </span>),
        },
        {
            title: "No swatch / disabled / invalid",
            description: "showSwatch=false Only text is left; when an unparsable value is entered, the component itself will be marked red, and there is no need to pass invalid externally.",
            code: `<ColorField showSwatch={false} defaultValue="#38e8ff" className="w-32" />
<ColorField disabled defaultValue="#6b7d93" className="w-36" />
<ColorField invalid defaultValue="#ff6b6b" className="w-36" />`,
            render: () => (<span className="inline-flex items-center gap-3">
          <ColorField showSwatch={false} defaultValue="#38e8ff" className="w-32" aria-label="No swatch"/>
          <ColorField disabled defaultValue="#6b7d93" className="w-36" aria-label="Disabled"/>
          <ColorField invalid defaultValue="#ff6b6b" className="w-36" aria-label="Marked in red"/>
        </span>),
        },
    ],
    controls: [],
    states: [
        { name: "default", render: () => <ColorField defaultValue="#38e8ff" className="w-40" aria-label="Default"/> },
        { name: "sm", render: () => <ColorField size="sm" defaultValue="#7c5cff" className="w-32" aria-label="Small"/> },
        { name: "lg", render: () => <ColorField size="lg" defaultValue="#34e8a4" className="w-40" aria-label="Large"/> },
        {
            name: "no-swatch",
            render: () => <ColorField showSwatch={false} defaultValue="#38e8ff" className="w-32" aria-label="No swatch"/>,
        },
        { name: "disabled", render: () => <ColorField disabled defaultValue="#6b7d93" className="w-36" aria-label="Disabled"/> },
        { name: "invalid", render: () => <ColorField invalid defaultValue="#ff6b6b" className="w-36" aria-label="Marked in red"/> },
    ],
    renderWithProps: () => <ColorField defaultValue="#38e8ff" className="w-40" aria-label="Main color"/>,
    toCode: () => `<ColorField defaultValue="#38e8ff" className="w-40" aria-label="Main Color" />`,
};
