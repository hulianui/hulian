---
"@hulianui/tokens": minor
---

修 #101：主题局部覆盖现在两个方向都成立（亮页里嵌暗岛、暗页里嵌亮岛）

亮色此前只是 `:root` 上的默认值，不是一个可选择的主题。于是覆盖只有单向：亮页里嵌 `<div data-theme="dark">` 能生效（暗块自己匹配得上规则），暗页里嵌 `<div data-theme="light">` **完全无效**（没有对应规则，子树继续继承祖先的暗色变量）。CodeEditor 的 `theme` 逃生口、PreviewSandbox 的固定配色预览、文档站里并排展示明暗两态的对照卡，都卡在这一条上。

两处改动：

1. `semantic.css` 的亮色块改挂 `:root, [data-theme="light"]`。两条选择器特异性相同，而 `[data-theme="dark"]` 在源码里靠后，所以根节点标 dark 时仍然是暗色赢；嵌套亮色岛因为自己匹配上了规则，能覆盖继承来的暗色值。
2. `preset.css` 的 `dark` variant 改按**最近的主题祖先**判定，岛内的 `dark:` 工具类跟着岛走而不是跟着页面走。

第 2 点最后没有采用 issue 里提的 `:not([data-theme="light"] *)` 排除写法 —— 真实浏览器实测发现它会反过来打断「**显式**亮页 → 暗岛」这个每天都在跑的组合（`ThemeProvider` 会把 `light` 显式写在 `<html>` 上，于是暗岛内部同时也是 `[data-theme="light"] *`，`dark:` 工具类全部失效）。选择器表达不了「最近」，所以改判一个由继承传播的 `--hl-theme`：

```css
@custom-variant dark {
  &:where([data-theme="dark"]) { @slot; }          /* 岛根自己（@container 查的是父容器） */
  @container style(--hl-theme: dark) { @slot; }     /* 其余元素看最近祖先 */
}
```

任意嵌套深度都正确，包括「暗页 → 亮岛 → 再嵌暗岛」。

**基线**：style container query（Chrome 111 / Safari 18 / Firefox 128）。本库已经在依赖 `:has()` 与 `@container`，属同代能力。

**体积代价**：每条 `dark:` 工具类从一条规则变成两条。实测扫全库源码编译出来是 276.7KB → 278.0KB（**+1.3KB / +0.5%**）—— 之所以这么小，是因为组件基本不写 `dark:`（语义 token 自己换值，这正是 token 层存在的意义）。

验收按 issue 要求走了真实浏览器双向比对（Chrome，computed style + 截图），四种组合逐条核对：根默认亮页→暗岛、显式亮页→暗岛、暗页→亮岛、暗→亮→暗三层嵌套。岛内的 `dark:` 工具类、`shadow-*`（`--hl-shadow-*`）、`--color-hairline`（亮色 transparent / 暗色可见细线）与 `color-scheme` 全部跟着岛走；`[data-surface="inverse"]` 叠在亮岛里的行为一并确认正常（它只重映射中性色，与主题岛不冲突）。

顺带堵住一个静默失败：`registry.json` 注入组件用的 `cssVars` 是从 `semantic.css` 正则抠出来的，选择器一改就悄无声息地把 light 抠成空（注入的组件页面能跑，只是全是默认色）。现在解析不出变量会直接报错。
