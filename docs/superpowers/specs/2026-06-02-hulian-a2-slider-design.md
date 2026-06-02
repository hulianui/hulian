# 瑚琏 A2 Step（补充）— 表单录入族 Slider 设计

- **日期**: 2026-06-02
- **状态**: 关键裁决已定（用户授权自主推进，见下「裁决」），进入实施计划
- **覆盖范围**: 单组件 **Slider**（滑块）。归类 `inputs`，接入既有 IA（manifest +1 / registry +1），第 11 个组件。
- **上游依据**:
  - 主 spec `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 分类法把 Slider 列入 `inputs`；§6 硬约束；§9 YAGNI 边界）
  - Step 2 spec/plan（`…-a2-step2-form-inputs*.md`）—— 表单录入族四件套 + TDD + 三道门模具，本组件沿用
- **前置进度**: A2 批次一 + Step 2（10 组件）已完成（见项目记忆 `hulian-phase-status`）。Slider 是表单录入补充，独立一个 commit 序列。

---

## 1. 本组件定义与边界

Slider = 在轨道上拖动 thumb 选数值的录入控件。瑚琏只做「皮肤 + 瑚琏 API 薄包」，**几何定位与键盘交互全部交给 Base UI rc.0 `slider` primitive 兜底**，不手写。

- **做**：单值滑块 + 可选 range（双 thumb）；轨道 / 已填充段 / thumb 三段语义 token 皮肤；thumb focus 环复用 Switch 配方思路；disabled 态。
- **不做**（YAGNI，见 §6）：marks/刻度标记、垂直方向、tooltip 气泡、对数刻度、`Field` 内 a11y 串联演示（Slider 可独立用，本批不绑 Field demo）。

---

## 2. Base UI API 实证（require.resolve 确认，非记忆）

`@base-ui-components/react/slider` @ **1.0.0-rc.0**，解析自
`node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_…/slider/index.js`。

**子组件（`Slider.*`）**：`Root` · `Value` · `Control` · `Track` · `Indicator` · `Thumb`。

**`Slider.Root` 关键 prop**（泛型 `Value extends number | readonly number[]`）：
`value` / `defaultValue`（**数组即 range**）· `min`(默认 0) · `max`(默认 100) · `step`(默认 1) ·
`largeStep`(默认 10，PageUp/Down + Shift+Arrow) · `minStepsBetweenValues` · `disabled` · `orientation` ·
`name` · `format`/`locale` · `onValueChange(value, details)` · `onValueCommitted(...)` ·
`thumbCollisionBehavior`(`push`/`swap`/`none`，range 双 thumb 碰撞)。

**⚠️ 关键裁决依据 —— 没有 `range` prop**：range 由「`value`/`defaultValue` 传数组」驱动。
组件据此分流：标量 value → 渲 1 个 `<Slider.Thumb>`；数组 value → 渲 2 个 `<Slider.Thumb index={0}/index={1}>`（SSR range 必须显式 index）。

**键盘全兜底**（`SliderThumb.js` onKeyDown 实证）：方向键=step、Shift+方向键/PageUp/PageDown=largeStep、Home/End=min/max（range 下夹到邻 thumb）。**瑚琏不写一行键盘逻辑**。

**Thumb 焦点结构（实证）**：`Slider.Thumb` 渲 `<div>` + 内嵌 `<input type="range">`（`visuallyHidden`、铺满 thumb、承接 `:focus-visible`）。
→ **焦点环不能用 `focus-visible:ring`**（焦点在内层 input 不在 thumb div），**必须 `has-[:focus-visible]:ring-…`**（thumb div 监听后代 input 的 focus-visible）。这是与 Switch（Root 自身可聚焦）配方的唯一差异点。

**几何自动**：`Slider.Indicator` 与 `Slider.Thumb` 由 Root state 自算 inline style（填充宽度 / thumb 位置）。瑚琏皮肤**只给外观**（bg/border/radius/size），**不写 left/width/transform 几何**，否则覆盖 Base UI 定位。

---

## 3. 关键裁决（brainstorm 收口）

| 决策点 | 裁决 | 理由 |
|--------|------|------|
| 单值 vs range | **本批都做**：一个 `Slider` 组件，标量 value→单 thumb，数组 value→双 thumb | Base UI 原生支持（数组 value），零额外引擎；range 是表单录入常见诉求 |
| marks/刻度 | **不做**（YAGNI） | Base UI parts 无 marks；刻度是后续可加增量，非本批命脉 |
| 受控 vs 非受控 | **都支持**（`value`/`defaultValue`/`onValueChange` 全透传 Root）；默认用法非受控（`defaultValue`） | 薄包透传，零成本两全 |
| 值读出 | 加 **`showValue?: boolean`**（默认 false）→ 渲 `<Slider.Value>` output 在轨道上方 | 滑块无值反馈难用/难演示；用 Base UI 自带 Value part，无自造 |
| Playground value 表达 | **number control**（value/min/max/step）+ **boolean**（showValue/disabled）；**range 只在 `states` gallery 演示**（数组无法用标量 control 表达） | 标量 control 表达单值；range 用预置 demo。**`ShowcaseSpec` 无需改**（已确认） |
| 方向 | **horizontal only** | 垂直 YAGNI |

---

## 4. 组件结构与皮肤（只消费语义 token）

```tsx
// 标量：单 thumb；数组：双 thumb（index 0/1）。
<Slider.Root value/defaultValue/min/max/step/disabled/onValueChange …>
  {showValue && (
    <div className="mb-2 flex items-center justify-between text-sm text-foreground">
      {/* 可选 label slot + */} <Slider.Value className="tabular-nums text-muted" />
    </div>
  )}
  <Slider.Control className="relative flex w-full touch-none items-center select-none py-2">
    <Slider.Track className="relative h-1.5 w-full rounded-full bg-surface-hover">
      <Slider.Indicator className="rounded-full bg-primary" />
      {/* 单值 */}<Slider.Thumb className={thumbCls} />
      {/* range */}<Slider.Thumb index={0} className={thumbCls} /><Slider.Thumb index={1} className={thumbCls} />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

`thumbCls`（focus 环用 `has-[:focus-visible]:`，复用 Switch 的 ring token 配方）：
```
size-4 rounded-full border border-border bg-surface shadow outline-none transition-transform
has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg
```

- **轨道** `bg-surface-hover`、**已填充段** `bg-primary`、**thumb** `bg-surface + border-border + shadow`。
- **disabled**：Root wrapper 加 `data-[disabled]:opacity-50 data-[disabled]:pointer-events-none`（Root 据 `disabled` 落 `data-disabled`）。
- 圆角统一 `rounded-full`（thumb/track/indicator 都圆），轨道高度 `h-1.5`、thumb `size-4`。
- range 双 thumb 不重叠：靠 Base UI `thumbCollisionBehavior` 默认 `push` 兜底，皮肤无需处理。

> 语义 token 白名单（继承硬约束，无 success）：`bg`/`surface`/`surface-hover`/`foreground`/`muted`/`border`/`ring`/`primary`(+`-foreground`/`-hover`)/`danger`(+`-foreground`)/`radius`。Slider 用到：`surface`/`surface-hover`/`primary`/`border`/`ring`/`foreground`/`muted`/`bg`(ring-offset)。

---

## 5. 瑚琏 API（`SliderProps`）

```ts
// 透传 Base UI Root（非泛型，用默认联合类型——数组 value 仍类型可过且避免泛型组件转发摩擦）。
export interface SliderProps extends Omit<SliderRoot.Props, "className" | "render"> {
  className?: string;       // 落 Root wrapper（覆盖 Base UI 的 string|fn className，简化为 string）
  showValue?: boolean;      // 显示数值读出（Slider.Value）
}
```

- 不新增 size 变体（YAGNI；单一尺寸已够，后续要再加 CVA）。
- 不暴露泛型 `Value` 参数（默认 `SliderRoot.Props` 即 `number | readonly number[]` 联合，`value={[25,75]}` 仍类型可过）。
- `value`/`defaultValue`/`min`/`max`/`step`/`disabled`/`onValueChange`/`name` 等全由 `SliderRoot.Props` 提供，透传即可。
- range 判定：渲染期 `Array.isArray(value ?? defaultValue)` → 双 thumb，否则单 thumb。

---

## 6. 继承硬约束 + YAGNI

**硬约束**（plan 逐条守）：只消费语义 token；overlay 红线无关（Slider 无浮层）；四件套
`slider.tsx`+`slider.types.ts`+`slider.showcase.tsx`(必 `"use client"`)+`slider.test.tsx`+`index.ts`，桶导出 + 主 index `export * from "./slider"`；showcase 从主 barrel 导出供 registry 消费；
三道门 `pnpm typecheck && pnpm test && pnpm build --filter=www`（build **必 `--filter=www`**）；
Playwright 截图存 cwd 根、Read 看像素（明暗两态，验轨道/填充/thumb 对齐、focus ring、disabled、range 双 thumb 不重叠）；端口 www=5512 / app=5514（app 已跑 5514 则用 5514 截图）；registry/manifest 双文件隔离。

**YAGNI（不做）**：marks/刻度、垂直方向、tooltip 气泡、size 变体、Field 内串联 demo、`onValueCommitted` 暴露为瑚琏专属 API（仍可透传，但不在 showcase 演示）、对数/非线性刻度。

---

## 7. showcase 模具（零改 `ShowcaseSpec`）

- **controls**：`value`(number,默 40) · `min`(number,默 0) · `max`(number,默 100) · `step`(number,默 1) · `showValue`(boolean,默 true) · `disabled`(boolean,默 false)。
- **states**（gallery 预置）：`default`(单值 40) · `showValue`(带读出) · `range`(数组 `[25,75]`，双 thumb) · `step=10`(粗粒度) · `disabled`。
- **renderWithProps**：用上述标量 controls 渲单值滑块（range 不进 Playground）。
- **toCode**：`<Slider defaultValue={value} min={…} max={…} step={…}{showValue}{disabled} />`。

---

## 8. 验收口径（done 标志）

1. `Slider` 四件套齐、只消费语义 token、`"use client"` 正确、桶导出 + 主 index + showcase 从 barrel 出。
2. 接 IA：manifest +1（`slider`/`inputs`/`new`）、registry +1（import+map）；契约测试 11 slug 双边齐全。
3. 三道门全绿；`/components/slider` SSG 生成、可 URL 访问。
4. Playwright 明暗两态像素自证：轨道 `surface-hover`、填充段 `primary`、thumb `surface+border` 对齐居中；键盘聚焦 thumb 出 `ring`（`has-[:focus-visible]` 生效）；disabled 整体变暗；**range 双 thumb 各就位、不重叠、两段填充正确**。
5. 桌面 app(5514) 加载新组件正常。
6. 单测覆盖：单值渲 1 个 `role="slider"`、range 渲 2 个；min/max/step/disabled 透传到 input 属性；showValue 渲出 output；数组 value 不报错。

---

## 9. 不做（YAGNI 边界，重申）

marks/刻度 · 垂直 · tooltip · size 变体 · Field demo · 改 `ShowcaseSpec` 类型 · 新依赖（纯 Base UI 既有 slider）。
