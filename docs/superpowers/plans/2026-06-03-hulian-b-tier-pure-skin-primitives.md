# 瑚琏 B 档 — HeroUI 缺口纯皮肤高频基础件批（spec + plan 合一）

- 日期：2026-06-03
- 批次：B 档（HeroUI 对照缺口 · 纯皮肤静态件，**零 Base UI / 零浮层 / 零新依赖**）
- 范围：**4 个 slug** —— Spinner / Chip / Link / Kbd。照 badge/breadcrumb 范式（CVA 皮肤 + 语义 token）。
- 注：纯皮肤小件按 breadcrumb 先例不写独立重 spec，裁决固化于本合一文档 + commit msg。

## 0. 缘起

A 档把 Base UI 现成 primitive 吃完后，HeroUI 仍缺一批**纯皮肤、无需 primitive** 的基础高频件。
这些是任何设计系统的地基（Divider 已由 A 档 Separator 覆盖；还缺 Spinner/Chip/Link/Kbd）。
全部 CVA 皮肤 + 语义 token，多数可 RSC（仅带交互的 Chip 需 "use client"）。

## 1. 清单与裁决

| slug | name | category | RSC? | 设计裁决 |
|------|------|----------|------|----------|
| `spinner` | Spinner | feedback | ✅ 纯 CSS animate-spin | SVG 双层环(track opacity-20 + spinning arc strokeLinecap round)；CVA size(sm/md/lg)×tone(primary/current/muted)；`role=status`+aria-label("加载中")；stroke=currentColor 吃 tone 色 |
| `chip` | Chip | data-display | ❌ 含 onClose 交互 | 比 Badge 大+可关闭(区别 Badge 是计数点)；CVA variant(solid/soft/outline)×tone(brand/danger/neutral)×size(sm/md)；`onClose` 存在才渲 X 按钮(lucide X, aria-label=移除)；leading dot 可选 |
| `link` | Link | navigation | ✅ 纯 a 标签 | CVA tone(primary/foreground/danger)×underline(always/hover/none)；`external` → target=_blank+rel=noopener+尾 ExternalLink 图标；focus-visible ring |
| `kbd` | Kbd | data-display | ✅ 纯 kbd 标签 | `<kbd>` 皮肤：border+bg-surface-hover+font-mono+text-muted+shadow-sm；多键组合靠并排多个 Kbd(keys 符号映射 YAGNI) |

## 2. 共性裁决

- **只消费语义 token**（无 success；tone 限 brand/primary/danger/neutral/foreground/muted/border）。
- **纯皮肤件不加 "use client"**（Spinner/Link/Kbd 可 RSC，照 badge/breadcrumb）；**仅 Chip 因 onClose 交互加 "use client"**。
- **CVA 范式**照 badge.tsx（variants + compoundVariants + defaultVariants）。
- **不散写 transition**：Link hover 颜色过渡用 `transition-colors`（与 breadcrumb 一致，单属性可接受）。

## 3. 接入链路（每件 4 处，照 SSOT）

1. `packages/ui/src/<slug>/`：`<name>.tsx` + `.types.ts` + `.showcase.tsx` + `.test.tsx` + `index.ts`。
2. `packages/ui/src/index.ts`：`export * from "./<slug>"`。
3. `apps/www/lib/manifest.ts`：加 meta 行（status `new`）。
4. `apps/www/lib/registry.tsx`：import showcase + map slug。

## 4. 测试与验收

- **vitest（每件 4–6 条）**：根元素/标签 + role/aria + CVA 皮肤类 + 关键行为（Chip onClose 点击回调、Link external 加 target+rel+图标、Spinner role=status、Kbd 渲 kbd 标签）。这些都是 jsdom 可靠测的静态/click 行为（非 Base UI pointer）。
- **三道门**：typecheck（剔除并行 WIP 后我 scope 零错）+ vitest（`--force`）+ build www（SSG 全过）+ manifest 契约 4 条。
- **截图自证**：隔离 chromium CDP 明暗两态，抽查 Spinner/Chip（tone×variant 矩阵）/Link。

## 5. 不做（YAGNI）

Spinner 自定义 svg slot · Chip avatar 槽 · Link as-child/Next Link 集成（消费者自包 next/link） · Kbd keys 符号自动映射 · Code/Snippet（含复制按钮，单独件后议）。

## 6. 完成定义

4 slug 四件套 + 接入 4 处 + 三道门绿 + 关键件截图自证 + race-safe commit。manifest 48 → 52。
