---
"@hulianui/ui": patch
---

修 #107：可选 prop 收到 `null` 不再抛 TypeError

JS 的解构默认值只在值为 `undefined` 时生效，`null` 会原样落进函数体。于是 `<Stack direction={null}>` 直接崩在 `directionClass`（`typeof null === "object"`，null 掉进了响应式分支）：

```
TypeError: Cannot read properties of null (reading 'base')
```

这不是「调用方别传 null」就能算了的事。瑚琏把 AI 消费当一等公民，**任何由 LLM 产出结构再动态渲染的消费方都会遇到模型把「不设这个 prop」写成 `"direction": null`** —— 那是 JSON 里最自然的写法。报告者的 DSL 生成平台就是这么整棵子树被 ErrorBoundary 吃掉的。

全库扫了同一个缺陷类，19 个组件的 22 个 prop 全部补上回落：

- **响应式 / 对象形态**：`Stack.direction`、`Grid.cols`、`Tree.virtual` —— 这三个是 `typeof x === "object"` 分支判断的直接受害者
- **数组形态**：WorldMap(`dots`/`points`)、BeianFooter(`icp`)、FlyingPosters(`items`)、ScrollVelocity(`texts`)、BounceCards(`images`)、Folder(`items`)、Cascader(`defaultValue`)、Listbox(`defaultSelectedKeys`/`disabledKeys`)、Transfer(`defaultTargetKeys`)、Scheduler(`resources`)、InfiniteMenu(`items`)、FallingText(`highlightWords`)、VoiceRecord(`levels`)、StaggeredMenu(`items`/`socialItems`)、GridMotion(`items`)、ScopeMatrix(`suggestions`)、Tree(三个 `defaultXxxKeys`)

每个都配了一条回归测试：传 `null` 不抛错，且与「完全不传这个 prop」表现一致。用改动前的代码跑这批测试，会精确复现 issue 里那条 `Cannot read properties of null (reading 'base')`。

**本轮的边界**：只消灭崩溃。布尔与字符串默认值（`selectable = true`、`variant = "solid"` 这类，全库 430+ 处）收到 `null` 时仍然退化成 falsy 值而不是回落默认值 —— 那不会崩，只是行为与「不传」不同。要不要连这批一起归一是另一个量级的决策，没有夹带在这次里。消费方若从 LLM 输出直接构造 props，稳妥做法仍是在校验层丢弃值为 `null` 的键。
