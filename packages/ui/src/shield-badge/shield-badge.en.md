---
slug: shield-badge
name: ShieldBadge
category: data-display
group: info
tags: []
exports: [ShieldBadge, ShieldBadgeGroup, compactCount]
status: enriched
---

# ShieldBadge

> A theme-aware shields.io-style project badge with label and value segments, three skins, three shapes, optional icon and link, and a wrapping group.

## When to use

Use ShieldBadge in README headers, project pages, and package details for version, license, downloads, CI, and stars.

[Badge](../badge/badge.md) overlays a count on another element, [Tag](../tag/tag.md) is a single status label, and [Chip](../chip/chip.md) is an interactive token. ShieldBadge represents project metadata with a distinctive two-segment structure. Use [DeployStatus](../deploy-status/deploy-status.md) for deployment lifecycle, [StatusDot](../status-dot/status-dot.md) for health, or [AwardBadge](../award-badge/award-badge.md) for honors.

Unlike a remote shields.io image, this CSS component follows themes, avoids a request, scales cleanly, and keeps text selectable. It does not fetch data; supply the value and optionally format counts with `compactCount`.

## Import
```ts
import { ShieldBadge, ShieldBadgeGroup, compactCount } from "@hulianui/ui"
```

## Props

### ShieldBadge

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `ReactNode` | - | Colored value segment, such as `MIT`, `1.5k/month`, or `failing`. |
| label | `ReactNode` | - | Neutral label segment; omission creates a single-segment badge. |
| icon | `ReactNode` | - | Leading brand mark in the label segment, or value segment without a label. |
| tone | `"neutral" \| "brand" \| "success" \| "warning" \| "danger"` | `"brand"` | Value-segment tone. |
| color | `string` | - | CSS color or semantic name such as `chart-1`, overriding tone. |
| variant | `"solid" \| "soft" \| "outline"` | `"solid"` | Sticker, quiet, or outlined skin. |
| shape | `"rounded" \| "square" \| "pill"` | `"rounded"` | Badge shape. |
| size | `"sm" \| "md"` | `"md"` | Component size. |
| href | `string` | - | Makes the whole badge a focusable link. |
| target | `string` | - | Link target; `_blank` adds `rel="noreferrer noopener"` unless explicitly overridden. |
| rel | `string` | - | Explicitly overrides the `rel` added above. |
| className | `string` | - | Custom class plus forwarded native attributes. |

### ShieldBadgeGroup

| Name | Type | Default | Description |
|------|------|------|------|
| gap | `"sm" \| "md"` | `"sm"` | Badge spacing with wrapping on narrow screens. |

### compactCount(value, digits?)

Formats stars and downloads as stable badge notation such as `999`, `1.5k`, `12k`, or `3.4M`. Values at least 10 in a unit are rounded, and `999_999` carries to `1M`. It deliberately avoids locale-sensitive `Intl.NumberFormat` compact notation.

## Examples
```tsx
// README badge row
<ShieldBadgeGroup>
  <ShieldBadge label="@hulianui/ui" value="v0.17.0" icon={<NpmMark />} />
  <ShieldBadge label="downloads" value={`${compactCount(1500)}/month`} />
  <ShieldBadge label="license" value="MIT" />
  <ShieldBadge label="CI" value="failing" tone="danger" icon={<GithubMark />} />
  <ShieldBadge label="stars" value={compactCount(4)} href="https://github.com/hulianui/hulian" target="_blank" />
</ShieldBadgeGroup>

// Quiet inline metadata
<ShieldBadge label="node" value=">=22" variant="soft" tone="neutral" size="sm" />
```

## Pitfalls

- Supply brand marks through `icon`; the library does not bundle npm, GitHub, or Discord assets. Slot SVGs are sized and hidden from assistive technology.
- Use [Badge](../badge/badge.md) for an overlaid count; ShieldBadge is an inline metadata sticker.
- Solid custom colors use `--color-primary-foreground`. Verify contrast for medium colors, or use the soft skin.

## Related
[Badge](../badge/badge.md) · [Tag](../tag/tag.md) · [AwardBadge](../award-badge/award-badge.md) · [DeployStatus](../deploy-status/deploy-status.md) · [GitCommit](../git-commit/git-commit.md) · [StatusDot](../status-dot/status-dot.md)
