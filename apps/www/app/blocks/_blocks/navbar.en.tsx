"use client";
import { useState } from "react";
import Link from "next/link";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, Drawer, DrawerContent, Button, } from "@hulianui/ui";
import { Cloud } from "lucide-react";
const products = [
    { title: "Elastic deployment", desc: "Deploy on git push and scale to zero when idle" },
    { title: "edge network", desc: "Serve users from more than 300 global edge nodes" },
    { title: "Observability", desc: "End-to-end logs, metrics, and traces" },
    { title: "Compute marketplace", desc: "GPU/CPU instances billed per second" },
];
const navItems = [
    { label: "Plan", href: "https://example.com/#solutions" },
    { label: "Pricing", href: "https://example.com/#pricing" },
    { label: "Documentation", href: "https://example.com/#docs" },
    { label: "Blog", href: "https://example.com/#blog" },
];
export function NavbarBlock() {
    const [open, setOpen] = useState(false);
    return (<Navbar sticky bordered>

      <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"}/>


      <NavbarBrand>
        <Link href="#" className="flex items-center gap-2 text-foreground">
          <span className="flex size-7 items-center justify-center rounded-[min(var(--radius),0.5rem)] bg-primary text-primary-foreground">
            <Cloud className="size-4" aria-hidden/>
          </span>
          <span className="text-base font-semibold">HanCloud</span>
        </Link>
      </NavbarBrand>


      <NavbarContent justify="center" className="hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[30rem] grid-cols-2 gap-1">
                  {products.map((p) => (<NavigationMenuLink key={p.title} href="#" className="block px-3 py-2">
                      <div className="font-medium text-foreground">{p.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{p.desc}</div>
                    </NavigationMenuLink>))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {navItems.map((it) => (<NavigationMenuItem key={it.label} value={it.label}>
                <NavigationMenuLink href={it.href}>{it.label}</NavigationMenuLink>
              </NavigationMenuItem>))}
          </NavigationMenuList>
        </NavigationMenu>
      </NavbarContent>


      <NavbarContent justify="end" className="hidden md:flex">
        <NavbarItem className="px-0">
          <Button variant="ghost" size="sm" render={<Link href="https://example.com/#login"/>}>
            Login
          </Button>
        </NavbarItem>
        <NavbarItem className="px-0">
          <Button size="sm" render={<Link href="https://example.com/#signup"/>}>
            Start for free
          </Button>
        </NavbarItem>
      </NavbarContent>


      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="left" title="HanCloud" description="Navigation menu">
          <nav className="flex flex-col gap-1">
            <Link href="#products" className="rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover" onClick={() => setOpen(false)}>
              Products
            </Link>
            {navItems.map((it) => (<Link key={it.label} href={it.href} className="rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover" onClick={() => setOpen(false)}>
                {it.label}
              </Link>))}
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" render={<Link href="https://example.com/#login"/>}>
                Login
              </Button>
              <Button render={<Link href="https://example.com/#signup"/>}>Start for free</Button>
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </Navbar>);
}
