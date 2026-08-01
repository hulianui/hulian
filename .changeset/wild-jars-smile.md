---
"@hulianui/mcp": minor
---

新增 `audit_hulian_adoption` tool 与 `npx @hulianui/mcp audit` 命令：给**已经有代码**的项目做组件采用体检（issue #43）。

存量项目才是采用率的主要战场，而它需要的东西和新建项目不一样：不是「该怎么搭」，而是「该用的有没有用上、从哪改起」。

- **自动判场景** —— surface + modifiers 三维正交，判据来自 profile 真源新增的 `detect` 字段（`signals` 的机器可判定伴生），依据与置信度一并给出，次名候选如实列出，可人工覆盖。
- **主指标是高层业务组件采用度**（如 `10/12`）而非裸覆盖率 —— 后者对项目规模敏感，前者直接对应「有没有绕过现成能力」。
- **机会点只报有邻近信号的缺口** —— 一个职责组里用过东西却缺关键件才报；整组一件没有 = 这个项目没这个场景。所以中后台不会因为 91 个 `decoration` 组件没用而被判采用不足，那是库存结构问题。新增的 `avoidCategories` 进一步保证 modifier 的建议不越过 surface 的组件语言边界。
- **风险项不一律标红** —— 每条带置信度与判断依据。实测 quay 的 69 处裸 `<button>`：high 0 / medium 2 / low 67。
- **原型口径** —— 传 `workflow: "prototype"` 后不推高层企业件（实证：同产品的 demo 与正式系统是 5/12 与 10/12，那是取向不同不是采用不足），但形态必备件照报。项目自述像原型时会提示，但**不自动切换**。
- **baseline / ratchet** —— CLI 的 `--write-baseline` 接受现有债务，`--check` 只拦新增。基线人类可读、不含项目源码。

输出**全部是带置信度的建议，不产生 error**：可静态证明的错误仍归 `validate_hulian_usage` / `@hulianui/guard`。写盘只在 CLI，tool 保持 `readOnlyHint` 语义不被破坏。

判定质量对着本机 11 个真实消费项目验证过，#43 的 7 条验收标准逐条通过。
