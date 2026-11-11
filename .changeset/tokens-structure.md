---
"@hulianui/ui": minor
"@hulianui/tokens": minor
---

feat(tokens): 补齐颜色之外的结构令牌，修正亮色 hover 对比度，并把控件圆角与容器圆角分开。**有视觉变化**，升级后请过一遍自己的页面。

**悬停对比度（修复）**：亮色下五个语义色的 `--color-*-hover` 此前取的是更亮的一档，实心按钮悬停时白字对比从 5.8–7.0 掉到 3.5–4.05，全部够不到 AA 4.5。现在两个主题都朝更深走一步（亮色 700 → 新增的 800 档），悬停时白字对比为 8.1–9.4。新增原语 `--brand-800` / `--danger-800` / `--success-800` / `--warning-800` / `--info-800`。

**结构令牌（新增）**：`--hl-radius-control`、`--hl-control-h-xs/sm/md/lg`、`--hl-duration-fast/base/slow`、`--hl-opacity-disabled`、`--hl-text-2xs/3xs`、`--hl-z-overlay`，默认值见 `packages/tokens/README.md`。组件里对应的字面量（`h-10`、`duration-300`、`disabled:opacity-50`、`text-[11px]`、`z-50`）全部改成带回退的任意值，例如 `h-[var(--hl-control-h-md,2.5rem)]`；回退值等于默认值，所以 `@hulianui/ui` 配旧版 tokens 时渲染不变。用 `className` 覆盖的写法（`h-auto`、`rounded-full`、`z-10`）照常生效。

**控件圆角 8px**：按钮、输入框、选择器触发器、分段轨道、Tab、图标按钮、侧栏菜单项从 `--radius`（10px）改为 `--hl-radius-control`（默认 `--radius` 的 0.8 倍）；Segmented / Tabs 的滑块随之减到 4px 保持同心。容器（Card / Dialog / Popover）不变。想保持旧观感：`:root { --hl-radius-control: var(--radius); }`。

**中性色**：灰阶色相从 286° 并到品牌轴 258°；亮端梯子改为等步长（`--gray-50` 0.985 → 0.98，`--gray-100` 0.967 → 0.96），卡片与页底的亮度比从 1.04 升到 1.06，hover 底与静息底从 1.10 升到 1.12。

**其它**：`--radius` 从亮色主题块挪到 `:root`，嵌套的亮色岛不再把消费方改过的圆角重置回默认值。7 处 `disabled:opacity-40` 统一到 `--hl-opacity-disabled`（0.5）。Select 多选标签此前用了未定义的 `bg-surface-raised`（没有底色），改为 `bg-surface-hover`。`ShimmerButton` 的 `borderRadius` 默认值改为 `var(--hl-radius-control, var(--radius))`。

写了 `.fixed.z-50` 这类选择器去找瑚琏浮层的测试需要改：类名现在是 `z-[var(--hl-z-overlay,50)]`。

<!-- changelog-en:start -->
feat(tokens): add the structural tokens beyond color, fix light-theme hover contrast, and separate control radius from container radius. **This changes how things look**, so review your pages after upgrading.

**Hover contrast (fix)**: in the light theme the five `--color-*-hover` tokens used a lighter step, so white text on a hovered solid button dropped from 5.8–7.0 to 3.5–4.05, all below AA 4.5. Both themes now move one step darker (light 700 → the new 800 step), and white text on hover measures 8.1–9.4. New primitives: `--brand-800`, `--danger-800`, `--success-800`, `--warning-800`, `--info-800`.

**Structural tokens (new)**: `--hl-radius-control`, `--hl-control-h-xs/sm/md/lg`, `--hl-duration-fast/base/slow`, `--hl-opacity-disabled`, `--hl-text-2xs/3xs`, `--hl-z-overlay`; defaults are listed in `packages/tokens/README.md`. The matching literals in components (`h-10`, `duration-300`, `disabled:opacity-50`, `text-[11px]`, `z-50`) are now arbitrary values with a fallback, such as `h-[var(--hl-control-h-md,2.5rem)]`; the fallback equals the default, so `@hulianui/ui` renders the same with an older tokens release. `className` overrides such as `h-auto`, `rounded-full`, and `z-10` still win.

**Control radius is 8px**: buttons, inputs, select triggers, segmented tracks, tabs, icon buttons, and sidebar menu items move from `--radius` (10px) to `--hl-radius-control` (0.8× `--radius` by default); the Segmented and Tabs thumbs drop to 4px to stay concentric. Containers (Card, Dialog, Popover) are unchanged. To keep the old look: `:root { --hl-radius-control: var(--radius); }`.

**Neutrals**: the gray hue moves from 286° to the brand axis at 258°; the light end now uses even steps (`--gray-50` 0.985 → 0.98, `--gray-100` 0.967 → 0.96), raising the card-to-page luminance ratio from 1.04 to 1.06 and hover-to-rest from 1.10 to 1.12.

**Other**: `--radius` moves from the light theme block to `:root`, so a nested light island no longer resets a radius you changed. Seven `disabled:opacity-40` uses now follow `--hl-opacity-disabled` (0.5). Select multi-value tags used the undefined `bg-surface-raised` (no background) and now use `bg-surface-hover`. `ShimmerButton` defaults `borderRadius` to `var(--hl-radius-control, var(--radius))`.

Tests that find Hulian overlays with selectors such as `.fixed.z-50` need updating: the class is now `z-[var(--hl-z-overlay,50)]`.
<!-- changelog-en:end -->
