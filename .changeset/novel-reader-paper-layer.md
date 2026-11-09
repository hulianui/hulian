---
"@hulianui/ui": patch
---

fix(novel-reader): 菜单收起时正文被纸色层盖住，整页空白。纸色层是 `absolute`，收起菜单时正文视口只有 `h-full`、不是定位元素，按 CSS 绘制顺序纸画在了正文上面；DOM 里文字都在，屏幕上什么也看不见。菜单展开时视口改成 `absolute`，所以只有默认状态出问题。视口在收起时也改为 `relative`，补了一条真实浏览器的命中测试。

<!-- changelog-en:start -->
fix(novel-reader): with the menus collapsed, the paper layer covered the text and the page looked blank. The paper layer is `absolute`, while the collapsed viewport was only `h-full` and not positioned, so CSS paint order drew the paper above the text. The text was in the DOM but nothing showed on screen. The open-menu state made the viewport `absolute`, so only the default state broke. The collapsed viewport is now `relative`, and a real-browser hit test covers it.
<!-- changelog-en:end -->
