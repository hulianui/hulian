---
"@hulianui/mcp": minor
---

`inspect_project` 与 `audit_hulian_adoption` 把「没挂 ConfigProvider」列为接入缺口（#164）。

ThemeProvider 漏了页面立刻不对，ConfigProvider 漏了**页面看起来完全正常** —— 回退掉的是组件内置文案，其中大半在 `aria-label` 里（NumberField 的「减少」「增加」、Spinner 的「加载中」、Tag 的「移除」）。英文产品能带着一屏中文读屏标签上线而无人察觉，只有读屏用户和 e2e 断言才撞得到。

按「建议」而非 error 报出（这两个 tool 明确不是门禁），并在文案里声明探测局限：只看入口文件里有没有这个标签，i18n 桥层挂在别处的项目自行确认。
