---
"@hulianui/ui": minor
---

ShimmerButton 补 `foreground`（#288）：文字前景与 `background` 成对，固定品牌渐变在暗色下不再出黑字

`ShimmerButton` 收 `background`（缺省 `var(--color-primary)`），文字色却写死 `text-primary-foreground`。默认底色下这对是成立的（主色 ↔ 主色前景随主题成对变），可消费方一旦传了**固定**底色（登录页那种不随主题的品牌渐变 `linear-gradient(135deg,#7c3aed,#4f46e5)`），前景仍跟着主题走：暗色下 primary-foreground 是近黑，紫渐变上出黑字。

- 新增 `foreground?: string`，缺省 `var(--color-primary-foreground)`，落 `--hulian-shimmer-fg`；文字色改读该变量（写成 `[color:var(--hulian-shimmer-fg)]` 而非 inline `style.color`，消费方此前在 `className` 里写 `text-white` 顶着的调用点仍照常生效，可从容迁到 prop）。
- `shimmerColor` 缺省改为跟随 `foreground`（同一个变量），配对时不必再传第三个值；不传 `foreground` 时值与旧版逐字相同（primary-foreground），显式传 `shimmerColor` 不受影响。
