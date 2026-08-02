---
slug: code-review-thread
name: CodeReviewThread
category: data-display
group: collection
tags: []
exports: [CodeReviewThread, severityStyle, SEVERITY]
status: enriched
---

# CodeReviewThread

> A code-review discussion thread with severity, AI or human authors, adoptable inline diffs, replies, resolution states, and collapsing.

## When to use

Use CodeReviewThread for a complete discussion around a code section: multi-turn AI or human comments, severity, suggested diffs, replies, and resolution state. Use [CodeDiff] for a plain line diff, or compose Avatar and a list for general comments without review semantics.

## Import
```ts
import { CodeReviewThread, severityStyle, SEVERITY } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| comments* | `ReviewComment[]` | — | Thread comments with author kind, severity, body, and optional suggestion. |
| status | `"open"\|"resolved"\|"wontfix"` | `open` (internally managed) | Controlled thread status when supplied. |
| replyable | `boolean` | `true` | Shows the reply field. |
| defaultCollapsed | `boolean` | `false` | Initial uncontrolled collapsed state. |
| collapsed | `boolean` | — | Controlled collapsed state, taking precedence over `defaultCollapsed`. |
| className | `string` | — | Custom class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onStatusChange | `(s: ReviewThreadStatus) => void` | Reports status changes for controlled state. |
| onReply | `(text: string) => void` | Fires when a reply is submitted. |
| onAdoptSuggestion | `(commentId: string) => void` | Fires when a suggested change is adopted. |
| onCollapsedChange | `(v: boolean) => void` | Reports collapse changes for controlled state. |

## Examples
```tsx
const comments = [
  {
    id: "c1",
    author: { name: "AI reviewer", kind: "ai" },
    severity: "critical",
    body: "Guard against a null user so the signed-out state does not crash.",
    time: "Just now",
    suggestion: {
      oldText: "const name = user.profile.name;",
      newText: 'const name = user?.profile?.name ?? "";',
    },
  },
];

<CodeReviewThread comments={comments} />
```

Render a resolved thread:
```tsx
<CodeReviewThread comments={comments} status="resolved" />
```

## Pitfalls

Both `status` and `collapsed` become controlled when supplied. Pair them with `onStatusChange` and `onCollapsedChange`, respectively, or interactions cannot persist. `collapsed` overrides `defaultCollapsed`; do not treat both as active state.

The built-in interface remains Chinese at runtime. Severity labels are `"\u4e25\u91cd"` ("Critical"), `"\u91cd\u8981"` ("Major"), `"\u6b21\u8981"` ("Minor"), and `"\u63d0\u793a"` ("Info"). Thread copy includes `"\u5efa\u8bae\u4fee\u6539"` ("Suggested change"), `"\u91c7\u7eb3\u5efa\u8bae"` ("Adopt suggestion"), `` `${comments.length} \u6761\u6279\u6ce8` `` ("N comments"), `"\u5df2\u89e3\u51b3"` ("Resolved"), `"\u8bef\u62a5"` ("False positive"), `"\u6807\u8bb0\u5df2\u89e3\u51b3"` ("Mark resolved"), `"\u91cd\u65b0\u6253\u5f00"` ("Reopen"), `"\u56de\u590d\u8fd9\u6761\u6279\u6ce8\u2026"` ("Reply to this comment..."), and `"\u56de\u590d"` ("Reply").

## Related

Built-in severity, status, suggestion, and reply labels follow `ConfigProvider`; comment bodies and authors remain business data.
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
