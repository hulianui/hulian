---
slug: intercept-card
name: InterceptCard
category: feedback
group: message
tags: []
exports: [InterceptCard]
status: enriched
---

# InterceptCard

> Interception card · Explains which rule blocked an action, where the rule came from, what violated it, how to comply, and whether an override is available · feedback/message

## When to use

- Explain and optionally override a policy or permission block.
- Review a risk-control match manually.
- Present a compliance failure, rejected approval, or alert acknowledgment.

## When not to use

| Scenario | Use | Why |
|---|---|---|
| One-sentence message | `Alert` | It has no provenance or action and can be read at a glance. |
| Full-page outcome | `Result` | The outcome is the page's primary content. |
| Field-level validation | `Field` error state | Feedback belongs next to the field and does not need a card. |

## Usage

```tsx
import { InterceptCard } from "@hulianui/ui";

<InterceptCard
  severity="block"
  title="Parallel subtask limit"
  message="A session can run at most two parallel subtasks"
  source="Team policy · Hard constraint 4"
  violation="This is the third subtask"
  suggestion="Wait for one of the first two tasks to finish"
  onOverride={async (reason) => api.override(id, reason)}
/>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `severity` | `"block" \| "confirm" \| "notice"` | — | Interception severity. Built-in Chinese badges are `"\u5df2\u62e6\u622a"` (“Blocked”), `"\u5f85\u786e\u8ba4"` (“Confirmation required”), and `"\u63d0\u9192"` (“Notice”). |
| `title` | `ReactNode` | — | Rule name or reason. |
| `message` | `ReactNode` | — | Original rule text or explanation. |
| `source` | `ReactNode` | — | Provenance; strongly recommended. |
| `violation` | `ReactNode` | — | Specific violation, rendered in monospace. |
| `suggestion` | `ReactNode` | — | Recommended compliant alternative. |
| `onOverride` | `(reason: string) => void \| Promise<void>` | — | Renders the override flow when provided. |
| `overrideLabel` | `ReactNode` | `"\u653e\u884c\u672c\u6b21"` | Override-button copy. The built-in Chinese text means “Override this time.” |
| `overridePlaceholder` | `string` | `"\u4e3a\u4ec0\u4e48\u8fd9\u6b21\u53ef\u4ee5\u653e\u884c\uff1f\uff08\u5fc5\u586b\uff0c\u4f1a\u8fdb\u5165\u5ba1\u8ba1\u8bb0\u5f55\uff09"` | Required-reason placeholder. The built-in Chinese copy asks why this override is permitted and notes that the answer enters the audit record. |
| `overridden` | `{ reason, at? }` | — | Existing override reason and optional time. |

## Design decisions

**Provenance is first-class.** When an interception cannot identify its source, people are more likely to dismiss it than follow it. `source` is optional in the type, but omitting it removes much of the component's value.

**An override reason is required and enforced.** The confirmation control stays disabled for an empty reason, and `onOverride` is never called. An unexplained exception cannot be audited later.

**The left border is the sole severity anchor.** Tinting the entire card would turn a list of interceptions into large color blocks and make severity harder to scan.

**Override takes two steps.** Selecting the built-in override action first reveals the reason field; it does not immediately apply the exception. A consequential action should not happen in one accidental click. The remaining built-in Chinese controls are `"\u786e\u8ba4\u653e\u884c"` (“Confirm override”), `"\u5904\u7406\u4e2d\u2026"` (“Processing…”), and `"\u53d6\u6d88"` (“Cancel”).
