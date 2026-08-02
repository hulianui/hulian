---
slug: profile-card
name: ProfileCard
category: data-display
group: collection
tags: [animated]
exports: [ProfileCard]
status: enriched
---

# ProfileCard

> Holographic profile card · RAF-damped 3D pointer tilt and glow, chart-token gradients, initial fallback avatar, structured profile details, and static reduced-motion behavior · data-display/collection · #animated

## When to use

Use ProfileCard for a polished personal or team profile with structured name, role, handle, status, and contact action. Use [TiltedCard](../tilted-card/tilted-card.md) for a generic tilting image, or [PixelCard](../pixel-card/pixel-card.md) for a pixel-animated card.

## Import
```ts
import { ProfileCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| avatarUrl | `string` | — | Avatar URL. Omission uses the first character of `name` without a remote asset. |
| name | `string` | `"\u745a\u740f"` | Main name; the built-in Chinese default means “Hulian.” |
| title | `string` | `"\u524d\u7aef\u5de5\u7a0b\u5e08"` | Role; the built-in Chinese default means “Frontend engineer.” |
| handle | `string` | `"hulianui"` | User handle in the lower information bar. |
| status | `string` | `"\u5728\u7ebf"` | Status; the built-in Chinese default means “Online.” |
| contactText | `string` | `"\u8054\u7cfb"` | Contact action; the built-in Chinese default means “Contact.” |
| showUserInfo | `boolean` | `true` | Shows the lower glass information bar. |
| enableTilt | `boolean` | `true` | Enables pointer tilt and holographic sheen; reduced motion makes it static. |
| glowColor | `string` | `var(--color-chart-1)` | Holographic highlight color. Use a real `--color-` token or any CSS color. |
| aspectRatio | `number` | `0.74` | Card width-to-height ratio. |
| className | `string` | — | Class name forwarded to the root. |
| style | `CSSProperties` | — | Inline styles forwarded to the root. |

## Events

| Event | Type | Description |
|------|------|------|
| onContactClick | `() => void` | Called when the contact button is selected. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Custom front-face content above the avatar and below the information bar. |

## Examples
```tsx
<ProfileCard name="Lin Yu" title="Independent developer" handle="linyu" />

<ProfileCard
  name="Su Wan"
  title="Product designer"
  handle="suwan"
  status="Busy"
  glowColor="var(--color-chart-3)"
  onContactClick={() => router.push("/contact")}
/>
```

## Usage notes

- [[hulian-token-color-var-needs-color-prefix]]: use `var(--color-chart-1)`, not bare `var(--chart-1)` or `var(--primary)`.
- The RAF spring has no WebGL dependency. `enableTilt={false}` and reduced motion retain the gradient and profile information in a static card.
- The avatar alt appends built-in Chinese `" \u5934\u50cf"` (“ avatar”) to `name`; the contact button label prepends `"\u8054\u7cfb "` (“Contact ”). These dynamic labels therefore remain Chinese unless the runtime is localized.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
