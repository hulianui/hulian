---
"@hulianui/mcp": minor
---

`get_component_doc` 新增 `format: "json"`：返回结构化 props，供受约束生成使用（#105）

想让 LLM「只能输出白名单组件与合法 props」的消费方，此前只能拿 markdown 表格去解析，于是每家都要自己趟一遍同样的坑：转义竖线 `\|` 被当成列分隔符（#102）、类型列写的是别名而取值只在源码里（#103）、文档标题是展示名而非真实导出名（#104）。

现在直接要结构化数据：

```jsonc
{ "name": "IPhone", "format": "json" }   // 用真实导出名也能反查到组件
```

返回逐条带 `kind`（enum / boolean / number / string / node / function / array / union）、`values`（枚举取值白名单）、`valueType`（`level={1}` 还是 `level="1"`）、`default`、`required` 的 props/events/slots，可直接生成 Zod 或 JSON Schema。同时走 `structuredContent`（MCP 里机器读的正路）与文本 JSON 两条通道；`sections` 照常可裁剪。

数据源是新产物 `llms-props.json`：本地模式读 `apps/www/public/`，远程模式读文档站。
