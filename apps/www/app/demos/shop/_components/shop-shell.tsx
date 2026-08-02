"use client";
import { copy } from "./shop-shell.content";
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
    heading: copy("popularProducts"),
    items: products.slice(0, 8).map((p) => ({
      value: `p:${p.id}`,
      label: p.name,
      description: `${p.brand} · ${formatPrice(p.price)}`,
      keywords: `${p.name} ${p.brand} ${p.tags.join(" ")}`,
    })),
  },
  {
    heading: copy("productCategories"),
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
          <NavigationMenuTrigger>{copy("allCategories")}</NavigationMenuTrigger>
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
                aria-label={copy("myFavorites")}
                className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <Badge count={favorites.length} tone="danger" size="sm">
                  <Heart className="size-5" aria-hidden />
                </Badge>
              </Link>
            }
          />
          <TooltipContent>{copy("myFavorites")}</TooltipContent>
        </Tooltip>
      </li>
      <li className="flex items-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`${SHOP_BASE}/cart`}
                aria-label={copy("cart")}
                className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <Badge count={cartCount} tone="danger" size="sm">
                  <ShoppingCart className="size-5" aria-hidden />
                </Badge>
              </Link>
            }
          />
          <TooltipContent>{copy("cart")}</TooltipContent>
        </Tooltip>
      </li>
      <li className="hidden items-center md:flex">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`${SHOP_BASE}/account`}
                aria-label={copy("account")}
                className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <User className="size-5" aria-hidden />
              </Link>
            }
          />
          <TooltipContent>{copy("account")}</TooltipContent>
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
              aria-label={copy("searchProductsK")}
            >
              <Search className="size-3.5" aria-hidden />
              <span className="text-xs">{copy("searchProducts")}</span>
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
        placeholder={copy("searchProductsOrCategories")}
        shortcut
        onSelectItem={onSelect}
        emptyMessage={copy("noMatchingProductsFound")}
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
              <Search className="size-4" aria-hidden />  {copy("searchProducts")}
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

              {copy("account")}
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
              {brand.slogan}  {copy("thisStorefrontIsADemoProductsAndPricesAreFictional")}
            </Text>
          </div>
          <Stack direction="row" gap={10} wrap>
            <FooterCol title={copy("shoppingGuide")} links={[copy("gettingStarted"), copy("paymentMethods"), copy("deliveryInformation"), copy("returnsSupport")]} />
            <FooterCol title={copy("sellerServices")} links={[copy("sellOnHanshop"), copy("marketingCenter"), copy("shippingRates"), copy("developerPlatform")]} />
            <FooterCol title={copy("aboutHanshop")} links={[copy("aboutUs"), copy("careers"), copy("contactSupport"), copy("privacyPolicy")]} />
          </Stack>
        </Stack>
        <Divider className="my-6" />
        <Stack direction="row" justify="between" wrap gap={3} className="text-sm text-muted">
          <Text size="sm" tone="muted">
            © 2026 {brand.name} {brand.nameEn}  {copy("demoSite")}
          </Text>
          <Link href="/demos" className="hover:text-foreground">

            {copy("backToDemoGallery")}
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
