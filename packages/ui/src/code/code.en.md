---
slug: code
name: Code
category: typography
group: code
tags: []
exports: [Code, codeVariants]
status: enriched
---

# Code

> Inline code · Monospace `<code>` styling with default, primary, and danger tones + RSC · typography/code

## When to use

Use Code for inline commands, identifiers, or paths with monospace styling and semantic tones. It can render directly in an RSC. Use [CodeBlock](../code-block/code-block.md) for multiline syntax-highlighted code, [Snippet](../snippet/snippet.md) for a copyable command, or [Kbd](../kbd/kbd.md) for keyboard keys.

## Import
```ts
import { Code, codeVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"default" \| "primary" \| "danger"` | `"default"` | Color tone: Default/Main color (emphasis)/Danger (destructive command) |

All remaining native `<code>` (`HTMLElement`) attributes are supported. `codeVariants` is a CVA function for reusing the same styles on custom elements.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Code content |

## Examples
```tsx
<span className="text-sm text-foreground">Run <Code>pnpm install</Code> to install dependencies.</span>

<Code tone="danger">rm -rf</Code>
```

## Usage guidelines

No component-specific caveats are currently documented.

## Related
[CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
