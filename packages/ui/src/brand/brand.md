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

> 品牌标识 · 方角徽章 + 站点名(+ 副标题) · mark 缺省自动取品牌名首字(中文一字/英文首字母) · 三档尺寸(sm 导航栏 28px / md 侧栏 36px / lg 登录页) + color 换徽章底色 · 省略 name 即收起态只出徽章 · href 普通链接 / render 接框架路由件回首页 · 区别 Avatar(圆的·套它得用 className 改形状=业务侧打补丁) · navigation/global

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
| mark | `ReactNode` | 取 `name` 首字 | 徽章内容：图标 / 图片 / 首字 |
| name | `ReactNode` | — | 品牌名；省略则只出徽章（侧栏收起态） |
| description | `ReactNode` | — | 品牌名下方一行副标题（版本号 / 一句话定位） |
| size | `"sm" \| "md" \| "lg"` | `"md"` | sm 导航栏 28px / md 侧栏 36px / lg 登录页品牌区 |
| color | `string` | `"primary"` | 徽章底色：语义色名（`chart-3` 等）或任意 CSS 色 |
| href | `string` | — | 普通链接（链回首页） |
| render | `ReactElement` | — | 渲染成框架路由件（`<Link to="/" />`），避免 SPA 整页刷新；与 Button/Link/NavMenuItem 的 `render` 约定一致 |
| className | `string` | — | 透传类名；其余原生属性一并透传 |

## 示例
```tsx
// 导航栏
<Brand size="sm" mark={<Logo />} name="瑚琏后台" render={<Link to="/" />} />

// 侧栏（收起时只留徽章）
<Brand mark={<Logo />} name={collapsed ? undefined : "瑚琏后台"} />

// 登录页
<Brand size="lg" name="瑚琏后台" description="v0.18.0" />
```

## 禁忌 / 坑

- **有 `name` 时徽章是装饰**（`aria-hidden`），无障碍名由品牌名承载；只出徽章（收起态）时它自己就是内容，记得给 `mark` 一个有意义的节点或给根节点 `aria-label`。
- 徽章底色固定配 `--color-primary-foreground` 作前景（亮色白 / 暗色近黑）。给中等明度的自定义色时自行核对对比度。
- 品牌图片走 `mark={<img … />}`，组件已给 `size-full object-cover`，不要再在外面套尺寸类。

## 相关
[Avatar](../avatar/avatar.md) · [Navbar](../navbar/navbar.md) · [NavMenu](../nav-menu/nav-menu.md) · [AdminLayout](../admin-layout/admin-layout.md) · [BeianFooter](../beian-footer/beian-footer.md) · [LoginForm](../login-form/login-form.md)
