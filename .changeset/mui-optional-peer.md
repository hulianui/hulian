---
"@hulianui/ui": minor
---

**BREAKING**：日期族改走子路径导入，MUI / emotion 降为 optional peerDependency。

- `Rating` / `Stepper` 重写为零依赖自研，仍从根 barrel 导入，**不再需要** `MuiBridgeProvider`。
- `Calendar` / `DatePicker` / `DateTimePicker` / `TimeField` / `MuiBridgeProvider` 移出根 barrel，
  改从 `@hulianui/ui/date-pickers` 导入，并需自行安装 `@mui/material` `@mui/x-date-pickers`
  `@emotion/react` `@emotion/styled` 四个 optional peer。

迁移：

```diff
- import { DatePicker, MuiBridgeProvider } from "@hulianui/ui"
+ import { DatePicker, MuiBridgeProvider } from "@hulianui/ui/date-pickers"
```

为什么：`@emotion` 是 runtime CSS-in-JS（不兼容 RSC），此前是硬依赖 —— 任何人只想用一个
Button 也会被迫装下整个 MUI + emotion。源码分发下光把它降为 optional peer 还不够：根 barrel
导出会强制每个消费方的 tsc 去编译 `_mui/*.tsx`，没装 MUI 的项目直接 `TS2307`。所以连同
barrel 一起移出。

收益：`dependencies` 27 → 22；root-barrel 体积基线 1250KB → 1098KB（-12.2%）；
不用日期族的项目彻底不接触 emotion。
