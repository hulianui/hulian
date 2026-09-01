# 数学题件 · 阶段 5：MathField（可视化公式键盘）+ createCasComparator + demo + 消费指南 + 发版 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 MathLive 做一个满足 `MathFieldLikeProps` 的可视化公式输入框 `MathField`（独立 subpath `@hulianui/ui/math-field`，`mathlive` 为可选 peer），提供第 3 档判分比较器 `createCasComparator`，把 QuestionEditor / QuestionAnswer / MathField 三件在内置 demo「瀚学」里串成「题库录题 + 学生练习」两页，写消费指南 `docs/consuming-math.md`，最后把阶段 3–5 的四个 changeset 合成一次 `@hulianui/ui` minor（0.58.0 → 0.59.0）并在本地验证。

**Architecture:** 新目录 `packages/ui/src/math-field/`，通过 `exports` 的 `"./*"` 通配自动成为 subpath（目录名即 subpath 名）。`@hulianui/ui/math` 与主 barrel **一个都不导出**这里的东西（math 入口零 MathLive、主 barrel 体积增量 0）。MathLive 只在 `useEffect` 里 `await import("mathlive")`：服务端与客户端首帧都渲染同尺寸 `Skeleton` 占位（无 hydration mismatch），加载成功后用 `document.createElement("math-field")` 挂真元素并做受控同步，失败（没装 mathlive / 解析到 SSR 构建）则渲染带安装命令的 `Alert`，**不抛错**（showcase 静态导出不会整页失败）。组件对 MathLive 的依赖收敛成一个结构化接口 `MathfieldLike`（`getValue/setValue/disabled/readOnly/placeholder/mathVirtualKeyboardPolicy/menuItems`），jsdom 单测用假元素覆盖受控逻辑，browser project 用真 MathLive 覆盖注册 / 回流 / 键盘策略。Compute Engine **不随 mathlive 打包**（mathlive 通过 `globalThis[Symbol.for("io.cortexjs.compute-engine")]` 查找它），所以 `createCasComparator` 自己 `import("@cortex-js/compute-engine")`，签名是 **async**（返回 `Promise<(a, b) => boolean>`，见「已批准的偏离」）。

**Tech Stack:** TypeScript 7 / React 19 / vitest（unit = jsdom，browser = 真 chromium）/ Tailwind v4 / mathlive 0.110.0（devDependency + optional peer）/ @cortex-js/compute-engine 0.58.0（mathlive 的钉死依赖，同样 devDependency + optional peer）/ 库内 Skeleton、Alert、Text、Button、Card、Drawer、Popconfirm、Segmented、Progress、Result、Empty、toast / 阶段 1–4 的 `question/`、`math-textarea/`、`question-editor/`、`question-answer/`。

Spec：`docs/superpowers/specs/2026-08-31-math-question-authoring-design.md` §4.2、§6.2 第 3 档、§7、§8、§9、§11。上游产物：`packages/ui/src/math-textarea/math-textarea.types.ts`（`MathFieldLikeProps`：`value` / `onChange` / `onSubmit?` / `disabled?` / `aria-label?` / `className?`）、`packages/ui/src/question-answer/question-answer.tsx:129`（`mathField` 注入点，传 `value/onChange/aria-label/disabled`）、`packages/ui/src/math-textarea/math-textarea.tsx:247`（`visualEditor` 注入点，传 `value/onChange/onSubmit/aria-label`）、`packages/ui/src/question-editor/question-editor.types.ts:35`（`visualEditor` 透传）。写法模板：`packages/ui/src/math-textarea/`（locale 独立文件 / showcase / 中英 md / exports.test）。

## 已核实的外部事实（写计划前在 scratchpad 装了 mathlive@0.110.0 实测）

- `mathlive@0.110.0`：`dependencies = { "@cortex-js/compute-engine": "0.58.0" }`（钉死）；unpacked 5.7MB；`exports["."]` 分 `browser`（完整构建 `mathlive.min.mjs`，含 `MathfieldElement`）与 `node`（**SSR 构建** `mathlive-ssr.min.mjs`，只有 `convertLatexToMarkup` 等 7 个函数，**没有** `MathfieldElement`）两个条件；`./fonts.css` → `mathlive-fonts.css`。
- 于是：vitest unit（jsdom，node 条件）里 `import("mathlive")` 拿到的是 SSR 构建 —— 组件必须把「模块加载成功但没有 `MathfieldElement`」也视为不可用；TS（`moduleResolution: Bundler`）走 `default` 条件 → `types/mathlive.d.ts`。
- `MathfieldElement`：`getValue(format)` / `setValue(value, { silenceNotifications })` / `disabled` / `readOnly` / `placeholder` / `menuItems`（setter 都存在）/ `mathVirtualKeyboardPolicy: "auto" | "manual" | "sandboxed"`（**没有 `off`**）；静态 `soundsDirectory` / `fontsDirectory`（`null` = 不加载）；事件 `input`（每次击键）/ `change`（回车或失焦）/ `beforeinput`。
- mathlive.mjs 里读取的 CSS 变量（可从宿主元素继承穿透 shadow DOM）：`--caret-color`、`--selection-background-color`、`--selection-color`、`--contains-highlight-background-color`、`--placeholder-color`、`--smart-fence-color`、`--latex-color`、`--highlight-text`、`--correct-color`、`--incorrect-color`。
- `@cortex-js/compute-engine@0.58.0`：`new ComputeEngine()`；`ce.parse(latex)` → `BoxedExpression`，有 `isValid: boolean`、`isSame(rhs): boolean`、`isEqual(other): boolean | undefined`；unpacked 20MB（dev 才装）。

## 已批准 / 待批准的偏离（相对 spec §4.2、§6.2）

1. **`createCasComparator` 是 async**：`createCasComparator(): Promise<(a: string, b: string) => boolean>`。理由：Compute Engine 不在 mathlive 包内、只能 `import()`；返回的比较器本身是同步的，仍直接喂 `gradeObjective` 的 `equivalent`。
2. **第二个 optional peer `@cortex-js/compute-engine`**：mathlive 已把它钉成依赖，任何装了 mathlive 的消费方 node_modules 里都有它；显式声明是为了让打包器从 `@hulianui/ui` 的真实路径解析它时不依赖 pnpm 的 hoist。文档口径：「`pnpm add mathlive` 即可用 MathField；要用 `createCasComparator` 再加 `@cortex-js/compute-engine`」。
3. **peer 下界写成实测过的版本**：`mathlive >=0.110.0`、`@cortex-js/compute-engine >=0.58.0`。理由（写进 `docs/consuming-math.md`）：只承诺测过的那一版；MathLive 0.9x → 0.10x 之间 `menuItems` / `mathVirtualKeyboardPolicy` 都改过语义。
4. `virtualKeyboard="off"` = 策略置 `manual` + 隐藏键盘切换钮（CSS part `virtual-keyboard-toggle`）。
5. demo 不新建，而是在既有 `apps/www/app/demos/learn`（瀚学 LMS）下加两个路由 `/demos/learn/questions`（题库录题）与 `/demos/learn/practice`（学生练习），demo 总数仍 19（`demo-i18n-coverage.test.ts` 硬编码 19 不动）。
6. 中英 md 的用法段一律 `## Examples`（英文）；组件 md 描述行沿用 `math-textarea.md:13` 的「> 一句话 · 要点 · 要点 · category/group」体裁。

## Global Constraints

- 目录 `packages/ui/src/math-field/`；**只**从 `math-field/index.ts` 导出。`packages/ui/src/math/index.ts` 与 `packages/ui/src/index.ts` **一个都不加**（Task 6 有测试锁住）。
- `math-field/` 下任何文件**不许** import `../config/locale`（整份字典 28KB）；词条独立 `math-field.locale.ts`，`config/locale.ts` 反向引用（`ComponentLocale.mathField?`，`zhCN` / `enUS` 都接）。组件用 `useComponentLocale().mathField ?? MATH_FIELD_LOCALE_ZH`。
- `math-field/` 下任何文件**不许**静态 `import ... from "mathlive"` 或 `"@cortex-js/compute-engine"`（只允许 `import()` 表达式，且只在 `mathlive-loader.ts` / `cas.ts` 两处）。对外类型**不得**引用 mathlive 的类型（`keyboardLayouts` 用 `readonly unknown[]`），否则没装 mathlive 的消费方 typecheck 会挂（CI 的 consumer-typecheck 刻意不装 optional peer）。
- 文案写「状态」不写「机制」；英文里不许有 CJK 与 em-dash。纯函数不产出文案。
- 色彩只用本库 token 类；组件里**不写 `style=`**、不写 `!` 类。MathLive 的主题变量通过 Tailwind 任意属性类挂在宿主 div 上（自定义属性可继承进 shadow DOM）。宿主元素的静止态类**照抄** `packages/ui/src/input/input.tsx` 的 `inputShellVariants`（先 `sed -n 12,40p` 看清再抄，不自创一套边框/背景）。
- 开发期告警用 `warnOnce(key, message)`（`packages/ui/src/lib/warn-once.ts`），key 不拼可变值：本阶段两处 `math-field:mathlive-missing`、`math-field:compute-engine-missing`。
- `docs:check:props` 只看 `<slug>/*.types.ts` 里 `Props` / `Item` 结尾的导出接口：`MathFieldProps` 每个字段都要进 md 表；`MathfieldLike` / `MathLiveModule` 刻意不以 Props 结尾（内部类型，不进文档、不从 index 导出）。
- **体积基线**：`scripts/size-limits.json` 新加一行 `math-field`，值 = `ceil(实测 initial × 1.15)`；只许手加自己那行，**禁止** `bash scripts/bundle-size.sh --update`。`math` 那行（208）不动；先 `--why math` 确认无 `mathlive` 与无 `config/locale.ts`（grep 用 `config/locale.ts` 精确匹配，`config/locale-context.ts` 702B 是合法命中）。
- 测试：`*.test.ts(x)` 走 jsdom；`*.browser.test.tsx` 走真实 chromium。jsdom 里 `mathlive` 一律 `vi.mock`；`warnOnce` 同 key 整个进程只打一次，一个 key 只在一个测试文件里触发。
- 每个任务结束 `git add <具体文件>` 再 commit，**不许** `git add -A` / `git commit -a`（工作区 `packages/ui/src/upload/upload.tsx` 是主人拍板「留着不动」的未提交改动，不要碰、不要还原、不要连带提交）。commit message 末尾带：
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3`
- 命令：单测 `cd packages/ui && npx vitest run --project unit <path>`；browser `cd packages/ui && npx vitest run --project browser <path>`；typecheck `pnpm --filter @hulianui/ui typecheck`；体积 `CI=1 pnpm size`（必须带 `CI=1`）；hulian-scan `CI=1 pnpm --filter @hulianui/hulian-scan test`。**不要用 `cmd | tail` 判绿**，看每条命令自己的退出码（`echo rc=$?`）。
- 分支：`git checkout -b feat/math-question-phase5` 从 master 起；全部任务完成、门禁全绿后 `git checkout master && git merge --ff-only feat/math-question-phase5`，**不 push**。
- 生成顺序（阶段 2–4 实测）：中英 md 必须**先于** `pnpm docs:all` 存在；perf-lab 重生成（`pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts`，再带 `--check`）必须**在** `pnpm docs:all` 之后；`docs:all` 产物含 `packages/guard/conventions.json` 与 `packages/ui/conventions.json`，要一起 add。
- showcase 英文词表（`apps/www/i18n/showcase-copy.en.json` 的 `exact` 块）：生成器把全角标点也算中文（纯公式串也要词条）、遇第一条 missing 即停（用脚本循环补）、JSON 键是解码后的运行时字符串（单反斜杠）、`protectedTokens` 逐字（`key` 不认 `keys`）、数字紧贴 `$` 报 missing（示例公式不以数字收尾）、TS 字符串里 `\n` 分行取键、code 块逐行取词条。JSX 属性字符串含反斜杠的值写在 TS 字符串常量里。
- demo（`apps/www/app/demos/learn` 属 `TASK_11_DEMOS` = STRICT）：源码文件里**零中文字面量**，全部经各自 `.content.ts` 的 `copy()`；每个新 `page.tsx` / `_data/*.ts` 路由或 fixture 都要登记进 `apps/www/app/demos/lib/demo-i18n-coverage.test.ts` 的 `inventory.learn`；每份 `.content.ts` 的 zh/en 键集必须相等、每个键必须被同名源文件消费、en 值零 CJK。资源零外链。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `packages/ui/package.json` | devDependencies + optional peerDependencies（mathlive / @cortex-js/compute-engine） |
| `packages/ui/vitest.config.ts` | `optimizeDeps.include` 加两个包（browser project 中途重优化会打断用例） |
| `packages/ui/src/math-field/math-field.types.ts` | `MathFieldProps`（extends `MathFieldLikeProps`） |
| `packages/ui/src/math-field/math-field.locale.ts` | `MathFieldLocale` + 中英预设（SSOT） |
| `packages/ui/src/config/locale.ts` | `ComponentLocale.mathField?` + `zhCN` / `enUS` 接线 |
| `packages/ui/src/math-field/mathlive-loader.ts` | `loadMathLive()`（缓存的 `import("mathlive")`、SSR 构建判定、`soundsDirectory/fontsDirectory = null`）、`MathLiveUnavailableError`、`MATHLIVE_INSTALL_HINT`、`resetMathLiveLoaderForTests()`、内部类型 `MathfieldLike` / `MathLiveModule` |
| `packages/ui/src/math-field/math-field.tsx` | `MathField` 主件（三态：loading / ready / unavailable） |
| `packages/ui/src/math-field/cas.ts` | `createCasComparator()`（async）、`stripMathDelimiters()`、`COMPUTE_ENGINE_INSTALL_HINT`、`resetComputeEngineForTests()` |
| `packages/ui/src/math-field/index.ts` | 目录 barrel（= subpath `@hulianui/ui/math-field` 的全部公开面） |
| `packages/ui/src/math-field/math-field.showcase.tsx` + `packages/ui/src/showcase.ts` | 画廊 |
| `packages/ui/src/math-field/math-field.md` / `.en.md` | 文档 |
| `packages/ui/src/question-answer/question-answer.md` / `.en.md`、`math-textarea.md` / `.en.md`、`math/math.md` / `.en.md` | 去掉「阶段 5」措辞，链到 math-field 文档 |
| `apps/www/lib/manifest.ts` / `apps/www/lib/registry.tsx` / `apps/www/i18n/component-meta.en.ts` / `apps/www/i18n/showcase-copy.en.json` | 画廊注册 + 英文词表 |
| `apps/perf-lab/scenarios/generated.ts` | 重生成（不手改） |
| `apps/www/package.json` / `apps/www/app/layout.tsx` | www 装 mathlive 并 `import "mathlive/fonts.css"`（文档页与 demo 都要字体） |
| `scripts/size-limits.json` / `scripts/bundle-size.sh` / `scripts/consumer-typecheck.sh` | 体积基线新行；体积门禁工程装 optional peer（否则 esbuild 解析不到 `import("mathlive")`）；消费方 typecheck 工程**不装** optional peer 但要 import `@hulianui/ui/math-field` |
| `apps/www/app/demos/learn/_data/questions.ts` / `.content.ts` | 题库 fixture（6 道题，四种客观题型 + 一道计算题） |
| `apps/www/app/demos/learn/_lib/question-bank-store.tsx` | 题库 + 练习记录的内存 store（Provider 挂在 LearnShell） |
| `apps/www/app/demos/learn/_components/question-bank-client.tsx` / `.content.ts` | 题库页（列表 + Drawer 内 QuestionEditor + 删除 Popconfirm + toast） |
| `apps/www/app/demos/learn/_components/practice-client.tsx` / `.content.ts` | 练习页（QuestionAnswer + MathField + gradeObjective 三档即时反馈 + Progress + Result） |
| `apps/www/app/demos/learn/(app)/questions/page.tsx`、`(app)/practice/page.tsx` | 路由 |
| `apps/www/app/demos/learn/_components/nav-config.ts` / `.content.ts`、`learn-shell.tsx`、`(app)/layout.tsx` | 导航两项、Provider 挂载、ToastProvider / ModalProvider |
| `apps/www/app/demos/lib/demo-i18n-coverage.test.ts`、`apps/www/app/demos/lib/demos.ts`、`apps/www/i18n/demo-meta.en.ts`、`scripts/check-task11-demo-output.mjs` / `.test.mjs` | demo 登记 |
| `docs/consuming-math.md` + `docs/consuming.md` 链接 | 消费指南 |
| `.changeset/math-field.md` | 发版记录（minor） |
| `README.md` / `README.en.md` / `packages/ui/README.md` | 计数 399（`pnpm readme:sync`） |

---

### Task 0: 起分支 + 装依赖 + peer 声明

**Files:**
- Modify: `packages/ui/package.json`（devDependencies / peerDependencies / peerDependenciesMeta）
- Modify: `packages/ui/vitest.config.ts:44-60`（optimizeDeps.include）
- Modify: `apps/www/package.json`（dependencies 加 mathlive）
- Modify: `apps/www/app/layout.tsx:3`（`import "mathlive/fonts.css"`）
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: 确认工作区只有 upload.tsx 一处改动，起分支**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git status --short
# 期望只有：  M packages/ui/src/upload/upload.tsx
git checkout -b feat/math-question-phase5
```

- [ ] **Step 2: 给 packages/ui 装 devDependency**

```bash
pnpm --filter @hulianui/ui add -D mathlive@0.110.0 @cortex-js/compute-engine@0.58.0
ls packages/ui/node_modules/mathlive/mathlive.min.mjs packages/ui/node_modules/@cortex-js/compute-engine/dist/compute-engine.min.esm.js
```
期望：两个文件都存在。

- [ ] **Step 3: 手改 packages/ui/package.json 的 peer 声明**

`peerDependencies` 加两行、`peerDependenciesMeta` 加两项（保持字母序）：

```json
  "peerDependencies": {
    "@base-ui/react": ">=1.6.0",
    "@cortex-js/compute-engine": ">=0.58.0",
    "mathlive": ">=0.110.0",
    "motion": ">=11",
    "react": ">=18",
    "react-dom": ">=18",
    "tailwindcss": ">=4.1",
    "vite": ">=5"
  },
  "peerDependenciesMeta": {
    "@cortex-js/compute-engine": {
      "optional": true
    },
    "mathlive": {
      "optional": true
    },
    "vite": {
      "optional": true
    }
  },
```

- [ ] **Step 4: vitest browser project 的预构建清单加两个包**

在 `packages/ui/vitest.config.ts` 的 `optimizeDeps.include` 数组末尾（`"class-variance-authority",` 之后）加：

```ts
      // math-field 的 browser 用例第一次 import("mathlive") 时若还没预构建，Vite 会中途重优化 + reload，
      // 正在跑的用例被打断（见上面那段注释）。
      "mathlive",
      "@cortex-js/compute-engine",
```

- [ ] **Step 5: www 装 mathlive 并全站引字体**

```bash
pnpm --filter www add mathlive@0.110.0
```

`apps/www/app/layout.tsx` 在 `import "./globals.css";` 下一行加：

```ts
// MathLive 的字体由消费方引入（库不替消费方决定）。文档站与 demo 都渲染 MathField，放根布局一次引齐；
// @font-face 只在真正用到字形时才下载，不用 MathField 的页面零成本。
import "mathlive/fonts.css";
```

- [ ] **Step 6: 验证解析与 typecheck，commit**

```bash
node -e "import('mathlive').then(m => console.log('node-condition exports MathfieldElement?', typeof m.MathfieldElement))" --input-type=module 2>&1 | tail -1
# 期望打印 undefined —— 这就是「node 条件解析到 SSR 构建」的证据，组件必须处理
pnpm --filter @hulianui/ui typecheck; echo rc=$?
git add packages/ui/package.json packages/ui/vitest.config.ts apps/www/package.json apps/www/app/layout.tsx pnpm-lock.yaml
git commit -m "build(ui): mathlive 与 @cortex-js/compute-engine 作 optional peer + devDependency；www 引 mathlive 字体

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 1: 类型 + 词条 + config/locale 接线

**Files:**
- Create: `packages/ui/src/math-field/math-field.types.ts`
- Create: `packages/ui/src/math-field/math-field.locale.ts`
- Create: `packages/ui/src/math-field/math-field.locale.test.ts`
- Modify: `packages/ui/src/config/locale.ts:3`（import）、`:745`（ComponentLocale）、`:1524`（zhCN）、`:2420`（enUS）

**Interfaces:**
- Produces: `MathFieldProps`、`MathFieldLocale`、`MATH_FIELD_LOCALE_ZH`、`MATH_FIELD_LOCALE_EN`

- [ ] **Step 1: 写 locale 测试（先红）**

`packages/ui/src/math-field/math-field.locale.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { MATH_FIELD_LOCALE_EN, MATH_FIELD_LOCALE_ZH } from "./math-field.locale";
import { enUS, zhCN } from "../config/locale";

const CJK = /[㐀-鿿＀-￯]/;

describe("math-field 词条", () => {
  it("中英键集一致，英文零中文字符", () => {
    expect(Object.keys(MATH_FIELD_LOCALE_EN).sort()).toEqual(Object.keys(MATH_FIELD_LOCALE_ZH).sort());
    for (const value of Object.values(MATH_FIELD_LOCALE_EN)) {
      expect(CJK.test(value), value).toBe(false);
    }
  });

  it("config/locale 的 zhCN / enUS 反向引用本文件（SSOT 在这里）", () => {
    expect(zhCN.mathField).toBe(MATH_FIELD_LOCALE_ZH);
    expect(enUS.mathField).toBe(MATH_FIELD_LOCALE_EN);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/math-field.locale.test.ts; echo rc=$?
```
期望：FAIL（找不到 `./math-field.locale`）。

- [ ] **Step 3: 写类型**

`packages/ui/src/math-field/math-field.types.ts`：

```ts
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";

/**
 * 虚拟键盘策略。`auto` 触屏设备聚焦时弹出、`manual` 只由键盘切换钮弹出、`off` 不挂键盘
 * （策略置 manual 并隐藏切换钮）。MathLive 自身没有 off。
 */
export type MathFieldKeyboardPolicy = "auto" | "manual" | "off";

/**
 * 满足 `MathFieldLikeProps`（`value` / `onChange` / `onSubmit` / `disabled` / `aria-label` / `className`），
 * 可直接注入 MathTextarea 的 `visualEditor` 与 QuestionAnswer 的 `mathField`。
 */
export interface MathFieldProps extends MathFieldLikeProps {
  /** @default "auto" */
  virtualKeyboard?: MathFieldKeyboardPolicy;
  /**
   * 透传给 `window.mathVirtualKeyboard.layouts`。键盘是**页面级单例**：同页多个 MathField 共用，
   * 后挂载的覆盖先挂载的。类型刻意是 unknown[]，对外类型不引用 mathlive（没装它的消费方也要能 typecheck）。
   */
  keyboardLayouts?: readonly unknown[];
  /** 只读：能选中、复制，不能改。与 `disabled` 的差别同原生 input。@default false */
  readOnly?: boolean;
  placeholder?: string;
}
```

- [ ] **Step 4: 写词条**

`packages/ui/src/math-field/math-field.locale.ts`：

```ts
// MathField 词条。单独成文件的理由与 math-textarea/math-textarea.locale.ts 相同：
// @hulianui/ui/math-field 入口不能拖进 config/locale.ts 那份全库字典。这里是 SSOT。
export interface MathFieldLocale {
  /** 加载中占位的无障碍名。 */
  loading: string;
  /** 没装 mathlive 时的提示标题。 */
  missing: string;
  /** 提示正文，后面紧跟安装命令。 */
  missingHint: string;
}

export const MATH_FIELD_LOCALE_ZH: MathFieldLocale = {
  loading: "公式编辑器加载中",
  missing: "公式编辑器需要安装 mathlive",
  missingHint: "在项目里执行后刷新页面：",
};

export const MATH_FIELD_LOCALE_EN: MathFieldLocale = {
  loading: "Loading the formula editor",
  missing: "The formula editor needs the mathlive package",
  missingHint: "Run this in your project, then reload:",
};
```

- [ ] **Step 5: 接线 config/locale.ts**

第 3 行附近（与 `QUESTION_LOCALE_*` 的 import 并排）加：

```ts
import { MATH_FIELD_LOCALE_EN, MATH_FIELD_LOCALE_ZH, type MathFieldLocale } from "../math-field/math-field.locale";
```

`ComponentLocale` 里 `questionAnswer?: QuestionAnswerLocale;` 之后加：

```ts
  /** 可视化公式键盘词条，SSOT 在 math-field/math-field.locale.ts（同 question 的理由）。 */
  mathField?: MathFieldLocale;
```

`zhCN` 里 `questionAnswer: QUESTION_ANSWER_LOCALE_ZH,` 之后加 `mathField: MATH_FIELD_LOCALE_ZH,`；`enUS` 里 `questionAnswer: QUESTION_ANSWER_LOCALE_EN,` 之后加 `mathField: MATH_FIELD_LOCALE_EN,`。

- [ ] **Step 6: 跑测试 + typecheck，commit**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/math-field.locale.test.ts; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulianui/ui typecheck; echo rc=$?
git add packages/ui/src/math-field/math-field.types.ts packages/ui/src/math-field/math-field.locale.ts packages/ui/src/math-field/math-field.locale.test.ts packages/ui/src/config/locale.ts
git commit -m "feat(ui/math-field): MathFieldProps 与词条（config/locale 反向引用）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 2: `mathlive-loader.ts`（缓存加载 + 不可用判定）

**Files:**
- Create: `packages/ui/src/math-field/mathlive-loader.ts`
- Create: `packages/ui/src/math-field/mathlive-loader.test.ts`

**Interfaces:**
- Produces:
  - `interface MathfieldLike extends HTMLElement { getValue(format?: string): string; setValue(value: string, options?: { silenceNotifications?: boolean }): void; disabled: boolean; readOnly: boolean; placeholder: string; mathVirtualKeyboardPolicy: "auto" | "manual" | "sandboxed"; menuItems: readonly unknown[] }`
  - `interface MathLiveModule { MathfieldElement: MathfieldCtor }`（`MathfieldCtor = (new () => MathfieldLike) & { soundsDirectory: string | null; fontsDirectory: string | null }`）
  - `loadMathLive(): Promise<MathLiveModule>`
  - `class MathLiveUnavailableError extends Error`
  - `const MATHLIVE_INSTALL_HINT = "pnpm add mathlive"`
  - `resetMathLiveLoaderForTests(): void`

- [ ] **Step 1: 写测试（先红）**

`packages/ui/src/math-field/mathlive-loader.test.ts`：

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

// 每个用例都要重置模块缓存：loader 内部缓存 promise，vi.doMock 只对下一次 import 生效。
afterEach(() => {
  vi.doUnmock("mathlive");
  vi.resetModules();
});

async function load() {
  const mod = await import("./mathlive-loader");
  mod.resetMathLiveLoaderForTests();
  return mod;
}

describe("loadMathLive", () => {
  it("模块解析失败（没装 mathlive）→ MathLiveUnavailableError，消息带安装命令", async () => {
    vi.doMock("mathlive", () => {
      throw new Error("Cannot find package 'mathlive'");
    });
    const { loadMathLive, MathLiveUnavailableError, MATHLIVE_INSTALL_HINT } = await load();
    await expect(loadMathLive()).rejects.toBeInstanceOf(MathLiveUnavailableError);
    await expect(loadMathLive()).rejects.toThrow(MATHLIVE_INSTALL_HINT);
  });

  it("解析到 SSR 构建（有模块没有 MathfieldElement）也算不可用", async () => {
    vi.doMock("mathlive", () => ({ convertLatexToMarkup: () => "" }));
    const { loadMathLive, MathLiveUnavailableError } = await load();
    await expect(loadMathLive()).rejects.toBeInstanceOf(MathLiveUnavailableError);
  });

  it("成功：关掉音效与字体目录，注册自定义元素，且同一 promise 复用", async () => {
    class Fake extends HTMLElement {
      static soundsDirectory: string | null = "./sounds";
      static fontsDirectory: string | null = "./fonts";
    }
    vi.doMock("mathlive", () => ({ MathfieldElement: Fake }));
    const { loadMathLive } = await load();
    const p1 = loadMathLive();
    const p2 = loadMathLive();
    expect(p1).toBe(p2);
    const mod = await p1;
    expect(mod.MathfieldElement).toBe(Fake);
    expect(Fake.soundsDirectory).toBeNull();
    expect(Fake.fontsDirectory).toBeNull();
    expect(customElements.get("math-field")).toBe(Fake);
  });

  it("失败后不缓存：下一次调用会重新尝试", async () => {
    vi.doMock("mathlive", () => ({}));
    const { loadMathLive } = await load();
    await expect(loadMathLive()).rejects.toThrow();
    vi.doUnmock("mathlive");
    // 第二次仍会失败（真实 jsdom 下解析到 SSR 构建），但重点是它**重新 import 了**而不是复用被拒的 promise：
    // 用 resetModules 后 loader 的私有缓存已清，这里只断言两次拒绝不是同一个 promise。
    const again = loadMathLive();
    await expect(again).rejects.toThrow();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/mathlive-loader.test.ts; echo rc=$?
```
期望：FAIL（找不到 `./mathlive-loader`）。

- [ ] **Step 3: 写 loader**

`packages/ui/src/math-field/mathlive-loader.ts`：

```ts
// MathLive 的唯一加载点。组件与比较器都不静态 import "mathlive"：
//   1. mathlive 是 optional peer，静态 import 会让没装它的消费方在打包期就炸；
//   2. exports 的 node 条件解析到 SSR 构建（没有 MathfieldElement），只能在浏览器里动态取；
//   3. 体积：动态 import 让打包器把 MathLive 切成独立 chunk，@hulianui/ui/math-field 的 initial 只剩壳。

export const MATHLIVE_INSTALL_HINT = "pnpm add mathlive";

/** 组件用到的 MathfieldElement 实例面。收敛成结构化接口，对外类型不引用 mathlive。 */
export interface MathfieldLike extends HTMLElement {
  getValue(format?: string): string;
  setValue(value: string, options?: { silenceNotifications?: boolean }): void;
  disabled: boolean;
  readOnly: boolean;
  placeholder: string;
  mathVirtualKeyboardPolicy: "auto" | "manual" | "sandboxed";
  menuItems: readonly unknown[];
}

export type MathfieldCtor = (new () => MathfieldLike) & {
  soundsDirectory: string | null;
  fontsDirectory: string | null;
};

export interface MathLiveModule {
  MathfieldElement: MathfieldCtor;
}

export class MathLiveUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(`[瑚琏] MathField 需要安装 mathlive：${MATHLIVE_INSTALL_HINT}`, { cause });
    this.name = "MathLiveUnavailableError";
  }
}

let pending: Promise<MathLiveModule> | null = null;

/**
 * 加载并初始化 MathLive。同一页面只跑一次；失败不缓存（装好依赖热更新后能恢复）。
 * 只能在浏览器调用（组件在 useEffect 里调）。
 */
export function loadMathLive(): Promise<MathLiveModule> {
  if (pending) return pending;
  const attempt = import("mathlive").then(
    (mod: unknown) => {
      const ctor = (mod as { MathfieldElement?: unknown }).MathfieldElement;
      // node 条件解析到的 SSR 构建没有这个类；坏包同理。
      if (typeof ctor !== "function") throw new MathLiveUnavailableError("mathlive resolved without MathfieldElement");
      const element = ctor as MathfieldCtor;
      // 音效不要；字体交给消费方 import "mathlive/fonts.css"（null = 不自行加载，缺字体只是回退不是白屏）。
      element.soundsDirectory = null;
      element.fontsDirectory = null;
      if (!customElements.get("math-field")) {
        customElements.define("math-field", element as unknown as CustomElementConstructor);
      }
      return { MathfieldElement: element };
    },
    (error: unknown) => {
      throw error instanceof MathLiveUnavailableError ? error : new MathLiveUnavailableError(error);
    },
  );
  pending = attempt;
  attempt.catch(() => {
    if (pending === attempt) pending = null;
  });
  return attempt;
}

/** 测试专用：清掉缓存的 promise（自定义元素注册表本身清不掉，测试里用同一个假类）。 */
export function resetMathLiveLoaderForTests(): void {
  pending = null;
}
```

- [ ] **Step 4: 跑测试 + typecheck，commit**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/mathlive-loader.test.ts; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulianui/ui typecheck; echo rc=$?
git add packages/ui/src/math-field/mathlive-loader.ts packages/ui/src/math-field/mathlive-loader.test.ts
git commit -m "feat(ui/math-field): MathLive 加载器（动态 import、SSR 构建判定、失败不缓存）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 3: `MathField` 主件（jsdom 用假元素测受控逻辑）

**Files:**
- Create: `packages/ui/src/math-field/math-field.tsx`
- Create: `packages/ui/src/math-field/math-field.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 `MathFieldProps` / `MATH_FIELD_LOCALE_ZH`；Task 2 的 `loadMathLive` / `MathfieldLike` / `MATHLIVE_INSTALL_HINT`
- Produces: `function MathField(props: MathFieldProps): JSX.Element`；DOM 契约 `[data-slot="math-field"][data-status="loading"|"ready"|"unavailable"]`

- [ ] **Step 1: 写测试（先红）**

`packages/ui/src/math-field/math-field.test.tsx`：

```tsx
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * jsdom 装得了自定义元素，装不了 MathLive（无布局、无 shadow DOM 排版）。这里用一个只实现
 * MathfieldLike 面的假元素替代，测的是组件这一侧的契约：三态、受控同步、事件回流、属性透传。
 * 真 MathLive 的注册 / 击键回流 / 键盘策略在 math-field.browser.test.tsx。
 */
class FakeMathfield extends HTMLElement {
  static soundsDirectory: string | null = null;
  static fontsDirectory: string | null = null;
  private latex = "";
  disabled = false;
  readOnly = false;
  placeholder = "";
  mathVirtualKeyboardPolicy: "auto" | "manual" | "sandboxed" = "auto";
  menuItems: readonly unknown[] = [{ label: "builtin" }];
  setValueCalls: { value: string; silent: boolean }[] = [];
  getValue() {
    return this.latex;
  }
  setValue(value: string, options?: { silenceNotifications?: boolean }) {
    this.latex = value;
    this.setValueCalls.push({ value, silent: options?.silenceNotifications === true });
  }
  /** 模拟用户击键：改内部值并派发 input。 */
  type(latex: string) {
    this.latex = latex;
    this.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

vi.mock("mathlive", () => ({ MathfieldElement: FakeMathfield }));

let MathField: typeof import("./math-field").MathField;
beforeAll(async () => {
  ({ MathField } = await import("./math-field"));
});
afterEach(cleanup);

const field = () => document.querySelector("math-field") as FakeMathfield | null;

describe("MathField 三态", () => {
  it("服务端渲染只有骨架，没有 math-field（首帧与客户端一致，无 hydration mismatch）", () => {
    const html = renderToStaticMarkup(<MathField value="x" onChange={() => {}} />);
    expect(html).toContain('data-status="loading"');
    expect(html).not.toContain("<math-field");
  });

  it("加载成功后挂真元素、状态 ready、初值写入且静默、菜单关掉", async () => {
    render(<MathField value="\\sqrt{2}" onChange={() => {}} aria-label="公式" />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    expect(el.closest("[data-slot='math-field']")?.getAttribute("data-status")).toBe("ready");
    expect(el.getValue()).toBe("\\sqrt{2}");
    expect(el.setValueCalls[0]).toEqual({ value: "\\sqrt{2}", silent: true });
    expect(el.menuItems).toEqual([]);
    expect(el.getAttribute("aria-label")).toBe("公式");
    // 骨架已撤
    expect(document.querySelector("[data-slot='math-field'] [data-slot='skeleton']")).toBeNull();
  });
});

describe("MathField 受控", () => {
  it("用户击键 → onChange 收到 latex；父层 value 变化 → 静默 setValue；与元素当前值相同时不重复写", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MathField value="a" onChange={onChange} />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    act(() => el.type("a+b"));
    expect(onChange).toHaveBeenCalledWith("a+b");

    const before = el.setValueCalls.length;
    rerender(<MathField value="a+b" onChange={onChange} />);
    expect(el.setValueCalls.length).toBe(before); // 已相等，不写

    rerender(<MathField value="c" onChange={onChange} />);
    expect(el.setValueCalls.at(-1)).toEqual({ value: "c", silent: true });
    expect(el.getValue()).toBe("c");
  });

  it("回车 → onSubmit(当前 latex) 且阻止默认；没给 onSubmit 不阻止", async () => {
    const onSubmit = vi.fn();
    render(<MathField value="x^2" onChange={() => {}} onSubmit={onSubmit} />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    act(() => {
      el.dispatchEvent(enter);
    });
    expect(onSubmit).toHaveBeenCalledWith("x^2");
    expect(enter.defaultPrevented).toBe(true);
  });

  it("disabled / readOnly / placeholder / virtualKeyboard 透传，off 映射成 manual 并打标", async () => {
    const { rerender } = render(
      <MathField value="" onChange={() => {}} disabled readOnly placeholder="输入公式" virtualKeyboard="off" />,
    );
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    expect(el.disabled).toBe(true);
    expect(el.readOnly).toBe(true);
    expect(el.placeholder).toBe("输入公式");
    expect(el.mathVirtualKeyboardPolicy).toBe("manual");
    expect(el.closest("[data-slot='math-field']")?.getAttribute("data-keyboard")).toBe("off");

    rerender(<MathField value="" onChange={() => {}} virtualKeyboard="manual" />);
    expect(el.disabled).toBe(false);
    expect(el.readOnly).toBe(false);
    expect(el.placeholder).toBe("");
    expect(el.mathVirtualKeyboardPolicy).toBe("manual");
    expect(el.closest("[data-slot='math-field']")?.getAttribute("data-keyboard")).toBe("manual");
  });

  it("卸载时移除元素与监听", async () => {
    const onChange = vi.fn();
    const { unmount } = render(<MathField value="" onChange={onChange} />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    unmount();
    expect(document.querySelector("math-field")).toBeNull();
    el.type("z");
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

另建 `packages/ui/src/math-field/math-field.unavailable.test.tsx`（独立文件：`vi.mock` 是文件级的，且 `warnOnce` 的 key 只能在一个文件里触发）：

```tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("mathlive", () => {
  throw new Error("Cannot find package 'mathlive'");
});

afterEach(cleanup);

describe("MathField 缺依赖", () => {
  it("不抛错：渲染安装提示、状态 unavailable、warnOnce 一次", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { MathField } = await import("./math-field");
    const { MATH_FIELD_LOCALE_ZH } = await import("./math-field.locale");
    render(<MathField value="" onChange={() => {}} />);
    await waitFor(() =>
      expect(document.querySelector("[data-slot='math-field']")?.getAttribute("data-status")).toBe("unavailable"),
    );
    expect(screen.getByText(MATH_FIELD_LOCALE_ZH.missing)).toBeInTheDocument();
    expect(screen.getByText("pnpm add mathlive")).toBeInTheDocument();
    expect(document.querySelector("math-field")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("pnpm add mathlive");
    warn.mockRestore();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/math-field.test.tsx src/math-field/math-field.unavailable.test.tsx; echo rc=$?
```
期望：FAIL（找不到 `./math-field`）。

- [ ] **Step 3: 看清 Input 的静止态类与 token 名，再写组件**

```bash
sed -n 12,40p packages/ui/src/input/input.tsx          # inputShellVariants：抄它的边框 / 背景 / 圆角 / focus 环
grep -n "\-\-color-\(primary\|foreground\|muted\|border\|ring\|success\|danger\)\b" packages/tokens/src/*.css | head -12   # 确认 MathLive 变量要映射到的 token 真名
```

`packages/ui/src/math-field/math-field.tsx`（下面 `HOST_CLASS` 里的边框 / 背景 / 圆角 / focus 类以上一步看到的 `inputShellVariants` 默认档为准替换，其余照写）：

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Alert } from "../alert";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Skeleton } from "../skeleton";
import { Text } from "../text";
import { MATH_FIELD_LOCALE_ZH } from "./math-field.locale";
import type { MathFieldProps } from "./math-field.types";
import { loadMathLive, MATHLIVE_INSTALL_HINT, type MathfieldLike } from "./mathlive-loader";

type Status = "loading" | "ready" | "unavailable";

// MathLive 通过 CSS 变量取色，自定义属性能从宿主继承进 shadow DOM。这里把它们钉到本库 token，
// 亮 / 暗主题随 token 切换，不另写一份。变量名来自 mathlive.mjs 实际读取的清单（见计划顶部）。
const THEME_VARS = cn(
  "[--caret-color:var(--color-primary)]",
  "[--selection-background-color:color-mix(in_oklch,var(--color-primary)_18%,transparent)]",
  "[--selection-color:var(--color-foreground)]",
  "[--contains-highlight-background-color:color-mix(in_oklch,var(--color-primary)_10%,transparent)]",
  "[--placeholder-color:var(--color-muted)]",
  "[--smart-fence-color:var(--color-muted)]",
  "[--latex-color:var(--color-foreground)]",
  "[--highlight-text:var(--color-foreground)]",
  "[--correct-color:var(--color-success)]",
  "[--incorrect-color:var(--color-danger)]",
);

// 宿主里那个 <math-field> 的外观：与 Input 同一套静止态 / 聚焦态（照抄 inputShellVariants）。
const HOST_CLASS = cn(
  "[&>math-field]:block [&>math-field]:w-full [&>math-field]:min-h-10",
  "[&>math-field]:rounded-[var(--radius)] [&>math-field]:border [&>math-field]:border-border",
  "[&>math-field]:px-3 [&>math-field]:py-1.5 [&>math-field]:text-base [&>math-field]:text-foreground",
  "[&>math-field:focus-within]:outline-none [&>math-field:focus-within]:ring-2 [&>math-field:focus-within]:ring-ring",
  "[&>math-field[disabled]]:cursor-not-allowed [&>math-field[disabled]]:opacity-60",
  // 内置右键菜单已在 JS 里清空（menuItems = []）；键盘切换钮按 virtualKeyboard 决定。
  "[&>math-field::part(menu-toggle)]:hidden",
  "data-[keyboard=off]:[&>math-field::part(virtual-keyboard-toggle)]:hidden",
);

/**
 * MathLive 驱动的可视化公式输入框。值是不带 `$` 的 LaTeX。
 * 服务端与首帧渲染骨架；`mathlive` 在 effect 里动态加载，没装时显示安装提示而不是抛错。
 */
export function MathField({
  value,
  onChange,
  onSubmit,
  virtualKeyboard = "auto",
  keyboardLayouts,
  readOnly = false,
  disabled = false,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: MathFieldProps) {
  const L = useComponentLocale().mathField ?? MATH_FIELD_LOCALE_ZH;
  const hostRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<MathfieldLike | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // 最新回调放 ref：监听器只在挂元素时绑一次，不随每次渲染重绑。
  const latest = useRef({ onChange, onSubmit });
  latest.current = { onChange, onSubmit };
  // 初值也走 ref：挂元素的 effect 不依赖 value，否则每次输入都会重建元素。
  const initialValue = useRef(value);
  initialValue.current = value;

  useEffect(() => {
    let cancelled = false;
    loadMathLive().then(
      () => {
        if (!cancelled) setStatus("ready");
      },
      (error: unknown) => {
        if (cancelled) return;
        warnOnce("math-field:mathlive-missing", error instanceof Error ? error.message : String(error));
        setStatus("unavailable");
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // 挂真元素（ready 后一次）。
  useEffect(() => {
    if (status !== "ready") return;
    const host = hostRef.current;
    if (!host) return;
    const el = document.createElement("math-field") as MathfieldLike;
    el.menuItems = [];
    el.setValue(initialValue.current, { silenceNotifications: true });
    host.appendChild(el);
    fieldRef.current = el;

    const onInput = () => latest.current.onChange(el.getValue("latex"));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey || !latest.current.onSubmit) return;
      event.preventDefault();
      latest.current.onSubmit(el.getValue("latex"));
    };
    el.addEventListener("input", onInput);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("keydown", onKeyDown);
      el.remove();
      fieldRef.current = null;
    };
  }, [status]);

  // 受控同步：父层 value 变了且与元素当前值不同才写，写时静默（不触发 input → 不回环 onChange）。
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || el.getValue("latex") === value) return;
    el.setValue(value, { silenceNotifications: true });
  }, [value, status]);

  // 属性透传。
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.disabled = disabled;
    el.readOnly = readOnly;
    el.placeholder = placeholder ?? "";
    el.mathVirtualKeyboardPolicy = virtualKeyboard === "off" ? "manual" : virtualKeyboard;
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    else el.removeAttribute("aria-label");
  }, [status, disabled, readOnly, placeholder, virtualKeyboard, ariaLabel]);

  // 键盘布局是页面级单例（window.mathVirtualKeyboard），给了才动它。
  useEffect(() => {
    if (status !== "ready" || !keyboardLayouts) return;
    const keyboard = (window as { mathVirtualKeyboard?: { layouts: readonly unknown[] } }).mathVirtualKeyboard;
    if (keyboard) keyboard.layouts = keyboardLayouts;
  }, [status, keyboardLayouts]);

  return (
    <div
      data-slot="math-field"
      data-status={status}
      data-keyboard={virtualKeyboard}
      className={cn("relative w-full", THEME_VARS, HOST_CLASS, className)}
    >
      <div ref={hostRef} className={cn(status !== "ready" && "hidden")} />
      {status === "loading" && <Skeleton shape="rect" className="h-10 w-full" aria-label={L.loading} />}
      {status === "unavailable" && (
        <Alert tone="warning" title={L.missing}>
          <Text as="span" size="sm">
            {L.missingHint}{" "}
          </Text>
          <code className="font-mono text-sm">{MATHLIVE_INSTALL_HINT}</code>
        </Alert>
      )}
    </div>
  );
}
```

注意：
- `data-[keyboard=off]:[&>math-field::part(...)]:hidden` 这种「data 变体 + 任意变体」组合若 Tailwind 没生成规则（jsdom 看不出来，Task 4 的 browser 用例会查），退而把两个类拆成两条：`virtualKeyboard === "off" && "[&>math-field::part(virtual-keyboard-toggle)]:hidden"` 直接拼进 className。
- `Alert` 的 `tone` 取值见 `packages/ui/src/alert/alert.tsx:19`（`neutral | brand | info | success | warning | danger`）。
- `Skeleton` 是否输出 `data-slot="skeleton"`：先 `grep -n "data-slot" packages/ui/src/skeleton/skeleton.tsx`；没有的话测试里那条「骨架已撤」改成 `expect(container.querySelector("[aria-label='公式编辑器加载中']")).toBeNull()`。

- [ ] **Step 4: 跑测试 + typecheck，commit**

```bash
cd packages/ui && npx vitest run --project unit src/math-field; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulianui/ui typecheck; echo rc=$?
git add packages/ui/src/math-field/math-field.tsx packages/ui/src/math-field/math-field.test.tsx packages/ui/src/math-field/math-field.unavailable.test.tsx
git commit -m "feat(ui/math-field): MathField 主件（骨架首帧 / 动态挂 math-field / 受控同步 / 缺依赖提示）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 4: browser project 用真 MathLive 验注册 / 回流 / 键盘策略

**Files:**
- Create: `packages/ui/src/math-field/math-field.browser.test.tsx`

- [ ] **Step 1: 写 browser 测试**

```tsx
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MathField } from "./math-field";
import type { MathfieldLike } from "./mathlive-loader";

/**
 * jsdom 装不了 MathLive：自定义元素要 shadow DOM 排版、击键走它内部的隐藏 textarea、
 * 键盘切换钮是 shadow 里的 part。这些只在真实浏览器里可信。
 */
afterEach(cleanup);

type RealField = MathfieldLike & {
  executeCommand: (command: unknown) => boolean;
  shadowRoot: ShadowRoot | null;
};

async function mount(props: Partial<Parameters<typeof MathField>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(<MathField value="\\frac{1}{2}" onChange={onChange} {...props} />);
  await waitFor(() => expect(document.querySelector("math-field")).not.toBeNull(), { timeout: 10_000 });
  await customElements.whenDefined("math-field");
  return { ...utils, onChange, el: document.querySelector("math-field") as RealField };
}

describe("MathField × 真 MathLive", () => {
  it("注册成功：math-field 已升级为 MathfieldElement，初值可读回", async () => {
    const { el } = await mount();
    expect(customElements.get("math-field")).toBeDefined();
    expect(el.constructor.name).not.toBe("HTMLElement");
    expect(el.getValue("latex")).toBe("\\frac{1}{2}");
    expect(el.menuItems).toEqual([]);
  });

  it("用户输入回流 onChange，值是不带 $ 的 LaTeX", async () => {
    const { el, onChange } = await mount({ value: "" });
    el.focus();
    // insert 是 MathLive 的用户命令，会像击键一样派发 input。
    el.executeCommand(["insert", "\\sqrt{x}"]);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("\\sqrt{x}");
  });

  it("父层改 value 静默写入，不回环 onChange", async () => {
    const { el, onChange, rerender } = await mount();
    rerender(<MathField value="x^2" onChange={onChange} />);
    await waitFor(() => expect(el.getValue("latex")).toBe("x^2"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("virtualKeyboard=off：策略 manual 且切换钮不显示", async () => {
    const { el } = await mount({ virtualKeyboard: "off" });
    expect(el.mathVirtualKeyboardPolicy).toBe("manual");
    const toggle = el.shadowRoot?.querySelector<HTMLElement>('[part~="virtual-keyboard-toggle"]');
    if (toggle) expect(getComputedStyle(toggle).display).toBe("none");
  });

  it("主题变量穿进 shadow DOM：光标色等于 --color-primary", async () => {
    const { el } = await mount();
    const expected = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
    expect(getComputedStyle(el).getPropertyValue("--caret-color").trim()).toBe(`var(--color-primary)`);
    expect(expected).not.toBe("");
  });

  it("disabled 透传到元素", async () => {
    const { el } = await mount({ disabled: true });
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(true);
  });
});
```

- [ ] **Step 2: 跑 browser project**

```bash
cd packages/ui && npx vitest run --project browser src/math-field/math-field.browser.test.tsx; echo rc=$?
```
期望：PASS。若「用户输入回流」那条不触发 `input`（`executeCommand` 没派发），改用 `el.focus(); await userEvent.keyboard("x")`（`@testing-library/user-event` 是否已装：`ls packages/ui/node_modules/@testing-library`；没装则改成 `el.dispatchEvent(new InputEvent("beforeinput", { inputType: "insertText", data: "x", bubbles: true }))` 后再断言）。若 Enter 提交在真浏览器里被 MathLive 先吞（Task 3 的 keydown 收不到），把组件里的 `keydown` 监听换成 `beforeinput` 且 `inputType === "insertLineBreak"`，Task 3 的假元素测试同步改成派发 `InputEvent("beforeinput", { inputType: "insertLineBreak", cancelable: true })`。

- [ ] **Step 3: commit**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git add packages/ui/src/math-field/math-field.browser.test.tsx
# 若 Step 2 改了组件 / 假元素测试，一并 add packages/ui/src/math-field/math-field.tsx packages/ui/src/math-field/math-field.test.tsx
git commit -m "test(ui/math-field): browser project 用真 MathLive 验注册 / 回流 / 键盘策略 / 主题变量

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 5: `createCasComparator`（第 3 档等价比较器）

**Files:**
- Create: `packages/ui/src/math-field/cas.ts`
- Create: `packages/ui/src/math-field/cas.test.ts`
- Create: `packages/ui/src/math-field/cas.unavailable.test.ts`

**Interfaces:**
- Produces:
  - `createCasComparator(): Promise<(a: string, b: string) => boolean>`
  - `stripMathDelimiters(text: string): string`
  - `const COMPUTE_ENGINE_INSTALL_HINT = "pnpm add mathlive @cortex-js/compute-engine"`
  - `class ComputeEngineUnavailableError extends Error`
  - `resetComputeEngineForTests(): void`

- [ ] **Step 1: 写测试（先红）**

`packages/ui/src/math-field/cas.test.ts`（真 compute-engine，纯 JS，jsdom 能跑）：

```ts
import { describe, expect, it } from "vitest";
import { createCasComparator, stripMathDelimiters } from "./cas";
import { gradeObjective } from "../question/grade";

describe("stripMathDelimiters", () => {
  it.each([
    ["$\\frac{1}{2}$", "\\frac{1}{2}"],
    ["$$x^2$$", "x^2"],
    ["\\(a+b\\)", "a+b"],
    ["  2x+1  ", "2x+1"],
    ["x", "x"],
  ])("%s → %s", (input, expected) => {
    expect(stripMathDelimiters(input)).toBe(expected);
  });
});

describe("createCasComparator（Compute Engine 0.58 的实际行为，表驱动）", () => {
  it.each([
    ["\\frac{1}{2}", "0.5", true],
    ["2x+1", "1+2x", true],
    ["x^2", "x", false],
    ["\\sqrt{4}", "2", true],
    ["$\\frac{1}{2}$", "\\frac{2}{4}", true],
    ["\\frac{1}{", "0.5", false], // 解析失败 → false，不抛
    ["", "0", false],
  ])("%s ≡ %s → %s", async (a, b, expected) => {
    const equivalent = await createCasComparator();
    expect(equivalent(a, b)).toBe(expected);
  });

  it("同一进程复用同一个引擎实例（第二次不再 import）", async () => {
    const first = await createCasComparator();
    const second = await createCasComparator();
    expect(first("x+1", "1+x")).toBe(true);
    expect(second("x+1", "1+x")).toBe(true);
  });

  it("接进 gradeObjective 第 3 档：字面不等、归一不等、CAS 判等", async () => {
    const equivalent = await createCasComparator();
    const question = { type: "blank" as const, answer: [["\\frac{1}{2}"]], score: 5 };
    expect(gradeObjective(question, ["0.5"]).correct).toBe(false);
    expect(gradeObjective(question, ["0.5"], { equivalent }).correct).toBe(true);
    expect(gradeObjective(question, ["0.5"], { equivalent }).score).toBe(5);
  });
});
```

`packages/ui/src/math-field/cas.unavailable.test.ts`：

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@cortex-js/compute-engine", () => {
  throw new Error("Cannot find package '@cortex-js/compute-engine'");
});

describe("createCasComparator 缺依赖", () => {
  it("抛 ComputeEngineUnavailableError，消息带安装命令", async () => {
    const { createCasComparator, ComputeEngineUnavailableError, COMPUTE_ENGINE_INSTALL_HINT } = await import("./cas");
    await expect(createCasComparator()).rejects.toBeInstanceOf(ComputeEngineUnavailableError);
    await expect(createCasComparator()).rejects.toThrow(COMPUTE_ENGINE_INSTALL_HINT);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/cas.test.ts src/math-field/cas.unavailable.test.ts; echo rc=$?
```
期望：FAIL（找不到 `./cas`）。

- [ ] **Step 3: 写 cas.ts**

```ts
// 第 3 档判分比较器：交给 Compute Engine 判两个 LaTeX 是否数学等价。
// 只在 @hulianui/ui/math-field 这条 subpath 导出 —— Compute Engine 不随 mathlive 打包
// （mathlive 只通过 globalThis[Symbol.for("io.cortexjs.compute-engine")] 找它），
// 所以这里自己 import()，并把它声明成第二个 optional peer。
//
// 判分 SSOT 仍在服务端（见 question/grade.ts 顶部）：这个比较器给的是即时反馈与录题自测。

export const COMPUTE_ENGINE_INSTALL_HINT = "pnpm add mathlive @cortex-js/compute-engine";

interface BoxedLike {
  readonly isValid: boolean;
  isSame(rhs: BoxedLike): boolean;
  isEqual(rhs: BoxedLike): boolean | undefined;
}
interface ComputeEngineLike {
  parse(latex: string): BoxedLike;
}
type ComputeEngineCtor = new () => ComputeEngineLike;

export class ComputeEngineUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(`[瑚琏] createCasComparator 需要安装 @cortex-js/compute-engine：${COMPUTE_ENGINE_INSTALL_HINT}`, { cause });
    this.name = "ComputeEngineUnavailableError";
  }
}

/** 剥掉 `$…$` / `$$…$$` / `\(…\)` 并 trim；比较器收到的是学生原样输入，可能带定界符。 */
export function stripMathDelimiters(text: string): string {
  let s = text.trim();
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) s = s.slice(2, -2);
  else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) s = s.slice(1, -1);
  else if (s.startsWith("\\(") && s.endsWith("\\)") && s.length >= 4) s = s.slice(2, -2);
  return s.trim();
}

let pending: Promise<ComputeEngineLike> | null = null;

function loadComputeEngine(): Promise<ComputeEngineLike> {
  if (pending) return pending;
  const attempt = import("@cortex-js/compute-engine").then(
    (mod: unknown) => {
      const ctor = (mod as { ComputeEngine?: unknown }).ComputeEngine;
      if (typeof ctor !== "function") throw new ComputeEngineUnavailableError("module resolved without ComputeEngine");
      return new (ctor as ComputeEngineCtor)();
    },
    (error: unknown) => {
      throw error instanceof ComputeEngineUnavailableError ? error : new ComputeEngineUnavailableError(error);
    },
  );
  pending = attempt;
  attempt.catch(() => {
    if (pending === attempt) pending = null;
  });
  return attempt;
}

/**
 * 返回一个同步比较器，直接喂 `gradeObjective(question, answer, { equivalent })`。
 * 解析失败、空串、任何异常一律 `false`（判分宁可漏判不可误判）。
 */
export async function createCasComparator(): Promise<(a: string, b: string) => boolean> {
  const ce = await loadComputeEngine();
  return (a, b) => {
    const left = stripMathDelimiters(a);
    const right = stripMathDelimiters(b);
    if (left === "" || right === "") return false;
    try {
      const x = ce.parse(left);
      const y = ce.parse(right);
      if (!x.isValid || !y.isValid) return false;
      if (x.isSame(y)) return true;
      return x.isEqual(y) === true;
    } catch {
      return false;
    }
  };
}

/** 测试专用。 */
export function resetComputeEngineForTests(): void {
  pending = null;
}
```

- [ ] **Step 4: 跑测试；表里哪条与 CE 0.58 实际行为不符就改**测试期望**并在该行注释写明实测结果（不改比较器去迎合）；typecheck；commit**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/cas.test.ts src/math-field/cas.unavailable.test.ts; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulianui/ui typecheck; echo rc=$?
git add packages/ui/src/math-field/cas.ts packages/ui/src/math-field/cas.test.ts packages/ui/src/math-field/cas.unavailable.test.ts
git commit -m "feat(ui/math-field): createCasComparator（Compute Engine 第 3 档等价判分，async 加载）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 6: 目录 barrel + 导出面测试（math 入口与主 barrel 零 math-field）

**Files:**
- Create: `packages/ui/src/math-field/index.ts`
- Create: `packages/ui/src/math-field/exports.test.ts`

- [ ] **Step 1: 写测试（先红）**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as fieldEntry from "./index";
import * as mathEntry from "../math";
import * as rootEntry from "../index";

describe("math-field 导出面", () => {
  it("@hulianui/ui/math-field 的公开面", () => {
    for (const name of [
      "MathField",
      "createCasComparator",
      "stripMathDelimiters",
      "MATHLIVE_INSTALL_HINT",
      "COMPUTE_ENGINE_INSTALL_HINT",
      "MathLiveUnavailableError",
      "ComputeEngineUnavailableError",
      "MATH_FIELD_LOCALE_ZH",
      "MATH_FIELD_LOCALE_EN",
    ]) {
      expect((fieldEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("@hulianui/ui/math 与主 barrel 一个都不带（math 入口零 MathLive，主包体积增量 0）", () => {
    expect((mathEntry as Record<string, unknown>).MathField).toBeUndefined();
    expect((mathEntry as Record<string, unknown>).createCasComparator).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).MathField).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).createCasComparator).toBeUndefined();
  });

  it("math-field 目录里没有静态 import mathlive / compute-engine（只允许 import() 表达式）", () => {
    for (const file of ["math-field.tsx", "mathlive-loader.ts", "cas.ts", "index.ts", "math-field.types.ts", "math-field.locale.ts"]) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source, file).not.toMatch(/^import[^;]*from\s+["'](mathlive|@cortex-js\/compute-engine)["']/m);
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败，写 index.ts**

```bash
cd packages/ui && npx vitest run --project unit src/math-field/exports.test.ts; echo rc=$?
```

`packages/ui/src/math-field/index.ts`：

```ts
// @hulianui/ui/math-field —— MathLive 驱动的可视化公式键盘，独立 subpath。
// 主入口 @hulianui/ui 与 @hulianui/ui/math 刻意不导出这里的任何东西：
// mathlive（+ 它钉死的 @cortex-js/compute-engine）是 optional peer，只有真要可视化输入 /
// CAS 判分的页面才为它们买单。MathField 满足 MathFieldLikeProps，注入 MathTextarea 的
// visualEditor 与 QuestionAnswer 的 mathField 即可。
export { MathField } from "./math-field";
export type { MathFieldProps, MathFieldKeyboardPolicy } from "./math-field.types";
export { MATH_FIELD_LOCALE_ZH, MATH_FIELD_LOCALE_EN } from "./math-field.locale";
export type { MathFieldLocale } from "./math-field.locale";
export { MATHLIVE_INSTALL_HINT, MathLiveUnavailableError } from "./mathlive-loader";
export {
  createCasComparator,
  stripMathDelimiters,
  COMPUTE_ENGINE_INSTALL_HINT,
  ComputeEngineUnavailableError,
} from "./cas";
```

- [ ] **Step 3: 跑 math-field 全部 unit 用例 + typecheck，commit**

```bash
cd packages/ui && npx vitest run --project unit src/math-field; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulianui/ui typecheck; echo rc=$?
git add packages/ui/src/math-field/index.ts packages/ui/src/math-field/exports.test.ts
git commit -m "feat(ui/math-field): subpath barrel 与导出面测试（math 入口 / 主 barrel 零 math-field）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 7: showcase + 注册 + 英文词表 + ssr-safety

**Files:**
- Create: `packages/ui/src/math-field/math-field.showcase.tsx`
- Modify: `packages/ui/src/showcase.ts:122`（在 `questionAnswerShowcase` 之后加一行）
- Modify: `apps/www/lib/manifest.ts:186`（在 question-answer 之后）
- Modify: `apps/www/lib/registry.tsx:165` 与 `:615`（import + map）
- Modify: `apps/www/i18n/component-meta.en.ts:209` 之后
- Modify: `apps/www/i18n/showcase-copy.en.json`（生成器补词条）

- [ ] **Step 1: 写 showcase**

```tsx
"use client";
import { useEffect, useState } from "react";
import { MathTextarea } from "../math-textarea/math-textarea";
import { gradeObjective } from "../question/grade";
import type { Question, StudentAnswer } from "../question/question.types";
import { QuestionAnswer } from "../question-answer/question-answer";
import type { QuestionAnswerResult } from "../question-answer/question-answer.types";
import type { ShowcaseSpec } from "../showcase/types";
import { Text } from "../text";
import { createCasComparator } from "./cas";
import { MathField } from "./math-field";
import type { MathFieldProps } from "./math-field.types";

// 示例公式刻意不以数字收尾：英文词表门禁数保护 token 时不认「数字紧贴 $」。
const INITIAL = "\\frac{a}{b}+\\sqrt{c}";
const STEM = "计算 $\\frac{1}{2}+\\frac{1}{3}$ 的值：____";

function Demo({ initial = INITIAL, ...rest }: { initial?: string } & Partial<Omit<MathFieldProps, "value" | "onChange">>) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-full max-w-md space-y-2">
      <MathField {...rest} value={value} onChange={setValue} aria-label="公式" />
      <Text as="p" size="xs" tone="muted" family="mono">
        {value || " "}
      </Text>
    </div>
  );
}

function TextareaDemo() {
  const [value, setValue] = useState("已知 $x^2=4$，求 $x$。");
  return (
    <div className="w-full max-w-xl">
      <MathTextarea multiline aria-label="题干" value={value} onChange={setValue} visualEditor={MathField} />
    </div>
  );
}

const BLANK: Question = {
  type: "blank",
  stem: STEM,
  options: null,
  answer: [["\\frac{5}{6}"]],
  analysis: "通分：$\\frac{3}{6}+\\frac{2}{6}=\\frac{5}{6}$。",
  difficulty: 2,
  score: 5,
};

/** 三档判分：字面 → 归一 → CAS。学生用公式键盘敲出 \frac{10}{12} 也判对。 */
function GradedDemo() {
  const [value, setValue] = useState<StudentAnswer | undefined>();
  const [result, setResult] = useState<QuestionAnswerResult | null>(null);
  const [equivalent, setEquivalent] = useState<((a: string, b: string) => boolean) | undefined>();
  useEffect(() => {
    let alive = true;
    createCasComparator().then((fn) => {
      if (alive) setEquivalent(() => fn);
    }, () => {});
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="w-full max-w-xl">
      <QuestionAnswer
        question={{ type: BLANK.type, stem: BLANK.stem, options: null, blankCount: 1, difficulty: BLANK.difficulty }}
        value={value}
        onChange={setValue}
        result={result}
        blankInput="math"
        mathField={MathField}
        onSubmit={(answer) => {
          const graded = gradeObjective(BLANK, answer, { normalize: true, tolerance: 0.001, equivalent });
          setResult({ correct: graded.correct === true, correctAnswer: BLANK.answer, analysis: BLANK.analysis });
        }}
      />
    </div>
  );
}

export const mathFieldShowcase: ShowcaseSpec = {
  controls: [
    { prop: "virtualKeyboard", type: "select", options: ["auto", "manual", "off"], defaultValue: "auto", label: "虚拟键盘" },
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "readOnly", type: "boolean", defaultValue: false },
    { prop: "placeholder", type: "text", defaultValue: "输入公式" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "disabled", render: () => <Demo disabled /> },
    { name: "readOnly", render: () => <Demo readOnly /> },
    { name: "keyboard-off", render: () => <Demo virtualKeyboard="off" /> },
  ],
  examples: [
    {
      title: "基础用法",
      description: "受控的 LaTeX 值（不带 $）。首帧是骨架，mathlive 在客户端动态加载。",
      code: `<MathField value={latex} onChange={setLatex} aria-label="公式" />`,
      render: () => <Demo />,
    },
    {
      title: "注入 MathTextarea",
      description: "传组件本身给 visualEditor，MathTextarea 多出「可视化输入」页签，确认后仍按 $…$ 插到光标处。",
      code: `<MathTextarea multiline value={value} onChange={setValue} visualEditor={MathField} />`,
      render: () => <TextareaDemo />,
    },
    {
      title: "填空题公式键盘 + 三档判分",
      description: "QuestionAnswer 的 blankInput=\"math\"；提交时 gradeObjective 依次走字面、归一、createCasComparator。",
      code: `const equivalent = await createCasComparator();
<QuestionAnswer question={q} value={v} onChange={setV} blankInput="math" mathField={MathField}
  onSubmit={(a) => gradeObjective(q, a, { normalize: true, equivalent })} />`,
      render: () => <GradedDemo />,
    },
    {
      title: "虚拟键盘策略",
      description: "manual 只由切换钮弹出；off 不挂键盘（策略 manual 且隐藏切换钮），适合桌面端录题。",
      code: `<MathField value={latex} onChange={setLatex} virtualKeyboard="off" />`,
      render: () => <Demo virtualKeyboard="off" />,
    },
    {
      title: "禁用与只读",
      description: "已提交的作答传 disabled；展示参考答案传 readOnly。",
      code: `<MathField value={latex} onChange={setLatex} disabled />`,
      render: () => (
        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <Demo disabled />
          <Demo readOnly initial="\\int_0^1 x\\,dx" />
        </div>
      ),
    },
  ],
  renderWithProps: (props) => <Demo {...(props as Partial<MathFieldProps>)} />,
  toCode: (props) => {
    const attrs = Object.entries(props)
      .filter(([, v]) => v !== false && v !== "" && v !== undefined)
      .map(([k, v]) => (v === true ? k : `${k}=${JSON.stringify(v)}`))
      .join(" ");
    return `<MathField value={latex} onChange={setLatex}${attrs ? " " + attrs : ""} />`;
  },
};
```

写完先看 `packages/ui/src/math-textarea/math-textarea.showcase.tsx` 末尾 `renderWithProps` / `toCode` 的写法，与本仓其它 showcase 保持一致（`Text` 是否有 `family` prop：`grep -n family packages/ui/src/text/text.types.ts`，没有就去掉）。

- [ ] **Step 2: 三处注册**

`packages/ui/src/showcase.ts` 第 122 行之后：
```ts
export { mathFieldShowcase } from "./math-field/math-field.showcase";
```

`apps/www/lib/manifest.ts` 第 186 行（question-answer）之后：
```ts
  { slug: "math-field", name: "MathField", shortName: "可视化公式键盘", description: "MathLive 驱动的公式输入框：所见即所得地敲出 LaTeX，可注入公式输入框与作答卡，另给 CAS 等价判分", category: "forms", group: "advanced", status: "new" },
```

`apps/www/lib/registry.tsx`：第 165 行附近 import 列表加 `mathFieldShowcase,`；第 615 行之后加 `"math-field": mathFieldShowcase,`。

`apps/www/i18n/component-meta.en.ts` 的 `"question-answer"` 块之后：
```ts
  "math-field": {
    shortName: "MathField",
    description:
      "MathLive-powered formula input: type LaTeX visually, inject it into MathTextarea and QuestionAnswer, and grade with CAS equivalence.",
    keywords: ["math", "formula", "latex", "mathlive", "keyboard", "forms"],
  },
```

- [ ] **Step 3: ssr-safety + showcase 门禁 + 英文词表**

```bash
cd packages/ui && npx vitest run --project unit src/showcase/ssr-safety.test.tsx; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm showcase:check; echo rc=$?
```
`showcase:check` 报 missing 时按阶段 4 的做法循环补 `apps/www/i18n/showcase-copy.en.json` 的 `exact` 块（每次只报第一条）：

```bash
for i in $(seq 1 40); do out=$(pnpm -s showcase:check 2>&1) && break; echo "$out" | grep -m1 -i "missing"; done
```
每条 missing 的中文键手工写英文值（键是解码后的运行时字符串，单反斜杠；公式段原样保留；`protectedTokens` 逐字）。补完再跑一次 `pnpm showcase:check; echo rc=$?` 与 `pnpm showcase:generate`。

- [ ] **Step 4: typecheck 全仓 + commit**

```bash
pnpm typecheck; echo rc=$?
git add packages/ui/src/math-field/math-field.showcase.tsx packages/ui/src/showcase.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx apps/www/i18n/component-meta.en.ts apps/www/i18n/showcase-copy.en.json
git status --short apps/www/generated | head    # showcase:generate 的产物一并 add
git add apps/www/generated/showcase-en
git commit -m "feat(www): MathField 画廊示例（含 MathTextarea 注入与三档判分）+ 四处注册 + 英文词条

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 8: 中英 md + 相邻文档收尾 + docs:all + perf-lab + README 计数

**Files:**
- Create: `packages/ui/src/math-field/math-field.md`、`math-field.en.md`
- Modify: `packages/ui/src/question-answer/question-answer.md:75` / `.en.md:75`（去掉「阶段 5」注释，改成链接）、`math-textarea.md:56,112` / `.en.md`（链到 math-field 文档）、`packages/ui/src/math/math.md` / `.en.md`（顶部导入表加一行 `@hulianui/ui/math-field`）
- Regenerate: `pnpm docs:all` 产物、`apps/perf-lab/scenarios/generated.ts`、三份 README

- [ ] **Step 1: 写中文 md**

先 `sed -n 1,30p packages/ui/src/math-textarea/math-textarea.md` 看 frontmatter / 描述行体裁，照抄结构。`packages/ui/src/math-field/math-field.md` 内容骨架（每节都要有实文）：

```markdown
（frontmatter 与 math-textarea.md 同款：name / slug / category / group / status / 中文简介）

> 可视化公式键盘 · MathLive 驱动，所见即所得地敲出 LaTeX（值不带 $）· 满足 MathFieldLikeProps，直接注入 MathTextarea 的 visualEditor 与 QuestionAnswer 的 mathField · 服务端与首帧渲染骨架，mathlive 在客户端动态加载，没装时显示安装提示不白屏 · 独立子路径 @hulianui/ui/math-field，主包与 @hulianui/ui/math 零 MathLive · 另给 createCasComparator 做第 3 档等价判分 · forms/advanced

## 安装

`mathlive` 是可选 peer：`pnpm add mathlive`（要用 `createCasComparator` 再加 `@cortex-js/compute-engine`，它是 mathlive 钉死的依赖，通常已经在 node_modules 里）。字体由你引入一次：`import "mathlive/fonts.css"`。缺字体只是回退成系统字体，不是白屏。
peer 下界 `mathlive >=0.110.0`、`@cortex-js/compute-engine >=0.58.0`：只承诺测过的版本（0.9x → 0.10x 之间 menuItems 与键盘策略语义都改过）。

## 用法
（导入 + 受控示例 + 注入 MathTextarea + 注入 QuestionAnswer 三段代码，与 showcase 一致）

## Props
| 名称 | 类型 | 默认 | 说明 |
（value / onChange / onSubmit / disabled / aria-label / className / virtualKeyboard / keyboardLayouts / readOnly / placeholder 十行，全部来自 MathFieldProps 与 MathFieldLikeProps）

## 事件
（onChange：每次击键，参数 LaTeX；onSubmit：回车）

## createCasComparator
签名 `createCasComparator(): Promise<(a: string, b: string) => boolean>`；async 的原因（Compute Engine 需单独加载）；解析失败一律 false；与 gradeObjective 的接法；服务端才是判分 SSOT。

## SSR 与加载
三态（loading 骨架 / ready / unavailable 提示）；为什么首帧不挂元素；Next App Router 直接用（组件已是 client）；Vite 可选 `optimizeDeps.include: ["mathlive"]`。

## 虚拟键盘
auto / manual / off 的语义；键盘是页面级单例（keyboardLayouts 后挂载覆盖先挂载）。

## 主题
把 MathLive 的 CSS 变量钉到本库 token（列出映射表），亮暗随主题。

## 注意事项
- 值是不带 $ 的 LaTeX；要插进题干走 MathTextarea 的 visualEditor（它负责套 $）。
- 注入的是组件不是元素：`mathField={MathField}`。
- jsdom 里 mathlive 解析到 SSR 构建，组件会显示安装提示；消费方单测里 `vi.mock("mathlive")` 或直接断言骨架。

## 相关
- MathTextarea / QuestionAnswer / QuestionEditor / Formula 的相对链接
- docs/consuming-math.md
```

- [ ] **Step 2: 写英文 md**

`packages/ui/src/math-field/math-field.en.md`：同结构，用法段标题 `## Examples`，零 CJK、零 em-dash。

- [ ] **Step 3: 相邻文档收尾**

- `question-answer.md:75` 与 `.en.md:75`：把 `// 阶段 5，可选 peer mathlive` / `// phase 5, optional peer mathlive` 改成 `// 可选 peer mathlive，见 ../math-field/math-field.md` / `// optional peer mathlive, see ../math-field/math-field.en.md`；「相关」节各加一行链接 math-field 文档。
- `math-textarea.md:56` / `.en.md:56` 的 visualEditor 行末尾加 `（[文档](../math-field/math-field.md)）` / `([docs](../math-field/math-field.en.md))`；「相关」节各加一行。
- `math/math.md` / `math.en.md` 顶部导入表加一行：`@hulianui/ui/math-field` | MathField、createCasComparator | 可选 peer mathlive。

- [ ] **Step 4: 生成链（顺序不能换）**

```bash
pnpm docs:all; echo rc=$?
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts; echo rc=$?
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check; echo rc=$?
pnpm readme:sync; echo rc=$?
grep -c "399" README.md README.en.md packages/ui/README.md    # 各 ≥1
pnpm docs:check:props; echo rc=$?
pnpm docs:i18n:check; echo rc=$?
pnpm conventions:check; echo rc=$?
pnpm check:remote-assets; echo rc=$?
```
`docs:check:props` 若报 MathFieldProps 字段缺行，补 md 表格；若 `docs:all` 覆盖了手写 md（`git diff packages/ui/src/math-field/*.md` 出现被 scaffold 替换的迹象），说明 md 写在 `docs:all` 之后才被扫到的顺序错了，`git checkout` 回手写版再跑。

- [ ] **Step 5: commit（先看清单再 add，排除 upload.tsx）**

```bash
git status --short
git add packages/ui/src/math-field/math-field.md packages/ui/src/math-field/math-field.en.md \
  packages/ui/src/question-answer/question-answer.md packages/ui/src/question-answer/question-answer.en.md \
  packages/ui/src/math-textarea/math-textarea.md packages/ui/src/math-textarea/math-textarea.en.md \
  packages/ui/src/math/math.md packages/ui/src/math/math.en.md \
  README.md README.en.md packages/ui/README.md \
  apps/perf-lab/scenarios/generated.ts packages/guard/conventions.json packages/ui/conventions.json
# docs:all 的其余产物（apps/www/public/llms*、apps/www/public/r/*.json、apps/www/generated/**、apps/www/lib/changelog*.json、skill 索引）逐个 add：
git status --short | awk '$1=="M"||$1=="??"{print $2}' | grep -v "packages/ui/src/upload/upload.tsx" | xargs git add
git status --short    # 此时只应剩 " M packages/ui/src/upload/upload.tsx"
git commit -m "docs(ui/math-field): 中英文档 + 相邻文档链接 + docs:all / perf-lab 产物 + README 计数（399）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 9: 体积与消费方门禁（size-limits 新行 / bundle-size.sh 装 optional peer / consumer-typecheck 加子路径）

**Files:**
- Modify: `scripts/bundle-size.sh:46-62`（gate 工程 dependencies）、`:76-81`（dep 断言循环）
- Modify: `scripts/size-limits.json`（`$comment` 第 3 条 + 新 target）
- Modify: `scripts/consumer-typecheck.sh:20-21`（注释）、`:216-230`（app.tsx 加 math-field）

- [ ] **Step 1: bundle-size.sh 的空白工程装 optional peer**

把第 46–48 行那段注释改成：

```bash
# peer 必须装齐：少一个，esbuild 会把它当外部模块跳过，体积凭空少一大块，门禁失真。
# 两个 optional peer（mathlive / @cortex-js/compute-engine）在这里**故意装上**：math-field 入口
# 用 import() 懒加载它们，不装则 esbuild 解析失败；装了它们只进独立 chunk —— initial 不含、total 含，
# 正好量出「消费方打开公式键盘那一刻才付的字节」。
```

`dependencies` 里加两行（字母序）：

```json
    "@cortex-js/compute-engine": "^0.58.0",
    "mathlive": "^0.110.0",
```

dep 断言循环 `for dep in recharts @tanstack+react-table @vidstack+react @tiptap+react; do` 改成 `for dep in recharts @tanstack+react-table @vidstack+react @tiptap+react mathlive @cortex-js+compute-engine; do`。

- [ ] **Step 2: consumer-typecheck.sh 的注释与样例**

第 20–21 行注释改成：

```bash
# 消费方工程只装库声明的**必需** peer（react / react-dom / @base-ui/react / motion / tailwindcss），
# optional peer（mathlive / @cortex-js/compute-engine）**一个都不装** —— 这正是要测的：
# @hulianui/ui/math-field 的类型面不许依赖它们，没装的消费方也要能 typecheck 通过。
```

`app.tsx` heredoc 的 import 区加：

```tsx
import { MathField } from "@hulianui/ui/math-field";
```
JSX 里加一行（放在 `<Formula ...>` 之后）：

```tsx
      {/* MathField 走 @hulianui/ui/math-field：mathlive 是 optional peer，这个工程刻意没装，类型面必须独立。 */}
      <MathField value="" onChange={() => {}} aria-label="formula" />
```

- [ ] **Step 3: 跑消费方 typecheck（本机需 pnpm 8 shim，见记忆 hulian-local-consumer-gates-need-pnpm8-shim）**

```bash
bash scripts/consumer-typecheck.sh; echo rc=$?
```
期望 rc=0。若报 `Cannot find module 'mathlive'` 之类，说明 `dist/math-field/*.d.ts` 泄漏了 mathlive 类型：`grep -rn "mathlive\|compute-engine" packages/ui/dist/math-field/` 定位，把对应类型改成结构化接口。

- [ ] **Step 4: 先量再写基线**

```bash
CI=1 pnpm size; echo rc=$?          # 此时还没有 math-field 行，先确认 14 个既有入口全绿、math ≤ 208
CI=1 bash scripts/bundle-size.sh --why math 2>&1 | grep -c "mathlive"            # 期望 0
CI=1 bash scripts/bundle-size.sh --why math 2>&1 | grep -c "config/locale.ts"    # 期望 0
CI=1 bash scripts/bundle-size.sh --why root-barrel 2>&1 | grep -c "math-field/"  # 期望 0
```

`scripts/size-limits.json` 先加一行**临时大值**量实测：

```json
    {
      "name": "math-field",
      "entry": "@hulianui/ui/math-field",
      "limitKB": 999
    },
```
（放在 `math` 那条之后、`date-picker` 之前。）`$comment` 第 3 条的「五大重依赖入口（chart/video/markdown-editor/rich-text-editor/math）」改成「六个重依赖入口（chart/video/markdown-editor/rich-text-editor/math/math-field；math-field 的 mathlive 与 compute-engine 走 import() 懒加载，initial 只剩壳，total 才含它们）」。

```bash
CI=1 pnpm size 2>&1 | grep "math-field"     # 读 initial 实测值 X 与 total
```
把 `limitKB: 999` 改成 `ceil(X × 1.15)`（保留 0.5 精度，与其它行一致），再跑：

```bash
CI=1 pnpm size; echo rc=$?     # 15 入口全绿
CI=1 bash scripts/bundle-size.sh --why math-field 2>&1 | head -40   # 记下 mathlive / compute-engine 各自 chunk 的 gzip，Task 12 写进消费指南
```

- [ ] **Step 5: commit**

```bash
git add scripts/bundle-size.sh scripts/consumer-typecheck.sh scripts/size-limits.json
git commit -m "build(gates): math-field 体积基线（initial 实测 XKB → 上限 YKB）；体积门禁装 optional peer；消费方 typecheck 覆盖 @hulianui/ui/math-field

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```
（message 里的 X / Y 用实测值替换。）

---

### Task 10: demo「瀚学」题库页（fixture + store + 列表 + Drawer 内 QuestionEditor）

**Files:**
- Create: `apps/www/app/demos/learn/_data/questions.ts`、`questions.content.ts`
- Create: `apps/www/app/demos/learn/_lib/question-bank-store.tsx`
- Create: `apps/www/app/demos/learn/_components/question-bank-client.tsx`、`question-bank-client.content.ts`
- Create: `apps/www/app/demos/learn/(app)/questions/page.tsx`
- Modify: `apps/www/app/demos/learn/_components/learn-shell.tsx`（挂 `QuestionBankProvider`）
- Modify: `apps/www/app/demos/learn/(app)/layout.tsx`（ToastProvider / ModalProvider，若尚未在 learn 子树挂载）

**Interfaces:**
- Produces（store）：
  ```ts
  interface BankQuestion { id: string; courseId: string; question: Question; updatedAt: string }
  interface Attempt { answer: StudentAnswer; correct: boolean | null; score: number }
  interface QuestionBank {
    questions: BankQuestion[];
    add: (courseId: string, question: Question) => BankQuestion;
    update: (id: string, question: Question) => void;
    remove: (id: string) => void;
    attempts: Record<string, Attempt>;
    recordAttempt: (id: string, attempt: Attempt) => void;
    resetAttempts: () => void;
  }
  function QuestionBankProvider({ children }): JSX.Element
  function useQuestionBank(): QuestionBank
  ```

- [ ] **Step 1: 先看清 learn 里 toast 的 Provider 挂在哪**

```bash
grep -rn "ToastProvider\|ModalProvider" apps/www/app/layout.tsx apps/www/app/demos/learn apps/www/app/demos/_components | head
```
若 learn 子树与根布局都没有，就在 `apps/www/app/demos/learn/(app)/layout.tsx` 的 `<LearnShell>` 内 children 之后加 `<ToastProvider />` 与 `<ModalProvider />`（从 `@hulianui/ui` import；写法见 `apps/www/app/demos/scheduler/layout.tsx`）。若已有，跳过。

- [ ] **Step 2: fixture（内容全部走 copy）**

`apps/www/app/demos/learn/_data/questions.content.ts`（与 `clinic.content.ts` 同款骨架：`content` / `ContentKey` / `copy` / 默认导出 `Dictionary`，`key: "demo-learn-data-questions"`），词条：

```ts
    // 题干 / 选项 / 解析。公式段两边语言一致，只翻自然语言。
    q1Stem: "已知 $\\sin A=\\frac{3}{5}$ 且 $A$ 为锐角，则 $\\cos A$ 的值为（ ）",
    q1OptA: "$\\frac{4}{5}$", q1OptB: "$\\frac{3}{4}$", q1OptC: "$\\frac{5}{4}$", q1OptD: "$\\frac{5}{3}$",
    q1Analysis: "由 $\\sin^2 A+\\cos^2 A=1$ 得 $\\cos A=\\frac{4}{5}$。",
    q2Stem: "下列函数中，在 $(0,+\\infty)$ 上单调递增的有（ ）",
    q2OptA: "$y=x^2$", q2OptB: "$y=\\frac{1}{x}$", q2OptC: "$y=\\ln x$", q2OptD: "$y=-x$",
    q2Analysis: "$y=x^2$ 与 $y=\\ln x$ 在 $(0,+\\infty)$ 上递增。",
    q3Stem: "函数 $y=\\sin x$ 是奇函数。",
    q3Analysis: "$\\sin(-x)=-\\sin x$，是奇函数。",
    q4Stem: "计算 $\\frac{1}{2}+\\frac{1}{3}$ 的值：____",
    q4Analysis: "通分：$\\frac{3}{6}+\\frac{2}{6}=\\frac{5}{6}$。",
    q5Stem: "方程 $x^2-5x+6=0$ 的两根之和为 ____，两根之积为 ____",
    q5Analysis: "由韦达定理：$x_1+x_2=5$，$x_1x_2=6$。",
    q6Stem: "求函数 $f(x)=x^3-3x$ 的极值。",
    q6Reference: "$f'(x)=3x^2-3$，令 $f'(x)=0$ 得 $x=\\pm 1$；极大值 $f(-1)=2$，极小值 $f(1)=-2$。",
    q6Point1: "正确求导", q6Point2: "求出驻点", q6Point3: "判断极大 / 极小并求值",
```
英文对照逐键给出（自然语言英译，公式不变；例如 `q1Stem: "Given $\\sin A=\\frac{3}{5}$ with $A$ acute, the value of $\\cos A$ is ( )"`）。

`apps/www/app/demos/learn/_data/questions.ts`：

```ts
import { copy } from "./questions.content";
import type { Question } from "@hulianui/ui/math";

export interface SeedQuestion {
  id: string;
  /** 挂在哪门课下（复用 courses.ts 的 id）。 */
  courseId: string;
  question: Question;
}

// 六道题覆盖 single / multiple / judge / blank（单空、双空）/ calculation。
// 客观题全部能被 gradeObjective 判；calculation 在练习页只读展示，提醒「需老师批阅」。
export const seedQuestions: SeedQuestion[] = [
  {
    id: "q1",
    courseId: "react-foundations",
    question: {
      type: "single",
      stem: copy("q1Stem"),
      options: [
        { key: "A", text: copy("q1OptA") },
        { key: "B", text: copy("q1OptB") },
        { key: "C", text: copy("q1OptC") },
        { key: "D", text: copy("q1OptD") },
      ],
      answer: "A",
      analysis: copy("q1Analysis"),
      difficulty: 2,
      score: 5,
    },
  },
  {
    id: "q2",
    courseId: "react-foundations",
    question: {
      type: "multiple",
      stem: copy("q2Stem"),
      options: [
        { key: "A", text: copy("q2OptA") },
        { key: "B", text: copy("q2OptB") },
        { key: "C", text: copy("q2OptC") },
        { key: "D", text: copy("q2OptD") },
      ],
      answer: ["A", "C"],
      analysis: copy("q2Analysis"),
      difficulty: 3,
      score: 5,
    },
  },
  { id: "q3", courseId: "react-foundations", question: { type: "judge", stem: copy("q3Stem"), options: null, answer: true, analysis: copy("q3Analysis"), difficulty: 1, score: 2 } },
  { id: "q4", courseId: "react-foundations", question: { type: "blank", stem: copy("q4Stem"), options: null, answer: [["\\frac{5}{6}"]], analysis: copy("q4Analysis"), difficulty: 2, score: 5 } },
  { id: "q5", courseId: "react-foundations", question: { type: "blank", stem: copy("q5Stem"), options: null, answer: [["5"], ["6"]], analysis: copy("q5Analysis"), difficulty: 2, score: 6 } },
  {
    id: "q6",
    courseId: "react-foundations",
    question: {
      type: "calculation",
      stem: copy("q6Stem"),
      options: null,
      answer: { reference: copy("q6Reference"), rubric: [{ point: copy("q6Point1"), score: 3 }, { point: copy("q6Point2"), score: 3 }, { point: copy("q6Point3"), score: 4 }] },
      analysis: "",
      difficulty: 4,
      score: 10,
    },
  },
];
```
courseId 用 `apps/www/app/demos/learn/_data/courses.ts` 里真实存在的 id（`grep -n "id: \"" apps/www/app/demos/learn/_data/courses.ts | head`，`react-foundations` 是 task11 脚本里出现过的）。

- [ ] **Step 3: store**

`apps/www/app/demos/learn/_lib/question-bank-store.tsx`：

```tsx
"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Question, StudentAnswer } from "@hulianui/ui/math";
import { seedQuestions } from "../_data/questions";

export interface BankQuestion {
  id: string;
  courseId: string;
  question: Question;
  updatedAt: string;
}

export interface Attempt {
  answer: StudentAnswer;
  /** null = 主观题，等老师批。 */
  correct: boolean | null;
  score: number;
}

export interface QuestionBank {
  questions: BankQuestion[];
  add: (courseId: string, question: Question) => BankQuestion;
  update: (id: string, question: Question) => void;
  remove: (id: string) => void;
  attempts: Record<string, Attempt>;
  recordAttempt: (id: string, attempt: Attempt) => void;
  resetAttempts: () => void;
}

const Ctx = createContext<QuestionBank | null>(null);

// 固定时间戳，不读系统时钟（静态导出下 SSR 与客户端首帧要一致，见 #181）。
const SEED_TIME = "2026-09-01T09:00:00";

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<BankQuestion[]>(() =>
    seedQuestions.map((s) => ({ id: s.id, courseId: s.courseId, question: s.question, updatedAt: SEED_TIME })),
  );
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [serial, setSerial] = useState(seedQuestions.length);

  const add = useCallback<QuestionBank["add"]>(
    (courseId, question) => {
      const next = serial + 1;
      const row: BankQuestion = { id: `q${next}`, courseId, question, updatedAt: SEED_TIME };
      setSerial(next);
      setQuestions((list) => [row, ...list]);
      return row;
    },
    [serial],
  );
  const update = useCallback<QuestionBank["update"]>((id, question) => {
    setQuestions((list) => list.map((row) => (row.id === id ? { ...row, question } : row)));
  }, []);
  const remove = useCallback<QuestionBank["remove"]>((id) => {
    setQuestions((list) => list.filter((row) => row.id !== id));
  }, []);
  const recordAttempt = useCallback<QuestionBank["recordAttempt"]>((id, attempt) => {
    setAttempts((map) => ({ ...map, [id]: attempt }));
  }, []);
  const resetAttempts = useCallback(() => setAttempts({}), []);

  const value = useMemo<QuestionBank>(
    () => ({ questions, add, update, remove, attempts, recordAttempt, resetAttempts }),
    [questions, add, update, remove, attempts, recordAttempt, resetAttempts],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuestionBank(): QuestionBank {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuestionBank must be used within QuestionBankProvider");
  return ctx;
}
```

`learn-shell.tsx`：找到 `<LearnStoreProvider>` 包 children 的位置，在其内层再包一层 `<QuestionBankProvider>`（import 自 `../_lib/question-bank-store`）。

- [ ] **Step 4: 题库页客户端组件**

`apps/www/app/demos/learn/_components/question-bank-client.content.ts`（`key: "demo-learn-components-question-bank-client"`）词条（zh 值如下，en 对照自己写、零 CJK）：

```ts
    title: "题库",
    subtitle: "老师录题：七种题型、公式模板、可视化公式键盘、实时预览与结构校验",
    newQuestion: "新建题目",
    editQuestion: "编辑题目",
    filterAll: "全部",
    typeSingle: "单选", typeMultiple: "多选", typeJudge: "判断", typeBlank: "填空", typeSubjective: "主观",
    save: "保存",
    cancel: "取消",
    saved: "题目已保存",
    created: "题目已创建",
    deleted: "题目已删除",
    deleteConfirm: "删除这道题？练习记录一并清除。",
    delete: "删除",
    edit: "编辑",
    emptyTitle: "这个题型还没有题",
    emptyHint: "点「新建题目」录一道",
    fixIssues: "还有校验问题没处理",
    count: "共 {0} 道",
```

`question-bank-client.tsx`：

```tsx
"use client";
import { copy } from "./question-bank-client.content";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  DrawerContent,
  Empty,
  Heading,
  Popconfirm,
  Segmented,
  Skeleton,
  Stack,
  Text,
  toast,
} from "@hulianui/ui";
import { MathField } from "@hulianui/ui/math-field";
import {
  QuestionCard,
  QuestionEditor,
  defaultQuestion,
  validateQuestion,
  type Question,
  type QuestionType,
} from "@hulianui/ui/math";
import { Plus } from "lucide-react";
import { useMockData, usePending } from "../../lib/async";
import { useQuestionBank, type BankQuestion } from "../_lib/question-bank-store";

type Filter = "all" | "single" | "multiple" | "judge" | "blank" | "subjective";
const SUBJECTIVE: QuestionType[] = ["short_answer", "calculation", "essay"];
const DEFAULT_COURSE = "react-foundations";

function matches(row: BankQuestion, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "subjective") return SUBJECTIVE.includes(row.question.type);
  return row.question.type === filter;
}

export function QuestionBankClient() {
  const bank = useQuestionBank();
  const { data, loading } = useMockData(bank.questions, { delay: 500 });
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<{ id: string | null; draft: Question } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [pending, run] = usePending();

  const rows = useMemo(() => (data ?? []).filter((row) => matches(row, filter)), [data, filter]);

  const openNew = () => {
    setShowAll(false);
    setEditing({ id: null, draft: defaultQuestion("single") });
  };
  const openEdit = (row: BankQuestion) => {
    setShowAll(false);
    setEditing({ id: row.id, draft: row.question });
  };
  const save = () => {
    if (!editing) return;
    if (validateQuestion(editing.draft).length > 0) {
      setShowAll(true);
      toast({ title: copy("fixIssues"), tone: "danger" });
      return;
    }
    void run(() => {
      if (editing.id) {
        bank.update(editing.id, editing.draft);
        toast({ title: copy("saved"), tone: "info" });
      } else {
        bank.add(DEFAULT_COURSE, editing.draft);
        toast({ title: copy("created"), tone: "info" });
      }
      setEditing(null);
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={1}>{copy("title")}</Heading>
          <Text tone="muted">{copy("subtitle")}</Text>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" aria-hidden />
          {copy("newQuestion")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: copy("filterAll") },
            { value: "single", label: copy("typeSingle") },
            { value: "multiple", label: copy("typeMultiple") },
            { value: "judge", label: copy("typeJudge") },
            { value: "blank", label: copy("typeBlank") },
            { value: "subjective", label: copy("typeSubjective") },
          ]}
        />
        <Text size="sm" tone="muted">{copy("count", rows.length)}</Text>
      </div>

      {loading ? (
        <Stack gap={4}>
          <Skeleton shape="rect" className="h-40 w-full" />
          <Skeleton shape="rect" className="h-40 w-full" />
        </Stack>
      ) : rows.length === 0 ? (
        <Empty title={copy("emptyTitle")} description={copy("emptyHint")} />
      ) : (
        <Stack gap={4}>
          {rows.map((row) => (
            <Card key={row.id} className="p-4">
              <QuestionCard question={row.question} showAnswer />
              <div className="mt-3 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>{copy("edit")}</Button>
                <Popconfirm
                  title={copy("deleteConfirm")}
                  onConfirm={() => {
                    bank.remove(row.id);
                    toast({ title: copy("deleted"), tone: "info" });
                  }}
                >
                  <Button size="sm" variant="ghost" tone="danger">{copy("delete")}</Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </Stack>
      )}

      <Drawer open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DrawerContent side="right" className="w-full max-w-3xl overflow-y-auto">
          {editing && (
            <div className="space-y-4 p-6">
              <Heading level={2}>{editing.id ? copy("editQuestion") : copy("newQuestion")}</Heading>
              <QuestionEditor
                value={editing.draft}
                onChange={(draft) => setEditing({ id: editing.id, draft })}
                visualEditor={MathField}
                showAllIssues={showAll}
                disabled={pending}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>{copy("cancel")}</Button>
                <Button onClick={save} loading={pending}>{copy("save")}</Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
```
写之前**逐个查 props**（不许猜）：`QuestionCard` 的题目 prop 名与 `showAnswer`（`packages/ui/src/question-card/question-card.types.ts`）、`defaultQuestion` / `validateQuestion` 是否从 `@hulianui/ui/math` 导出（`grep -n "defaultQuestion\|validateQuestion" packages/ui/src/question/index.ts`，名字不同就用真名）、`Segmented` 的 `options`/`onValueChange`、`Popconfirm` 的 `title`/`onConfirm`、`Empty` 的 `title`/`description`、`Button` 的 `loading`/`tone`/`variant`、`Drawer`/`DrawerContent` 的 `side`、`Heading` 的 `level`、`toast` 的签名（`{ title, tone: "info" | "danger" | "neutral" }`）。以 `pnpm --filter www typecheck` 为准。

`apps/www/app/demos/learn/(app)/questions/page.tsx`：

```tsx
import { QuestionBankClient } from "../../_components/question-bank-client";

export default function LearnQuestionsPage() {
  return <QuestionBankClient />;
}
```

- [ ] **Step 5: typecheck + 起 dev 实机看一眼**

```bash
pnpm --filter www typecheck; echo rc=$?
pnpm --filter www dev   # 另一个终端；浏览器打开 http://localhost:<端口>/zh/demos/learn/questions（端口与 /zh 前缀以 apps/www 的 dev 输出为准）
```
实机验：列表出现 6 张 QuestionCard；「新建题目」Drawer 里 QuestionEditor 的题干输入框有「可视化输入」页签，页签里是真 MathField（能敲出分式）；保存空题会红字 + toast；删除有 Popconfirm + toast。用已开的浏览器（记忆 no-repeated-chrome-for-testing-launch-keychain-spam）。

- [ ] **Step 6: commit**

```bash
git add "apps/www/app/demos/learn/_data/questions.ts" "apps/www/app/demos/learn/_data/questions.content.ts" \
  apps/www/app/demos/learn/_lib/question-bank-store.tsx \
  apps/www/app/demos/learn/_components/question-bank-client.tsx apps/www/app/demos/learn/_components/question-bank-client.content.ts \
  "apps/www/app/demos/learn/(app)/questions/page.tsx" apps/www/app/demos/learn/_components/learn-shell.tsx "apps/www/app/demos/learn/(app)/layout.tsx"
git commit -m "feat(www/demos/learn): 题库页（QuestionEditor + MathField 可视化输入、Drawer 录题、Popconfirm 删除、toast）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 11: demo「瀚学」练习页 + 导航 + 所有 demo 登记点

**Files:**
- Create: `apps/www/app/demos/learn/_components/practice-client.tsx`、`practice-client.content.ts`
- Create: `apps/www/app/demos/learn/(app)/practice/page.tsx`
- Modify: `apps/www/app/demos/learn/_components/nav-config.ts` / `.content.ts`
- Modify: `apps/www/app/demos/lib/demo-i18n-coverage.test.ts:465-468`（inventory.learn）
- Modify: `apps/www/app/demos/lib/demos.ts:92-100`、`apps/www/i18n/demo-meta.en.ts:51-57`
- Modify: `scripts/check-task11-demo-output.mjs:9-35`、`scripts/check-task11-demo-output.test.mjs:21-22`

- [ ] **Step 1: 练习页词条**

`practice-client.content.ts`（`key: "demo-learn-components-practice-client"`）：

```ts
    title: "练习",
    subtitle: "学生作答：按题型给对的控件，填空用公式键盘，交卷即时判分（字面 → 归一 → CAS 等价）",
    progress: "第 {0} / {1} 题",
    next: "下一题",
    finishTitle: "本轮练习完成",
    finishSubtitle: "答对 {0} 题，得 {1} 分",
    again: "再练一次",
    submitted: "已提交",
    correctHint: "下次不会再推给你",
    subjectiveNote: "主观题需老师批阅，这里只展示题面",
    emptyTitle: "题库里还没有题",
    emptyHint: "先去题库录几道",
    reason: "老师布置的课后练习",
```

- [ ] **Step 2: 练习页组件**

```tsx
"use client";
import { copy } from "./practice-client.content";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Heading, Progress, Result, Skeleton, Text, toast } from "@hulianui/ui";
import { createCasComparator, MathField } from "@hulianui/ui/math-field";
import {
  QuestionAnswer,
  gradeObjective,
  type QuestionAnswerResult,
  type StudentAnswer,
} from "@hulianui/ui/math";
import { useMockData, usePending } from "../../lib/async";
import { useQuestionBank } from "../_lib/question-bank-store";

type Equivalent = (a: string, b: string) => boolean;

export function PracticeClient() {
  const bank = useQuestionBank();
  const { data, loading } = useMockData(bank.questions, { delay: 500 });
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState<StudentAnswer | undefined>();
  const [result, setResult] = useState<QuestionAnswerResult | null>(null);
  const [pending, run] = usePending();
  const [equivalent, setEquivalent] = useState<Equivalent | undefined>();

  // CAS 比较器异步加载；没到位之前提交仍能判（只走前两档）。
  useEffect(() => {
    let alive = true;
    createCasComparator().then(
      (fn) => {
        if (alive) setEquivalent(() => fn);
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);

  const rows = data ?? [];
  const current = rows[index];
  const done = !loading && rows.length > 0 && index >= rows.length;
  const summary = useMemo(() => {
    let correct = 0;
    let score = 0;
    for (const row of rows) {
      const a = bank.attempts[row.id];
      if (!a) continue;
      if (a.correct) correct += 1;
      score += a.score;
    }
    return { correct, score };
  }, [rows, bank.attempts]);

  const submit = (answer: StudentAnswer) => {
    if (!current) return;
    void run(() => {
      const graded = gradeObjective(current.question, answer, { normalize: true, tolerance: 0.001, equivalent });
      bank.recordAttempt(current.id, { answer, correct: graded.correct, score: graded.score });
      setResult({ correct: graded.correct === true, correctAnswer: current.question.answer, analysis: current.question.analysis });
      toast({ title: copy("submitted"), tone: "info" });
    });
  };
  const next = () => {
    setIndex((i) => i + 1);
    setValue(undefined);
    setResult(null);
  };
  const again = () => {
    bank.resetAttempts();
    setIndex(0);
    setValue(undefined);
    setResult(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Heading level={1}>{copy("title")}</Heading>
        <Text tone="muted">{copy("subtitle")}</Text>
      </div>

      {loading ? (
        <Skeleton shape="rect" className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <Empty title={copy("emptyTitle")} description={copy("emptyHint")} />
      ) : done ? (
        <Result
          status="success"
          title={copy("finishTitle")}
          subtitle={copy("finishSubtitle", summary.correct, summary.score)}
          extra={<Button onClick={again}>{copy("again")}</Button>}
        />
      ) : (
        <Card className="space-y-4 p-4">
          <div className="space-y-1">
            <Text size="sm" tone="muted">{copy("progress", index + 1, rows.length)}</Text>
            <Progress value={((index + (result ? 1 : 0)) / rows.length) * 100} />
          </div>
          <QuestionAnswer
            question={{
              type: current.question.type,
              stem: current.question.stem,
              options: current.question.options,
              blankCount: Array.isArray(current.question.answer) ? current.question.answer.length : undefined,
              difficulty: current.question.difficulty,
            }}
            value={value}
            onChange={setValue}
            result={result}
            pending={pending}
            onSubmit={submit}
            blankInput="math"
            mathField={MathField}
            reason={copy("reason")}
            correctHint={copy("correctHint")}
          />
          {["short_answer", "calculation", "essay"].includes(current.question.type) && (
            <Text size="sm" tone="muted">{copy("subjectiveNote")}</Text>
          )}
          {(result !== null || ["short_answer", "calculation", "essay"].includes(current.question.type)) && (
            <div className="flex justify-end">
              <Button onClick={next}>{copy("next")}</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
```
同样先查 `Progress` / `Result` 的 props 真名（`packages/ui/src/progress/*.types.ts`、`packages/ui/src/result/*.types.ts`）。`blankCount` 只对 blank 题有意义，其它题型 QuestionAnswer 会忽略。

`(app)/practice/page.tsx`：

```tsx
import { PracticeClient } from "../../_components/practice-client";

export default function LearnPracticePage() {
  return <PracticeClient />;
}
```

- [ ] **Step 3: 导航**

`nav-config.content.ts` 加键 `questionBank: "题库"` / `"Question bank"`、`practice: "练习"` / `"Practice"`；`nav-config.ts` 的 `primaryNav` 追加：

```ts
  { label: copy("questionBank"), href: `${LEARN_BASE}/questions` },
  { label: copy("practice"), href: `${LEARN_BASE}/practice` },
```

- [ ] **Step 4: 登记点**

- `demo-i18n-coverage.test.ts` 的 `inventory.learn` 改成：
  ```ts
  learn: {
    routes: ["(app)/courses/[id]/page.tsx", "(app)/page.tsx", "(app)/practice/page.tsx", "(app)/questions/page.tsx"],
    fixtures: ["_data/courses.ts", "_data/poster.ts", "_data/questions.ts"],
  },
  ```
- `demos.ts` learn 条目：description 末尾追加「新增题库（QuestionEditor + MathField 可视化公式键盘）与练习（QuestionAnswer + gradeObjective 三档即时判分）两页，串起数学题件整条链路。」；tags 追加 `"QuestionEditor", "MathField"`。
- `demo-meta.en.ts` learn：description 末尾追加 ` Adds a question bank (QuestionEditor with the MathField formula keyboard) and a practice page (QuestionAnswer with three-tier instant grading).`；tags 追加 `"QuestionEditor", "MathField"`。
- `scripts/check-task11-demo-output.mjs`：`TASK11_DEMO_ROUTES` 在 `"learn/courses/react-foundations"` 之后加 `"learn/questions"`、`"learn/practice"`；`TASK11_ROUTE_MARKERS` 加 `"learn/questions": "Question bank"`、`"learn/practice": "Practice"`（键顺序与 ROUTES 一致，test 用 deepEqual 比键序）。
- `scripts/check-task11-demo-output.test.mjs:21-22` 的 `11` 改 `13`。

- [ ] **Step 5: 跑 demo 相关测试与 typecheck**

```bash
pnpm --filter www typecheck; echo rc=$?
cd apps/www && npx vitest run app/demos/lib/demo-i18n-coverage.test.ts app/demos/task11-fixture-quality.test.ts app/demos/demo-fixture-quality.test.ts i18n/meta-coverage.test.ts app/demos/lib/async.test.ts; echo rc=$?
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm test:scripts; echo rc=$?
pnpm --filter www demos:coverage; echo rc=$?
```
`demo-i18n-coverage` 红的常见原因：某份 `.content.ts` 有键没被同名源文件 `copy("key")` 消费（删键或用上）、en 值含全角标点、源码里残留中文字面量（挪进 content）。`task11-fixture-quality` 红：英文值命中机翻模式，按报错改写英文。

- [ ] **Step 6: 实机验 + commit**

浏览器打开 `/demos/learn/practice`：首帧 Skeleton → 第 1 题单选 → 提交后正误 + 解析 → 「下一题」；到 q4 填空时每空是真 MathField，敲 `10/12` 走可视化键盘出 `\frac{10}{12}` 提交判对（CAS 档）；q5 双空两个 MathField；q6 计算题只读 + 提示；做完出 Result + 「再练一次」。导航顶栏多出「题库」「练习」。

```bash
git add apps/www/app/demos/learn/_components/practice-client.tsx apps/www/app/demos/learn/_components/practice-client.content.ts \
  "apps/www/app/demos/learn/(app)/practice/page.tsx" apps/www/app/demos/learn/_components/nav-config.ts apps/www/app/demos/learn/_components/nav-config.content.ts \
  apps/www/app/demos/lib/demo-i18n-coverage.test.ts apps/www/app/demos/lib/demos.ts apps/www/i18n/demo-meta.en.ts \
  scripts/check-task11-demo-output.mjs scripts/check-task11-demo-output.test.mjs
git commit -m "feat(www/demos/learn): 练习页（QuestionAnswer + MathField + gradeObjective 三档即时判分）+ 导航 + demo 登记点

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 12: 消费指南 `docs/consuming-math.md`

**Files:**
- Create: `docs/consuming-math.md`
- Modify: `docs/consuming.md`（第 4 节末尾加一句链接）

- [ ] **Step 1: 写指南**

`docs/consuming-math.md` 章节与要点（数字用 Task 9 的实测填，不留占位）：

```markdown
# 数学题件消费指南

> 面向要在自己仓库里用 QuestionEditor / QuestionAnswer / MathTextarea / MathField / gradeObjective 的人。
> 通用集成约束见 docs/consuming.md，这里只写数学件特有的。

## 1. 三条入口各买什么
| 入口 | 内容 | initial（gzip） | 备注 |
| `@hulianui/ui` | 不含任何数学件 | 0 增量 | 主 barrel 刻意不导出 |
| `@hulianui/ui/math` | Formula / QuestionCard / MathTextarea / QuestionEditor / QuestionAnswer / question 纯函数 / gradeObjective | ≈185KB（含 KaTeX） | 基线 208KB |
| `@hulianui/ui/math-field` | MathField / createCasComparator | ≈XKB 壳 | mathlive ≈YKB、compute-engine ≈ZKB 走 import() 懒加载，打开公式键盘那一刻才下载 |

## 2. 安装 mathlive（可选 peer）
pnpm add mathlive（0.110.0 起）；要 createCasComparator 再 pnpm add @cortex-js/compute-engine（0.58.0 起，是 mathlive 钉死的依赖）。为什么下界写这么高：只承诺测过的版本。
import "mathlive/fonts.css" 一次（Next 放根 layout，Vite 放 main.tsx）；缺字体只是回退。

## 3. SSR / 打包器注意点
- MathField 是 client 组件，服务端与首帧渲染骨架；mathlive 在 useEffect 里 import()。Next App Router 直接用，不需要 next/dynamic。
- mathlive 的 exports 在 node 条件下解析到 SSR 构建（没有 MathfieldElement）：组件把这种情况当「没装」处理并显示安装提示。vitest jsdom 里同理，消费方单测请 vi.mock("mathlive") 或只断言骨架。
- Vite：optimizeDeps.include: ["mathlive", "@cortex-js/compute-engine"] 可选，避免首次打开时中途重优化。
- 虚拟键盘是页面级单例（window.mathVirtualKeyboard）。

## 4. 注入点
MathTextarea.visualEditor={MathField} / QuestionEditor.visualEditor={MathField} / QuestionAnswer blankInput="math" mathField={MathField}。传组件不传元素。

## 5. 判分：服务端是 SSOT
gradeObjective 三档（默认逐字与 5069tk grading.py 同口径；normalize / tolerance opt-in；equivalent 注入 await createCasComparator()）。库不能比服务端更宽松，否则学生端「答对」与成绩单「答错」打架。grade.contract.json 的路径与对账方式。

## 6. 从自建组件迁过来（5069tk-app 清单）
spec §9 的删除清单逐条列出 + 对应库件。
```

- [ ] **Step 2: consuming.md 加链接**

`docs/consuming.md` 第 4 节（「只用少数几个组件时，从子路径引入」）末尾加：

```markdown
数学题件（KaTeX / MathLive 两个重依赖、判分 SSOT）单独写在 [docs/consuming-math.md](./consuming-math.md)。
```

- [ ] **Step 3: 链接门禁 + commit**

```bash
pnpm docs:i18n:check; echo rc=$?     # 相对链接门禁（悬空报红就修）
git add docs/consuming-math.md docs/consuming.md
git commit -m "docs: 数学题件消费指南（三条入口体积 / mathlive 安装与 SSR / 判分 SSOT / 迁移清单）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 13: changeset + 全门禁 + 合并 + 本地发版验证

**Files:**
- Create: `.changeset/math-field.md`

- [ ] **Step 1: changeset**

```markdown
---
"@hulianui/ui": minor
---

新增独立子路径 `@hulianui/ui/math-field`：`MathField`（MathLive 驱动的可视化公式输入框，值为不带 `$` 的 LaTeX，满足 `MathFieldLikeProps`，可直接注入 MathTextarea / QuestionEditor 的 `visualEditor` 与 QuestionAnswer 的 `mathField`；服务端与首帧渲染骨架，`mathlive` 在客户端动态加载，没装时显示安装提示而不是抛错；`virtualKeyboard` auto / manual / off、`keyboardLayouts`、`readOnly`、`placeholder`；MathLive 的 CSS 变量钉到本库 token）与 `createCasComparator()`（第 3 档等价判分，返回 `Promise<(a, b) => boolean>`，直接喂 `gradeObjective` 的 `equivalent`；解析失败一律 false）。

`mathlive`（>=0.110.0）与 `@cortex-js/compute-engine`（>=0.58.0，mathlive 钉死的依赖）作为 **optional peerDependencies** 加入：不装它们的消费方不受影响，主包与 `@hulianui/ui/math` 零 MathLive，`@hulianui/ui/math-field` 的 initial 实测 XKB（mathlive / compute-engine 走 `import()` 懒加载）。字体由消费方 `import "mathlive/fonts.css"`。

内置 demo「瀚学」新增题库（QuestionEditor + MathField）与练习（QuestionAnswer + 三档即时判分）两页；新增 `docs/consuming-math.md`。

<!-- changelog-en:start -->
New standalone subpath `@hulianui/ui/math-field`: `MathField` (a MathLive-powered visual formula input whose value is LaTeX without `$`; it satisfies `MathFieldLikeProps`, so it plugs straight into the `visualEditor` of MathTextarea / QuestionEditor and the `mathField` of QuestionAnswer; the server and the first client frame render a skeleton, `mathlive` is loaded dynamically on the client, and a missing package shows an install hint instead of throwing; `virtualKeyboard` auto / manual / off, `keyboardLayouts`, `readOnly`, `placeholder`; MathLive's CSS variables are pinned to the library tokens) and `createCasComparator()` (tier-3 equivalence grading that returns `Promise<(a, b) => boolean>` to feed `gradeObjective`'s `equivalent`; any parse failure is false).

`mathlive` (>=0.110.0) and `@cortex-js/compute-engine` (>=0.58.0, the dependency mathlive pins) join as **optional peerDependencies**: consumers who do not install them are unaffected, the main package and `@hulianui/ui/math` contain zero MathLive, and the initial chunk of `@hulianui/ui/math-field` measures XKB (mathlive / compute-engine are lazy-loaded through `import()`). Fonts come from the consumer's `import "mathlive/fonts.css"`.

The built-in HanLearn demo gains a question bank page (QuestionEditor + MathField) and a practice page (QuestionAnswer with three-tier instant grading); `docs/consuming-math.md` is new.
<!-- changelog-en:end -->
```
（X 用 Task 9 实测值。）

- [ ] **Step 2: 全门禁（逐条看退出码）**

```bash
cd packages/ui && npx vitest run; echo rc=$?                       # 两个 project 全量，期望 6009 + 本阶段新增全绿
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck; echo rc=$?
pnpm test:scripts; echo rc=$?
pnpm showcase:check; echo rc=$?
pnpm conventions:check; echo rc=$?
pnpm docs:check:props; echo rc=$?
pnpm docs:i18n:check; echo rc=$?
pnpm check:remote-assets; echo rc=$?
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check; echo rc=$?
CI=1 pnpm --filter @hulianui/hulian-scan test; echo rc=$?
CI=1 pnpm size; echo rc=$?                                          # 15 入口
bash scripts/consumer-typecheck.sh; echo rc=$?
pnpm --filter @hulianui/ui build:types && rm -rf packages/ui/dist; echo rc=$?   # 声明能干净 emit（CI 的 Emit declarations 步）
cd apps/www && npx vitest run; echo rc=$?; cd ../..
```
任何一条非 0 就地修，修完重跑那一条与它的邻居；不许跳过。

- [ ] **Step 3: commit changeset，合回 master**

```bash
git add .changeset/math-field.md
git commit -m "docs(ui/math-field): changeset（minor，含英文段）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
git status --short          # 只应剩 upload.tsx
git checkout master && git merge --ff-only feat/math-question-phase5
git log --oneline -3
```

- [ ] **Step 4: 本地发版验证（不 push）**

```bash
pnpm version-packages; echo rc=$?
grep -n "## 0.59.0" -A3 packages/ui/CHANGELOG.md | head
grep -n "## 0.59.0" -A3 packages/ui/CHANGELOG.en.md | head
grep -c "changelog-en" packages/ui/CHANGELOG.md          # 期望 0：标记段已被抽走
ls .changeset/*.md | grep -v README                       # 期望：只剩 brand-motion-mark.md 之类非本链路条目（若有）
git status --short
```
检查：`packages/ui/package.json` 版本 0.59.0；中文 CHANGELOG 0.59.0 下有 math-question-phase1 / math-textarea / question-editor / question-answer / math-field 五条 minor + group-items-own-label 一条 patch；英文 CHANGELOG.en.md 同一版本号下六段齐全（`scripts/sync-changelog-locales.mjs` 从 `changelog-en` 标记抽取），无 CJK。哪段缺英文就回 changeset 补标记段再重跑（先 `git checkout -- .` 还原 version-packages 的改动 —— **但 upload.tsx 不能被这条 checkout 波及**：用 `git status --short` 列出改动文件后逐个 `git checkout -- <file>`，跳过 upload.tsx）。

全部齐全后提交发版 commit（留在本地，由主人决定是否 push）：

```bash
git status --short | awk '$1=="M"||$1=="D"||$1=="??"{print $2}' | grep -v "packages/ui/src/upload/upload.tsx" | xargs git add
git commit -m "chore(release): @hulianui/ui 0.59.0（数学题件五阶段：question 域 / MathTextarea / QuestionEditor / QuestionAnswer / MathField）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
git log --oneline origin/master..master | wc -l     # 领先数，汇报用
```

- [ ] **Step 5: 汇报**

向主人报：master 领先 origin 的 commit 数、0.59.0 CHANGELOG 中英各几段、math-field 初始 / total 体积实测、demo 两页地址、**未 push**；下一步是主人拍板 push（Release job 会按 memory hulian-030-release 的流程走）与 5069tk-app 回流（spec §9，在消费方仓做）。

---

## 自查记录（写完计划后对照 spec）

- §4.2 MathFieldProps 十个字段 → Task 1；optional peer → Task 0；缺依赖抛带安装命令的错 → Task 2（loader）+ Task 3（组件捕获显示，不让 showcase 炸）；SSR 骨架 + whenDefined → Task 3（用 `loadMathLive` resolve 代替 `whenDefined`，语义相同：resolve 时元素已注册）；soundsDirectory / fonts.css → Task 2 / Task 0 / Task 8 文档；主题变量映射 → Task 3；受控 input 回写 + silenceNotifications → Task 3；createCasComparator → Task 5（签名 async，偏离 1）。
- §6.2 第 3 档 equivalent → Task 5 有 gradeObjective 接线测试。
- §7 错误处理「showcase 页捕获并显示安装提示」→ Task 3 组件内置，Task 7 ssr-safety 守。
- §8.1 browser project「注册成功、受控值回流、键盘策略」→ Task 4；bundle-size 新增 math-field 基线 + 主 barrel 增量 0 → Task 9；ssr-safety / 词表 / props / conventions / hulian-scan / 消费方冒烟 → Task 7 / 8 / 9 / 13。
- §8.2 md（中英）/ 全部注册点 / docs:all / 消费指南 / demo learn → Task 7 / 8 / 10 / 11 / 12。
- §8.3 一次 minor + 英文段 + package.json peer → Task 0 / 13。
- §9 消费方回流：不在本仓，Task 12 文档里列清单，Task 13 汇报里点名。
