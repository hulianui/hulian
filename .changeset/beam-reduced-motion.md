---
"@hulianui/ui": patch
---

`BorderBeam` / `AnimatedBeam` 补 reduced-motion 兜底（#300）：这是库里仅有的两个没做兜底的无限循环动画件，用户开了系统「减少动态效果」后照常永久绕圈/打光；`BorderBeam` 的文档还声称支持而代码没做。漏网原因是机制不统一 —— `Meteors` / `AuroraText` / `ShimmerButton` / `Marquee` 走 CSS 动画 + Tailwind `motion-reduce:` 变体，而这两个是 JS 驱动的补间（`offsetDistance`、渐变 `x1`/`x2`），类变体够不着，按「加个 `motion-reduce:` 类」的思路扫会以为已覆盖。两者降级方式不同：`BorderBeam` 整个不渲染（纯装饰层 `absolute inset-0 pointer-events-none`，不渲染既不影响布局也不丢信息，而让光束停在半途反倒像渲染残留）；`AnimatedBeam` 只去掉流光与渐变、保留底线 path（那条线表达的「A 连到 B」是信息，不随动效一起拿掉）。
