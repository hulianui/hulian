---
slug: accent-scope
name: AccentScope
category: layout
group: container
tags: []
exports: [AccentScope]
status: enriched
---

# AccentScope

> Changes the accent hue of one region; the components inside follow automatically. · layout/container

## When to Use

Use it when one part of a page needs a different accent color (a rotating theme color on a marketing page, sections tinted by product line, a color preview) and the rest of the site stays as is. Inside the subtree, primary, hover, subtle fill (`-subtle`), subtle border (`-border`), focus ring, and the chart palette `chart-1..6` all move to the new hue. **Lightness and chroma stay on the brand ladder**, so contrast and hierarchy match the brand color at any hue.

For site-wide light/dark switching use `ThemeProvider`; to change the brand color everywhere, edit the tokens' `--brand-*` values instead of using this component.

## Import
```ts
import { AccentScope } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| hue | `number` | — | OKLCH hue (0–360) for the subtree's accent; only the hue changes. When omitted, the initial value registered by tokens, 258 (the brand color), applies |
| transition | `number` | `0` | Transition duration in milliseconds when the hue changes; `0` switches instantly. It transitions the single `--hl-accent-hue` variable, so every derived color in the subtree changes together |
| theme | `"light" \| "dark"` | — | Writes the theme onto the same element as the scope. Only needed for nesting such as "dark page > light island > scope" |

> Extends `ComponentPropsWithoutRef<"div">`.

## Examples
```tsx
<AccentScope hue={165}>
  <Button>Primary</Button>
  <Tag tone="brand">Tag</Tag>
</AccentScope>

// Hue driven by state; the whole region changes together
const [hue, setHue] = useState(258);
<AccentScope hue={hue} transition={900}>…</AccentScope>

// Read the same variable when computing your own derived colors
<span style={{ color: "oklch(0.62 0.17 calc(var(--hl-accent-hue) + 45))" }} />
```

## Pitfalls

- The derivation rules live in `semantic.css` of `@hulianui/tokens` (the `[data-accent-scope]` block), so the project must load the tokens styles. Without them this component is a plain div.
- Don't put a transition on `--hl-accent-hue` in child elements: the inherited value changes every frame and restarts the child's transition, so the color change drags. Put the transition only on the scope (the `transition` prop).
- With nesting such as "dark page > light island > scope", the two ancestor theme selectors have equal specificity and source order picks dark; pass `theme="light"` to this component in that case.

## Related
`ThemeProvider` · [Spotlight](../spotlight/spotlight.md)
