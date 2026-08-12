---
slug: button
name: Button
category: forms
group: button
tags: []
exports: [Button, buttonVariants]
status: enriched
---

# Button

> Button · CVA variant + press animation · forms/button

## When to use

Use Button for standard actions with solid, soft, outline, ghost, or link styling; brand or danger tones; an optional loading state; and a press-scale animation. Use [ShimmerButton](../shimmer-button/shimmer-button.md), [RainbowButton](../rainbow-button/rainbow-button.md), or [PulsatingButton](../pulsating-button/pulsating-button.md) for a special-effect CTA, and [ButtonGroup](../button-group/button-group.md) for related actions. When you need the styling without `<button>` semantics, call `buttonVariants(...)` to obtain the class name.

## Import
```ts
import { Button, buttonVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"solid" \| "soft" \| "outline" \| "ghost" \| "link"` | `"solid"` | Visual style. `soft` is a tinted semantic background with matching text, sitting between `outline` and `solid` in weight (see below). |
| tone | `"brand" \| "success" \| "warning" \| "danger" \| "neutral" \| "current"` | `"brand"` | Semantic color tone (see the table below). `current` is not a semantic color but "set no color, inherit from the container", and is **only effective on `ghost` and `outline`** (see "Inheriting the container color"). |
| size | `"xs" \| "28" \| "sm" \| "md" \| "lg" \| "icon" \| "iconSm" \| "iconLg" \| "iconXs" \| "icon24" \| "icon28"` | `"md"` | Control size. `xs` (24) and `"28"` are the two dense text sizes, for admin toolbars, table rows and filter-pill rows. `iconSm` / `icon` / `iconLg` are square icon buttons whose side length matches the text size of the same name. The dense end has three more icon sizes — `iconXs` (20), `icon24` (24) and `icon28` (28) — each pinned to one row scale (see the table below). |
| block | `boolean` | `false` | Stretches the button to the full container width, for mobile primary actions and form footers. |
| muted | `boolean` | `false` | Emphasis step: the resting color drops one level to the secondary gray and returns to the tone's own color on hover. **Only effective on `ghost`, `link` and `outline`** (see "The muted emphasis step"). |
| loading | `boolean` | `false` | Shows a spinner and disables the button. |
| type | `"button" \| "submit" \| "reset"` | `"button"` | **Defaults to `button` rather than the native `<button>` default of `submit`**, so a helper button inside a form does not submit it when `type` is omitted. Write `type="submit"` explicitly on submit buttons. |
| ...ButtonHTMLAttributes | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Native attributes such as `disabled`. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Native click callback inherited from `ButtonHTMLAttributes`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button content. |
| render | `ReactElement` | Custom element such as `<a>` or Next.js `<Link>`. Button styles and `aria-disabled` are merged into this element. |

## Semantic tones

Buttons are a two-dimensional model of **`variant` (shape) × `tone` (meaning)**, not a flat one-dimensional `type` list: "a solid success button" and "an outlined success button" are orthogonal choices and do not need one enum value each.

| tone | Use it for | Solid appearance |
|------|-----------|------------------|
| `brand` (default) | The primary action of the page: submit, save, next | Brand fill with white text |
| `success` | Positive confirmations: approve, publish, enable | Success fill with its own foreground |
| `warning` | Costly but non-destructive: reject, unpublish, force sync | Warning fill with its own foreground |
| `danger` | Irreversible destruction: delete, deactivate, clear | Danger fill with its own foreground |
| `neutral` | A secondary action of equal weight: cancel and go back, skip | Inverted fill (the foreground colour becomes the background) |

```tsx
<Button tone="success">Approve</Button>
<Button tone="warning" variant="outline">Reject</Button>
<Button tone="danger">Delete</Button>
<Button tone="neutral">Skip</Button>
```

Coming from a one-dimensional `type` model: `type="primary"` becomes a plain `<Button>`, `type="success"` becomes `tone="success"`, and `type="default"` or `plain` becomes `variant="outline"`. Hairline borders are already the library default, so there is nothing to opt into.

## Tinted semantic fill (soft)

`soft` is a tinted semantic background with matching text — Radix calls it soft, MUI calls it tonal,
Ant calls it filled — and its visual weight sits between `outline` and `solid`. **A tinted fill is not
an outline**: `outline` keeps the canvas background and only adds a semantic border, so the fill never
gets lighter. When you want a tinted fill, use `soft` instead of writing `bg-*-50` in `className`.

Three typical places:

- **Secondary primary action**: weaker than `solid` so it does not compete with the page CTA, stronger than `outline` so it still reads as a brand action.
- **The cancel or discard half of a pair**: `variant="soft" tone="danger"` carries the danger meaning without a full red block.
- **A stateful trigger**: `variant={isActive ? "soft" : "outline"}` shows that a filter is on.

```tsx
<Button variant="soft">Secondary action</Button>
<Button variant="soft" tone="danger">Cancel</Button>
<Button variant="soft" tone="success" size="xs">Enabled</Button>
```

The fill uses the opacity recipe the library already has — `bg-{tone}/12`, deepening to 20% on hover, with
`neutral` on `bg-foreground/8` so it adapts to light and dark — exactly as `soft` works on
[Tag](../tag/tag.md), [Chip](../chip/chip.md) and [Alert](../alert/alert.md). It **deliberately avoids the
`--color-*-subtle` tokens**: switching to them would mean minting a `--color-primary-subtle` plus four
`*-subtle-hover` tokens, leaving the library with two parallel soft palettes where retuning one leaves the
other behind.

Known trade-off: the fill is translucent, so it **picks up the background of whatever contains it**. On a
coloured block the button will look off; report it with a screenshot rather than layering an opaque
background through `className`.

## The muted emphasis step

The weakest color `ghost`, `link` and `outline` can reach is body black (`tone="neutral"` included), yet most **secondary** text links and icon buttons in everyday UI rest in the secondary gray and only return to body black on hover. `muted` adds that step (#211, #221):

```tsx
<Button variant="ghost" size="xs" muted>Show log</Button>
<Button variant="link" muted>Clear</Button>
<Button variant="link" tone="danger" muted>Delete</Button>   {/* gray at rest, red on hover */}
<Button variant="outline" size="xs" muted block>Abort</Button>   {/* border kept, only the text drops */}
```

The rule in one line: **the resting color drops to `--color-muted-foreground` and returns to the tone's own color on hover** (`ghost` and `outline` each keep their own hover background). So `tone="danger" muted` is the "gray at rest, red on hover" delete link rather than a discarded semantic color - a common shape in dense admin rows.

On `outline` it touches **the text only**: `bg-surface`, `border-hairline` and `hover:bg-surface-hover` all stay, as does the semantic border of a non-neutral `tone` (`border-danger` and friends). Reach for it whenever the border is what carries the message ("this is a clickable box") and only the text is too loud; `ghost muted` is not a substitute because it drops the border along with the color. The typical spot is the inactive half of a two-state trigger — in `variant={active ? "soft" : "outline"}`, the inactive half is supposed to be one step weaker than the active one.

Three boundaries:

- **Only effective on `ghost`, `link` and `outline`.** On `solid` or `soft` it adds no class at all and logs one `warnOnce` in development - a prop that silently does nothing is harder to track down than an error. Those two pair their background with their foreground, and dropping the foreground alone would produce combinations that fail contrast.
- **It is opt-in and changes no default.** A `ghost` without `muted` is still body black, so existing call sites do not move by a pixel. Row actions like "View" or "Reload" are **normal emphasis** and belong in body black; only genuinely secondary affordances take `muted`.
- **It is not a sixth `tone`.** `tone` is the semantic-color SSOT shared by 29 components, while muted is an **emphasis level**, not a hue. Folding it into `tone` would force `solid` and `soft` to answer "what is a muted fill?" - and a `bg-muted` fill simply reads as disabled.

## Inheriting the container color with `tone="current"`

Icon buttons inside a colored card or a colored row should **take the color of that container** instead of being pulled back to body black. `tone="current"` means "set no color, leave it to inheritance" (#215):

```tsx
{/* The arrow is green-700 along with the card, not body black */}
<div className="rounded-md border border-green-400 bg-green-100 p-2 text-green-700">
  <span className="text-xs font-medium">Start node</span>
  <Button variant="ghost" size="iconXs" tone="current" aria-label="Move up">
    <ChevronUp className="size-3" />
  </Button>
</div>
```

What separates it from the five semantic steps: those all hand out an **absolute** color, whereas this expresses "the container already decided the color, the button should keep out of it". A card may be green or blue, and neither deserves its own tone. `muted` is equally absolute and points the other way (pinned to the secondary gray). The word follows the `tone="current"` that `Spinner` already has.

- **Only effective on `ghost` and `outline`.** On `solid`, `soft`, or `link` the rendered result is identical to omitting it, plus one `warnOnce`. `solid` and `soft` carry their own background and the foreground has to be paired with it, so inheriting the container color would produce combinations that fail contrast; the resting color of `link` is the brand color, which belongs to the link rather than to the container.
- **It is opt-in**: a `ghost` or `outline` without `tone` is still `text-foreground`.
- A call site that writes its own color class (`className="text-red-500"`) **already wins** (`cn` is tailwind-merge). `current` covers the other case: the call site wants to write **nothing** and just inherit.

## Taking the className straight from `buttonVariants(...)`

The exported function now runs its output through tailwind-merge, so the string can go onto any element as-is:

```tsx
<a href="/docs" className={buttonVariants({ variant: "ghost", tone: "danger" })}>Delete</a>
```

That was **not** true in 0.36.0 and earlier: `cva` only concatenates and never resolves conflicts, so the returned string carried several rules for the same CSS property (base `text-foreground` alongside `text-danger`). Dropped onto an `<a>`, the winner was decided by **stylesheet order** - 6 of 16 common combinations rendered the wrong color, three of them danger buttons losing their red (#217). The `<Button>` component never had this problem (it has `cn()` inside).

Use `cn()` as usual when composing further classes; merging twice is idempotent.

## Size scale

The regular scale has three steps. Every icon size has the same side length as the text size of the same name, so **pair icon buttons with the matching text size** — otherwise an attached group ([ButtonGroup](../button-group/button-group.md)) shows a visible step at the seam.

| Text size | Height | Font | Matching icon size | Side |
|-----------|--------|------|--------------------|------|
| `sm` | 32px | 14px | `iconSm` | 32px |
| `md` (default) | 40px | 14px | `icon` | 40px |
| `lg` | 48px | 16px | `iconLg` | 48px |

Five more sizes form the dense end. **Only `"28"` and `icon28` share a height**; every other one is
pinned to its own row scale:

| Dense size | Dimensions | Font | What it pairs with | Where it belongs |
|------------|------------|------|--------------------|------------------|
| `xs` | 24px tall | 12px | `icon24` | Text buttons in admin toolbars, table rows and panel headers |
| `"28"` | 28px tall | 12px | `icon28`, [Chip](../chip/chip.md) `md`, [Sidebar](../sidebar/sidebar.md) menu item `sm` | Text buttons on the 28px row scale: filter-pill triggers, secondary actions at the foot of an info card |
| `iconXs` | 20px square | — | Nothing (shorter than every text size) | Icon-only micro actions inside a table row: tree expanders, drag handles |
| `icon24` | 24px square | — | The `xs` text size, [Tag](../tag/tag.md) `md`, [Chip](../chip/chip.md) `sm` | Icon buttons sitting next to `xs` text buttons |
| `icon28` | 28px square | — | The `"28"` text size, [Chip](../chip/chip.md) `md`, [Sidebar](../sidebar/sidebar.md) menu item `sm` | Icon buttons on the 28px row scale, such as the clear button on a filter-pill row |

`xs` is the smallest text size for dense interfaces. Once a screen carries a dozen actions, `sm`
(32px / 14px) is one step too large rather than the smallest step, and forcing it into a 24px toolbar
means a stack of override classes that undo the height, padding, font size and radius `sm` just added.
`xs` already lowers the radius to 4px and tightens the icon gap to 4px, so use it as is instead of
patching it through `className`.

`"28"` fills the gap between `xs` and `sm`, and its **name is a bare number**: it differs from
`icon28` only by the `icon` prefix, and a text size has no prefix, so the side length is all that is
left to name it after (the same rule as `icon24` / `icon28` below). Its font follows `xs` (12px)
rather than `sm` — the dense band runs 10 to 12px, and 14px would make every one of these call sites
add `text-xs` back. Padding (10px) and icon gap (6px) are interpolated by height between `xs` and
`sm`. The radius stays at `--radius`, matching `icon28`, so a 28px text button and a 28px icon button
on the same row also agree on their corners (#228).

**The icon size that matches `xs` is `icon24`, not `iconXs`.** The one named `Xs` is 20px: it is another
4px shorter than `xs` on purpose, because raising it to 24px would push `density="compact"` table rows
taller, and staying out of the row height is its entire reason to exist. The two names look like a pair
but are two different scales — take `icon24` when you need equal heights (#222).

These two carry **numbers** rather than t-shirt names because the t-shirt names between `xs` and `sm`
were already taken by `iconXs` (20px), and that size cannot change its side length without silently
flattening every expander that relies on it. The number is the entire meaning of these sizes: they pin
one pixel scale.

The radius follows the side length: `icon24` drops to 4px alongside `xs` and `iconXs` (a 10px `--radius`
on a 24px square reads as a disc), while `icon28` keeps `--radius` alongside `iconSm` (32px).

**Dense sizes only mix with dense sizes.** `iconXs` next to `xs` differs by 4px, which `items-center`
hides; pairing `iconXs` with `sm` or larger opens a gap past 12px, and so does `icon24` next to `md`.

```tsx
{/* Dense toolbar: xs text buttons next to an icon24 icon button (equal height) */}
<Button size="xs" variant="outline">Record</Button>
<Button size="xs" variant="soft">Filtered</Button>
<Button size="icon24" variant="ghost" muted aria-label="More">
  <ChevronRight className="size-4" />
</Button>

{/* The 28px row scale: a text trigger plus a clear button (equal height, matching corners) */}
<Button size="28" variant="outline" tone="neutral" muted>Filter</Button>
<Button size="icon28" variant="outline" muted aria-label="Clear filters">
  <X className="size-3.5" />
</Button>

{/* Full-width escape hatch at the foot of a card */}
<Button size="28" variant="outline" muted block>Abort</Button>
```

```tsx
{/* Correct: matching pair, equal height */}
<ButtonGroup><Button>Save</Button><Button size="icon"><ChevronDown className="size-4" /></Button></ButtonGroup>
{/* Wrong: mismatched sizes, 8px apart */}
<ButtonGroup><Button>Save</Button><Button size="iconSm"><ChevronDown className="size-4" /></Button></ButtonGroup>
```

## Examples
```tsx
<Button>Default</Button>
<Button variant="soft">Tinted secondary action</Button>
<Button variant="outline">Outline</Button>
<Button tone="danger">Danger</Button>
<Button tone="success" variant="soft">Approve</Button>
<Button size="xs" variant="outline">Dense toolbar</Button>
<Button block>Full-width primary action</Button>
<Button loading>Loading</Button>
```

## Usage guidelines

- To avoid unsafe element animation, `render` mode **does not apply Motion**, so it has no press-scale effect. Color and hover transitions remain, and Button's `children` take precedence as the visible content.
- `loading` disables the button automatically; do not add `disabled` solely for the loading state.
- Button text **cannot be selected** (the base class carries `select-none`). A button label is a control affordance, not content, and rapid clicking would otherwise make the browser select the word or the whole line. Do not turn text people need to copy into a button.
- `tone` changes meaning, never shape. For a light-background success button use `tone="success" variant="soft"` instead of overriding the background through `className`. **It is not `variant="outline"`**: `outline` keeps the canvas background and only adds a semantic border, so nothing appears to change and the next move is usually to write `bg-green-50` — exactly what this rule forbids.
- `tone="neutral"` in `solid` is an **inverted** fill (dark background in light mode, light background in dark mode), not a grey one. A grey fill is nearly indistinguishable from `variant="outline"`, which would make the tone pointless.
- If an icon wraps away from its label in a custom or effect button, Tailwind Preflight's `svg{display:block}` rule is usually the cause. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]; the wrapper needs `inline-flex`. Button already handles this internally.
- Use `variant="soft"` (tinted semantic background with semantic text) for a secondary control that shows an on/off state. Do not override the palette with `bg-primary/10 text-primary` in `className`, and do not fall back to `solid`: a filled brand block among `h-7` toolbar controls outweighs the primary action of the page. `soft` combines with every `tone`; the typical form is `variant={isActive ? "soft" : "outline"}`. Note that it does not render `aria-pressed` — use [Toggle](../toggle/toggle.md) for a real toggle. `soft` fits triggers that merely show something is active, such as a sort chip that opens a menu.

## Related
[ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
