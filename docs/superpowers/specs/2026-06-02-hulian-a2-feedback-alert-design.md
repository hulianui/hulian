# 瑚琏 Hulian A2 反馈族补充 — Alert 提示条设计

- **日期**: 2026-06-02
- **状态**: 设计定稿（用户已设目标「直到完成再通知我」= 授权自主跑完 brainstorm→plan→实施→收尾，本 spec 记录裁决供 audit）
- **范围**: A2 反馈族（`feedback` 分类）补充 **Alert**——纯静态内联提示条，**无 Base UI 行为、无浮层、无 Portal**。
- **上游依据**:
  - 主 spec `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 分类法 feedback 含 Alert · §6 硬约束 · §9 YAGNI）
  - Step 2 plan `2026-06-02-hulian-a2-step2-form-inputs.md`（四件套 + TDD + 三道门模具）
  - 范式参照 `packages/ui/src/badge/badge.tsx`（纯 CVA 皮肤 + compoundVariants）

---

## 1. 定位与边界

Alert = 页面级 / 表单级**内联**反馈提示条（区别于浮层的 Toast/Dialog）。它没有交互行为态，本质是 **CVA 皮肤 + 语义结构 + 一条 a11y role**，因此**照 Badge 的纯皮肤范式写**，不挂 Base UI 行为引擎。

- **做**：`tone × variant` 皮肤矩阵 + 可选 `icon` slot + 可选 `title` + `children`(description) + 由 tone 派生的 `role`。
- **不做**（YAGNI，见 §6）：dismissible（关闭按钮 + 隐藏状态）、size 变体、action 按钮槽、自动消失计时（那是 Toast 的领域，排 overlay 批次）。

---

## 2. 关键裁决

| 决策点 | 裁决 | 第一性原理 |
|--------|------|-----------|
| **tone 集合** | `info` / `danger` / `neutral` | token 集合**无** success/warning（`grep color- preset.css` 自证：仅 primary/danger/surface/muted 系）。强行引 success/warning = 引未注册颜色，违「只消费语义 token」硬约束。info 复用 primary 系，danger 用 danger 系，neutral 用 surface/muted/border 系。 |
| **variant 范围** | `soft` / `outline` | 对齐 Badge：soft = `/12` alpha 底（明暗实测都对），outline = `border-{tone}`。不做 solid（整块实心色块作大段文字背景对比度差、压迫感强，内联提示用不到）。 |
| **icon 怎么传** | `icon?: ReactNode` 由调用方传入 | 设计系统不绑图标库（零新依赖硬约束）。调用方传自己的 SVG/emoji；showcase 内用本地内联 SVG 演示三 tone 的典型图标。 |
| **dismissible 本批是否做** | **不做**（deferred YAGNI follow-up） | 见 §3。 |
| **role** | tone=danger → `role="alert"`（assertive）；info/neutral → `role="status"`（polite）；可被 `props.role` 覆盖 | danger 是需打断的错误，alert 角色让 AT 立即播报；info/neutral 是非紧急，status 角色礼貌播报。别漏 role。 |
| **是否 `"use client"`** | 本体**不加**（纯静态、无 hook/事件 → RSC-capable）；仅 `*.showcase.tsx` 加 | 保住「纯皮肤组件可作 Server Component」的优雅属性。showcase 因 ShowcaseSpec 含 `render()` 函数须 client。 |

---

## 3. 为何 dismissible 本批不做（裁决记录）

1. **核心价值不依赖它**：Alert 主用例 = 内联静态提示（表单错误汇总、页面级公告），不可关闭恰是常态。
2. **代价不对称**：dismissible 需 `useState` + 关闭按钮 → **强制本体加 `"use client"`**，直接牺牲 §2 末「纯静态可作 RSC」的优雅属性，为一个非核心能力污染整组件。
3. **纯增量、可无损后补**：`dismissible?: boolean` + `onDismiss?` 是附加 prop，后续要做时不破坏现有 API。
4. **职责边界**：真正「可关闭 + 短时自动消失」的反馈是 **Toast**，已排 overlay 批次（A2.2）。Alert 与 Toast 各司其职，不在 Alert 上提前长出 Toast 的能力。

> follow-up：若后续确需可关闭内联条，新增 `dismissible`/`onDismiss` 并届时给本体加 `"use client"`，单独小批处理。

---

## 4. 组件结构与皮肤

### 4.1 结构

```tsx
<div role={resolvedRole} className={alertVariants({ tone, variant })}>
  {icon != null && <span className="icon-slot">{icon}</span>}
  <div className="content">
    {title != null && <div className="title">{title}</div>}
    {children != null && <div className="description">{children}</div>}
  </div>
</div>
```

- 容器：`flex w-full items-start gap-3 rounded-[var(--radius)] p-4`
- icon slot：`mt-0.5 shrink-0 [&>svg]:size-5`（图标顶对齐首行，约束 SVG 尺寸）
- title：`text-sm font-medium`（继承容器 accent 色）
- description：`text-sm text-muted`（**恒 muted**——保证大段正文在明暗下都是中性可读色，不被 tone accent 染成整块彩色文字）

### 4.2 CVA（tone × variant，9 条 compoundVariants）

容器 base 设布局；`tone`/`variant` 留空由 compound 填色（照 Badge 写法）。compound 设「底色/边框 + accent 文字色」，accent 作用于 icon + title（description 显式 `text-muted` 覆盖）：

| variant | tone | class |
|---------|------|-------|
| soft | info | `bg-primary/12 text-primary` |
| soft | danger | `bg-danger/12 text-danger` |
| soft | neutral | `bg-surface-hover text-foreground` |
| outline | info | `border border-primary text-primary` |
| outline | danger | `border border-danger text-danger` |
| outline | neutral | `border border-border text-foreground` |

- `variant: { soft: "", outline: "border" }`，`tone: { info: "", danger: "", neutral: "" }`，`defaultVariants: { tone: "info", variant: "soft" }`。
- outline 的 `bg`：保持透明（继承页面 bg）即可，无需额外 `bg-surface`——内联条在 `bg`/`surface` 上都靠 border 划界。

### 4.3 Props

```ts
export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,   // 避开 HTML title 属性与 ReactNode title 冲突
    VariantProps<typeof alertVariants> {
  icon?: ReactNode;
  title?: ReactNode;
  // children = description
}
```

- `role` 在组件内由 tone 派生，但允许 `props.role` 显式覆盖（`role` 已在 HTMLAttributes 内，destructure 后取默认）。

---

## 5. 四件套与 IA 接入

- 四件套：`alert.tsx`（**无** "use client"）+ `alert.types.ts` + `alert.showcase.tsx`（**必** "use client"）+ `alert.test.tsx` + `index.ts`（桶导出 Alert + alertVariants + AlertProps + alertShowcase）。
- 主 `packages/ui/src/index.ts` 加 `export * from "./alert"`（紧跟 `./field` 之后）。
- IA：`apps/www/lib/manifest.ts` +1 条（`category: "feedback"`, `status: "new"`）；`apps/www/lib/registry.tsx` +1 import 名 + 1 map 行。**registry/manifest 双文件隔离不破。**
- showcase：`tone`/`variant` 用 `select`，`title`/`description` 用 `text`，`withIcon` 用 `boolean`；**ShowcaseSpec 类型零改动**（现有 control 类型够用）。

---

## 6. 继承硬约束（实现逐条守）

1. **只消费语义 token**：无 success/warning；info=primary 系、danger=danger 系、neutral=surface/muted 系；圆角 `rounded-[var(--radius)]`。
2. **变体收敛**：全走 CVA `tone/variant` + compoundVariants，不散写 className 覆盖。
3. **a11y**：role 必加（danger=alert / 其余=status），不可漏。
4. **四件套** + 桶导出 + 主 index + showcase 从主 barrel 导出（registry 消费）。
5. **三道门**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（build **必** `--filter=www`）。
6. **Playwright 截图**：明暗两态，存 cwd 根 Read 看像素——重点验 soft 的 `/12` alpha 底色在明暗下都正确 + tone×variant 矩阵 + icon/title 对齐。桌面 app 已跑 5514 则用 5514 截图。

---

## 7. YAGNI 边界（本批不做）

- **不做 dismissible**（§3）、不做 size 变体、不做 action 按钮槽、不做自动消失计时。
- **不绑图标库**（icon 由调用方传）。
- **不做 solid variant**。
- **不改** `ShowcaseSpec` 类型、**不引**任何新依赖。
