---
slug: icon-picker
name: IconPicker
category: forms
group: advanced
tags: []
exports: [IconPicker]
status: enriched
---

# IconPicker

> Icon picker · Categorized grid, cross-category aliases, recent history, and consumer-supplied rendering · forms/advanced

## When to use

Use IconPicker when a user chooses an icon and the application stores the icon's **name**, for example in menu, category, or shortcut configuration. Use [EmojiPicker](../emoji-picker/emoji-picker.md) when the choices are emoji from the built-in dataset.

## Import
```ts
import { IconPicker } from "@hulianui/ui"
```

> **The component does not bundle an icon set.** Supply the name-to-node mapping through `sources[].renderIcon`.
> This supports Lucide, icon fonts, and local SVG registries. HulianUI's `_icons` contains only the small set needed internally.
> The library deliberately does not bundle an icon catalog, which would add thousands of icons to each consumer bundle.

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sources* | `IconPickerSource[]` | - | Icon categories. Each item contains `{ key, label, tabIcon?, icons, renderIcon }`. |
| value | `string \| null` | - | Controlled icon name. |
| defaultValue | `string \| null` | - | Initial icon name when uncontrolled. |
| columns | `number` | `8` | Number of grid columns. |
| searchable | `boolean` | `true` | Shows the search field. |
| searchPlaceholder | `string` | `"\u641c\u7d22\u56fe\u6807"` | Search placeholder; the built-in Chinese copy means “Search icons.” |
| defaultSource | `string` | First source | Initial category key. |
| recent | `string[]` | - | Controlled recent-history names. When omitted, the component stores up to 16 names internally, newest first. |
| clearable | `boolean` | `true` | Shows the selected value and a clear button when a value exists. |
| emptyMessage | `ReactNode` | `"\u6ca1\u6709\u5339\u914d\u7684\u56fe\u6807"` | Empty-state content; the built-in Chinese copy means “No matching icons.” |
| className | `string` | - | Additional class name for the picker panel, commonly used to set its width. |

`IconPickerSource`:

| Field | Type | Description |
|------|------|------|
| key* | `string` | Unique category key. |
| label* | `ReactNode` | Category-tab label. |
| tabIcon | `ReactNode` | Category-tab icon; the label is shown when no icon is supplied. |
| icons* | `{ name: string; keywords?: string[] }[]` | Icons in the category. `name` is the external value and `keywords` contains search aliases. |
| renderIcon* | `(name: string) => ReactNode` | Converts an icon name into its rendered node. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(name: string \| null) => void` | Called with the selected name, or `null` when cleared. |
| onRecentChange | `(recent: string[]) => void` | Called when recent icons change; persist this array when `recent` is controlled. |

## Examples
```tsx
import { Home, User, Settings } from "lucide-react"

const REGISTRY = { home: <Home />, user: <User />, settings: <Settings /> }

const SOURCES = [
  {
    key: "common",
    label: "Common",
    icons: [
      { name: "home", keywords: ["front page", "homepage"] },
      { name: "user", keywords: ["user", "account"] },
      { name: "settings", keywords: ["preferences", "configure"] },
    ],
    renderIcon: (name) => REGISTRY[name] ?? null,
  },
]

<IconPicker sources={SOURCES} value={icon} onValueChange={setIcon} />
```

Compose IconPicker inside a popover for a form-field trigger:
```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline">{icon ?? "Select icon"}</Button>} />
  <PopoverContent className="p-0">
    <IconPicker sources={SOURCES} value={icon} onValueChange={setIcon} className="border-0" />
  </PopoverContent>
</Popover>
```

## Usage guidelines

- **Do not load an entire icon library into `sources`.** A full `import * as icons` from `lucide-react` defeats tree-shaking and greatly increases bundle size. Build a focused registry for the application's actual needs.
- Search covers all categories, not only the active category. Category tabs are hidden while searching so the UI does not imply that results are category-scoped.
- Use `keywords` for localized aliases. Without an alias, an English icon name such as `trash` cannot be found with a translated search term such as “Delete.”
- Recent history stores icon names only. If a recorded name no longer exists in `sources`, it is skipped rather than rendered as an empty cell. For persistence, control `recent`, handle `onRecentChange`, and store the array in application storage.
- The external value is an **icon-name string**, not a React node. Render it through the consumer-provided `renderIcon`; the component does not expose selected nodes.

## Related
[EmojiPicker](../emoji-picker/emoji-picker.md) · [ColorPicker](../colorpicker/colorpicker.md) · [ColorField](../color-field/color-field.md) · [Select](../select/select.md) · [Combobox](../combobox/combobox.md) · [Popover](../popover/popover.md)
