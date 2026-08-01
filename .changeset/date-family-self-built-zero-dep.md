---
"@hulianui/ui": minor
---

**BREAKING**：日期族全部自研为零依赖，MUI 与 emotion 整族切除

`src/_mui/` 目录不复存在。`@mui/material`、`@mui/x-date-pickers`、`@emotion/react`、`@emotion/styled`
四个包已从 `dependencies` / `peerDependencies` / `peerDependenciesMeta` 全部移除，
`@hulianui/ui/date-pickers` 子路径入口移除，`MuiBridgeProvider` 移除。

**装 `@hulianui/ui` 现在没有 optional peer、没有子路径入口、没有必须挂的第三方 Provider。**

### 新增（自研零依赖）

- **`Calendar`** —— 常驻日历面板，日/月/年三层下钻，不带触发器与浮层
- **`DateTimePicker`** —— 左日历 + 右时/分/秒列一体弹层，边界只在压着 min/max 那天生效
- **`TimeField`** —— 分段键盘输入（时/分/秒各一段 `role="spinbutton"`）：`↑↓` 调值、`←→` 切段、
  数字键两位缓冲覆写并自动跳段、`Backspace` 清段

### 改名

- **`DateField` → `DatePicker`**。库内命名统一为 `DatePicker` / `TimePicker` / `DateRangePicker`，
  与行业惯例一致。`DatePicker` 这个名字此前指向 MUI 桥接件，现在指向这个自研实现。
- 随之移除导出类型 `DateFieldPicker`，粒度类型统一用 `CalendarPicker`。

### 迁移

| 之前 | 现在 |
|------|------|
| `import { X } from "@hulianui/ui/date-pickers"` | `import { X } from "@hulianui/ui"` |
| `pnpm add @mui/material @mui/x-date-pickers @emotion/react @emotion/styled` | 不需要，可以卸掉 |
| `<MuiBridgeProvider>` 包裹 | 删掉 |
| `DateField` | `DatePicker` |
| 值是完整 ISO 时间戳 | 定宽字符串：`"YYYY-MM-DD"` / `"HH:mm[:ss]"` / `"YYYY-MM-DD HH:mm"` |
| `DatePicker` 的 `views` / `openTo` | `picker="date" \| "month" \| "year"` |
| `DatePicker` / `TimeField` 的 `label` | `placeholder` + `aria-label`（不带浮动 label） |
| `DateTimePicker` 的 `minutesStep` | `minuteStep`（与 `TimePicker` 对齐） |
| `DateTimePicker` 的 `format` | `displayFormat`（只改显示，不改值） |

值改成定宽字符串是刻意的：字典序即时间序，范围比较可以直接比字符串，
既不用引 date 库做比较，也不会被时区和 UTC 日界搅进来。

### 顺带修复

`recharts` 3.x 把 `react-is` 声明为 **peerDependency**，而瑚琏既没装也没声明它 ——
此前一直是靠 MUI 的依赖链蹭到的。MUI 一走，体积门禁当场 `Could not resolve "react-is"`。
recharts 是我们的 `dependency`，它的 peer 就该由我们兜住，现已补进 `dependencies`：
在不自动装 peer 的包管理器（如 yarn classic）下，此前用 `Chart` 会直接打包失败。

### 真机验证抓到的两个修复

单测（jsdom）全绿之后，用真实浏览器逐个走了一遍键盘与浮层，抓到两个 jsdom 测不出来的问题：

- **`TimeField` 的两位缓冲在受控用法下失效**：`applyParts` 只在非受控时记录「刚提交的值」，
  于是受控下父组件回传值会被当成「外部改了值」，连带清空缓冲 —— 输 `3` 再输 `0` 得到 `00` 而不是 `30`。
  全部用 `defaultValue` 的测试碰不到这条路径，已补两条受控回环的回归测试。
- **时间列的滚动定位每次多滚一格**（`TimePicker` 原有问题，`DateTimePicker` 继承）：
  `el.offsetTop` 的 offsetParent 不是滚动容器而是带列头的外层 div，于是选中项被顶到可视区外。
  滚动容器补 `relative` 后，选中项正好落在列顶。jsdom 无布局、`offsetTop` 恒 0，只有真机看得见。

### 门禁

- 消费方冒烟门禁收敛回单场景，并在消费面里钉死日期族必须能从根 barrel 导入且零额外依赖
- `scripts/bundle-size.sh` 反向断言升级：`@mui/*` / `@emotion/*` 出现在**任何一类**依赖里即失败
- 体积基线的 `mui-bridge` 采样点换成 `date-picker`（53.6KB initial）；根 barrel 实测 957.5KB
