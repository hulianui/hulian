---
"@hulianui/ui": minor
---

浮层三件补口子：Drawer 尺寸档、Modal 危险语气、Toast 关闭句柄（#230 #231 #227）

- **Drawer 加 `size`（#230）**：`sm | md | lg | xl | full`。主轴随 `side` 换手——左右抽屉吃宽度、上下抽屉吃高度，故同一档在两轴上不是同一个值（`md` 即 0.39.0 写死的 24rem / 20rem，不传 `size` 渲染不变）。此前 `top`/`bottom` 高度写死 320px 且 `DrawerContentProps` 里没有任何尺寸字段，要 760px 的业务面板只能整块弃用组件自绘。除 `full` 外都保留 `min(90vw, …)` / `min(90vh, …)` 上限：抽屉是贴边的，宽过视口的那截直接落到屏幕外够不着。附带建议的 `inset`（左右留白 + 圆角）本轮未做，`drawer.md` 里给了 className 写法——它必须连出场位移一起改，否则收起时底部留一道残影。

- **Modal 加 `danger`（#231）**：确定键走 `tone="danger"`，左侧图标同步转 `text-danger`（与 `Popconfirm` 的 `danger` 同名同义）。此前命令式确认框没有危险语气，`type` 只驱动图标与图标色，确定键写死默认主色档 —— 连 `type="error"` 也救不了，「删除后不可恢复」的确定键和「保存」完全同色。图标**字形**仍由 `type` 决定：字形说「这是一个提问」，颜色说「后果不可逆」。

- **Toast 加 `toast.close(id)`（#227）**：按 id 关掉某一条，不传 id 关掉全部。`toast()` 一直返回 id，但 manager 是模块级私有单例，此前没有任何出口能消费它，于是「进行中 → 完成后关掉它 → 弹结果」这条链路断在中间，「正在上传…」与「上传成功」会同屏并存最多 5 秒。

- **Toast 加 `loading` 档（#227）**：标题前渲转圈图标，且 `timeout` 缺省值从 5000 变成 0。它与 `timeout: 0` 不是两套常驻语义，只是同一个 `timeout` 的默认值之差，显式传值依然优先。恒走 `priority: "low"`（polite），即使 `tone="danger"` 也不升 assertive——「进行中」是陪跑不是结果，且会长时间挂着。转圈图标 `aria-hidden`（不在 aria-live 区里再嵌活动区），`prefers-reduced-motion` 下减速到 2.4s 一圈而非停转：它是这个状态唯一的视觉记号，定格就等于状态信息消失。

- **ToastProvider 加 `position`（#227）**：六档停靠位置，默认 `"top-right"`（与今天逐字一致）。底部三档把队列改成从下往上堆，最新一条永远贴着停靠边；入场滑动方向也跟着停靠边换手。toast 出现在哪个角是产品决策不是库决策。
