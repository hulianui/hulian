---
"@hulianui/ui": patch
---

修正英文站上的一批机翻错译，并给三处门禁补上真正的判据。

**英文文案**（23 条，逐条核实过消费它的组件语境）：`分数` 曾译成 Score —— 而用它的只有 math 与 question-card 两处数学语境，正确译法是 Fraction；`工号` 曾是 Job number（应为 Employee ID）；`参考人数` 被理解成「参考编号」译作 Reference number（应为 Examinees）；`电量` 译成功率 Power（应为 Battery）；`等级带` 直译成 Level belt（应为 Grade bands）；diff-stat 的 `新增行 / 删除行` 是代码行却译成表格 row；badge 的 `纯点`、divider 的 `纯分隔线`、color-field 的 `无色块` 都是字面直译；heading 的六个层级原本混用三种译法（First level title / Level 3 heading / Sixth level title），统一成 Heading level N。

**门禁**：

- 英文词表的 `files` 块此前不受「非空 / 无 CJK / 保留占位符」那条质量断言覆盖（它只遍历 `exact`），而 per-file 覆盖正是「同一个中文在不同组件里要不同译法」的唯一出路，等于把这批译文放在质检之外。扩大覆盖后立刻抓到一条丢失 `PDF/Word/OCR` 标识符的译文。
- picker 的子树跳过测试用的是**挂钟时间**阈值（`< max(0.5ms, base * 0.1)`）。memo 命中时实测 0.004–0.008ms、baseDuration 1.3–10ms，余量上百倍仍偶发翻红 —— 并发跑测试时一次调度延迟就是毫秒级。改成结构断言（组件确实被 memo 包着）+ 多次采样取最小值，对负载免疫。
- `advisories` 条数曾以绝对值写死在测试里，任何一次组件增删都会打翻它。改成按组件文档数的比例下限，守的是「提取链路没断」而不是某个具体数字。

另外 unit 测试 timeout 从默认 5s 放宽到 15s（最慢的用例单跑 1.4s，并发下涨到 5.4s 就撞线），并新增 `pnpm readme:sync` 一键同步 README 里的组件数 / demo 数 —— 此前只有校验没有修复入口，增删组件要手改 5 处。
