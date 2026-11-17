"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
} from "./navbar";

function NavbarDemo({ justify = "end" }: { justify?: "start" | "center" | "end" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
      <Navbar bordered={false}>
        <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
        <NavbarBrand>瑚琏</NavbarBrand>
        <NavbarContent justify={justify} className="hidden sm:flex">
          <NavbarItem isActive>组件</NavbarItem>
          <NavbarItem>文档</NavbarItem>
          <NavbarItem>主题</NavbarItem>
        </NavbarContent>
      </Navbar>
      <NavbarMenu isOpen={open}>
        <NavbarItem isActive>组件</NavbarItem>
        <NavbarItem>文档</NavbarItem>
        <NavbarItem>主题</NavbarItem>
      </NavbarMenu>
    </div>
  );
}

export const navbarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "NavbarBrand 放品牌，NavbarContent 排导航项，isActive 高亮当前页。",
      code: `<Navbar bordered>
  <NavbarBrand>瑚琏</NavbarBrand>
  <NavbarContent justify="end">
    <NavbarItem isActive>组件</NavbarItem>
    <NavbarItem>文档</NavbarItem>
    <NavbarItem>主题</NavbarItem>
  </NavbarContent>
</Navbar>`,
      render: () => (
        <div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Navbar bordered={false}>
            <NavbarBrand>瑚琏</NavbarBrand>
            <NavbarContent justify="end">
              <NavbarItem isActive>组件</NavbarItem>
              <NavbarItem>文档</NavbarItem>
              <NavbarItem>主题</NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>
      ),
    },
    {
      title: "内容居中",
      description: "NavbarContent 的 justify 控制导航项对齐方向。",
      code: `<Navbar bordered>
  <NavbarBrand>瑚琏</NavbarBrand>
  <NavbarContent justify="center">
    <NavbarItem isActive>组件</NavbarItem>
    <NavbarItem>文档</NavbarItem>
    <NavbarItem>主题</NavbarItem>
  </NavbarContent>
</Navbar>`,
      render: () => (
        <div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Navbar bordered={false}>
            <NavbarBrand>瑚琏</NavbarBrand>
            <NavbarContent justify="center">
              <NavbarItem isActive>组件</NavbarItem>
              <NavbarItem>文档</NavbarItem>
              <NavbarItem>主题</NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>
      ),
    },
    {
      title: "响应式菜单",
      description: "窄屏用 NavbarMenuToggle 受控展开折叠菜单（缩小窗口查看）。",
      code: `function App() {
  const [open, setOpen] = useState(false);
  return (
    <Navbar bordered>
      <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
      <NavbarBrand>瑚琏</NavbarBrand>
      <NavbarContent justify="end" className="hidden sm:flex">
        <NavbarItem isActive>组件</NavbarItem>
        <NavbarItem>文档</NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}`,
      render: () => <NavbarDemo justify="end" />,
    },
    {
      title: "紧凑顶栏 · 浅底药丸导航",
      description:
        "size=\"sm\" 收成 56px，variant=\"page\" 用页面底色融进页面；NavbarItem variant=\"soft\" 选中项铺主色浅底，项里的链接整块可点。",
      code: `<Navbar size="sm" variant="page">
  <NavbarBrand grow={false}>瑚琏</NavbarBrand>
  <NavbarContent>
    <NavbarItem variant="soft" isActive><a href="#">组件</a></NavbarItem>
    <NavbarItem variant="soft"><a href="#">区块</a></NavbarItem>
    <NavbarItem variant="soft"><a href="#">页面</a></NavbarItem>
  </NavbarContent>
</Navbar>`,
      render: () => (
        <div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Navbar size="sm" variant="page" bordered={false}>
            <NavbarBrand grow={false}>瑚琏</NavbarBrand>
            <NavbarContent>
              <NavbarItem variant="soft" isActive>
                <a href="#">组件</a>
              </NavbarItem>
              <NavbarItem variant="soft">
                <a href="#">区块</a>
              </NavbarItem>
              <NavbarItem variant="soft">
                <a href="#">页面</a>
              </NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>
      ),
    },
  ],
  controls: [
    { prop: "justify", type: "select", options: ["start", "center", "end"], defaultValue: "end" },
  ],
  states: [
    { name: "end", render: () => <NavbarDemo justify="end" /> },
    { name: "center", render: () => <NavbarDemo justify="center" /> },
  ],
  renderWithProps: (p) => <NavbarDemo justify={(p.justify as "start" | "center" | "end") ?? "end"} />,
  toCode: (p) =>
    `<Navbar sticky bordered>\n  <NavbarMenuToggle isOpen={open} onToggle={toggle} />\n  <NavbarBrand>瑚琏</NavbarBrand>\n  <NavbarContent justify="${(p.justify as string) ?? "end"}">\n    <NavbarItem isActive>组件</NavbarItem>\n    <NavbarItem>文档</NavbarItem>\n  </NavbarContent>\n</Navbar>`,
};
