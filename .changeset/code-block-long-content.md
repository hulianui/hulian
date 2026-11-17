---
"@hulianui/ui": minor
---

feat(code-block / markdown / code / kbd / prose / snippet / code-diff / segmented / curved-loop / table): 代码展示美学与长内容体验，外加一批视觉缺陷修复。

- **CodeBlock**：有 `lang` 时渲染标题栏（左侧语言名、右侧操作区），不再靠 `pt-8` 让位浮字；无 `lang` 时操作区悬浮在右上角，悬停 / 键盘聚焦时出现（触屏常显），复制按钮不再压住首行。代码区换成比 surface 沉半档的底色，行号列同色、线条减淡。新增 `defaultWrap`（长行初始换行）；内容真有一行放不下时操作区出现「自动换行」开关。新增 `maxLines`：超出即折叠，底部渐隐 +「展开全部 N 行」，收起时把块顶拉回视口。
- **Markdown**：新增 `codeBlock`，把 `maxLines` / `defaultWrap` / `lineNumbers` 等透传给每个围栏代码块。
- **Code / Prose 行内代码**：去掉 `whitespace-nowrap`，超长路径 / URL 不再撑破窄容器；折行时每截各自带圆角内距。加 `shadow-xs` 轻浮起。
- **Prose 折叠块**：`<summary>` 的原生实心三角换成线性 chevron，展开时旋转朝下。
- **Kbd / KbdGroup**：新增 `tone="primary"`（品牌浅底 + 品牌边），替代文档站首页的 className 覆盖。
- **Snippet / CodeBlock**：复制等图标按钮 hover 改为品牌色高亮。
- **CodeDiff**：文件头从灰带改为 surface 亮底 + 文件图标 + 加粗文件名 + 彩色统计药丸。
- **Segmented**：段内放 Tag 等富内容时不再贴边 —— 等宽改由 grid 实现，各段宽度取最宽那段。
- **CurvedLoop**：viewBox 按曲线与字形实测现算，向上弯（`curveAmount` 负值）时顶部不再被裁；组件高度因此等于文字真实占用高度（默认参数下比以前高）。
- **Table**：外壳自带 `bg-surface`，冻结列与吸顶表头同源，不再借容器背景。

<!-- changelog-en:start -->
feat(code-block / markdown / code / kbd / prose / snippet / code-diff / segmented / curved-loop / table): code display polish and long-content handling, plus a batch of visual fixes.

- **CodeBlock**: with `lang`, a header bar renders (language on the left, actions on the right) instead of a floating label pushed in by `pt-8`. Without `lang`, the actions float in the upper-right corner and appear on hover or keyboard focus (always visible on touch), so the copy button no longer covers the first line. The code area gets a background half a step below surface, and the line-number gutter matches it with a lighter rule. New `defaultWrap` starts long lines wrapped; when a line really overflows, a "Wrap lines" toggle appears. New `maxLines` collapses longer blocks with a bottom fade and a "Show all N lines" button, and collapsing scrolls the block's top back into view.
- **Markdown**: new `codeBlock` passes `maxLines` / `defaultWrap` / `lineNumbers` and similar options to every fenced code block.
- **Code / Prose inline code**: `whitespace-nowrap` is gone, so long paths and URLs no longer push narrow containers wider; wrapped fragments each keep their rounded corners and padding. Adds a light `shadow-xs` lift.
- **Prose details**: the native filled triangle on `<summary>` is replaced by a line chevron that rotates down when open.
- **Kbd / KbdGroup**: new `tone="primary"` (brand subtle fill and border), replacing the className override on the docs homepage.
- **Snippet / CodeBlock**: icon buttons such as copy now highlight in the brand color on hover.
- **CodeDiff**: the file header changes from a gray band to a bright surface with a file icon, a medium-weight file name, and colored stat pills.
- **Segmented**: segments holding rich content such as a Tag no longer touch the edges; equal widths now come from a grid, sized to the widest segment.
- **CurvedLoop**: the viewBox is computed from the curve and measured glyph extents, so upward curves (negative `curveAmount`) are no longer clipped at the top. The component's height now matches the space the text really occupies, which is taller than before with default props.
- **Table**: the shell carries its own `bg-surface`, matching pinned columns and the sticky header instead of borrowing the container background.
<!-- changelog-en:end -->
