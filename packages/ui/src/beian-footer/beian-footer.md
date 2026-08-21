---
slug: beian-footer
name: BeianFooter
category: navigation
group: global
tags: []
exports: [BeianFooter]
status: enriched
---

# BeianFooter

> 在页脚展示 ICP 备案与公安备案信息并链到官网 · navigation/global

## 何时用

中国大陆站点需要在页脚展示 ICP 备案号 + 公网安备 + 版权行（合规要求）时用，备案号默认自动链到 miit/mps 官方查询页。它专管「合规底栏」——顶部全局导航用 [Navbar](../navbar/navbar.md)，侧边树菜单用 [NavMenu](../nav-menu/nav-menu.md)。

## 导入
```ts
import { BeianFooter } from "@hulianui/ui"
```

## Props

`IcpRecord` = `{ number: string; href?: string }`；`PoliceRecord` 同形。`href` 不传则用默认官方链接。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| icp | `IcpRecord[]` | - | ICP 备案号，可多个（如主体下多站 -1/-2）。默认链 beian.miit.gov.cn |
| police | `PoliceRecord` | - | 公网安备号，带警徽图标。默认链 beian.mps.gov.cn |
| className | `string` | - | 类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icpLabel | `ReactNode` | 备案前缀文案，默认 `"ICP备案"` |
| copyright | `ReactNode` | 版权/补充行 |

## 示例
```tsx
// 完整：多 ICP + 公网安备 + 版权
<BeianFooter
  icp={[{ number: "闽ICP备2024073556号-1" }, { number: "闽ICP备2024073556号-2" }]}
  police={{ number: "闽公网安备35030302900030号" }}
  copyright="© 2026 瑚琏 · Abel"
/>

// 仅单个 ICP
<BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }]} />
```

## 禁忌 / 坑

- 备案号文本须与工信部/公安备案系统登记的完全一致（含「号-N」后缀），否则外链查询页对不上。
- 暂无其他已知坑（纯 RSC，外链统一新窗打开）。

## 相关
[Navbar](../navbar/navbar.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
