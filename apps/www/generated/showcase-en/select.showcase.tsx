"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel, } from "../../../../packages/ui/src/select/select";
type Side = "top" | "bottom";
type Size = "sm" | "md" | "lg";
const FONTS = [
    { value: "sans", label: "Sans serif Sans" },
    { value: "serif", label: "Serif Serif" },
    { value: "mono", label: "Equal width Mono" },
    { value: "cursive", label: "Handwritten Cursive" },
];
const GROUPED = [
    { group: "Spanish", items: [FONTS[0]!, FONTS[1]!] },
    { group: "Code / Handwriting", items: [FONTS[2]!, FONTS[3]!] },
];
function Demo({ placeholder = "Please select a font", size = "md", disabled = false, invalid = false, side = "bottom", defaultValue, clearable = false, searchable = false, loading = false, }: {
    placeholder?: string;
    size?: Size;
    disabled?: boolean;
    invalid?: boolean;
    side?: Side;
    defaultValue?: string;
    clearable?: boolean;
    searchable?: boolean;
    loading?: boolean;
}) {
    return (<div className="w-60">
      <Select items={FONTS} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled} clearable={clearable} searchable={searchable} loading={loading}>
        <SelectTrigger size={size} invalid={invalid}/>
        <SelectContent side={side}>
          {FONTS.map((f) => (<SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>))}
        </SelectContent>
      </Select>
    </div>);
}
function GroupDemo() {
    return (<div className="w-60">
      <Select items={FONTS} placeholder="Please select a font">
        <SelectTrigger />
        <SelectContent>
          {GROUPED.map((g) => (<SelectGroup key={g.group}>
              <SelectGroupLabel>{g.group}</SelectGroupLabel>
              {g.items.map((f) => (<SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>))}
            </SelectGroup>))}
        </SelectContent>
      </Select>
    </div>);
}
function MultiDemo({ defaultValue = [] as string[], maxDisplay }: {
    defaultValue?: string[];
    maxDisplay?: number;
}) {
    const [value, setValue] = useState<string[]>(defaultValue);
    return (<div className="w-60">
      <Select items={FONTS} placeholder="Select multiple fonts" multiple value={value} onValueChange={setValue}>
        <SelectTrigger maxDisplay={maxDisplay}/>
        <SelectContent>
          {FONTS.map((f) => (<SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>))}
        </SelectContent>
      </Select>
    </div>);
}
export const selectShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "items provides option data, and placeholder is used as placeholder.",
            code: `<Select items={fonts} placeholder="Please select a font">
  <SelectTrigger />
  <SelectContent>
    {fonts.map((f) => (
      <SelectItem key={f.value} value={f.value}>
        {f.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>`,
            render: () => <Demo />,
        },
        {
            title: "Default selected value",
            description: "Use the defaultValue default selection for uncontrolled writing.",
            code: `<Select items={fonts} defaultValue="serif">
  <SelectTrigger />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo defaultValue="serif"/>,
        },
        {
            title: "Multiple choice",
            description: "The controlled value under multiple is string[], Trigger tile has selected label (exceeds maxDisplay folding +N), and the floating layer remains open after selection.",
            code: `const [value, setValue] = useState<string[]>([]);

<Select items={fonts} placeholder="Select multiple fonts" multiple value={value} onValueChange={setValue}>
  <SelectTrigger maxDisplay={2} />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <MultiDemo defaultValue={["sans", "serif", "mono"]} maxDisplay={2}/>,
        },
        {
            title: "Clearable",
            description: "When there is a value under clearable hover / Focus on the field, a clear button will appear on the right arrow position; click to leave it blank and return null (multi-select return []).",
            code: `<Select items={fonts} placeholder="Please select a font" clearable defaultValue="serif">
  <SelectTrigger />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo clearable defaultValue="serif"/>,
        },
        {
            title: "Searchable",
            description: "searchable Cut to Combobox search skin: with search box on top of floating layer, filter and reuse Base UI Combobox (compared to el-select filterable).",
            code: `<Select items={fonts} placeholder="Please select a font" searchable clearable>
  <SelectTrigger />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo searchable clearable defaultValue="serif"/>,
        },
        {
            title: "Loading state",
            description: "Under loading, the Trigger icon is changed to Spinner, and only the loading placeholder appears in the floating layer (the old options from the previous round are not displayed).",
            code: `<Select items={fonts} placeholder="Please select a font" loading loadingText="Loading">
  <SelectTrigger />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo loading/>,
        },
        {
            title: "Option grouping",
            description: "SelectGroup + SelectGroupLabel segments the options (Base UI automatically establishes the aria association). searchable Groups under the skin will be flattened.",
            code: `<SelectContent>
  <SelectGroup>
    <SelectGroupLabel>Western</SelectGroupLabel>
    <SelectItem value="sans">Sans serif Sans</SelectItem>
    <SelectItem value="serif">serif Serif</SelectItem>
  </SelectGroup>
</SelectContent>`,
            render: () => <GroupDemo />,
        },
        {
            title: "Dimensions",
            description: "size of SelectTrigger offers sm / md / lg.",
            code: `<Select items={fonts} defaultValue="mono">
  <SelectTrigger size="sm" />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo size="sm" defaultValue="mono"/>,
        },
        {
            title: "Invalid state",
            description: "SelectTrigger passed to invalid marked red (when used independently).",
            code: `<Select items={fonts} placeholder="Please select a font">
  <SelectTrigger invalid />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo invalid/>,
        },
        {
            title: "Disabled",
            description: "Select passes disabled to block the entire dropdown.",
            code: `<Select items={fonts} defaultValue="sans" disabled>
  <SelectTrigger />
  <SelectContent>{/* SelectItem\u2026 */}</SelectContent>
</Select>`,
            render: () => <Demo disabled defaultValue="sans"/>,
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Please select a font", label: "Placeholder copywriting" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "side", type: "select", options: ["bottom", "top"], defaultValue: "bottom" },
        { prop: "clearable", type: "boolean", defaultValue: false, label: "Clearable" },
        { prop: "searchable", type: "boolean", defaultValue: false, label: "Searchable" },
        { prop: "loading", type: "boolean", defaultValue: false, label: "Loading state" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "Invalid state" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Selected value", render: () => <Demo defaultValue="serif"/> },
        { name: "Clearable", render: () => <Demo clearable defaultValue="serif"/> },
        { name: "Searchable", render: () => <Demo searchable defaultValue="serif"/> },
        { name: "Loading", render: () => <Demo loading/> },
        { name: "Grouping", render: () => <GroupDemo /> },
        { name: "Multiple selection (out of fold +N)", render: () => <MultiDemo defaultValue={["sans", "serif", "mono"]}/> },
        { name: "Disabled", render: () => <Demo disabled defaultValue="sans"/> },
        { name: "Invalid state", render: () => <Demo invalid/> },
        { name: "Bounce up", render: () => <Demo side="top" placeholder="Expand upward"/> },
        { name: "small", render: () => <Demo size="sm" defaultValue="mono"/> },
    ],
    renderWithProps: (p) => (<Demo placeholder={p.placeholder as string} size={p.size as Size} side={p.side as Side} disabled={p.disabled as boolean} invalid={p.invalid as boolean} clearable={p.clearable as boolean} searchable={p.searchable as boolean} loading={p.loading as boolean} defaultValue={p.clearable ? "serif" : undefined}/>),
    toCode: (p) => {
        const flags = [p.clearable && " clearable", p.searchable && " searchable", p.loading && " loading"]
            .filter(Boolean)
            .join("");
        return `<Select items={items} placeholder="${p.placeholder}"${flags} defaultValue="\u2026">
  <SelectTrigger size="${p.size}" />
  <SelectContent side="${p.side}">
    {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}
  </SelectContent>
</Select>`;
    },
};
