---
slug: component-picker
name: ComponentPicker
category: data-display
group: collection
tags: []
exports: [ALL_CATEGORY_KEY, ComponentPicker, ComponentPickerCommand, buildCategoryTree, defaultPropsOf, fuzzyMatch, matchesCategory, parseComponentCatalog, rankComponents, scoreComponent]
status: enriched
---

# ComponentPicker

> Component-library browser · category tree (reuses Tree) plus fuzzy search, a Card result grid, and a detail pane with preview / props table / examples toggles · dependency-free ranking where slug hits outweigh description hits (no fuse.js) · `parseComponentCatalog` turns llms-full.txt into items as a pure function run on the consumer side · `renderPreview` injects the live preview because the library never evaluates code or embeds an iframe · ships ComponentPickerCommand as a thin Command wrapper · data-display/collection

## When to use

Use it when your product needs a component catalog browser: search components, filter by category, read the props table and examples, then hand the chosen slug back. Typical hosts are the component panel of an AI site builder, an internal design-system portal, and the block palette of a low-code editor.

- For a plain quick-jump palette without a category tree or props table, use [Command](../command/command.md) directly, or the `ComponentPickerCommand` wrapper exported here.
- To pick an icon use [IconPicker](../icon-picker/icon-picker.md); to pick an emoji use [EmojiPicker](../emoji-picker/emoji-picker.md).
- For a general list page with a query bar rather than a component catalog, use [ProTable](../pro-table/pro-table.md).

Three boundaries are deliberate, not unfinished work:

1. **It never fetches.** `items` comes from the consumer. A library component must not assume the runtime has `llms-full.txt`, and must not issue a network request while rendering. Call the pure `parseComponentCatalog(text)` in your own layer instead.
2. **It never renders an arbitrary component.** There is no slug-to-component registry inside the library, and no string evaluation or iframe. Inject a live preview through `renderPreview`; without it the preview area shows a placeholder.
3. **It does not pull in fuse.js.** The ranker is a pure function in this folder, tuned so that a hit on slug or name outweighs a hit on description. A generic library cannot make that distinction: searching `btn` would float any component whose description happens to scatter b, t, and n above Button.

## Import
```ts
import {
  ALL_CATEGORY_KEY,
  ComponentPicker,
  ComponentPickerCommand,
  buildCategoryTree,
  defaultPropsOf,
  fuzzyMatch,
  matchesCategory,
  parseComponentCatalog,
  rankComponents,
  scoreComponent,
} from "@hulianui/ui"
```

## Props

`ComponentPickerProps`

| Name | Type | Default | Description |
|------|------|------|------|
| items * | ComponentPickerItem[] | - | The catalog. An empty array renders the empty-catalog state, which differs from the no-result state. |
| filter | ComponentPickerFilter | - | Controlled `{ category?, search? }`. Pair it with `onFilterChange`, otherwise the search box and the tree stop responding. |
| defaultFilter | ComponentPickerFilter | `{}` | Uncontrolled initial filter. |
| showTree | boolean | `true` | Shows the category tree on the left. |
| showPreview | boolean | `false` | Shows the preview area inside the detail pane. |
| showProps | boolean | `true` | Shows the props table (reuses Table). |
| showExamples | boolean | `true` | Shows example code (reuses CodeBlock). |
| activeSlug | string \| null | - | Controlled highlighted item, the one the detail pane describes. |
| defaultActiveSlug | string \| null | `null` | Uncontrolled initial highlighted item. |
| maxResults | number | `60` | Maximum number of result cards rendered. |
| labels | Partial\<ComponentPickerLabels\> | - | UI copy overrides, whole object or single keys. Omit it and the picker takes its copy from the ConfigProvider locale. |
| className | string | - | Wrapper class. **It must establish a height** such as `h-[560px]`; the internal panes then fill it and scroll independently. |

`ComponentPickerItem`

| Name | Type | Default | Description |
|------|------|------|------|
| slug * | `string` | - | Unique key, also the first argument of `onSelect`. |
| name * | `string` | - | Display name (the PascalCase export name). |
| description * | `string` | - | One-line summary. |
| category * | `string` | - | Top-level category (layout / forms / data-display…). |
| group * | `string` | - | Second-level group (container / advanced / collection…); pass an empty string when there is none. |
| tags | `string[]` | - | Extra keywords used by search. |
| props | `ComponentPickerProp[]` | - | Rows for the detail pane's props table, each `{ name, type?, default?, description?, required? }`. |
| examples | `ComponentPickerExample[]` | - | Example code for the detail pane, each `{ title?, lang?, code }`. |

`ComponentPickerCommandProps` (thin wrapper that puts the catalog inside a Command panel)

| Name | Type | Default | Description |
|------|------|------|------|
| items * | `ComponentPickerItem[]` | - | Same as above. |
| open * | `boolean` | - | Controlled open state. |
| onOpenChange * | `(open: boolean) => void` | - | Open-state callback. |
| onSelect | `(slug: string) => void` | - | Fires when an entry is chosen. |
| placeholder | `string` | From the locale | Search box placeholder. |
| emptyMessage | `ReactNode` | From the locale | Copy shown when nothing matches. |
| maxResults | `number` | `30` | Maximum rendered entries (note this differs from the 60 used by `ComponentPickerProps`). |
| groupByCategory | `boolean` | `true` | Groups by category with one heading per group. |
| shortcut | `boolean` | `false` | Built-in ⌘K / Ctrl+K toggle. |
| aria-label | `string` | From the locale | Accessible name of the panel. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | (slug: string, props: Record\<string, unknown\>) => void | Confirms a choice. The second argument comes from `defaultPropsOf(item)` and only carries literal defaults; functions and objects are never guessed. |
| onFilterChange | (filter: ComponentPickerFilter) => void | Search text or category changed. This is the only outlet once `filter` is controlled. |
| onActiveChange | (slug: string \| null) => void | Highlighted item changed by click, arrow key, or Escape. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderPreview | (item: ComponentPickerItem) => ReactNode | Injects the live preview. Without it the preview area shows a placeholder rather than blank space. |

## Pure functions

| Function | Signature | Description |
|------|------|------|
| parseComponentCatalog | (text: string, options?: ParseCatalogOptions) => ComponentPickerItem[] | Parses `llms-full.txt` into items. A missing section only drops that field; it never throws. |
| buildCategoryTree | (items, options?) => ComponentPickerCategoryNode[] | Derives the all / category / group tree as plain data with per-level counts. |
| matchesCategory | (item, key?) => boolean | Whether an item falls under a category key; `undefined` and `"*"` always match. |
| defaultPropsOf | (item) => Record\<string, unknown\> | Derives initial props from documented default values. |
| rankComponents | (items, query, options?) => RankedComponent[] | Ranks and filters. An empty query keeps the original order. |
| scoreComponent | (item, query) => number | Scores one item; multiple terms are combined with AND. |
| fuzzyMatch | (query, text) => FuzzyMatch \| null | Matches one string and returns the score plus matched indices. |

## Example

```tsx
// The catalog comes from llms-full.txt: parsing runs in your layer, the component only displays.
const text = await fetch("/llms-full.txt").then((r) => r.text());
const items = parseComponentCatalog(text);

<ComponentPicker
  items={items}
  className="h-[560px]"
  showPreview
  renderPreview={(item) => REGISTRY[item.slug]?.() ?? null}
  onSelect={(slug, props) => insertIntoCanvas(slug, props)}
/>
```

```tsx
// Controlled filter: mirror the search text into the URL query.
const [filter, setFilter] = useState<ComponentPickerFilter>({ category: ALL_CATEGORY_KEY });

<ComponentPicker
  items={items}
  className="h-[560px]"
  filter={filter}
  onFilterChange={(next) => {
    setFilter(next);
    router.replace(`?q=${encodeURIComponent(next.search ?? "")}`);
  }}
/>
```

```tsx
// Palette form, for when the target component is already known.
const [open, setOpen] = useState(false);

<ComponentPickerCommand
  items={items}
  open={open}
  onOpenChange={setOpen}
  shortcut
  onSelect={(slug) => insertIntoCanvas(slug)}
/>
```

## Accessibility

- The search box is a `role="combobox"` with `aria-controls`, `aria-autocomplete="list"`, and `aria-activedescendant`. The result grid is a `role="listbox"` and every card is a `role="option"` with `aria-selected`. Focus stays in the search box and `aria-activedescendant` points at the highlighted card, which is the WAI-ARIA combobox pattern; focus is never moved between cards.
- Keyboard: `Down` and `Up` move the highlight and wrap around, starting at the first card going down and the last card going up. `Enter` confirms. `Escape` backs out one level at a time, clearing the query first and the highlight second. The highlighted card is scrolled with `scrollIntoView({ block: "nearest" })`.
- The category tree runs [Tree](../tree/tree.md) in `expandTrigger="icon"` mode, so only the arrow expands a branch and the rest of the row still selects. That is what makes a whole category such as `forms` selectable.
- The detail pane is a `role="region"` with an accessible name, so a screen reader can jump straight into it.

## Usage notes

- **A height is mandatory.** Without one in `className` the whole block collapses to content height and every independent scroll area stops working, same as [Flow](../flow/flow.md) and [AdminLayout](../admin-layout/admin-layout.md).
- **A controlled `filter` needs `onFilterChange`.** Use `defaultFilter` when you only want an initial value. Passing `filter` without the callback leaves the search box unwritable and the tree unclickable, which reads as a broken component.
- **`renderPreview` is the only preview path**, not an optional convenience. The library will not turn a slug into an instance for you. Leave `showPreview` at `false` if you do not want to supply it.
- **The second argument of `onSelect` may be `{}`.** `defaultPropsOf` only accepts literal defaults such as `true`, `false`, numbers, and quoted strings. Documented defaults written as `() => void`, `{...}`, or an em dash are skipped on purpose; the empty object is honest, not a parse failure.
- **`parseComponentCatalog` does not read the slug from the document, because it is not there.** The function first harvests cross-reference links across the whole text, so `[Formula](.../components/math)` yields `math`, and only then falls back to kebab-casing the component name. Those two steps cover all 376 entries of this library; the single exception, `QRCode` to `qrcode`, is covered by a built-in override. Pass `slugOverrides` for the abbreviations in your own docs.
- **`maxResults` caps rendering, not scoring.** Every item is scored before the list is truncated, so entry 61 really is ranked 61st rather than dropped. Raise it to see everything, but 376 cards at once will visibly drop frames.
- **UI copy follows the locale by default.** Without `labels`, every string comes from the ConfigProvider locale and falls back to the built-in Chinese when no provider is present; `placeholder` and `emptyMessage` on `ComponentPickerCommand` work the same way. Priority is prop, then locale, then fallback, so overriding one key leaves the rest tracking the app language.
- **`ComponentPickerCommand` is not the main form.** A command line has no room for a category tree or a props table. Internally it uses `filter={() => true}` with `onQueryChange` to take over ordering, because the palette's own filter is a substring match that does not rank.
