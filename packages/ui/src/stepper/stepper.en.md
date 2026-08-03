---
slug: stepper
name: Stepper
category: navigation
group: inpage
tags: []
exports: [Stepper]
status: enriched
---

# Stepper

> Stepper · Dependency-free flex layout, drawn completion checkmarks, progress-aware connectors, and `aria-current` · navigation/inpage

## When to use

Use Stepper for a minimal horizontal progress indicator controlled by `steps` and `activeStep`. Choose [Steps](../steps/steps.md) when you need vertical layout, clickable steps, descriptions, custom icons, or explicit status. Stepper is the lighter option for display-only progress.

## Import
```ts
import { Stepper } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| steps* | `StepItem[]` | — | Steps in the shape `{ label: ReactNode }`. |
| activeStep* | `number` | — | Controlled zero-based current step. A value at least `steps.length` marks every step complete. |
| className | `string` | — | Additional class name. |

The progress container has the built-in Chinese `aria-label` `"\u6b65\u9aa4\u8fdb\u5ea6"`, meaning “Step progress.”

## Example
```tsx
const steps = [{ label: "Order" }, { label: "Payment" }, { label: "Shipping" }, { label: "Complete" }];

<Stepper steps={steps} activeStep={1} />
```

## Usage guidelines

- `activeStep` is controlled and zero-based. An index below it is complete and an equal index is active. Pass `activeStep={steps.length}` to represent full completion.
- The API is intentionally limited to `steps` and `activeStep`. Use Steps for vertical orientation, click-to-jump behavior, descriptions, or custom icons.
- State hooks are `aria-current="step"` and `data-state="completed|active|pending"`, not MUI's `.Mui-active` class.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
