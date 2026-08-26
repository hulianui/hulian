---
"@hulianui/guard": minor
---

新增可执行规则 `card-content-needs-cardbody`（warning），matcher kind `unslotted-children`。

`Card` 根只落密度变量，内边距住在 `CardHeader` / `CardBody` / `CardFooter` 三个插槽里，
所以 `<Card><div>x</div></Card>` 是零内边距、内容紧贴边框。从 shadcn/ui 迁过来的代码最容易
中招：那边叫 `CardContent`，名字打错报错之后，退回裸 `div` 是最省事的一条路，而它恰好静默
地对 —— 能编译、能渲染，只是难看。

判据问的是「这张卡的内边距**有没有人负责**」，不是「有没有用 CardBody」。后者过窄：全出血
卡片（顶部整张图贴边 + 下方内容区自己给 `p-5`）完全正当，库自己的 blog-list / product-grid
/ agent-card 三个区块就都是这个形状，按「必须用 CardBody」判会当场误报三处。所以只要直接子
里出现任何一个插槽组件或带内边距类的元素，整张卡就放行。根节点自带内边距、表达式子节点、
纯文本子节点同样放行。
