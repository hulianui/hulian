---
"@hulianui/ui": patch
---

`Chart` 图例与 `Gantt` 的横向滚动条在 Chromium 121+ 一条都不画，与 0.63.3 修的 `Table` 同根（#347）；经典滚动条皮肤收成一份共享。

0.63.3 只修了 `Table`：`scrollbar-width` / `scrollbar-color` 任一裸写都会让 Chromium 121+ 整体忽略 `::-webkit-scrollbar*`，macOS 上退回 overlay 条、平时一条都看不见。同款裸写还留在 `Chart` 的 `legendScroll` 图例行和 `Gantt` 的时间轴滚动容器里，注释还写着「定义 `::-webkit-scrollbar` 让 Chrome/macOS 强制常显」，实际被上一行的 `scrollbar-width: thin` 抵消。

皮肤本体（守卫过的标准属性 + 轨道透明 + 滑块圆角 + 两档滑块取色）提到库内一处共享，`Table` 外壳与代理条、`Chart` 图例、`Gantt` 三处改为引用，各自只补厚度。新增源码扫描测试：全库不许再出现裸写的 `scrollbar-width`（`none` 除外）/ `scrollbar-color`，从根上堵第四处。三个组件各加真实 Chromium 用例量滚动条真实高度大于 0（测试环境去掉了 headless 默认的 `--hide-scrollbars`，否则永远量到 0）。

<!-- changelog-en:start -->
`Chart` legend and `Gantt` horizontal scrollbars were not drawn at all on Chromium 121+, the same root cause as the `Table` fix in 0.63.3 (#347); the classic scrollbar skin is now a single shared definition.

0.63.3 only fixed `Table`: a bare `scrollbar-width` / `scrollbar-color` makes Chromium 121+ ignore `::-webkit-scrollbar*` entirely, so macOS falls back to the overlay bar that is invisible until you scroll. The same bare declarations were still present in the `Chart` legend row under `legendScroll` and in the `Gantt` timeline scroll container, whose comment still claimed that defining `::-webkit-scrollbar` forces a persistent bar on Chrome/macOS while the `scrollbar-width: thin` on the previous line cancelled it.

The skin itself (guarded standard properties, transparent track, rounded thumb, two thumb color presets) now lives in one shared place inside the library. The `Table` shell and proxy bar, the `Chart` legend and `Gantt` all reference it and only add their own thickness. A new source-scanning test forbids any bare `scrollbar-width` (other than `none`) or `scrollbar-color` anywhere in the library, so a fourth copy cannot appear. Each of the three components gains a real Chromium test asserting the scrollbar occupies real height (the test environment drops headless Chromium's default `--hide-scrollbars`, without which the measurement is always 0).
<!-- changelog-en:end -->
