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
> So lucide / iconfont / local svg three sources can be connected. HulianUI's `_icons` only has the dozens necessary for running.
> Explicitly do not make icon sets - otherwise a selector will put thousands of icons into each consumer's package.

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sources* | `IconPickerSource[]` | — | Icon source category. Each item `{ key, label, tabIcon?, icons, renderIcon }` |
| value | `string \| null` | — | Controlled value (icon name) |
| defaultValue | `string \| null` | — | uncontrolled initial value |
| columns | `number` | `8` | Number of grid columns |
| searchable | `boolean` | `true` | Show search box |
| searchPlaceholder | `string` | `"search icon"` | Search box placeholder |
| defaultSource | `string` | first one | Initial classification key |
| recent | `string[]` | — | Controlled "most recently used"; omitted to maintain internally (max 16, newest first) |
| clearable | `boolean` | `true` | Display the current value row and clear button when there is a value |
| emptyMessage | `ReactNode` | `"No matching icon"` | No results found for copywriting |
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
| onRecentChange | `(recent: string[]) => void` | Recent changes in use (use it to disk when controlled `recent`) |

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
- **Search across all categories**, not just the current category - users do not have the concept of "which category it belongs to" when looking for icons.
  Therefore, the category tab will be hidden during the search (leaving it on will make people mistakenly think that the search is only in the current category).
- Use `keywords` for localized aliases because icon names are English; without an alias, `trash` cannot be found with a translated search term such as "Delete."
- **Recently used only save names**. After the icon was downloaded from `sources`, the source of the record could not be determined, and the component was skipped without rendering.
  (Instead of rendering an empty grid). If you want persistence, use controlled `recent` + `onRecentChange` and drop it into localStorage yourself.
- The external value is an **icon-name string**, not a React node. Render it through the consumer-provided `renderIcon`; the component does not expose selected nodes.

## Related
[EmojiPicker](../emoji-picker/emoji-picker.md) · [ColorPicker](../colorpicker/colorpicker.md) · [ColorField](../color-field/color-field.md) · [Select](../select/select.md) · [Combobox](../combobox/combobox.md) · [Popover](../popover/popover.md)
