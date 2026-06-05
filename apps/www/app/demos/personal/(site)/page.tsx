"use client";

import {
  Anchor,
  Dock,
  DockIcon,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type AnchorItem,
} from "@hulian/ui";
import { Home, User, Cpu, Package, Rocket, Mail, ArrowUp } from "lucide-react";
import { Hero } from "../_components/sections/hero";
import { About } from "../_components/sections/about";
import { Stack } from "../_components/sections/stack";
import { Work } from "../_components/sections/work";
import { Journey } from "../_components/sections/journey";
import { Contact } from "../_components/sections/contact";

// 右侧 scrollspy 目录（走 window 滚动，不传 getContainer）。
const anchorItems: AnchorItem[] = [
  { href: "#hero", title: "首页" },
  { href: "#about", title: "关于" },
  { href: "#stack", title: "技能" },
  { href: "#work", title: "作品" },
  { href: "#journey", title: "历程" },
  { href: "#contact", title: "联系" },
];

// 底部 Dock 的快捷锚点。
const dockLinks = [
  { href: "#hero", label: "首页", icon: Home },
  { href: "#about", label: "关于", icon: User },
  { href: "#stack", label: "技能", icon: Cpu },
  { href: "#work", label: "作品", icon: Package },
  { href: "#journey", label: "历程", icon: Rocket },
  { href: "#contact", label: "联系", icon: Mail },
];

export default function PersonalHomePage() {
  return (
    <>
      {/* 各 section 在 window 滚动，每个根 <section id> 供 Anchor scrollspy + Dock 跳转 */}
      <Hero />
      <About />
      <Stack />
      <Work />
      <Journey />
      <Contact />

      {/* 右侧 sticky 锚点导航（超宽屏才显，避免遮挡内容） */}
      <aside
        className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
        aria-label="章节导航"
      >
        <div className="rounded-[var(--radius)] border border-border/60 bg-surface/70 px-3 py-3 backdrop-blur-md">
          <Anchor items={anchorItems} offsetTop={80} className="w-28" />
        </div>
      </aside>

      {/* 底部悬浮 Dock 导航 */}
      <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <Dock className="border border-border/60 bg-surface/80 backdrop-blur-xl">
          {dockLinks.map((link) => {
            const Icon = link.icon;
            return (
              <DockIcon key={link.href}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        href={link.href}
                        aria-label={link.label}
                        className="flex size-full items-center justify-center text-muted transition-colors hover:text-foreground"
                      >
                        <Icon className="size-5" aria-hidden />
                      </a>
                    }
                  />
                  <TooltipContent>{link.label}</TooltipContent>
                </Tooltip>
              </DockIcon>
            );
          })}
          {/* 回到顶部 */}
          <DockIcon>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="#hero"
                    aria-label="回到顶部"
                    className="flex size-full items-center justify-center text-primary transition-colors hover:text-primary-hover"
                  >
                    <ArrowUp className="size-5" aria-hidden />
                  </a>
                }
              />
              <TooltipContent>回到顶部</TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </div>
    </>
  );
}
