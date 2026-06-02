# 瑚琏 Hulian A2 Step 2 设计 — 表单录入族 Input / Textarea / Field

- **日期**: 2026-06-02
- **状态**: 设计已与用户确认（含一轮源码级 review，四主张逐条核验 + 一真坑两小雷已收口），进入实施计划阶段（待用户审阅本 spec → writing-plans）
- **本 spec 覆盖范围**: A2 **Step 2**（主 spec §7 步序表第三步）= 表单录入族 **Input + Textarea + Field** 三组件吸取，全部建在 Base UI rc.0 `field`/`input` primitive 上，零新依赖。
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（A2 批次一主 spec，§4 选源表 / §5 showcase 模具 / §6 硬约束 / §7 步序 / §9 YAGNI）
  - `2026-06-02-hulian-a2-batch1-ia-display.md`（批次一上半 plan，Step 0 IA 骨架 + Step 1 展示族；本 Step 沿用其四件套模具与 IA 接入入口）
- **前置进度**: A2 批次一（Step 0 IA 骨架 + Step 1 展示族 4 组件）已完成，共 7 组件，IA 就绪——manifest/registry 双文件 SSOT + 左侧分类树 + `/components/[slug]` SSG 独立页 + ComponentDoc client 岛 + manifest↔registry 契约测试。**加组件唯一入口 = 库里写四件套 + manifest 加一行 + registry 加 import + map。**

---

## 1. 本步定义与边界

- **做**：吸取 **Input · Textarea · Field** 三件，统一成瑚琏 API + 明暗 token 皮肤 + Base UI 兜底的 a11y 串联。**全量范围**（用户裁决）：Input 含前后缀 slot，Textarea 含自适应高度（`autoResize`）。
- **不做**（YAGNI，见 §13）：不引 React Aria；不碰 overlay 族；不暴露 Field 的 `validate`/`validationMode` 实时校验编排（showcase 用 `invalid` 外部受控驱动即可）；不做 `number-field`。

---

## 2. 关键裁决（含来源）

| 决策点 | 裁决 | 来源 |
|--------|------|------|
| Field 选源 | **Base UI Field**（label/description/error/validity + 自动 `htmlFor`/`aria-describedby`/`aria-invalid` 串联），**改判主 spec §4 的「原生 + 手写 a11y」** | 上 session 查证 + 本 session 核验 `Input.js`/`FieldRootContext.js`/`FieldRoot.js` |
| Field API 形态 | **Props 包装式**：`<Field label description error invalid disabled>{control}</Field>` | 用户裁决 |
| Input/Textarea 范围 | **全量**：Input 前后缀 slot + Textarea `autoResize` 都做 | 用户裁决 |
| Field 错误文字渲染 | **`<BaseField.Error match={true}>{error}</BaseField.Error>`**（error 非空才渲染），**不**自渲染 `<p>` | 本 session 核验 `FieldError.js`，见 §5 |

---

## 3. 架构：三组件全建在 Base UI `field`/`input` primitive

**对称性地基（已核验）**：Base UI `Input` 实现就是 `forwardRef((p,ref)=><Field.Control ref={ref} {...p}/>)`；`FieldRootContext` 自带完整默认值对象，`useFieldRootContext(optional=true)` 默认可选、无 provider 不抛错。故 `Field.Control` **在 `Field.Root` 之外优雅降级为纯控件**。⇒ Input 与 Textarea 都「独立即纯控件、入 Field 即自动 a11y 串联」，且控件即便被 prefix/suffix 的 div 包一层，仍在 Field.Root 的 React 子树内 → context 照流（不依赖 DOM 深度）。

### 3.1 Input

- 结构：`focus-within` 皮肤**外壳容器**（inline-flex，承载 border/bg/圆角/ring/invalid/disabled，标签 div/label 由 plan 定）→ 内含 可选 `prefix` slot + **内嵌透明 Base UI `Input`** + 可选 `suffix` slot。
- 内层 Base UI Input：`bg-transparent outline-none text-foreground placeholder:text-muted size-full`，把视觉一切交给外壳。
- `size`：sm/md/lg 控外壳高度/内距/字号。
- 始终带外壳（即便无前后缀）——统一 invalid/focus/disabled 处理，避免分支。
- a11y：在 hulian Field 内时，内层 Base UI Input 自动从 Field context 取 `id`/`aria-describedby`/`aria-invalid`（DOM 上虽被外壳包一层，context 不受影响）。

### 3.2 Textarea

- 结构：`Field.Control render={<textarea/>}` + 同款外壳皮肤（textarea 多行，外壳无前后缀槽，但 invalid/focus/disabled 同源）。
- `autoResize`（用户裁决纳入）：**用 JS `scrollHeight` 法，不用 CSS `field-sizing:content`**——Tauri macOS WebView(WKWebView) 对 `field-sizing` 支持不稳，JS 法跨端可靠。
- **autoResize 三条实现红线**（写进 C2 TDD，漏任一条必出 bug）：
  1. **先 `height='auto'` 再读 `scrollHeight`**，且测高放 **`useLayoutEffect`**（否则只增不减：删字后高度不回收）。
  2. **受控值变化也要触发重测**（监听 `onValueChange` / value prop，不能只听原生 input 事件，否则受控刷新不长高）。
  3. **`rows` 作为 min-height 下限**（内容短于 rows 时不塌到比 rows 矮）。
- ref：Base UI `render` prop 透传 ref，`autoResize` 需对内层 textarea 取 ref 测高。

### 3.3 Field（Props 包装式）

```tsx
function Field({ label, description, error, invalid, disabled, children, ...rest }) {
  const isInvalid = invalid ?? Boolean(error);          // error 非空隐含 invalid（瑚琏 API 简化）
  return (
    <BaseField.Root invalid={isInvalid} disabled={disabled} {...rest}>
      {label && <BaseField.Label className="...">{label}</BaseField.Label>}
      {children}                                          {/* 控件 = hulian Input / Textarea（= Field.Control，恰一个）*/}
      {description && <BaseField.Description className="text-muted ...">{description}</BaseField.Description>}
      {error && <BaseField.Error match={true} className="text-danger ...">{error}</BaseField.Error>}
    </BaseField.Root>
  );
}
```

- `isInvalid` 经 `Field.Root invalid` 驱动控件红态（见 §6）；`error` 非空时渲染 `Field.Error match={true}`（见 §5）。
- `...rest` 透传 `Field.Root` 留逃生口（`name` 等），但本步 showcase 不暴露真校验。
- 控件恰好一个 `Field.Control`（hulian Input = Base Input = Field.Control；hulian Textarea = Field.Control render textarea）→ 串联无歧义。

---

## 4. 三组件选源 / 命脉速查

| 组件 | 选源（Base UI primitive） | 命脉 / 要点 | 独立用 | 入 Field 自动串联 |
|------|--------------------------|-------------|--------|------------------|
| **Input** | `Input`（≡ `Field.Control`）+ 瑚琏外壳 | size·invalid·disabled + 前后缀 slot；外壳承载视觉、内层透明 | ✅ | ✅ |
| **Textarea** | `Field.Control render={<textarea/>}` + 瑚琏外壳 | rows + `autoResize`（JS scrollHeight，三红线见 §3.2） | ✅ | ✅ |
| **Field** | `Field.Root/Label/Control/Description/Error` | Props 包装 label/help/error/invalid/disabled；`error` 隐含 invalid；错误渲染 `match={true}`（§5） | — | 提供串联 |

---

## 5. 🔴 真坑专章：Field 错误文字怎么渲染（唯一会静默失效的点）

**症状**：若按「`Field.Root invalid` 驱动 + 用 `Field.Error` 默认行为」写，结果是**框红了、错误字一个都不渲染**——最难 debug 的静默失效。

**根因（核验 `esm/field/error/FieldError.js`）**：
```js
let rendered = false;
if (formError || match === true) { rendered = true; }          // 强制显示（不碰 validityData）
else if (match) { rendered = Boolean(validityData.state[match]); }
else { rendered = validityData.state.valid === false; }         // 默认分支
```
默认分支看的是 **`validityData.state.valid`**（来自真校验流），**不是** `Field.Root invalid` prop 推出的 root `state.valid`。本步明确不跑真校验 → `validityData` 恒停在 `DEFAULT_VALIDITY_STATE`（`valid: null`）→ `null === false` 为 `false` → `Field.Error` 返回 `null`，**错误文字零渲染**。而红边框走的是另一条路（root `state.valid=false` → 控件 `data-invalid`），照常出现 → 框红字没。

**裁决：用 `<BaseField.Error match={true}>{error}</BaseField.Error>`（error 非空才挂），不自渲染 `<p>`。** 三条源码事实支撑此选优于自渲染：
1. `match===true` ⇒ `rendered=true` **无条件**，绕开 validityData 这个「外部受控 error 场景下的负资产」。
2. 渲染即注册：`useIsoLayoutEffect(... setMessageIds(v=>v.concat(id)) ...)` 只要 `rendered` 就把 error id 串进控件 `aria-describedby`——**a11y 白嫖、不问渲染原因**。
3. children 覆盖：`props:[{id, children: formError || validityData.error}, elementProps]`，`elementProps` 在末位 → 我传的 `{error}` children 覆盖默认 → 显示瑚琏的 error 文案。

**为何不自渲染 `<p>`**：自渲染会丢掉事实 2 的自动 `aria-describedby` 注册，须手接 → 净增工作量。用户初评倾向自渲染的前提（validityData 是负资产）在 `match={true}` 下已不成立。

**附注**：`FieldError` 内部 `useFieldRootContext(false)` 为**非可选** → `Field.Error` 必须在 `Field.Root` 内（hulian Field 恒满足，不暴露独立 `FieldError`）。

---

## 6. invalid 态统一 + 一个 React 19 小雷

外壳一套选择器覆盖两条驱动路：
```
has-[[data-invalid]]:border-danger  has-[[data-invalid]]:focus-within:ring-danger
```
- **Field 驱动**：`Field.Root invalid` → 控件得 `data-invalid`（核验：`FieldRoot.js` invalid→`state.valid=false`→`fieldValidityMapping` 落 `data-invalid` 到控件）→ 外壳 `has-` 命中。
- **独立 prop**：hulian Input/Textarea 的 `invalid` → 给内层控件落 `data-invalid` + `aria-invalid` → 同一 `has-` 命中。

**🟡 小雷（写进 C1 prompt）：`invalid` 必须先 destructure 再翻译，禁裸传。** `invalid` 是自定义 boolean、非合法 DOM 属性。实现里要：
```tsx
const { invalid, ...rest } = props;
// ...
<BaseInput {...rest} {...(invalid && { "data-invalid": "", "aria-invalid": true })} />
```
若把 `invalid` 原样 `{...props}` spread 给内层，React 19 会把 `invalid=""` 当未知属性渲到 `<input>` 上。FieldControl 会把 `elementProps` 透传到 `<input>`，故 `data-*`/`aria-*` 能正确落地。

disabled：内层控件收真 `disabled`，外壳 `has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none` 连带前后缀一起暗。

---

## 7. showcase 模具——零改动（回答主 spec §5 开放问题）

`ShowcaseSpec` **不动**（核验：`states[].render:()=>ReactNode` 可塞任意节点，复合态/前后缀/autoResize/嵌套 Field 都能塞；invalid/error/help/label/disabled 全落现有 `text`/`select`/`boolean`/`number` 四类 control）。

- **states 预置**（看全貌，复合结构靠这承载）：
  - Input：default / withPrefixSuffix / invalid+error / disabled / sm·md·lg。
  - Textarea：default / autoResize / invalid / disabled / rows。
  - Field：default / withHelp / **invalid+error**（验真坑修复：框红 **且** 字出）/ disabled（内嵌一个 demo Input 作 children）。
- **Playground 标量**：
  - Input：`size`(select) + `placeholder`(text) + `invalid`(boolean) + `disabled`(boolean)。
  - Textarea：+ `rows`(number) + `autoResize`(boolean)。
  - Field：`label`/`description`/`error`(text) + `invalid`/`disabled`(boolean)。
- 复合结构（Field 的 label+control+error、Input 的 prefix/suffix）只用 states 预置承载，不试图用 controls 拼装——与批次一 Card 同口径。

---

## 8. token 皮肤（只消费语义 token，已核验全集，无 success）

`@hulian/tokens/preset.css` 的 `@theme inline` 注册：`bg / surface / surface-hover / foreground / muted / border / ring / primary[/-foreground/-hover] / danger[/-foreground] / radius`。因 `--color-danger`/`--color-ring` 已注册，Tailwind v4 自动生成 `ring-danger`/`border-danger`/`ring-ring` 等全套；`@source "packages/ui/src/**"` 已扫新组件 class。

- 外壳：`bg-surface border border-border rounded-[var(--radius)] transition-colors` + focus：`focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg`（复用 Switch 验证过的配方）+ invalid：`has-[[data-invalid]]:border-danger has-[[data-invalid]]:focus-within:ring-danger` + disabled：`has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none`。
- 内层控件：`bg-transparent outline-none text-foreground placeholder:text-muted`。
- 明暗自动适配靠语义 token（dark variant 绑 `[data-theme="dark"]`），无任何裸色值。

---

## 9. 四件套 + "use client" + IA 接入

- 三组件目录：`packages/ui/src/input/` · `textarea/` · `field/`（目录名 `field`，内部 `import { Field as BaseField } from "@base-ui-components/react/field"` 无命名冲突）。
- 各四件套：`*.tsx` + `*.types.ts` + `*.showcase.tsx`（必 `"use client"`）+ `*.test.tsx` + `index.ts`（桶导出组件/类型/showcase）；主 `packages/ui/src/index.ts` 加 `export * from "./input|textarea|field"`。
- **`"use client"`**：三组件本体都用 Base UI(client) → 都加；三个 showcase 必加。
- **IA 接入**：`apps/www/lib/manifest.ts` +3 行（`category:"inputs"`,`status:"new"`）；`apps/www/lib/registry.tsx` +3 import 名 + 3 map 行；契约测试自动守一致。

---

## 10. 对主 A2 spec §4 的回写（concrete step + grep 自证，非口头承诺）

主 spec §4 选源表把 Input/Field/Form 写成「原生 `<input>` + 皮肤 + 手写 a11y」。本步改判 **Base UI Field**。**回写在 finishing 阶段作为一个有验收的步骤执行**（套 `docs-pr-verification-grep-mirrors-required-changes` 纪律，防 spec↔runtime 再漂移）：

1. Edit `2026-06-02-hulian-a2-absorption-batch-design.md` §4 的 Input/Field 行：选源由「原生 + 手写 a11y」改为「**Base UI Field（`Field.Root/Label/Control/Description/Error`），a11y 自动串联**」，并加一行指回本 Step 2 spec。
2. **grep 自证**：`grep -n "Base UI Field" docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md` 必须命中改后行；`grep -n "手写 a11y" …` 在 Input/Field 行不再命中（原第一性原理记录段可保留为历史）。
3. 自证结果记入 finishing 总结。

---

## 11. 落地步骤（trunk-based 小步 commit 直接 master + 每步三道门 + Playwright 明暗像素实测）

「三道门」= `pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**——全包 `pnpm build` 会因 desktop tauri `beforeBuildCommand` 二次 build www 并发冲突）。每步 TDD 先红→绿，过三道门 + **Playwright 截图存 cwd 根 `*.png` 并 Read 看像素**（不靠 `browser_evaluate` 读 DOM 属性，会漏几何 bug）。

| Step | 内容 | 关键红线 |
|------|------|---------|
| **C1 Input** | 四件套：focus-within 外壳 + 前后缀 slot + 内嵌 Base Input + size/invalid/disabled | `invalid` 先 destructure 再翻译成 `data-invalid`+`aria-invalid`（§6 小雷） |
| **C2 Textarea** | 四件套：`Field.Control render textarea` + 同皮肤 + `autoResize` | autoResize 三红线（§3.2）写进测试/实现：useLayoutEffect+先 auto 再测、受控值重测、rows 下限 |
| **C3 Field** | 四件套：Props 包装 `Field.Root/Label/Description/Error` + `error` 隐含 invalid | **错误渲染用 `Field.Error match={true}`（§5 真坑）**；实现前此点已敲定 |
| **C4 接 IA + 验收** | manifest +3 / registry +3+3；契约测试；三道门；Playwright 明暗两态 | 重点验：focus ring、invalid **框红且字出**、前后缀对齐不溢出、autoResize 长高/回收、disabled 对比、placeholder 明暗 |

> 每步独立 commit、独立 review、独立回滚。Playwright 实测每组件明暗两态各一张截图，Read 看像素确认无溢出/重叠/对比失效。

---

## 12. 验收口径（done 的标志）

1. Input/Textarea/Field 三组件四件套齐、只消费语义 token、明暗自适应、`"use client"` 规则正确。
2. a11y 串联达标：Field 内控件自动 `htmlFor`/`aria-describedby`(含 error id)/`aria-invalid`；焦点环可见。
3. **invalid+error 态：框红 且 错误文字渲染**（§5 真坑已修，Playwright 截图自证）。
4. Input 前后缀对齐不溢出；Textarea `autoResize` 长高且删字回收、受控刷新长高、不塌破 rows 下限。
5. 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 7→10 个 slug 双边齐全；桌面 app(5514) 加载新组件正常。
6. manifest/registry 仍是加组件唯一入口，未碰 `ShowcaseSpec` 类型、未引新依赖。
7. 主 spec §4 已回写为 Base UI Field 并 grep 自证（§10）。

---

## 13. 本步不做（YAGNI 边界）

- 不引 React Aria；不碰 overlay 浮层族（各后续批次）。
- 不暴露 Field 的 `validate`/`validationMode` 实时校验编排（仅 `invalid`/`error` 外部受控；真校验是 Form 级，后议）——`...rest` 透传 Field.Root 留逃生口。
- 不做 `number-field`（后续）。
- 不改 `ShowcaseSpec` 类型（用 states 写法承载复合组件）。
- 不做 CSS `field-sizing:content`（WKWebView 不稳，autoResize 走 JS）。
