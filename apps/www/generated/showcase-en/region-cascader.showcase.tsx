"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RegionCascader } from "../../../../packages/ui/src/region-cascader/region-cascader";
function Demo({ level = 3, showSearch = true, defaultValue = [], disabled, invalid, }: {
    level?: 2 | 3;
    showSearch?: boolean;
    defaultValue?: string[];
    disabled?: boolean;
    invalid?: boolean;
}) {
    const [codes, setCodes] = useState<string[]>(defaultValue);
    const [names, setNames] = useState<string[]>([]);
    return (<div className="w-80 space-y-2">
      <RegionCascader level={level} showSearch={showSearch} value={codes} onChange={(c, n) => {
            setCodes(c);
            setNames(n);
        }} disabled={disabled} invalid={invalid}/>
      <div className="text-xs text-muted">
        {names.length ? `Selected:${names.join(" / ")}(${codes.join(",")})` : "Not selected"}
      </div>
    </div>);
}
export const regionCascaderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Level 3 (province/city/district/county)",
            description: "Built-in full administrative divisions, with three-level linkage by default. onChange Give code both the path and the name path (the form's permanent name).",
            code: `<RegionCascader
  value={codes}
  onChange={(codes, names) => save(codes, names)}
  showSearch
/>`,
            render: () => (<div className="w-80">
          <RegionCascader showSearch onChange={() => { }}/>
        </div>),
        },
        {
            title: "Default value echo",
            description: "defaultValue Pass the code path to echo (uncontrolled).",
            code: `<RegionCascader defaultValue={["11", "1101", "110105"]} />`,
            render: () => (<div className="w-80">
          <RegionCascader defaultValue={["11", "1101", "110105"]} onChange={() => { }}/>
        </div>),
        },
        {
            title: "Two levels (province/city)",
            description: "level=2 is only linked to the city level.",
            code: `<RegionCascader level={2} defaultValue={["44", "4401"]} />`,
            render: () => (<div className="w-80">
          <RegionCascader level={2} defaultValue={["44", "4401"]} onChange={() => { }}/>
        </div>),
        },
        {
            title: "Disabled",
            code: `<RegionCascader disabled defaultValue={["31", "3101", "310115"]} />`,
            render: () => (<div className="w-80">
          <RegionCascader disabled defaultValue={["31", "3101", "310115"]} onChange={() => { }}/>
        </div>),
        },
    ],
    controls: [
        { prop: "showSearch", type: "boolean", defaultValue: true, label: "Floating layer search" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "Invalid state" },
    ],
    states: [
        { name: "Level 3 (province/city/district/county \u00B7 with search)", render: () => <Demo /> },
        { name: "Default value echo", render: () => <Demo defaultValue={["11", "1101", "110105"]}/> },
        { name: "Two levels (province/city)", render: () => <Demo level={2} defaultValue={["44", "4401"]}/> },
        { name: "No search (pure level-by-level browsing)", render: () => <Demo showSearch={false}/> },
        { name: "Disabled", render: () => <Demo disabled defaultValue={["31", "3101", "310115"]}/> },
        { name: "Invalid state", render: () => <Demo invalid/> },
    ],
    renderWithProps: (p) => (<Demo showSearch={p.showSearch !== false} disabled={Boolean(p.disabled)} invalid={Boolean(p.invalid)}/>),
    toCode: () => `<RegionCascader
  value={codes}
  onChange={(codes, names) => save(codes, names)}
  showSearch
/>`,
};
