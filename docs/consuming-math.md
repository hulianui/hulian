# 数学题件消费指南

> 面向要在自己仓库里用 QuestionEditor / QuestionAnswer / MathTextarea / MathField / gradeObjective 的人。
> 通用集成约束见 [docs/consuming.md](./consuming.md)，这里只写数学件特有的几条。

这一族组件横跨两个重依赖（KaTeX 排版、MathLive 可视化输入）和一个「服务端才是真源」的判分函数。
三件事不写明就一定会踩：**从哪条入口引、mathlive 怎么装、判分该信谁**。

---

## 1. 三条入口各买什么

| 入口 | 内容 | initial（gzip，实测 0.59.0） | 备注 |
|---|---|---|---|
| `@hulianui/ui` | **不含任何数学件** | 0 增量 | 主 barrel 刻意不导出；根 barrel 里只有 382B 的 `math-field.locale.ts`（随 `config/locale.ts` 字典进来） |
| `@hulianui/ui/math` | Formula / QuestionCard / MathTextarea / QuestionEditor / QuestionAnswer / `question` 纯函数 / `gradeObjective` | 184.5KB（含 KaTeX） | 体积门禁基线 208KB；零 MathLive |
| `@hulianui/ui/math-field` | MathField / `createCasComparator` | 12.9KB 壳 | mathlive 221KB、compute-engine 294KB 走 `import()` 懒加载 chunk，用户**打开公式键盘那一刻**才下载；基线 15KB 只卡壳 |

口径与 `scripts/bundle-size.mjs` 相同：`export *` 的上界、esbuild splitting + minify、react 外部化。
`sideEffects: false`，只用 `Formula` 或 `QuestionCard` 的页面 tree-shake 后不会带上编辑器。

## 2. 安装 mathlive（可选 peer）

`mathlive` 与 `@cortex-js/compute-engine` 都是 **optional peerDependency**：不装它们的项目一切照旧，
`@hulianui/ui/math` 与主包不会因为缺它们而报错。

```bash
# 只用 MathField
pnpm add mathlive

# 还要 createCasComparator（第 3 档等价判分）
pnpm add mathlive @cortex-js/compute-engine
```

- `@cortex-js/compute-engine` 是 mathlive 钉死的依赖（0.110.0 钉 0.58.0），装了 mathlive 它就在 node_modules 里；
  显式装一次是让打包器从 `@hulianui/ui` 的真实路径解析它时不依赖 pnpm 的 hoist。
  MathLive 自己不打包它，只通过 `globalThis[Symbol.for("io.cortexjs.compute-engine")]` 查找，所以库内是单独 `import()`。
- peer 下界 `mathlive >=0.110.0`、`@cortex-js/compute-engine >=0.58.0`：**只承诺测过的版本**。
  MathLive 0.9x 到 0.10x 之间 `menuItems` 与 `mathVirtualKeyboardPolicy` 的语义都改过，往下放宽等于拿没测过的组合做承诺。
- 字体由你引入一次；缺字体只是回退成系统字体，不是白屏：

```ts
// Next：app/layout.tsx；Vite：main.tsx
import "mathlive/fonts.css";
```

## 3. SSR 与打包器

- **MathField 是 client 组件**，服务端与客户端首帧只渲染一个同尺寸骨架（`data-status="loading"`），
  `mathlive` 在 `useEffect` 里 `import()`，成功后才 `createElement("math-field")`。Next App Router 直接用，不需要 `next/dynamic`。
- mathlive 的 `exports` 在 **node 条件**下解析到 SSR 构建（没有 `MathfieldElement`）。组件把这种情况与「没装」一视同仁：
  渲染一条带安装命令的 `Alert`（`data-status="unavailable"`），不抛错，静态导出不会整页失败。
  vitest 的 jsdom 环境同理，消费方单测里 `vi.mock("mathlive")` 一个只实现 `getValue` / `setValue` 的假元素，或只断言首帧骨架。
- Vite：`optimizeDeps.include: ["mathlive", "@cortex-js/compute-engine"]` 可选，避免第一次打开公式键盘时中途重优化。
- 虚拟键盘是**页面级单例**（`window.mathVirtualKeyboard`）：同页多个 MathField 共用；`keyboardLayouts` 后挂载的覆盖先挂载的。
  桌面端录题一般 `virtualKeyboard="off"`，学生端触屏作答用默认 `auto`。
- 类型面独立：`MathFieldProps` 不引用 mathlive 的类型（`keyboardLayouts` 是 `readonly unknown[]`），
  没装 mathlive 的项目 `tsc` 照样过。CI 的消费方 typecheck 门禁就是不装 optional peer 跑的。

## 4. 三个注入点

MathField 满足 `MathFieldLikeProps`（`value` / `onChange` / `onSubmit?` / `disabled?` / `aria-label?` / `className?`），
**传组件本身，不是元素**：

```tsx
import { MathField } from "@hulianui/ui/math-field";
import { MathTextarea, QuestionEditor, QuestionAnswer } from "@hulianui/ui/math";

<MathTextarea multiline value={stem} onChange={setStem} visualEditor={MathField} />
<QuestionEditor value={question} onChange={setQuestion} visualEditor={MathField} />
<QuestionAnswer question={q} value={v} onChange={setV} blankInput="math" mathField={MathField} />
```

MathField 的值是**不带 `$` 的 LaTeX**。MathTextarea 的 `visualEditor` 页签负责套 `$…$` 并插到光标处；
QuestionAnswer 的每个空直接拿到 LaTeX 交给判分。不要自己把 `value` 拼进题干字符串。

## 5. 判分：服务端是 SSOT

`gradeObjective(question, studentAnswer, options?)` 有三档，**默认只有第 1 档**：

| 档 | 开关 | 规则 |
|---|---|---|
| 1 精确 | 默认 | 与首个消费方服务端 `grading.py::score_objective` 逐字同口径；`grade.contract.json` 两边共用 |
| 2 归一 | `normalize` / `tolerance` | 剥 `$`、全角转半角、空白折叠、Unicode 数学符号转 LaTeX；`tolerance` 给了且两侧可解析成数时按绝对误差 |
| 3 等价 | `equivalent` | 前两档都不等时才调；`createCasComparator()` 提供 |

```ts
import { gradeObjective } from "@hulianui/ui/math";
import { createCasComparator } from "@hulianui/ui/math-field";

const equivalent = await createCasComparator();   // async：Compute Engine 第一次调用才加载
const graded = gradeObjective(question, answer, { normalize: true, tolerance: 0.001, equivalent });
```

规矩只有一条：**库不能比服务端更宽松**，否则学生端「答对」与成绩单「答错」打架。
第 2、3 档只在服务端也开了同款归一 / 等价时才打开；纯即时反馈、录题自测、后端参考实现可以随意用。
对账用 `node_modules/@hulianui/ui/src/question/grade.contract.json`（随 npm 包发布），
里面每条 case 标了 `level`，Python 侧谁实现哪一档就跑哪一档。

## 6. 从自建组件迁过来

首个消费方 5069tk-app 升级时一次删掉的自建文件，与对应的库件：

| 自建 | 改用 |
|---|---|
| `web/components/formula-input.tsx`、`web/lib/formula-editing.ts` | `MathTextarea` + `applyFormulaTemplate` 等纯函数（`@hulianui/ui/math`） |
| `web/components/question-form.tsx` | 收缩为「私有字段（`extra`）+ `QuestionEditor` + 提交」 |
| `web/components/h5/question-card.tsx`、`web/lib/practice-answer.ts`、`web/lib/question-options.ts` | `QuestionAnswer` + `canSubmit` / `answerKind` / `normalizeOptions` |
| `web/lib/answer-format.ts` | `answerText` / `answerLines` |
| `web/lib/question-stem.ts` 的切图函数 | `splitStemFigures` / `stemFigureKeys` / `stripStemFigures` |
| 自己接 MathLive | `MathField`（`@hulianui/ui/math-field`） |

`api/tests` 加一条对账测试读上面的 `grade.contract.json`；`docs/HULIAN-GAPS.md` 记一笔。
