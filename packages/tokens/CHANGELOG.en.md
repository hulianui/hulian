# @hulianui/tokens

## 0.3.0

### Minor Changes

- 48c9f9a: Add tokens for `Annotation`, including the short `--hl-annotation-font` handwritten font stack and inherited animatable `--hl-ann-hue` property for rainbow tones.

### Patch Changes

- 4237cf3: Increase text and surface contrast for primary, danger, success, and warning semantic colors in both themes, and add reusable light and dark steps for danger and warning.

- 9f2ad65: Upgrade safe dependencies within semver ranges, update component runtime dependencies, and align the Tiptap package family to remove peer-version warnings.

## 0.2.0

### Minor Changes

- 8ff9043: Unify motion tokens and utilities: share the easing source of truth, add `--ease-drawer`, align default transitions, and support consistent trigger origins and press feedback.

## 0.1.2

### Patch Changes

- 549d24b: Document that `--color-hairline` is only for `border-*`. It is transparent in light mode, so using it for `text-*`, `bg-*`, or `fill-*` silently hides content; use `--color-border` or `--color-muted` instead.

## 0.1.1

### Patch Changes

- Add theme-aware `--color-hairline`, transparent in light mode and mapped to border in dark mode, so elevated surfaces avoid double borders in light mode and retain outlines in dark mode. <!-- parity-id: tokens-0.1.1-hairline -->
