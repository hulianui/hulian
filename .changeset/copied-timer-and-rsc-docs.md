---
"@hulianui/ui": patch
---

复制反馈的定时器不再对已卸载组件 setState；带 `"use client"` 的组件文档不再自称 RSC（#310 #307）

- **复制反馈修两个缺陷**（CodeBlock / IssueReporter / JsonViewer / PasswordGenerator / SecretField / Snippet）。此前六处都是同一句没有 ref 也没有 cleanup 的内联写法：点复制后排一个 `setTimeout` 把「已复制」复位。其一，用户点了复制、1.5 秒内关掉 Dialog 或离开页面，timer 照样在已卸载的组件上 `setState` —— React 19 不再为此打印警告，所以它在浏览器里是静默的。其二，连点两次复制，第一个 timer 会把第二次的「已复制」提前抹掉，反馈只显示半截。现在六处统一走内部的 `useCopiedFlag`：卸载时清定时器，重复点击重新计时。JsonViewer 保留它原本 1200ms 的复位时长，其余仍是 1500ms，行为不变。MessageActions 本来就写对了，一并收编进同一实现。

- **带 `"use client"` 的组件文档不再自称 RSC**（BeianFooter / CircularGallery / ClickSpark / ContributionGraph / GlassSurface / OrbitImages / SplashCursor / TypingDots）。这八个组件的 md 里有 14 处「RSC 安全」「纯 RSC」这类断言，而它们全都是客户端组件 —— `"use client"` 逐个核过都是必要的（BeianFooter 与 TypingDots 自身零 hooks 零事件，但都要读 Locale context）。组件 md 随包发布，MCP 的 `get_component_doc` 本地模式直读 `node_modules` 里那一份，所以这些话会被 agent 当成「该组件不进 client bundle」的依据。措辞统一成「客户端组件（`"use client"`）」；原本想表达「SSR 期不报错」的地方直说 SSR。ReflectiveCard 与 Citation 确实没有 `"use client"`，它们的说法准确，未改。
