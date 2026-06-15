---
slug: flowing-menu
name: FlowingMenu
category: navigation
group: global
tags: [animated]
exports: [FlowingMenu]
status: enriched
---

# FlowingMenu

> 竖排流动菜单 · 指针近边缘判进/离向揭幕 + 循环跑马灯(文字/图片)(零依赖去 gsap·CSS keyframes + transition·token·reduced-motion) · navigation/global · #animated

## 何时用

需要一组竖排大字菜单项、悬停某项时从指针进入方向揭出一条文字/图片跑马灯的壁纸级炫技导航时用，适合作品集/品牌站的全屏目录。它是「逐项揭幕跑马灯」风格；要全屏铺开胶囊用 [BubbleMenu](../bubble-menu/bubble-menu.md)，要展开成卡片用 [CardNav](../card-nav/card-nav.md)，要规范多级导航用 [NavigationMenu](../navigation-menu/navigation-menu.md)/[NavMenu](../nav-menu/nav-menu.md)。

## 导入
```ts
import { FlowingMenu } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items * | `FlowingMenuItem[]` | — | 菜单项列表 |
| speed | `number` | `18` | 跑马灯走完一整屏的秒数，越大越慢 |
| repeat | `number` | `4` | 单个文字块里重复的份数（撑满并保证无缝循环） |

> `FlowingMenuItem`: `{ link, text, image? }`；`text` 同时作主标题与揭幕跑马灯文字，`image` 留空则只跑文字不渲染图片块。
> 还继承 `ComponentPropsWithoutRef<"nav">`（除 `children`），可透传 `className`/`style` 等。

## 示例
```tsx
// 带图片的揭幕跑马灯
<div className="h-80 overflow-hidden rounded-xl border border-border">
  <FlowingMenu
    items={[
      { link: "#discover", text: "Discover", image: "/a.jpg" },
      { link: "#build", text: "Build", image: "/b.jpg" },
    ]}
  />
</div>

// 纯文字 + 慢速大字
<FlowingMenu items={[{ link: "#home", text: "首页" }]} speed={30} repeat={6} />
```

## 禁忌 / 坑

- 根 nav 需放在有明确高度且 `overflow-hidden` 的容器里，逐项揭幕才有纵向空间且跑马灯不溢出。
- reduced-motion 下跑马灯/揭幕动效降级。
- 暂无其他已知坑。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
