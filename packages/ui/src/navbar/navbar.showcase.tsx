"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
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
      {open && (
        <ul className="flex flex-col gap-1 border-t border-border p-2 sm:hidden">
          <NavbarItem isActive>组件</NavbarItem>
          <NavbarItem>文档</NavbarItem>
          <NavbarItem>主题</NavbarItem>
        </ul>
      )}
    </div>
  );
}

export const navbarShowcase: ShowcaseSpec = {
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
