---
"@hulianui/ui": minor
---

清 issue #19 / #20 / #21 / #31

**#31 Sortable：`InteractiveAwarePointerSensor.activators` 缺 `override`（0.13.0 回归 · 阻断级）**

`static activators` 补 `override`。这一行是 0.13.0 随 #26 首次发布时带进来的：本包**发的是源码**（`exports` 指向 `./src/index.ts`，产物里零 `dist/`），所以它会进入**每个消费方**的 tsc program，凡是 tsconfig 开了 `noImplicitOverride` 的工程 `tsc --noEmit` 直接 TS4114 失败。`skipLibCheck` 救不了——它只跳 `.d.ts`，跳不过我们发出去的 `.tsx`。消费方此前除了为一个依赖关掉自己代码的一项检查，没有别的绕法。

根子在门禁：`tsconfig.base.json` 只有 `strict: true`，而 `noImplicitOverride` 不在 strict 家族里、需单独开，于是库内编译通过、问题只在消费方暴露。现已在 `tsconfig.base.json` 与「消费方身份 typecheck」门禁的 tsconfig 里**双双开启**——后者刻意比库更严一档，因为对发源码的包来说，**库没开的检查项都是漏给消费方的雷**。全仓开启后零违规，即此前只此一处。

**#19 packaging：新增子路径导出，按需引入不再拖进整棵源码树**

`exports` 增加 `"./*": "./src/*/index.ts"`，从此可写 `import { Tag } from "@hulianui/ui/tag"`。

此前 exports 只有 `.` 与 `./showcase`，取任何一个组件都只能走根 barrel；叠加源码分发，消费方的打包器会把整棵 `src/`（700+ tsx）连同全部 26 个 dependencies（tiptap / recharts / vidstack / ogl / MUI …）拉进模块图——即使一个都没用到。实测某 Vite 桌面 App 只用约 15 个组件，dev server 常驻 3.1 GB、CPU ~90%，HMR 卡到「点了没反应」。

以打包后的真实产物量了一下同一个 `Tag`：

| 引入方式 | 模块数 | 带进来的 npm 包 |
|---|---|---|
| `@hulianui/ui`（根 barrel） | 5198 | 128 |
| `@hulianui/ui/tag`（子路径） | 8 | 4 |

顺带给 `theme` / `access` / `config` / `lib` 四个基础设施目录补了 `index.ts`（它们是根 barrel 已对外的公共 API，却是仅有的几个没有目录入口的），导出面与根 barrel 对应段落逐条对齐——两个入口是同一份公共契约的两种取法，子路径不额外放开内部实现。

⚠️ **这不是全自动的瘦身**：根 barrel 的行为完全不变，**仍会拖出全部 26 个 dependencies**，收益只在你改写 import 之后才拿得到。把重依赖组件（`_mui/*` / `markdown-editor` / `video` / `*-chart` / WebGL 系）移出根 barrel 是破坏性改动，留到 1.0。接入指引见 `docs/consuming.md` 第 3 节（含已经踩上又暂不想改 import 时的 Vite 止血办法）。

消费方冒烟门禁同步挂上三条子路径（普通组件 + 两个需专门补 `index.ts` 的基础设施目录）：exports 映射写错这一类问题，库内 tsc 走相对路径、workspace 链接走目录直读，**两者都测不到**，只有走 pack 产物的真实解析才拦得住。

**#21 deps：`tiptap-markdown` 升到 0.9.0，unmet peer 警告根除**

`^0.8.10` → `^0.9.0`。0.8.10 的 peer 锁在 `@tiptap/core@^2.0.3`，而库装的是 v3，于是**每个**消费方安装时都会看到一条 unmet peer WARN（只是警告不阻断，但足以让人怀疑自己装错了）。上游 0.9.0 的 peer 已是 `@tiptap/core@^3.0.1`，属干净升级——因此没有采用 `peerDependencyRules` 静音那条路。`MarkdownEditor` 用到的 `Markdown` 扩展与 `editor.storage.markdown.getMarkdown()` 两处 API 在 0.9.0 均未变，测试全绿。

**#20 docs(tooltip)：触发器必须用 `render` 注入，写成硬要求**

`TooltipTrigger` 默认自渲一个 `<button>`，children 是塞进它*里面*而不是替换它——从 HeroUI（`Tooltip.Trigger` 是把 props 合并进子元素）迁过来会很自然地把 `<button>` 当 children 传，结果 DOM 里套成 `button > button`。实测确认：children 形态嵌套 button 数为 1，`render` 形态为 0。

这个错误 **tsc / eslint / build / 肉眼全都不报**（children 类型完全合法，嵌套 button 在浏览器里照样可点），只有查 a11y 树才看得出来。原文档只提了 `render` 与 flex 截断的关系，那句话隐含「可以不用 render」，反倒容易让人以为 children 是正常用法。现已在 Slots 与「禁忌 / 坑」两处写明是硬要求，并给出正反例。

顺带补上另一条实测确认的坑：`TooltipContent` 渲染出的 popup **不带 `role="tooltip"`**（整棵树里该 role 计数为 0），写验收 / E2E 脚本时按 `[role="tooltip"]` 查会查不到，请按文本或类名定位。
