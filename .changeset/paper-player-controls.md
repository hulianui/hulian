---
"@hulianui/ui": minor
---

feat(paper): 图播放器补齐播放能力，控件与演示界面都能收起来。

- **ProcessFigure**：新增 `autoPlay` —— 图进视口自己开播，滚出视口暂停、滚回来续播；读者按过暂停，或从正文引用 / 卡片上的定位按钮改了状态，就由读者接管，不再自动恢复；`prefers-reduced-motion: reduce` 下不自动播。新增 `loop`：播到最后一步回到第一步继续（默认仍是播完停下）。新增 `speeds` / `defaultSpeed`：倍速档位，控件上显示为 `1×` 这种按钮，点一下换下一档，`interval` 仍是原速基准。步骤控件因此多了循环开关与倍速按钮。
- **PaperFigure**：新增 `hideCaption` / `hideDescription`，不渲染图注或图注第二行的状态说明（图号照常递增，后面的图不跳号）；新增 `collapsibleControls` / `defaultControlsCollapsed`，控件行可收起 —— 收起后不占一行（图下不再有按钮带），只剩图角上一个悬停 / 键盘聚焦才现的「显示控件」（触屏常显）；播放器不卸载，收起状态下自动播放照常走。
- **PaperPresenter**：新增 `hideChrome`，放映时可以只留幻灯片画面；顶栏的「隐藏界面」把标题、页码、退出与翻页条一并收走，画面右上角的「显示界面」随时唤回。

<!-- changelog-en:start -->
feat(paper): the figure player gains the playback capabilities, and both the controls and the presenter interface can be folded away.

- **ProcessFigure**: new `autoPlay` starts playback once the figure scrolls into view, pauses off-screen and resumes on return. A reader who pressed pause, or who changed the state from a `FigRef` or a locate-stage button, takes over and autoplay stops for good; it never starts under `prefers-reduced-motion: reduce`. New `loop` starts over after the last step (stopping at the end is still the default). New `speeds` / `defaultSpeed` add speed steps, shown as a `1×` button in the controls that cycles through them, with `interval` still the base speed. The step controls therefore gain a loop toggle and a speed button.
- **PaperFigure**: new `hideCaption` / `hideDescription` drop the caption or just its second line (figure numbers keep advancing, so later figures are not renumbered); new `collapsibleControls` / `defaultControlsCollapsed` fold the control row away entirely — no leftover strip under the figure, just a "Show controls" button in the figure corner revealed on hover or keyboard focus (always visible on touch). The player stays mounted, so autoplay keeps running while the controls are hidden.
- **PaperPresenter**: new `hideChrome` leaves only the slide on screen. "Hide interface" in the top bar folds away the title, counter, exit and pager; "Show interface" in the top-right corner brings them back at any time.
<!-- changelog-en:end -->
