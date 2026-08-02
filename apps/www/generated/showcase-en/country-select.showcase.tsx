"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CountrySelect } from "../../../../packages/ui/src/country-select/country-select";
function SingleDemo({ defaultValue = "", showDialCode, showEnglish = true, size, disabled, invalid, }: {
    defaultValue?: string;
    showDialCode?: boolean;
    showEnglish?: boolean;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    invalid?: boolean;
}) {
    const [code, setCode] = useState<string>(defaultValue);
    return (<div className="w-72 space-y-2">
      <CountrySelect value={code} onChange={(v) => setCode(v as string)} showDialCode={showDialCode} showEnglish={showEnglish} size={size} disabled={disabled} invalid={invalid}/>
      <div className="text-xs text-muted">value:{code || "(empty)"}</div>
    </div>);
}
function MultiDemo({ defaultValue = [] as string[] }: {
    defaultValue?: string[];
}) {
    const [codes, setCodes] = useState<string[]>(defaultValue);
    return (<div className="w-80 space-y-2">
      <CountrySelect multiple value={codes} onChange={(v) => setCodes(v as string[])} showDialCode/>
      <div className="text-xs text-muted">value:[{codes.join(", ") || "(empty)"}]</div>
    </div>);
}
export const countrySelectShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Single-select the country/region, and the search will match all fields of Chinese/English/code/area code.",
            code: `<CountrySelect defaultValue="CN" className="w-72" />`,
            render: () => <CountrySelect defaultValue="CN" className="w-72"/>,
        },
        {
            title: "Show area code",
            description: "showDialCode Fill in the international area code on the right side of the drop-down line.",
            code: `<CountrySelect defaultValue="US" showDialCode className="w-72" />`,
            render: () => <CountrySelect defaultValue="US" showDialCode className="w-72"/>,
        },
        {
            title: "Multiple choice (chips)",
            description: "multiple has been selected to be echoed as chips, and you can continue to search and add.",
            code: `<CountrySelect multiple defaultValue={["CN", "US", "JP"]} className="w-80" />`,
            render: () => <CountrySelect multiple defaultValue={["CN", "US", "JP"]} className="w-80"/>,
        },
        {
            title: "Dimensions",
            description: "size supports sm / md / lg.",
            code: `<>
  <CountrySelect size="sm" defaultValue="GB" className="w-72" />
  <CountrySelect size="lg" defaultValue="FR" className="w-72" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <CountrySelect size="sm" defaultValue="GB" className="w-72"/>
          <CountrySelect size="lg" defaultValue="FR" className="w-72"/>
        </div>),
        },
        {
            title: "Disabled / Invalid state",
            description: "disabled blocks interaction; invalid trigger becomes danger stroke.",
            code: `<>
  <CountrySelect disabled defaultValue="FR" className="w-72" />
  <CountrySelect invalid className="w-72" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <CountrySelect disabled defaultValue="FR" className="w-72"/>
          <CountrySelect invalid className="w-72"/>
        </div>),
        },
    ],
    controls: [
        { prop: "showDialCode", type: "boolean", defaultValue: false, label: "Show area code" },
        { prop: "showEnglish", type: "boolean", defaultValue: true, label: "Show English name" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "Invalid state" },
    ],
    states: [
        { name: "Single choice", render: () => <SingleDemo /> },
        { name: "Single choice \u00B7 Selected + area code", render: () => <SingleDemo defaultValue="CN" showDialCode/> },
        { name: "Multiple choice (chips)", render: () => <MultiDemo defaultValue={["CN", "US", "JP"]}/> },
        { name: "small", render: () => <SingleDemo size="sm" defaultValue="GB"/> },
        { name: "Disabled", render: () => <SingleDemo disabled defaultValue="FR"/> },
        { name: "Invalid state", render: () => <SingleDemo invalid/> },
    ],
    renderWithProps: (p) => (<SingleDemo showDialCode={Boolean(p.showDialCode)} showEnglish={p.showEnglish !== false} size={(p.size as "sm" | "md" | "lg") ?? "md"} disabled={Boolean(p.disabled)} invalid={Boolean(p.invalid)}/>),
    toCode: () => `<CountrySelect value={code} onChange={setCode} showDialCode />
{/* Multiple selection */}
<CountrySelect multiple value={codes} onChange={setCodes} />`,
};
