---
slug: comment
name: Comment
category: data-display
group: info
tags: []
exports: [Comment, CommentActions, CommentAction, commentActionVariants]
status: enriched
---

# Comment

> Displays nested comments with reply indentation, optional connectors, and action slots.

## When to use

Use Comment to mix discussion replies, ticket comments, and system activity. `type="comment"` renders body content as a comment, while `type="log"` creates a muted inline log. [[User](../user/user.md)] fits the author area, and RelativeTime fits timestamps.

## Import
```ts
import { Comment, CommentActions, CommentAction, commentActionVariants } from "@hulianui/ui"
```

## Props

### Comment

**Props**

| Name | Type | Default | Description |
|------|------|------|------|
| avatar | `AvatarProps` | - | Props for Avatar; ignored by log entries in favor of a system marker. |
| type | `"comment" \| "log"` | `"comment"` | Entry presentation. |
| connector | `boolean` | `false` | Draws a left connector beside nested comments. |
| className | `string` | - | Remaining `HTMLAttributes<HTMLElement>` after omitting `content` and `title`. |

**Slots**

| Slot | Type | Description |
|------|------|------|
| author* | `ReactNode` | Author name or composed User. |
| datetime | `ReactNode` | Relative or absolute timestamp. |
| content | `ReactNode` | Body below a comment, or inline after a log author. |
| actions | `ReactNode` | Like or reply controls, commonly composed with CommentAction. |
| children | `ReactNode` | Nested Comment replies with automatic indentation and optional connectors. |

### CommentAction

**Props**

| Name | Type | Default | Description |
|------|------|------|------|
| href | `string` | - | Renders a Hulian Link when set, otherwise a `<button>`. |

**Slots**

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Action content; remaining button attributes are forwarded. |

## Examples
```tsx
const actions = (
  <>
    <CommentAction>Like 12</CommentAction>
    <CommentAction href="#reply">Reply</CommentAction>
  </>
)
<Comment author="Hulian" datetime="2 hours ago" avatar={{ fallback: "H" }} content="The ticket is assigned." actions={actions} connector>
  <Comment author="Alex" datetime="1 hour ago" avatar={{ fallback: "A" }} content="Received; investigating now." />
</Comment>
```
```tsx
// Mixed system log
<Comment type="log" author="System" content="changed the ticket to In progress" datetime="Yesterday at 14:25" />
```

## Pitfalls

- Log entries ignore `avatar` and render `content` inline. Use the default type for avatar-and-body comments.
- Place nested Comment instances in `children`; indentation is automatic, while connectors require `connector`.
- `href` decides whether CommentAction is a Link or button. Use a link for anchor navigation and a button for interactions.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
