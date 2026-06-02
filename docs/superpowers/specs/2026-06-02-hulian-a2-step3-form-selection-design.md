# 瑚琏 Hulian A2 Step 3 设计文档 — 表单选择族 Checkbox / Radio

- **日期**: 2026-06-02
- **状态**: 已据用户 brief + 第一性原理定全部裁决（用户已设目标「直到完成再通知我」→ 自主推进，本 spec 与后续 plan 作可回溯设计记录）
- **本 spec 覆盖范围**: A2 批次一 **Step 3** = 吸取表单选择族 **Checkbox**（含 indeterminate 三态）+ **Radio**（RadioGroup 单选组 + 键盘方向键）。落地后文档站组件数 10 → **12**。
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（A2 批次一主 spec，§3 IA / §4 选源表 Checkbox·Radio 行 / §6 硬约束 / §7 Step 3 / §9 YAGNI）
  - `2026-06-02-hulian-a2-step2-form-inputs-design.md` + plan（同构模具：四件套 + TDD + 三道门 + Playwright 明暗两态像素实测）
- **前置进度**: P0/P1 + A0/A1 + A2 批次一 Step0/1/2 全完成（10 组件，见项目记忆 `hulian-phase-status`）。标杆选中态范式 = `packages/ui/src/switch/switch.tsx`（Base UI `.Root/.Thumb` + `data-[checked]` + `focus-visible:ring`）。

---

## 1. 本步定义与边界

主 spec §7 Step 3 = 「Checkbox · Radio（Base UI，复用 Switch 经验）」。本步把这两个选择族控件按瑚琏四件套吸取，统一成瑚琏 API + 明暗 token 皮肤，a11y（焦点环 / 键盘 / ARIA / 表单态串联）交给 Base UI primitive 兜底。

- **做**：Checkbox（unchecked / checked / **indeterminate** 三态）；Radio（单颗）+ RadioGroup（单选组容器，含键盘方向键，由 Base UI 原生提供）；两者的 inline label；两者在瑚琏 `Field` 内的 a11y 串联（验证 + demo，**零** Field 代码改动）。
- **不做**（YAGNI，见 §11）：checkbox-group 的「父子级联全选」（Base UI `parent` prop）、Radio 横向以外的花哨布局、indeterminate 的受控双向同步糖、ref 转发（与全 family 一致推迟）、`ShowcaseSpec` 类型改动、主 spec §4 回写（§4 本就标 Base UI，无需改）。

边界判据：**Step 3 不引入任何新依赖**（Base UI 已在依赖里，Switch/Dialog/Input 同源），不触发 overlay 红线（选择族无浮层）。

---

## 2. 确认的裁决（brainstorm 收口）

| 决策点 | 裁决 | 依据 |
|--------|------|------|
| 选源 | **全 Base UI rc.0**：`@base-ui-components/react/checkbox`、`/radio`、`/radio-group` | 主 spec §4 已定；与 Switch/Dialog/Input 同一套 primitive |
| 组件粒度 | **2 个 slug**：`checkbox` + `radio`；`radio` 文件夹同时产出 `Radio` + `RadioGroup`（单颗 Radio 离不开 Group，共一张文档页） | 「加组件唯一入口」= 四件套 + manifest 一行 + registry 一行；slug ↔ 文档页一一对应 |
| 选中态皮肤 | **复用 Switch 配方**：`data-[checked]` 驱动 + `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-bg` + 语义 token | 标杆一致；明暗自动适配 |
| disabled 选择器 | **用 `data-[disabled]` 而非 `:disabled` 伪类** | ⚠️ Checkbox.Root/Radio.Root 渲染 `<span>`（非 Switch 的 `<button>`），`:disabled` 伪类不命中 span（见 §3 实测） |
| indeterminate | Checkbox 第三态，用 Base UI `indeterminate` prop（原生支持），勾/横线靠 `Indicator` 的 `render={(props,state)=>…}` 按 `state.indeterminate` 类型安全分支 | §3 实测确认 prop + render 函数签名 |
| inline label | Checkbox/Radio **各带可选 `label` prop**（盒子 + 文字横排，`<label>` 包裹原生关联）。这是选择族的人体工学默认（label 在盒右，区别于 Input 的 label 在上） | 单选/复选的 label 天然在控件旁，不套 Field 的「label 在上」纵向布局 |
| Field 串联 | **能串、零代码改动**：Checkbox.Root/Radio.Root/RadioGroup.Root 均 `extends FieldRoot.State`，嵌进瑚琏 `Field` 即自动吃 Field 上下文（group label 在上 + error 在下 + disabled/invalid 经 context 下发）。验证 + demo，不改 Field | §3 实测 + Step 2 Field 已就绪 |
| Playground 表达 indeterminate | Checkbox 用 **select control**（`未选/已选/半选`）驱动初始态 + 可交互；`ShowcaseSpec` **无需改**（select 已支持） | brief 指定；§7 |
| 主 spec §4 回写 | **不需要**（§4 第 124/125 行 Checkbox/Radio 本就标 Base UI） | 与 Step 2 不同，Step 2 是把「原生」改判 Base UI Field，Step 3 无此需求 |

---

## 3. Base UI rc.0 API 实测确认（`require.resolve` 定位真实包，非猜测）

> 防 API 漂移。包根经 `require.resolve('@base-ui-components/react/package.json', {paths:['packages/ui']})` 定位到 `.pnpm/@base-ui-components+react@1.0.0-rc.0_…`，读 exports 映射 + 各 Root 的 `.d.ts`。

**Checkbox**（`@base-ui-components/react/checkbox`，命名空间 `Checkbox`）
- 成员：`Checkbox.Root`、`Checkbox.Indicator`。
- `Checkbox.Root` 渲染 `<span>` + 旁置隐藏 `<input>`；`extends FieldRoot.State`。关键 props：`checked?` / `defaultChecked?` / `onCheckedChange?(checked, eventDetails)` / **`indeterminate?: boolean`** / `disabled?` / `readOnly?` / `required?` / `name?` / `value?` / `id?` / `inputRef?` / `parent?`(checkbox-group 级联，YAGNI 不用)。
- `Checkbox.Indicator`：`keepMounted?`（默认 false → 未选时卸载）；渲染条件 `rootState.checked || rootState.indeterminate`；其 `State extends CheckboxRoot.State`（含 `indeterminate` / `transitionStatus`）。
- emit 的 data-* 属性：`data-checked` / `data-unchecked` / **`data-indeterminate`**（indeterminate 时不出 data-checked/unchecked）/ `data-disabled` / `data-readonly` / Field 内时 `data-invalid` 等（`fieldValidityMapping`）。

**Radio**（`@base-ui-components/react/radio` + `…/radio-group`）
- `radio-group` 导出 `RadioGroup`（具名，非命名空间）；渲染 `<div>`；`extends FieldRoot.State`；内置 roving tabindex + **方向键导航**。props：`value?: unknown` / `defaultValue?: unknown` / `onValueChange?(value, eventDetails)` / `disabled?` / `readOnly?` / `required?` / `name?` / `inputRef?`。
- `radio` 命名空间 `Radio`：`Radio.Root`（渲染 `<span>`+隐藏 input；`extends FieldRoot.State`；props：**`value: any`（必填）** / `disabled?` / `readOnly?` / `required?` / `inputRef?`）、`Radio.Indicator`（`keepMounted?` 默认 false；选中时挂载；`State` 含 `checked`/`transitionStatus`）。
- emit 的 data-*：`data-checked` / `data-unchecked` / `data-disabled`。

**render prop 函数签名（核心视觉承重点）**：`render?: ComponentRenderFn<Props,State> | ReactElement`，其中 `ComponentRenderFn = (props, state) => React.ReactElement`。→ Checkbox 勾/横线写法成立：
```tsx
<Checkbox.Indicator render={(props, state) => (
  <span {...props}>{state.indeterminate ? <Dash/> : <Check/>}</span>
)} />
```

---

## 4. 组件设计

### 4.1 Checkbox（`packages/ui/src/checkbox/`）

**API**（`checkbox.types.ts`）
```ts
export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;                  // 三态（Base UI 原生）
  onCheckedChange?: (checked: boolean) => void;  // 瑚琏收敛：丢 eventDetails（同 Switch 收敛风格）
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  label?: ReactNode;                        // 可选 inline label（盒右）
  className?: string;                       // 落在盒子 Checkbox.Root
  "aria-label"?: string;
}
```

**结构 / 皮肤**（复用 Switch 配方 → 方形盒）
- 有 `label` → 外层 `<label className="inline-flex items-center gap-2 ...">` 包「盒 + 文字」（原生 label↔input 关联，整体可点）；无 `label` → 仅盒子。
- 盒（`Checkbox.Root`）：`size-5 shrink-0 grid place-items-center rounded-[var(--radius)] border border-border bg-surface text-primary-foreground transition-colors` + `data-[checked]:bg-primary data-[checked]:border-primary` + `data-[indeterminate]:bg-primary data-[indeterminate]:border-primary` + `data-[invalid]:border-danger`（Field 内无效时）+ `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg` + `data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed`。
- 指示符（`Checkbox.Indicator`）：`render={(props,state)=> <span {...props}>{state.indeterminate ? 横线SVG : 勾SVG}</span>}`，图标 `size-3.5`、`currentColor`（继承盒的 `text-primary-foreground`）。SVG inline，**不引图标依赖**。
- label 文字 span：`text-sm text-foreground select-none`，`disabled` 时 JS 条件加 `opacity-50`（盒已自带 data-[disabled] 暗化，label 文字用 prop 暗化保持一致）。

### 4.2 Radio + RadioGroup（`packages/ui/src/radio/`，一文件夹双导出）

**API**（`radio.types.ts`）
```ts
export interface RadioGroupProps {
  value?: string;                           // 受控（瑚琏把 unknown 收窄 string）
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  orientation?: "vertical" | "horizontal";  // 仅控布局，默认 vertical
  className?: string;
  children: ReactNode;                      // <Radio> 们
  "aria-label"?: string;
}
export interface RadioProps {
  value: string;                            // 必填，标识选项
  disabled?: boolean;
  label?: ReactNode;                        // 可选 inline label（点右）
  id?: string;
  className?: string;                       // 落在点 Radio.Root
}
```

**结构 / 皮肤**
- `RadioGroup` = `<BaseRadioGroup>` + 布局：`flex flex-col gap-2`（vertical）/ `flex flex-row flex-wrap gap-4`（horizontal）。键盘方向键由 Base UI 内置，不手写。
- `Radio` = 有 `label` 时 `<label className="inline-flex items-center gap-2 ...">` 包「点 + 文字」；点（`Radio.Root`）：`size-5 shrink-0 grid place-items-center rounded-full border border-border bg-surface transition-colors` + `data-[checked]:border-primary` + `data-[invalid]:border-danger` + 同款 `focus-visible:ring` + `data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed`；中心点（`Radio.Indicator`）：`size-2.5 rounded-full bg-primary`（选中时挂载）。
- 标准单选观感：未选 = 空心圈；选中 = 主色描边圈 + 主色实心中心点。

---

## 5. Field 串联裁决（「能进 Field 串联」的完整答案）

- **per-control label** 走 Checkbox/Radio 自己的 `label` prop（人体工学正确：label 在盒/点旁）。
- **group-level label + help + error** 走嵌套进瑚琏 **Field**：
  ```tsx
  <Field label="性别" error="请选择一项">
    <RadioGroup defaultValue="m">
      <Radio value="m" label="男" />
      <Radio value="f" label="女" />
    </RadioGroup>
  </Field>
  ```
  Field.Root 给「性别」label（在上）+ error（在下，`match={true}` 强制渲染）+ 经 context 把 `disabled`/`invalid` 下发到 RadioGroup/Radio（它们 `extends FieldRoot.State`）。
- **零 Field 代码改动**：Field 已能包裹任意 children。本步只**验证**（测试）+ **demo**（showcase 一态），不改 Field。
- 测试落点：Checkbox 嵌 `<Field error>` → 控件得 `aria-invalid="true"`（证 context 串联）；RadioGroup 嵌 `<Field disabled>` → 子 Radio 不可交互 / 得 `data-disabled`（证 disabled 下发）。

---

## 6. showcase 模具评估（不动 `ShowcaseSpec` 类型）

现有 `ShowcaseSpec`（`controls: text/select/boolean/number` + `states` + `renderWithProps` + `toCode`）足够，本步零类型改动：
- **Checkbox 三态在 Playground**：用 **select control** `state: ["未选","已选","半选"]`（label 中文，值映射）。`renderWithProps` 接 select 字符串 → 映射 `{checked, indeterminate}` 到一个**可交互受控包装**（`useState` 初值由 select 定，select 变时用 `key` 重置；点击：半选→已选→未选 循环，indeterminate 点一下消解为 checked）。disabled(boolean) + label(text) 另两个 control。
- **Radio 在 Playground**：`orientation`(select vertical/horizontal) + `disabled`(boolean)；`renderWithProps` 渲一个受控 RadioGroup（3 选项，`useState` 持 value）。
- **states gallery**（静态全貌）：Checkbox = unchecked/checked/indeterminate/disabled/disabled-checked/带 label/在 Field 内(invalid+error)；Radio = 一个 vertical RadioGroup（默认选中一项 + 一项 disabled）/ 一个 horizontal / 在 Field 内(group label+error)。
- 复合结构（RadioGroup 的多选项、Field 串联）靠 `states` 预置组合展示，不用 controls 拼装结构（同 Step 2 口径）。

---

## 7. 继承的硬约束（plan/实现逐条守）

1. **只消费语义 token**（无 success）：`bg-bg`/`bg-surface`/`bg-surface-hover`/`text-foreground`/`text-muted`/`border-border`/`ring-ring`/`bg-primary`/`text-primary-foreground`/`border-primary`/`border-danger`/`ring-danger`/`text-danger`；圆角统一 `rounded-[var(--radius)]`（checkbox 方盒 / radio 用 `rounded-full`）。禁裸值。
2. **a11y 靠 Base UI 兜底**：焦点环 / 方向键 / role / aria-checked / 表单态串联全交 primitive；inline label 用原生 `<label>` 关联。
3. **变体收敛**：外观差异走 data-attr 选择器（`data-[checked]`/`data-[indeterminate]`/`data-[disabled]`/`data-[invalid]`），不散落 className 覆盖。Checkbox/Radio 标量变体少（size 暂统一 `size-5`，YAGNI 不开 size 变体），故**不强制** CVA；皮肤直接写在组件（同 Switch，Switch 也无 CVA）。
4. **四件套**：`x.tsx` + `x.types.ts` + `x.showcase.tsx`（必 `"use client"`）+ `x.test.tsx` + `index.ts`（桶导出组件/类型/showcase），主 `index.ts` 加 `export * from "./x"`，showcase 必经主 barrel 导出（registry 消费）。Checkbox/Radio 本体用 Base UI(client) → `"use client"`。
5. **overlay 全 Base UI**：本步无浮层，不触发红线。
6. **端口**：www=5512，桌面 app devUrl=5514；若桌面 app 已在 5514 跑则直接用 5514 截图（见 skill `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。
7. **disabled 用 `data-[disabled]`**（§2 裁决，span 非 button）。

---

## 8. 接 IA（manifest + registry 双文件，唯一入口）

- `apps/www/lib/manifest.ts` 在 `field` 后追加 2 条（`category:"inputs"`,`status:"new"`）：
  ```ts
  { slug: "checkbox", name: "Checkbox", description: "复选框 · 三态(含半选) + Base UI", category: "inputs", status: "new" },
  { slug: "radio", name: "Radio", description: "单选 · RadioGroup 单选组 + 键盘方向键", category: "inputs", status: "new" },
  ```
- `apps/www/lib/registry.tsx`：import 加 `checkboxShowcase`、`radioShowcase`，map 加 `checkbox: checkboxShowcase`、`radio: radioShowcase`。
- 契约测试（`apps/www` 现有 manifest 测试）应自动覆盖到 12 个 slug 双边齐全、无孤儿。

---

## 9. 分步落地（每步独立 commit + 节奏同 Step 2）

| Task | 内容 | 门禁 |
|------|------|------|
| **D1 — Checkbox** | checkbox 四件套（三态 + inline label + Field 串联测试） | TDD 先红后绿 `vitest run checkbox` + `pnpm typecheck` + commit |
| **D2 — Radio** | radio 四件套（RadioGroup + Radio + 方向键由 Base UI + Field 串联测试） | TDD 先红后绿 `vitest run radio` + `pnpm typecheck` + commit |
| **D3 — 接 IA + 验收** | manifest +2 / registry +2；契约测试；完整三道门；Playwright 明暗两态像素实测；commit | `pnpm typecheck && pnpm test && pnpm build --filter=www`（build **必 --filter=www**）+ Playwright |

- 完整三道门 + 生产 build **只在 D3 跑一次**（组件 Task 只 `vitest run <名>` + `typecheck`）。`build` 必 `--filter=www`（全包 build 撞 desktop tauri `beforeBuildCommand` 二次 build，见 skill `turbo-monorepo-desktop-shell-beforebuild-double-builds-frontend`）。
- **Playwright 截图只在 D3**：`checkbox`/`radio` 各明暗两态，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`（**不在 .playwright-mcp/**），**Read 每张看像素**（不靠 `browser_evaluate` 读 DOM，会漏几何/显色 bug，见 skill `ui-layout-verify-needs-screenshot-not-dom-eval`）。逐项验：checked 盒填主色+勾、**indeterminate 盒填主色+横线**、unchecked 空盒、disabled 暗化、**focus 点击后 ring 出现**、Radio 选中圈+中心点、**键盘方向键切选**、Field 内 group label+error 可见。
- **trunk-based**：本地 master 小步 commit，无 remote、不 push。

---

## 10. 验收口径（done 的标志）

1. 左树「表单录入」分组新增 Checkbox/Radio（带 `new` 标记），各自 `/components/[slug]` 独立 SSG 页可直接 URL 访问。
2. Checkbox 四件套齐：三态（unchecked/checked/**indeterminate**）皮肤正确、inline label 关联、disabled 暗化、focus ring、Field 内 aria-invalid 串联。
3. Radio 四件套齐：RadioGroup 单选互斥、**键盘方向键可切**、选中圈+中心点、inline label、disabled、Field 内 group label+error。
4. 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 12 slug 双边齐全；桌面 app(5514) 加载新组件正常。
5. Playwright 明暗两态像素实测无异常（尤其 indeterminate 横线 / checked 勾 / focus ring / 单选中心点显色）。
6. 只消费语义 token、`"use client"` 正确、未引新依赖、未改 `ShowcaseSpec` 类型、未动 Field。
7. manifest + registry 双文件为加组件唯一 IA 入口（+2 行）；**无主 spec §4 回写**（§4 本就 Base UI）。

---

## 11. 本步不做（YAGNI 边界）

- **不做 checkbox-group 父子级联全选**（Base UI `parent`/`CheckboxGroup`）——无当前需求，后议。
- **不开 size 变体**（统一 `size-5`）——选择族 size 诉求弱，需要时再加 CVA。
- **不做 ref 转发**（与全 family 一致推迟，作跨切面统一决策；记于记忆 follow-up）。
- **不改 `ShowcaseSpec` 类型**（select control 表达 indeterminate 足够）。
- **不改 Field**（串联靠 context，零改动）。
- **不回写主 spec §4**（已是 Base UI）。
- **不引图标库**（勾/横线/中心点用 inline SVG / div）。
- **不暴露 readOnly/eventDetails**（瑚琏 API 收敛；需要时逃生口再开）。
