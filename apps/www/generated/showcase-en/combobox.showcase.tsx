"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem } from "../../../../packages/ui/src/combobox/combobox";
import type { ComboboxItemData } from "../../../../packages/ui/src/combobox/combobox.types";
import { Link, Plus } from "../../../../packages/ui/src/_icons";
type Size = "sm" | "md" | "lg";
const FRUITS: ComboboxItemData[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "durian", label: "Durian" },
    { value: "grape", label: "Grape" },
    { value: "lemon", label: "Lemon" },
    { value: "mango", label: "Mango" },
    { value: "orange", label: "Orange" },
];
function Demo({ placeholder = "Select fruit", searchPlaceholder = "Search for fruits...", size = "md", disabled = false, invalid = false, defaultValue, }: {
    placeholder?: string;
    searchPlaceholder?: string;
    size?: Size;
    disabled?: boolean;
    invalid?: boolean;
    defaultValue?: ComboboxItemData;
}) {
    return (<div className="w-60">
      <Combobox items={FRUITS} defaultValue={defaultValue} disabled={disabled}>
        <ComboboxTrigger size={size} placeholder={placeholder} invalid={invalid}/>
        <ComboboxContent searchPlaceholder={searchPlaceholder}>
          {(item) => (<ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>)}
        </ComboboxContent>
      </Combobox>
    </div>);
}
function InlineDemo() {
    return (<div className="w-60">
      <Combobox items={FRUITS}>
        <ComboboxInput placeholder="Search for fruits..." clearable/>
        <ComboboxContent>
          {(item) => (<ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>)}
        </ComboboxContent>
      </Combobox>
    </div>);
}
const SearchGlyph = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>);
function SearchDemo() {
    return (<div className="w-60">
      <Combobox items={FRUITS}>
        <ComboboxInput size="sm" prefix={<SearchGlyph />} showChevron={false} placeholder="Search fruits" aria-label="Search fruits"/>
        <ComboboxContent>
          {(item) => (<ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>)}
        </ComboboxContent>
      </Combobox>
    </div>);
}
function IconTriggerDemo() {
    return (<Combobox items={FRUITS}>
      <ComboboxTrigger aria-label="Bind a fruit" showChevron={false} className="size-8 justify-center px-0">
        {(value: ComboboxItemData | null) => value == null ? (<Plus className="size-4 text-muted-foreground"/>) : (<Link className="size-4 text-primary"/>)}
      </ComboboxTrigger>
      <ComboboxContent searchPlaceholder="Search for fruits...">
        {(item) => (<ComboboxItem key={item.value} value={item}>
            {item.label}
          </ComboboxItem>)}
      </ComboboxContent>
    </Combobox>);
}
export const comboboxShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Search within elastic layer (Figure 4 paradigm)",
            description: "The trigger button displays the selected options. Click to expand the floating layer with the search box.",
            code: `<Combobox items={fruits}>
  <ComboboxTrigger placeholder="Select Fruit" />
  <ComboboxContent searchPlaceholder="Search for fruits...">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>`,
            render: () => <Demo />,
        },
        {
            title: "Inline auto-completion",
            description: "The fields are visible in the input box itself and can be filtered by typing directly. clearable displays the clear button.",
            code: `<Combobox items={fruits}>
  <ComboboxInput placeholder="Search for fruits..." clearable />
  <ComboboxContent>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>`,
            render: () => <InlineDemo />,
        },
        {
            title: "Search-field form",
            description: "prefix adds the magnifier and showChevron={false} drops the trailing chevron: the field itself is the search box (typing filters, selecting navigates), so it should not look like a dropdown. Used outside Field, aria-label goes straight on ComboboxInput and lands on the inner input.",
            code: `<Combobox items={fruits}>
  <ComboboxInput
    size="sm"
    prefix={<SearchIcon />}
    showChevron={false}
    placeholder="Search fruit"
    aria-label="Search fruit"
  />
  <ComboboxContent>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>`,
            render: () => <SearchDemo />,
        },
        {
            title: "Default selected value",
            description: "defaultValue Pass in the option object as an uncontrolled initial value.",
            code: `<Combobox items={fruits} defaultValue={fruits[2]}>
  <ComboboxTrigger placeholder="Select Fruit" />
  <ComboboxContent searchPlaceholder="Search for fruits...">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>`,
            render: () => <Demo defaultValue={FRUITS[2]}/>,
        },
        {
            title: "Trigger degraded to a status icon",
            description: "children replaces the default \"selected label\" block entirely. In a narrow table cell the name already appears elsewhere, so a trigger repeating it reads as two fields - such a slot only has room for an icon. Pass a function to branch on whether anything is selected.",
            code: `<Combobox items={fruits}>
  <ComboboxTrigger
    aria-label="Bind a fruit"
    showChevron={false}
    className="size-8 justify-center px-0"
  >
    {(value) => (value ? <Link className="size-4" /> : <Plus className="size-4" />)}
  </ComboboxTrigger>
  <ComboboxContent searchPlaceholder="Search for fruits...">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>`,
            render: () => <IconTriggerDemo />,
        },
        {
            title: "Disabled and invalid state",
            description: "disabled is overall gray; invalid trigger is marked red.",
            code: `<>
  <Combobox items={fruits} defaultValue={fruits[0]} disabled>
    <ComboboxTrigger placeholder="Select Fruit" />
    <ComboboxContent searchPlaceholder="Search for fruits...">
      {(item) => (
        <ComboboxItem key={item.value} value={item}>
          {item.label}
        </ComboboxItem>
      )}
    </ComboboxContent>
  </Combobox>
  <Combobox items={fruits}>
    <ComboboxTrigger placeholder="Select Fruit" invalid />
    <ComboboxContent searchPlaceholder="Search for fruits...">
      {(item) => (
        <ComboboxItem key={item.value} value={item}>
          {item.label}
        </ComboboxItem>
      )}
    </ComboboxContent>
  </Combobox>
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Demo disabled defaultValue={FRUITS[0]}/>
          <Demo invalid/>
        </div>),
        },
        {
            title: "Size",
            description: "size controls the trigger height (sm / md / lg).",
            code: `<Combobox items={fruits}>
  <ComboboxTrigger size="sm" placeholder="Select Fruit" />
  <ComboboxContent searchPlaceholder="Search for fruits...">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>`,
            render: () => <Demo size="sm"/>,
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Select fruit", label: "Placeholder copywriting" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "Invalid state" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Selected value", render: () => <Demo defaultValue={FRUITS[2]}/> },
        { name: "Disabled", render: () => <Demo disabled defaultValue={FRUITS[0]}/> },
        { name: "Invalid state", render: () => <Demo invalid/> },
        { name: "small", render: () => <Demo size="sm"/> },
        { name: "Inline auto-completion", render: () => <InlineDemo /> },
        { name: "Search-field form", render: () => <SearchDemo /> },
    ],
    renderWithProps: (p) => (<Demo placeholder={p.placeholder as string} size={p.size as Size} disabled={p.disabled as boolean} invalid={p.invalid as boolean}/>),
    toCode: (p) => `<Combobox items={items} defaultValue={items[0]}>
  <ComboboxTrigger size="${p.size}" placeholder="${p.placeholder}" />
  <ComboboxContent searchPlaceholder="Search for fruits...">
    {(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}
  </ComboboxContent>
</Combobox>`,
};
