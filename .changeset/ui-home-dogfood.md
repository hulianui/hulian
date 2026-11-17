---
"@hulianui/ui": minor
---

feat: 文档站首页与顶栏改为全部由组件构成，此前写在站点本地的视觉补丁回流成组件能力。新增 5 个组件、3 个子件导出，补齐 14 个组件的 prop；所有新 prop 的默认值都不改变存量渲染（ColorSwatchPicker 选中外环一处除外，见下）。

- **新组件**：`AccentScope`（局部换主色色相，配 tokens 的 `[data-accent-scope]`）· `IconTile`（功能 / 通知文字左边的图标方块，三尺寸 × 三变体 × 六语义色 + 分类色）· `SectionHeader`（eyebrow + 分节大标题 + 主色强调半句 + 导语）· `WindowFrame`（三色点标题栏的应用窗口外框）· `FadeMask`（把内容向一边或从中心向四周淡出到透明）。
- **新子件**：`CommandTrigger`（搜索框样子的命令面板入口，`shape="pill"`、`collapseBelow` 窄屏收成图标钮）· `NavbarMenu`（窄屏折叠菜单，与 `NavbarMenuToggle` 同一个 `breakpoint`）· `SnippetGroup`（多条命令堆叠在同一张卡里，`overlay` 放 BorderBeam 等装饰层）。
- **Tabs**：`TabsList variant="card"`（带描述的卡片 tab，竖排纵向堆叠）；`Tabs autoPlay={ms}` 自动轮播，选中 tab 底部进度条走满即换，悬停 / 聚焦 / 不在视口时暂停，减弱动效时不启用，访客选过一次即停。
- **Card**：`variant="primary"`（主色渐变底，自动挂 `data-surface="inverse"`，卡内组件自动反色）、`interactive`、`render`（整卡渲染成链接）。
- **Navbar**：`size="sm"`、`variant="page"`；`NavbarItem variant="soft"`（选中铺主色浅底，链接整块可点）；`NavbarMenuToggle breakpoint`。
- **Brand**：`variant="bare"`（无徽章底）、`maskSrc`（单色 logo 按形状着色，跟随主题色 / AccentScope）。
- **Segmented**：`shape="pill"`；段可给 `render`（如 `<a href>`），整组按链接组处理（`role="group"` + `aria-current="page"`）。
- **Tag**：`shape="pill"`、`render`（可点标签）。**Link**：`tone="muted"`、`arrow`。**Heading**：`size="display"`。
- **AnimatedThemeToggler**：`variant="ghost"`、`size="sm"`（与 Button `iconSm` 同高）。
- **Progress**：`tone="inverse"`（彩色卡上的白条）。**Avatar**：`tone="brand"`、`ring`。**Snippet**：`muted` 次要行。**Spotlight**：`blend="transparent"`、`size` 两值为椭圆。
- **ColorSwatchPicker**：`shape="circle"`。选中外环由 `ring-offset` 改为 `outline-offset`：间隙从「画出来的页面底色」变成透明，放在卡片上不再露出一圈与卡面不同的底色（页面底上视觉不变）。

<!-- changelog-en:start -->
feat: the docs homepage and navbar are now built entirely from components, and the visual patches that lived in the site are now component features. Adds 5 components and 3 sub-component exports and fills in props on 14 components. No new prop default changes existing rendering, except the ColorSwatchPicker selected ring noted below.

- **New components**: `AccentScope` (changes the accent hue of one region, paired with the tokens' `[data-accent-scope]`) · `IconTile` (the icon square left of feature or notification text: three sizes × three variants × six tones, plus category colors) · `SectionHeader` (eyebrow, section title, accented second half, and lead text) · `WindowFrame` (an app window with a traffic-light title bar) · `FadeMask` (fades content to transparency toward one edge or from the center outward).
- **New sub-components**: `CommandTrigger` (a search-field-style entry to the command palette; `shape="pill"`, and `collapseBelow` turns it into an icon button on narrow screens) · `NavbarMenu` (the collapsed menu for narrow screens, sharing `breakpoint` with `NavbarMenuToggle`) · `SnippetGroup` (several commands stacked in one card; `overlay` holds decorations such as BorderBeam).
- **Tabs**: `TabsList variant="card"` (card tabs with descriptions, stacked when vertical); `Tabs autoPlay={ms}` advances automatically, switching when the bar under the selected tab fills. It pauses on hover, on focus, and off screen, is disabled under reduced motion, and stops once the visitor picks a tab.
- **Card**: `variant="primary"` (a primary gradient that sets `data-surface="inverse"`, so components inside switch to inverse colors), `interactive`, and `render` (the whole card as a link).
- **Navbar**: `size="sm"` and `variant="page"`; `NavbarItem variant="soft"` (the active item gets the accent's subtle background and the link fills the pill); `NavbarMenuToggle breakpoint`.
- **Brand**: `variant="bare"` (no badge) and `maskSrc` (a single-color logo filled by its shape, following the theme color and AccentScope).
- **Segmented**: `shape="pill"`; segments can set `render` (such as `<a href>`), turning the group into a set of links (`role="group"` + `aria-current="page"`).
- **Tag**: `shape="pill"` and `render` (clickable tags). **Link**: `tone="muted"` and `arrow`. **Heading**: `size="display"`.
- **AnimatedThemeToggler**: `variant="ghost"` and `size="sm"` (the same height as Button `iconSm`).
- **Progress**: `tone="inverse"` (a white bar on colored cards). **Avatar**: `tone="brand"` and `ring`. **Snippet**: `muted` secondary rows. **Spotlight**: `blend="transparent"`, and two values in `size` give an ellipse.
- **ColorSwatchPicker**: `shape="circle"`. The selected ring now uses `outline-offset` instead of `ring-offset`, so the gap is transparent rather than painted with the page background, and no longer shows a mismatched band on cards (unchanged on the page background).
<!-- changelog-en:end -->
