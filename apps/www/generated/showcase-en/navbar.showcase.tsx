"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuToggle, } from "../../../../packages/ui/src/navbar/navbar";
function NavbarDemo({ justify = "end" }: {
    justify?: "start" | "center" | "end";
}) {
    const [open, setOpen] = useState(false);
    return (<div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
      <Navbar bordered={false}>
        <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)}/>
        <NavbarBrand>Hulian</NavbarBrand>
        <NavbarContent justify={justify} className="hidden sm:flex">
          <NavbarItem isActive>Components</NavbarItem>
          <NavbarItem>Documentation</NavbarItem>
          <NavbarItem>Theme</NavbarItem>
        </NavbarContent>
      </Navbar>
      <NavbarMenu isOpen={open}>
        <NavbarItem isActive>Components</NavbarItem>
        <NavbarItem>Documentation</NavbarItem>
        <NavbarItem>Theme</NavbarItem>
      </NavbarMenu>
    </div>);
}
export const navbarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "NavbarBrand places the brand, NavbarContent arranges the navigation items, and isActive highlights the current page.",
            code: `<Navbar bordered>
  <NavbarBrand>Hulian</NavbarBrand>
  <NavbarContent justify="end">
    <NavbarItem isActive>Component</NavbarItem>
    <NavbarItem>Documentation</NavbarItem>
    <NavbarItem>Theme</NavbarItem>
  </NavbarContent>
</Navbar>`,
            render: () => (<div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Navbar bordered={false}>
            <NavbarBrand>Hulian</NavbarBrand>
            <NavbarContent justify="end">
              <NavbarItem isActive>Components</NavbarItem>
              <NavbarItem>Documentation</NavbarItem>
              <NavbarItem>Theme</NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>),
        },
        {
            title: "Content centered",
            description: "justify of NavbarContent controls the navigation item alignment direction.",
            code: `<Navbar bordered>
  <NavbarBrand>Hulian</NavbarBrand>
  <NavbarContent justify="center">
    <NavbarItem isActive>Component</NavbarItem>
    <NavbarItem>Documentation</NavbarItem>
    <NavbarItem>Theme</NavbarItem>
  </NavbarContent>
</Navbar>`,
            render: () => (<div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Navbar bordered={false}>
            <NavbarBrand>Hulian</NavbarBrand>
            <NavbarContent justify="center">
              <NavbarItem isActive>Components</NavbarItem>
              <NavbarItem>Documentation</NavbarItem>
              <NavbarItem>Theme</NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>),
        },
        {
            title: "Responsive menu",
            description: "NavbarMenuToggle controlled expansion and folding menu for narrow screen (view with narrowed window).",
            code: `function App() {
  const [open, setOpen] = useState(false);
  return (
    <Navbar bordered>
      <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
      <NavbarBrand>Hulian</NavbarBrand>
      <NavbarContent justify="end" className="hidden sm:flex">
        <NavbarItem isActive>Component</NavbarItem>
        <NavbarItem>Documentation</NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}`,
            render: () => <NavbarDemo justify="end"/>,
        },
        {
            title: "Compact navbar with soft pill items",
            description: "size=\"sm\" shrinks the bar to 56px and variant=\"page\" blends it into the page background; NavbarItem variant=\"soft\" gives the active item the accent's subtle background, and the link inside is clickable across the whole pill.",
            code: `<Navbar size="sm" variant="page">
  <NavbarBrand grow={false}>Hulian</NavbarBrand>
  <NavbarContent>
    <NavbarItem variant="soft" isActive><a href="#">Components</a></NavbarItem>
    <NavbarItem variant="soft"><a href="#">Blocks</a></NavbarItem>
    <NavbarItem variant="soft"><a href="#">Pages</a></NavbarItem>
  </NavbarContent>
</Navbar>`,
            render: () => (<div className="w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Navbar size="sm" variant="page" bordered={false}>
            <NavbarBrand grow={false}>Hulian</NavbarBrand>
            <NavbarContent>
              <NavbarItem variant="soft" isActive>
                <a href="#">Components</a>
              </NavbarItem>
              <NavbarItem variant="soft">
                <a href="#">Blocks</a>
              </NavbarItem>
              <NavbarItem variant="soft">
                <a href="#">Pages</a>
              </NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>),
        },
    ],
    controls: [
        { prop: "justify", type: "select", options: ["start", "center", "end"], defaultValue: "end" },
    ],
    states: [
        { name: "end", render: () => <NavbarDemo justify="end"/> },
        { name: "center", render: () => <NavbarDemo justify="center"/> },
    ],
    renderWithProps: (p) => <NavbarDemo justify={(p.justify as "start" | "center" | "end") ?? "end"}/>,
    toCode: (p) => `<Navbar sticky bordered>
  <NavbarMenuToggle isOpen={open} onToggle={toggle} />
  <NavbarBrand>Hulian</NavbarBrand>
  <NavbarContent justify="${(p.justify as string) ?? "end"}">
    <NavbarItem isActive>Component</NavbarItem>
    <NavbarItem>Documentation</NavbarItem>
  </NavbarContent>
</Navbar>`,
};
