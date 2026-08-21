---
slug: beian-footer
name: BeianFooter
category: navigation
group: global
tags: []
exports: [BeianFooter]
status: enriched
---

# BeianFooter

> Renders Chinese filing and public-security registration links in a compliant footer. · navigation/global

## When to use

Use BeianFooter when a website operated in mainland China must display ICP registration, public-security registration, and copyright information in its footer. Record numbers link to the official MIIT and MPS lookup sites by default. This component is specifically a regulatory footer; use [Navbar](../navbar/navbar.md) for global top navigation or [NavMenu](../nav-menu/nav-menu.md) for a sidebar tree.

## Import
```ts
import { BeianFooter } from "@hulianui/ui"
```

## Props

`IcpRecord` is `{ number: string; href?: string }`; `PoliceRecord` has the same shape. Omitting `href` uses the corresponding official lookup URL.

| Name | Type | Default | Description |
|------|------|------|------|
| icp | `IcpRecord[]` | - | One or more ICP registration numbers, including multiple sites such as `-1` and `-2` under one entity. Links to beian.miit.gov.cn by default. |
| police | `PoliceRecord` | - | Public-security registration number shown with a police badge icon. Links to beian.mps.gov.cn by default. |
| className | `string` | - | Additional class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icpLabel | `ReactNode` | Prefix before the ICP records. The built-in Chinese copy is `"\u0049\u0043\u0050\u5907\u6848"`, meaning “ICP registration.” |
| copyright | `ReactNode` | Copyright or supplementary footer content. |

## Example
```tsx
// Complete footer: multiple ICP records, public-security registration, and copyright
<BeianFooter
  icp={[{ number: "Min ICP No. 2024073556-1" }, { number: "Min ICP No. 2024073556-2" }]}
  police={{ number: "Min Public Security No. 35030302900030" }}
  copyright="© 2026 Hulian · Abel"
/>

// A single ICP record only
<BeianFooter icp={[{ number: "Min ICP No. 2024073556-1" }]} />
```

## Usage guidelines

- The displayed registration number must exactly match the record in the MIIT or public-security system, including suffixes such as `-1` or `-2`; otherwise the linked lookup result will not match.
- Client component (`"use client"`): its labels come from the Locale context, and reading that
  context requires the client. It can still be nested inside a server page, but it does land in
  the client bundle.
- External record links always open in a new window (`target="_blank"` + `rel="noreferrer"`).

## Related
[Navbar](../navbar/navbar.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
