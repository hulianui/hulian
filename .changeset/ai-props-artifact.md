---
"@hulianui/ui": patch
---

AI 分发产物补上机器可读的 props 真源，并修掉三处让消费方必须自己写解析器的坑（#102 #103 #104 #105）

瑚琏把 AI 消费当一等公民，但结构化程度此前停在 markdown：`registry.json` 有 name / description / categories / exports / types，**唯独没有 props**。想做「受约束生成」（让模型只能输出白名单组件与合法 props）的消费方只能去解析文档表格，于是同一批坑每家踩一遍。

**新产物 `llms-props.json`**（383 个组件 / 3038 条 props）：

```jsonc
{
  "version": "…",
  "typeAliases": { "StackDirection": ["row", "column"], … },   // 143 条字面量联合别名
  "exportIndex": { "IPhone": "iphone", "BarChart": "chart", … }, // 796 个导出名 → 组件
  "components": [{ "slug": "button", "import": "…", "exports": [...],
                   "props": [{ "name": "size", "kind": "enum",
                               "values": ["sm","md","lg","icon","iconSm","iconLg"],
                               "valueType": "string", "default": "\"md\"", … }] }]
}
```

`kind` 覆盖 enum / union / boolean / number / string / node / function / array，`valueType` 区分 `level={1}` 与 `level="1"`，混合联合（`StackDirection | ResponsiveDirection`）也照样给出 `"row"` / `"column"` —— 「还有别的形态能传」不该让两个已知取值一起消失。

同时修掉的三条：

- **#102 转义竖线**：类型列的联合分隔符在文档里有三种写法（全角 `｜` 72 篇、半角、GFM 转义 `\|` 404 篇），按 `line.split("|")` 裸切会整行串列，枚举只剩第一个取值、默认值和说明全错。AI 产物（`llms-full.txt` / `d/<slug>.md`）的 Props / Events / Slots 表现在统一重写成 GFM 转义形。**英文产物无法改用全角**（那道门禁不许出现 CJK），所以「统一成 `｜`」这条路走不通 —— 真正的答案是上面那份 JSON，markdown 只保证自己合法且一致。
- **#103 别名不展开**：类型列写 `StackDirection` 而文档里没有任何地方给出它的取值，AI 只能猜 `direction="horizontal"` 然后**静默不生效**（不报错，只是版式不对，比报错更难查）。现在用编译器 AST 扫 `*.types.ts` 抽出字面量联合，在产物里就地展开成 `"row" | "column" | ResponsiveDirection`。非字面量别名（对象型的 `ResponsiveDirection`）保持原样。
- **#104 标题 ≠ 导出名**：`# iPhone`（真实导出 `IPhone`）、`# Chart`（真实导出 `AreaChart` / `BarChart` / …）、`# Resizable`（`ResizablePanelGroup` / …）。产物里每个组件标题下补一行以 barrel 为真源的 `**导出**`，消费方不必再去解析 `## 导入` 代码块反查。

`llms.txt` 里加了一句把受约束生成的消费方直接指向 JSON，别再解析表格。
