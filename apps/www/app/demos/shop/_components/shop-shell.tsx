"use client";
import { Suspense, useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  Badge,
  Button,
  Stack,
  Divider,
  Text,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  AnimatedThemeToggler,
  BackTop,
  Command,
  type CommandGroupData,
} from "@hulianui/ui";
import { ShoppingCart, Heart, User, Search, Menu, Store } from "lucide-react";
import { categories } from "../_data/categories";
import { products, formatPrice } from "../_data/products";
import { brand, primaryNav, SHOP_BASE } from "./nav-config";
import { ShopStoreProvider, useShop } from "../_lib/shop-store";

function Logo() {
  return (
    <Link href={SHOP_BASE} className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground">
        <Store className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {brand.name}
        <span className="text-muted"> {brand.nameEn}</span>
      </span>
    </Link>
  );
}

// ⌘K 搜索：商品 + 分类。
const COMMAND_GROUPS: CommandGroupData[] = [
  {
    heading: "热门商品",
    items: products.slice(0, 8).map((p) => ({
      value: `p:${p.id}`,
      label: p.name,
      description: `${p.brand} · ${formatPrice(p.price)}`,
      keywords: `${p.name} ${p.brand} ${p.tags.join(" ")}`,
    })),
  },
  {
    heading: "商品分类",
    items: categories.map((c) => ({
      value: `c:${c.key}`,
      label: c.name,
      keywords: `${c.name} ${c.children.map((x) => x.name).join(" ")}`,
    })),
  },
];

function CategoryMenu() {
  return (
    <NavigationMenu delay={80}>
      <NavigationMenuList>
        <NavigationMenuItem value="all">
          <NavigationMenuTrigger>全部分类</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[34rem] grid-cols-2 gap-1 p-1">
              {categories.map((c) => (
                <NavigationMenuLink
                  key={c.key}
                  href={`${SHOP_BASE}/products?cat=${c.key}`}
                  className="block rounded-[var(--radius)] px-3 py-2"
                >
                  <div className="font-medium text-foreground">{c.name}</div>
                  <div className="mt-0.5 text-xs text-muted">{c.children.map((x) => x.name).join(" · ")}</div>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function HeaderActions() {
  const { cartCount, favorites } = useShop();
  return (
    <>
      <li className="flex items-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`${SHOP_BASE}/favorites`}
                aria-label="我的收藏"
                className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <Badge count={favorites.length} tone="danger" size="sm">
                  <Heart className="size-5" aria-hidden />
                </Badge>
              </Link>
            }
          />
          <TooltipContent>我的收藏</TooltipContent>
        </Tooltip>
      </li>
      <li className="flex items-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`${SHOP_BASE}/cart`}
                aria-label="购物车"
                className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <Badge count={cartCount} tone="danger" size="sm">
                  <ShoppingCart className="size-5" aria-hidden />
                </Badge>
              </Link>
            }
          />
          <TooltipContent>购物车</TooltipContent>
        </Tooltip>
      </li>
      <li className="hidden items-center md:flex">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`${SHOP_BASE}/account`}
                aria-label="会员中心"
                className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <User className="size-5" aria-hidden />
              </Link>
            }
          />
          <TooltipContent>会员中心</TooltipContent>
        </Tooltip>
      </li>
    </>
  );
}

// 主导航项：active 判定需读 query（限时秒杀 ?flash=1 与全部商品同路径，仅 query 不同）。
// usePathname 不含 query，故用 useSearchParams——output:export 下它必须包在 Suspense 内，否则构建 CSR bailout。
function PrimaryNavItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const flash = searchParams.get("flash") === "1";

  const isActive = (href: string) => {
    const [base, query] = href.split("?");
    if (base === SHOP_BASE) return pathname === SHOP_BASE;
    if (!pathname.startsWith(base)) return false;
    // 同路径（/products 的秒杀 vs 全部）按 flash query 区分，避免两项同时高亮
    if (base === `${SHOP_BASE}/products`) {
      return (new URLSearchParams(query).get("flash") === "1") === flash;
    }
    return true;
  };

  return (
    <>
      {primaryNav.map((link) => (
        <NavbarItem key={link.label} isActive={isActive(link.href)}>
          <Link href={link.href}>{link.label}</Link>
        </NavbarItem>
      ))}
    </>
  );
}

// Suspense fallback：渲染无 active 态的导航项，保证 SSR/静态导出 HTML 仍含完整导航结构。
function PrimaryNavFallback() {
  return (
    <>
      {primaryNav.map((link) => (
        <NavbarItem key={link.label}>
          <Link href={link.href}>{link.label}</Link>
        </NavbarItem>
      ))}
    </>
  );
}

function ShopNavbar() {
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const onSelect = useCallback((value: string) => {
    if (value.startsWith("p:")) window.location.href = `${SHOP_BASE}/product/${value.slice(2)}`;
    else if (value.startsWith("c:")) window.location.href = `${SHOP_BASE}/products?cat=${value.slice(2)}`;
  }, []);

  return (
    <>
      <Navbar sticky bordered className="z-30">
        <NavbarBrand>
          <Logo />
        </NavbarBrand>

        <NavbarContent justify="center" className="hidden md:flex">
          <li className="flex items-center">
            <CategoryMenu />
          </li>
          <Suspense fallback={<PrimaryNavFallback />}>
            <PrimaryNavItems />
          </Suspense>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-1">
          <li className="hidden items-center md:flex">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 text-sm text-muted transition-colors hover:text-foreground"
              aria-label="搜索商品（⌘K）"
            >
              <Search className="size-3.5" aria-hidden />
              <span className="text-xs">搜索商品</span>
              <span className="ml-1 rounded border border-border px-1 text-[10px] font-mono text-muted">⌘K</span>
            </button>
          </li>
          <li className="flex items-center">
            <AnimatedThemeToggler />
          </li>
          <HeaderActions />
          <li className="flex md:hidden">
            <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
          </li>
        </NavbarContent>
      </Navbar>

      <Command
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        groups={COMMAND_GROUPS}
        placeholder="搜索商品或分类…"
        shortcut
        onSelectItem={onSelect}
        emptyMessage="没有找到相关商品"
      />

      {open && (
        <div className="sticky top-16 z-20 border-b border-border bg-surface/95 backdrop-blur-md md:hidden">
          <Stack direction="column" gap={1} className="px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCmdOpen(true);
              }}
              className="flex items-center gap-2 rounded-[var(--radius)] px-2 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <Search className="size-4" aria-hidden /> 搜索商品
            </button>
            {primaryNav.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Divider className="my-1" />
            <Link
              href={`${SHOP_BASE}/account`}
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius)] px-2 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
            >
              会员中心
            </Link>
          </Stack>
        </div>
      )}
    </>
  );
}

function ShopFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Stack direction="row" justify="between" align="start" wrap gap={6}>
          <div className="max-w-xs">
            <Logo />
            <Text tone="muted" size="sm" className="mt-3">
              {brand.slogan} —— 本商城为 @hulianui/ui 演示，商品与价格均为虚构。
            </Text>
          </div>
          <Stack direction="row" gap={10} wrap>
            <FooterCol title="购物指南" links={["新手上路", "支付方式", "配送说明", "售后服务"]} />
            <FooterCol title="商家服务" links={["商家入驻", "营销中心", "运费规则", "开放平台"]} />
            <FooterCol title="关于瀚选" links={["关于我们", "加入我们", "联系客服", "隐私政策"]} />
          </Stack>
        </Stack>
        <Divider className="my-6" />
        <Stack direction="row" justify="between" wrap gap={3} className="text-sm text-muted">
          <Text size="sm" tone="muted">
            © 2026 {brand.name} {brand.nameEn} · 演示站点
          </Text>
          <Link href="/demos" className="hover:text-foreground">
            返回 Demo 画廊
          </Link>
        </Stack>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <Text weight="semibold" size="sm" className="mb-3 text-foreground">
        {title}
      </Text>
      <Stack direction="column" gap={2}>
        {links.map((l) => (
          <Link key={l} href={SHOP_BASE} className="text-sm text-muted transition-colors hover:text-foreground">
            {l}
          </Link>
        ))}
      </Stack>
    </div>
  );
}

/** 商城外壳：被 (shop) 路由组 layout 套在所有页上，内含共享购物车/收藏内存态。 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <ShopStoreProvider>
      <div className="flex min-h-dvh flex-col bg-bg">
        <ShopNavbar />
        <main className="flex-1">{children}</main>
        <ShopFooter />
        <BackTop visibilityHeight={500} />
      </div>
    </ShopStoreProvider>
  );
}
