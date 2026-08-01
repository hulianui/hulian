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

> Icon selection · Category tab + cross-category search (name/alias) + grid + recently used · Icon set injected by consumer via renderIcon · forms/advanced

## When to use

Use IconPicker when users select an icon and the application stores its **name**, such as menu management, category settings, or shortcut configuration. Use [EmojiPicker](../emoji-picker/emoji-picker.md) for emoji with built-in data.

## Import
```ts
import { IconPicker } from "@hulianui/ui"
```

> **The icon set is not included in the component library.** `sources[].renderIcon` gives you the mapping of "name → node",
> This supports Lucide, icon fonts, and local SVG registries. HulianUI's `_icons` contains only the small set needed internally.
> The library deliberately does not bundle an icon catalog, which would add thousands of icons to each consumer bundle.

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sources* | `IconPickerSource[]` | — | Icon source category. Each item `{ key, label, tabIcon?, icons, renderIcon }` |
| value | `string \| null` | — | Controlled value (icon name) |
| defaultValue | `string \| null` | — | uncontrolled initial value |
| columns | `number` | `8` | Number of grid columns |
| searchable | `boolean` | `true` | Show search box |
| searchPlaceholder | `string` | `"\u641c\u7d22\u56fe\u6807"` | Search placeholder; the built-in Chinese copy means “Search icons.” |
| defaultSource | `string` | first one | Initial classification key |
| recent | `string[]` | — | Controlled "most recently used"; omitted to maintain internally (max 16, newest first) |
| clearable | `boolean` | `true` | Display the current value row and clear button when there is a value |
| emptyMessage | `ReactNode` | `"\u6ca1\u6709\u5339\u914d\u7684\u56fe\u6807"` | Empty-state content; the built-in Chinese copy means “No matching icons.” |
| className | `string` | — | Panel class name (for width adjustment) |

`IconPickerSource`：

| Field | type | illustrate |
|------|------|------|
| key* | `string` | Category unique key |
| label* | `ReactNode` | Category tab text |
| tabIcon | `ReactNode` | Category tab icon (if not given, `label` will be displayed) |
| icons* | `{ name: string; keywords?: string[] }[]` | The icon for this category. `name` is the external value, `keywords` is the search alias |
| renderIcon* | `(name: string) => ReactNode` | Render icon names into nodes |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(name: string \| null) => void` | Select/clear callback; clear callback `null` |
| onRecentChange | `(recent: string[]) => void` | Called when recent icons change; persist this array when `recent` is controlled. |

## Examples
```tsx
import { Home, User, Settings } from "lucide-react"

const REGISTRY = { home: <Home />, user: <User />, settings: <Settings /> }

const SOURCES = [
  {
    key: "common",
    label: "Commonly used",
    icons: [
      { name: "home", keywords: ["front page", "Home page"] },
      { name: "user", keywords: ["user", "account"] },
      { name: "settings", keywords: ["set up"] },
    ],
    renderIcon: (name) => REGISTRY[name] ?? null,
  },
]

<IconPicker sources={SOURCES} value={icon} onValueChange={setIcon} />
```

Put it into the pop-up layer and use it ("Select Icon" button in the form):
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
- Use `keywords` for localized aliases because icon names are English; without an alias, `trash` cannot be found with a translated search term such as "Delete."
- Recent history stores icon names only. If a recorded name no longer exists in `sources`, it is skipped rather than rendered as an empty cell. For persistence, control `recent`, handle `onRecentChange`, and store the array in application storage.
- The external value is an **icon-name string**, not a React node. Render it through the consumer-provided `renderIcon`; the component does not expose selected nodes.

## Related
[EmojiPicker](../emoji-picker/emoji-picker.md) · [ColorPicker](../colorpicker/colorpicker.md) · [ColorField](../color-field/color-field.md) · [Select](../select/select.md) · [Combobox](../combobox/combobox.md) · [Popover](../popover/popover.md)
