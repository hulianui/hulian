---
"@hulianui/tokens": minor
---

`preset.css` 拆成两层，补齐 info 语义色（#166 #173）。

**`preset.css` 三分，零破坏性**

原本 697 行里只有约 30 行会「接管」消费方既有行为，其余全是安全的加法，绑在一个入口里导致存量项目想要后者就必须连前者一起吃 —— 接入成本被整个前置到第 0 步，而收益要等到开始换组件之后。

| 入口 | 内容 | 性质 |
|---|---|---|
| `@hulianui/tokens/preset-core.css` | 语义 token → `--color-*` 映射、断点、42 个 `hulian-*` 关键帧 | **纯加法**，`hulian-` 前缀不撞名，断点与 Tailwind 默认同值 |
| `@hulianui/tokens/preset-opinionated.css` | `@custom-variant dark`、`--shadow-*` 重绑、缓动重绑 | **接管**，改变项目里已有的 `dark:` / `shadow-*` / 裸 `transition` 的行为 |
| `@hulianui/tokens/preset.css` | 上面两份的聚合入口 | 与拆分前等价，**现有写法零改动** |

其中 `@custom-variant dark` 那条是**静默**的：shadcn 默认形态是 `<html class="dark">` + `@custom-variant dark (&:is(.dark *))`，被瑚琏的定义覆盖后全站 `dark:` 工具类不再匹配任何东西，表现是「半暗」—— 页面底色还是暗的（那来自 `.dark { --… }` token 块，不走 variant），前景色与边框留在亮色。构建成功、控制台无警告、DevTools 里规则确实存在，排查起来很绕。

`docs/consuming.md` 新增一节写清三条出路（只引 core / 调整 `@custom-variant` 声明顺序 / 加一层 `--hl-theme` 桥），其中桥的写法已在 Chrome 151 实测验证，且确认与 #101 的主题岛语义相容（岛内元素不会被误点亮）。

**补齐 info 语义色**

primitives 补 `--info-50` … `--info-700`，semantic 补 `--color-info` / `-subtle` / `-border` / `-foreground` / `-hover`，明暗两套，与 success / warning / danger 完全对齐。

色相落在 **225°**，与 brand（250–258°）拉开 25–33°，彩度也显著更低（info-500 是 0.112，brand-500 是 0.19）—— 读起来是「信息」而不是「品牌」。此前没有 info 色系时，消费方只能借 primary（提示条与主操作共用色相，品牌色权重被稀释）或借 gray（说明文字掉进背景），两条路都不好，而这个决定一旦做了就会散落到几百个消费点。
