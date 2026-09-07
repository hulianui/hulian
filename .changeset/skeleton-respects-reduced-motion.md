---
"@hulianui/ui": patch
---

fix(skeleton): 此前开着系统「减少动态效果」，一屏几十块骨架（TableSkeleton 8×5 就是 40 块）照样永久扫光——shimmer 是 motion 驱动的 backgroundPosition 补间，Tailwind 的 motion-reduce: 类变体够不着；现在 reduce 下退成静态灰块，占位形状照旧，只去掉扫光与那层渐变，三个预设一并静止 (#350)
