---
"@hulianui/ui": minor
---

feat(novel-reader): 三处收口，都是「做阅读产品时才暴露」的缺口。

**`defaultChromeOpen`**：沉浸阅读默认收起顶栏/底栏（点正文中间三档唤出），但做阅读站落地页时，第一眼看到的是**一页没有返回、没有目录、没有设置的白纸**——用户不知道能点什么。新增这个 prop，默认 `false` 与旧行为完全一致；阅读产品首页传 `true`，首屏就带着顶栏（返回、书目、目录、设置）落下。

**纸色是真的纸**：此前 `day` 与 `default` 渲染完全一样（都是 `bg-bg`），`eye` 只是 `bg-success/12` 的一层绿膜，`night` 是纯 `bg-surface` —— 四档名不副实。现在全部从语义色混出来：`day` 偏暖（`warning` 6%）、`eye` 偏青（`success` 11%）、`night` 暗底混 5% 暖色、`oled` 才接近纯黑。换主题时纸色跟着走，不会出现「暗色页面里夹一张雪白纸」。

**纸铺满视口，不铺在 `<article>` 上**：正文只有几百字时，画在 article 上的纸会在最后一行齐刷刷截断——半页米色、半页白，像渲染坏了。纸色与 `data-theme` 一并挂到滚动视口上（视口是满高的），「菜单跟页面 token、纸色只包住正文」这条约束仍然成立。连带把连读模式的内容层定为 `min-h-full`，正文容器才撑得住整屏。

<!-- changelog-en:start -->
feat(novel-reader): three closures, each a gap that only shows up when building a reading product.

**`defaultChromeOpen`**: immersive reading keeps the top and bottom bars collapsed by default (a tap in the middle of the text cycles them in). A reading-site landing page then opens on a blank sheet with no back control, no contents, and no settings, and the reader cannot tell what is tappable. This prop defaults to `false`, matching the previous behavior. A reading product's home page passes `true`, so the first screen already has the top bar (back, bibliography, contents, settings).

**Paper is actually paper**: `day` and `default` used to render identically (both `bg-bg`), `eye` was only a green film of `bg-success/12`, and `night` was plain `bg-surface`, so the four names did not match the paint. They are now mixed from semantic colors: `day` runs warm (`warning` at 6%), `eye` runs green (`success` at 11%), `night` mixes 5% warmth into the dark ground, and `oled` is the one that approaches pure black. Changing theme carries the paper color with it, so a dark page does not hold a white sheet.

**Paper fills the viewport, not the `<article>`**: with only a few hundred characters, paper painted on the article stops dead at the last line, half beige and half white, as if rendering had broken. Paper color and `data-theme` now both hang on the scroll viewport, which is full height. The constraint that menus follow page tokens while paper only wraps the text still holds. The continuous-reading content layer is `min-h-full`, so the text container can fill the screen.
<!-- changelog-en:end -->

