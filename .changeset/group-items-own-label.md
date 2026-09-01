---
"@hulianui/ui": patch
---

修复：`CheckboxGroup` / `RadioGroup` 放进 `Field` 时，组内每个 `Checkbox` / `Radio` 的无障碍名都被 `Field` 标签吞掉（读屏念出 N 个同名项）。现在组内每项由自己的 `label` 命名，`Field` 标签命名整个组，description / error 仍到达每一项（内部用 Base UI `Field.Item`，只在「组内且 Field 内」才包）。不在组内的单个 `Checkbox` 仍由 `Field` 标签命名，行为不变。

<!-- changelog-en:start -->
Fix: when a `CheckboxGroup` / `RadioGroup` sits inside a `Field`, every `Checkbox` / `Radio` in the group used to take the `Field` label as its accessible name (screen readers announced N identically named items). Each item is now named by its own `label`, the `Field` label names the group, and description / error still reach every item (Base UI `Field.Item` under the hood, applied only inside a group within a `Field`). A single `Checkbox` inside a `Field` (not in a group) is still named by the `Field` label, unchanged.
<!-- changelog-en:end -->
