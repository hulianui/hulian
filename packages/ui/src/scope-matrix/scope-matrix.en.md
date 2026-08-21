---
slug: scope-matrix
name: ScopeMatrix
category: forms
group: advanced
tags: []
exports: [ScopeMatrix]
status: enriched
---

# ScopeMatrix

> Scope editor · opposing allow/deny pattern buckets + plain-language summary of the effective scope · forms/advanced

## When to use

Use ScopeMatrix when users must define an effective scope from opposing allow and deny patterns, such as:

- Permission or allowlist configuration.
- Paths a task or operation may change.
- Route guards, file-sync scopes, or CI trigger paths.

## When not to use

| Scenario | Use instead | Why |
|---|---|---|
| Moving items from a fixed candidate pool | `Transfer` | Candidates form a closed set; users select but cannot create them. |
| Free entry of one-dimensional labels | `TagInput` | The values do not have opposing allow/deny semantics. |

## Example

```tsx
import { ScopeMatrix } from "@hulianui/ui";

const [scope, setScope] = useState({ allow: ["src/**"], deny: ["**/dist/**"] });

<ScopeMatrix
  allow={scope.allow}
  deny={scope.deny}
  onChange={setScope}
  suggestions={derivedFromProject}
/>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `allow` | `string[]` | - | Allow patterns; an empty array disables allowlisting. |
| `deny` | `string[]` | - | Deny patterns. |
| `onChange` | `(next: { allow, deny }) => void` | - | Called with both buckets; omitting it makes the component read-only. |
| `suggestions` | `string[]` | `[]` | Suggested patterns that populate the input when clicked. |
| `readOnly` | `boolean` | `false` | Forces read-only mode. |
| `validate` | `(pattern) => string \| null` | - | Returns an error message for an invalid pattern, or `null`. |
| `allowLabel` / `denyLabel` | `ReactNode` | `"\u5141\u8bb8"` / `"\u7981\u6b62"` | Bucket headings; the built-in Chinese copy means “Allow” and “Deny.” |
| `allowHint` / `denyHint` | `ReactNode` | See defaults | Guidance shown below each bucket. |
| `placeholder` | `string` | `"\u8f93\u5165\u6a21\u5f0f\u540e\u56de\u8f66"` | Input placeholder; the built-in Chinese copy means “Enter a pattern, then press Enter.” |

## Usage guidelines

**The summary is the component's central feature.** Two allow/deny lists are easy to build, but their combined behavior is easy to misunderstand:

1. **Deny takes precedence over allow.** A pattern matching both buckets is denied.
2. **An empty allow list does not deny everything.** It disables allowlisting, leaving only the deny list in effect.

Misrepresenting the second rule can make a valid configuration appear to block everything. The component therefore states the current effective behavior in plain language instead of relying on external documentation.

**Pattern syntax is not built in.** Glob, regular-expression, Ant-style, and custom DSL rules differ too much for the component to guess. Pass `validate` when syntax validation is required.

**Clicking a suggestion only fills the input; it does not submit it.** Suggested patterns often need adjustment before addition, such as changing depth or adding a suffix.
