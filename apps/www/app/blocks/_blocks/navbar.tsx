/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  Drawer,
  DrawerContent,
  Button,
} from "@hulianui/ui";
import { Cloud } from "lucide-react";

// 营销站顶部导航栏区块 —— 自包含、可整段复制。
// 粘性 + 毛玻璃（Navbar sticky 自带 bg-surface/80 + backdrop-blur）。
// 桌面：NavigationMenu（「产品」mega 下拉 + 方案/定价/文档/博客 纯链接）。
// 移动端：汉堡 NavbarMenuToggle → 受控 Drawer 抽屉菜单。
// 复制后改：products 子项、主菜单 navItems、CTA href。

const products = [
  { title: "弹性部署", desc: "git push 即上线，闲时归零" },
  { title: "边缘网络", desc: "全球 300+ 节点就近分发" },
  { title: "可观测", desc: "端到端日志、指标与追踪" },
  { title: "算力市场", desc: "按秒计费的 GPU / CPU 实例" },
];

const navItems = [
  { label: "方案", href: "#solutions" },
  { label: "定价", href: "#pricing" },
  { label: "文档", href: "#docs" },
  { label: "博客", href: "#blog" },
];

export function NavbarBlock() {
  const [open, setOpen] = useState(false);

  return (
    <Navbar sticky bordered>
      {/* 移动端汉堡 */}
      <NavbarMenuToggle
        isOpen={open}
        onToggle={() => setOpen((v) => !v)}
        aria-label={open ? "关闭菜单" : "打开菜单"}
      />

      {/* 左：Logo */}
      <NavbarBrand>
        <Link href="#" className="flex items-center gap-2 text-foreground">
          <span className="flex size-7 items-center justify-center rounded-[min(var(--radius),0.5rem)] bg-primary text-primary-foreground">
            <Cloud className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold">瀚云</span>
        </Link>
      </NavbarBrand>

      {/* 中：桌面主菜单（含「产品」下拉分组） */}
      <NavbarContent justify="center" className="hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[30rem] grid-cols-2 gap-1">
                  {products.map((p) => (
                    <NavigationMenuLink key={p.title} href="#" className="block px-3 py-2">
                      <div className="font-medium text-foreground">{p.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{p.desc}</div>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {navItems.map((it) => (
              <NavigationMenuItem key={it.label} value={it.label}>
                <NavigationMenuLink href={it.href}>{it.label}</NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </NavbarContent>

      {/* 右：登录 + 免费开始 */}
      <NavbarContent justify="end" className="hidden md:flex">
        <NavbarItem className="px-0">
          <Button variant="ghost" size="sm" render={<Link href="#login" />}>
            登录
          </Button>
        </NavbarItem>
        <NavbarItem className="px-0">
          <Button size="sm" render={<Link href="#signup" />}>
            免费开始
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* 移动端抽屉菜单（受控） */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="left" title="瀚云" description="导航菜单">
          <nav className="flex flex-col gap-1">
            <Link
              href="#products"
              className="rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
              onClick={() => setOpen(false)}
            >
              产品
            </Link>
            {navItems.map((it) => (
              <Link
                key={it.label}
                href={it.href}
                className="rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" render={<Link href="#login" />}>
                登录
              </Button>
              <Button render={<Link href="#signup" />}>免费开始</Button>
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </Navbar>
  );
}
