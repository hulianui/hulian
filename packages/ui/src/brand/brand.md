---
slug: brand
name: Brand
category: navigation
group: global
tags: []
exports: [Brand]
status: enriched
---

# Brand

> 品牌标识 · 方角徽章 + 站点名(+ 副标题) · mark 缺省自动取品牌名首字(中文一字/英文首字母) · mark 接图标/图片/动图/视频(picture 减弱动效回退与 video 都已给铺满规则) · 三档尺寸(sm 导航栏 28px / md 侧栏 36px / lg 登录页) + color 换徽章底色 · 省略 name 即收起态只出徽章 · href 普通链接 / render 接框架路由件回首页 · 区别 Avatar(圆的·套它得用 className 改形状=业务侧打补丁) · navigation/global

## 何时用

「方角色块徽章 + 站点名」这个组合是每个中后台 / 会员站都有的四处：导航栏左上、侧栏顶部、页脚品牌列、登录页品牌区。

**为什么 [Avatar](../avatar/avatar.md) 顶不了**：Avatar 是**圆**的（`size` 只给圆直径），品牌徽章要方角 + token 圆角。套 Avatar 就得用 `className` 改形状——那正是 `guard` 与 conventions 里说的「在业务侧打补丁」（hulianui/hulian#57）。

## 导入
```ts
import { Brand } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| mark | `ReactNode` | 取 `name` 首字 | 徽章内容：图标 / 图片 / 动图 / 视频 / 首字 |
| name | `ReactNode` | - | 品牌名；省略则只出徽章（侧栏收起态） |
| description | `ReactNode` | - | 品牌名下方一行副标题（版本号 / 一句话定位） |
| size | `"sm" \| "md" \| "lg"` | `"md"` | sm 导航栏 28px / md 侧栏 36px / lg 登录页品牌区 |
| color | `string` | `"primary"` | 徽章底色：语义色名（`chart-3` 等）或任意 CSS 色 |
| href | `string` | - | 普通链接（链回首页） |
| render | `ReactElement` | - | 渲染成框架路由件（`<Link to="/" />`），避免 SPA 整页刷新；与 Button/Link/NavMenuItem 的 `render` 约定一致 |
| className | `string` | - | 透传类名；其余原生属性一并透传 |

## 示例
```tsx
// 导航栏
<Brand size="sm" mark={<Logo />} name="瑚琏后台" render={<Link to="/" />} />

// 侧栏（收起时只留徽章）
<Brand mark={<Logo />} name={collapsed ? undefined : "瑚琏后台"} />

// 登录页
<Brand size="lg" name="瑚琏后台" description="v0.18.0" />

// 动图品牌（GIF / APNG / 动图 WebP）：直接当 img 传就会动；
// 包一层 <picture> 给开了「减弱动效」的用户一张静态回退
<Brand
  name="瑚琏后台"
  mark={
    <picture>
      <source srcSet="/brand-static.png" media="(prefers-reduced-motion: reduce)" />
      <img src="/brand-motion.gif" alt="" />
    </picture>
  }
/>

// 视频品牌：静音自动循环 + poster。<video> 没有原生的减弱动效回退，
// 用库导出的 usePrefersReducedMotion 决定要不要自动播（不播时停在 poster 上）
const reduced = usePrefersReducedMotion();
<Brand
  name="瑚琏后台"
  mark={<video src="/brand.webm" poster="/brand-static.png" autoPlay={!reduced} muted loop playsInline />}
/>
```

## 禁忌 / 坑

- **有 `name` 时徽章是装饰**（`aria-hidden`），无障碍名由品牌名承载；只出徽章（收起态）时它自己就是内容，记得给 `mark` 一个有意义的节点或给根节点 `aria-label`。
- 徽章底色固定配 `--color-primary-foreground` 作前景（亮色白 / 暗色近黑）。给中等明度的自定义色时自行核对对比度。
- 品牌图片 / 动图 / 视频走 `mark={<img … />}`、`<picture>`、`<video>`、`<canvas>`，组件已给「铺满徽章 + `object-cover`」，不要再在外面套尺寸类；Lottie 之类渲染成 `<div>` 的自绘动画不在这份规则里，给容器 `className="size-full"`。
- **动图要给减弱动效回退**：图片格式包 `<picture>` + `<source media="(prefers-reduced-motion: reduce)">`（浏览器原生切换，零 JS；实测 Chrome 在页面加载时选源，运行中切系统偏好不一定重选，刷新后才对）；`<video>` 只能靠 `usePrefersReducedMotion` 切 `autoPlay`，别指望 CSS 能让它停。
- 徽章是方的，非方形素材会被 `object-cover` 裁成方形——动图 logo 请出一版方形素材。GIF 的 1-bit 透明会让边缘露出徽章底色（`color`），有透明边的动图优先用 APNG / 动图 WebP，或干脆导出不透明版。

## 相关
[Avatar](../avatar/avatar.md) · [Navbar](../navbar/navbar.md) · [NavMenu](../nav-menu/nav-menu.md) · [AdminLayout](../admin-layout/admin-layout.md) · [BeianFooter](../beian-footer/beian-footer.md) · [LoginForm](../login-form/login-form.md)
