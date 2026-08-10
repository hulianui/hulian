"use client";
import { copy } from "./mobile-store.content";
import { useCallback, useRef, useState } from "react";
import {
  ActionSheet,
  ActionSheetContent,
  ActionSheetTrigger,
  Fab,
  Picker,
  PullToRefresh,
  SafeArea,
  Skeleton,
  SwipeAction,
  TabBar,
  Tag,
  toast,
} from "@hulianui/ui";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
  Search,
  MessageCircle,
  ChevronUp,
  Heart,
  Package,
  Star,
} from "lucide-react";
import type { TabBarItem } from "@hulianui/ui";
import { products, productImage, formatPrice } from "../_data/products";
import { categories } from "../_data/categories";
import { useShop } from "../_lib/shop-store";
import { sleep } from "../../lib/async";

// 限时秒杀商品
const flashProducts = products.filter((p) => p.flashSale);
// 首页展示商品（前8件）
const homeProducts = products.slice(0, 8);

// 分类品类选项（供 ActionSheet 筛选）
const SORT_OPTIONS = [
  { key: "default", label: copy("recommended") },
  { key: "price-asc", label: copy("priceLowToHigh") },
  { key: "price-desc", label: copy("priceHighToLow") },
  { key: "sales", label: copy("bestSelling") },
  { key: "rating", label: copy("topRated") },
];

// 规格/地区 Picker 列
const sizeColumn = {
  options: [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
  ],
};
const colorColumn = {
  options: [
    { value: "black", label: copy("obsidianBlack") },
    { value: "white", label: copy("micaWhite") },
    { value: "blue", label: copy("hazeBlue") },
    { value: "green", label: copy("vintageGreen") },
  ],
};

// ─── 首页 Tab ───────────────────────────────────────────────────────────────

function HomeTab() {
  const { addToCart } = useShop();
  const [displayProducts, setDisplayProducts] = useState(homeProducts);

  const handleRefresh = async () => {
    await sleep(800);
    // 随机打乱顺序模拟刷新
    setDisplayProducts([...products].sort(() => Math.random() - 0.5).slice(0, 8));
    toast({ title: copy("updated"), tone: "info" });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full overflow-auto">
      <div className="pb-2">
        {/* 限时秒杀横条 */}
        <div className="mx-3 mt-3 overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-white">{copy("flashSale")}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">

              {copy("flashSaleTimeRemaining")}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {flashProducts.slice(0, 3).map((p) => (
              <button
                key={p.id}
                className="flex-shrink-0 w-20 rounded-lg bg-white/15 p-1.5 text-left"
                onClick={() => {
                  addToCart({
                    productId: p.id,
                    color: p.colors[0]?.name ?? "",
                    size: p.sizes[0] ?? "",
                    qty: 1,
                    price: p.price,
                  });
                  toast({ title: copy("addedToCart"), tone: "info" });
                }}
              >
                <img
                  src={productImage(p, 0, 80, 80)}
                  alt={p.name}
                  className="mb-1 h-16 w-full rounded object-cover"
                />
                <p className="text-xs font-bold text-white">
                  {formatPrice(p.price)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 分类导航 */}
        <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.key}
              className="flex flex-col items-center gap-1 rounded-lg bg-surface p-2"
              style={{ "--cat-hue": cat.hue } as React.CSSProperties}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm"
                style={{ background: `hsl(${cat.hue} 70% 92%)`, color: `hsl(${cat.hue} 70% 35%)` }}
              >
                {cat.name[0]}
              </span>
              <span className="text-[10px] text-muted-foreground">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 猜你喜欢 */}
        <div className="mx-3 mt-4">
          <p className="mb-2 text-xs font-semibold text-foreground">{copy("recommendedForYou")}</p>
          <div className="grid grid-cols-2 gap-2">
            {displayProducts.map((p) => (
              <button
                key={p.id}
                className="overflow-hidden rounded-xl bg-surface text-left shadow-sm"
                onClick={() => {
                  addToCart({
                    productId: p.id,
                    color: p.colors[0]?.name ?? "",
                    size: p.sizes[0] ?? "",
                    qty: 1,
                    price: p.price,
                  });
                  toast({ title: copy("productAddedToCart", p.name), tone: "info" });
                }}
              >
                <img
                  src={productImage(p, 0, 200, 200)}
                  alt={p.name}
                  className="h-28 w-full object-cover"
                />
                <div className="p-2">
                  <p className="line-clamp-1 text-xs text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-xs font-bold text-primary">
                    {formatPrice(p.price)}
                  </p>
                  {p.flashSale && (
                    <Tag tone="danger" size="sm" className="mt-1">

                      {copy("flashSaleBadge")}
                    </Tag>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

// ─── 分类 Tab ────────────────────────────────────────────────────────────────

function CategoryTab() {
  const [pickerValue, setPickerValue] = useState(["m", "black"]);
  const [selectedSort, setSelectedSort] = useState(copy("recommended"));
  const [showPicker, setShowPicker] = useState(false);
  const { addToCart } = useShop();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 筛选工具栏 */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <ActionSheet>
          <ActionSheetTrigger className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground">
            {selectedSort}
          </ActionSheetTrigger>
          <ActionSheetContent
            title={copy("chooseASortOrder")}
            actions={SORT_OPTIONS.map((o) => ({
              key: o.key,
              label: o.label,
              onClick: () => {
                setSelectedSort(o.label);
                toast({ title: `${copy("sortedBy")}${o.label}`, tone: "info" });
              },
            }))}
          />
        </ActionSheet>
        <button
          className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
          onClick={() => setShowPicker((v) => !v)}
        >

          {copy("chooseOptions")}
        </button>
      </div>

      {/* Picker：选规格 */}
      {showPicker && (
        <div className="border-b border-border bg-surface-hover px-3 py-2">
          <p className="mb-1 text-[10px] text-muted-foreground">{copy("chooseSizeColor")}</p>
          <Picker
            columns={[sizeColumn, colorColumn]}
            value={pickerValue}
            onChange={(v) => setPickerValue(v)}
            visibleCount={3}
            itemHeight={36}
          />
          <p className="mt-1 text-center text-[10px] text-muted-foreground">

            {copy("selected")}{pickerValue[0].toUpperCase()} · {colorColumn.options.find((o) => o.value === pickerValue[1])?.label}
          </p>
        </div>
      )}

      {/* 商品列表（左侧分类 + 右侧商品）*/}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧分类栏 */}
        <div className="flex w-16 flex-col overflow-y-auto border-r border-border bg-surface-hover">
          {categories.map((cat, i) => (
            <button
              key={cat.key}
              className={`flex-shrink-0 py-3 text-center text-[10px] ${i === 0 ? "border-l-2 border-primary font-semibold text-primary" : "text-muted-foreground"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 右侧商品 */}
        <div className="flex-1 overflow-y-auto">
          {products.map((p) => (
            <SwipeAction
              key={p.id}
              right={[
                {
                  key: "add",
                  label: copy("add"),
                  tone: "primary",
                  onClick: () => {
                    addToCart({
                      productId: p.id,
                      color: p.colors[0]?.name ?? "",
                      size: p.sizes[0] ?? "",
                      qty: 1,
                      price: p.price,
                    });
                    toast({ title: copy("addedToCart"), tone: "info" });
                  },
                },
              ]}
            >
              <div className="flex items-center gap-2 border-b border-border bg-surface p-2">
                <img
                  src={productImage(p, 0, 80, 80)}
                  alt={p.name}
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{p.brand}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs font-bold text-primary">
                      {formatPrice(p.price)}
                    </span>
                    <span className="text-[9px] text-muted-foreground line-through">
                      {formatPrice(p.originalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </SwipeAction>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 购物车 Tab ──────────────────────────────────────────────────────────────

function CartTab() {
  const { cart, cartTotal, removeFromCart, updateQty } = useShop();

  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <ShoppingCart className="size-10 opacity-30" />
        <p className="text-sm">{copy("yourCartIsEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {cart.map((item) => (
          <SwipeAction
            key={`${item.productId}-${item.color}-${item.size}`}
            right={[
              {
                key: "delete",
                label: copy("delete"),
                tone: "danger",
                onClick: () => {
                  removeFromCart(item.productId, item.color, item.size);
                  toast({ title: copy("removed"), tone: "info" });
                },
              },
            ]}
          >
            <div className="flex items-center gap-2 border-b border-border bg-surface p-3">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-hover">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-medium text-foreground">
                  {item.productId}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {item.color} · {item.size}
                </p>
                <p className="mt-1 text-xs font-bold text-primary">
                  {formatPrice(item.price)}
                </p>
              </div>
              {/* 数量加减 */}
              <div className="flex items-center gap-1">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-foreground"
                  onClick={() =>
                    updateQty(item.productId, item.color, item.size, item.qty - 1)
                  }
                >
                  -
                </button>
                <span className="w-5 text-center text-xs">{item.qty}</span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-foreground"
                  onClick={() =>
                    updateQty(item.productId, item.color, item.size, item.qty + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
          </SwipeAction>
        ))}
      </div>

      {/* 合计 + 结算 */}
      <SafeArea edges={["bottom"]} mode="padding" min={4}>
        <div className="flex items-center justify-between border-t border-border bg-surface px-3 py-2">
          <div>
            <span className="text-xs text-muted-foreground">{copy("total")}</span>
            <span className="text-sm font-bold text-danger">
              {formatPrice(cartTotal)}
            </span>
          </div>
          <button
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            onClick={() => toast({ title: copy("openingCheckoutDemo"), tone: "info" })}
          >

            {copy("checkout")}{cart.reduce((s, c) => s + c.qty, 0)})
          </button>
        </div>
      </SafeArea>
    </div>
  );
}

// ─── 我的 Tab ────────────────────────────────────────────────────────────────

function MeTab() {
  const { favorites } = useShop();

  const ORDER_ENTRIES = [
    { label: copy("awaitingPayment"), icon: <Package className="size-5" /> },
    { label: copy("preparingShipment"), icon: <Package className="size-5" /> },
    { label: copy("inTransit"), icon: <Package className="size-5" /> },
    { label: copy("completed"), icon: <Star className="size-5" /> },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* 用户信息 */}
      <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">

            {copy("h")}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{copy("hanshopCustomer")}</p>
            <p className="text-xs text-muted-foreground">{copy("vipMember3280Points")}</p>
          </div>
        </div>
      </div>

      {/* 我的订单 */}
      <div className="mx-3 mt-3 rounded-xl bg-surface p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{copy("myOrders")}</span>
          <button
            className="text-[10px] text-muted-foreground"
            onClick={() => toast({ title: copy("viewAllOrdersDemo"), tone: "info" })}
          >

            {copy("allGt")}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ORDER_ENTRIES.map((e) => (
            <button
              key={e.label}
              className="flex flex-col items-center gap-1"
              onClick={() => toast({ title: `${e.label}${copy("demo")}`, tone: "info" })}
            >
              <span className="text-muted-foreground">{e.icon}</span>
              <span className="text-[10px] text-muted-foreground">{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 我的收藏 */}
      <div className="mx-3 mt-3 rounded-xl bg-surface p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">

            {copy("myFavorites")}
            <span className="ml-1 text-[10px] text-muted-foreground">({favorites.length})</span>
          </span>
          <Heart className="size-4 text-rose-400" />
        </div>
        {favorites.length === 0 ? (
          <p className="text-center text-[10px] text-muted-foreground">{copy("noFavoritesYet")}</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto">
            {favorites.slice(0, 4).map((id) => {
              const p = products.find((x) => x.id === id);
              if (!p) return null;
              return (
                <div key={id} className="flex-shrink-0 w-16">
                  <img
                    src={productImage(p, 0, 80, 80)}
                    alt={p.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <p className="mt-1 line-clamp-1 text-[9px] text-muted-foreground">
                    {formatPrice(p.price)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 更多入口 */}
      <div className="mx-3 mt-3 rounded-xl bg-surface shadow-sm">
        {[
          { label: copy("addressBook"), sub: copy("manageShippingAddresses") },
          { label: copy("coupons"), sub: copy("viewMyCoupons") },
          { label: copy("feedback"), sub: copy("shareYourSuggestions") },
          { label: copy("aboutHanshop"), sub: copy("version100") },
        ].map((item, i, arr) => (
          <button
            key={item.label}
            className={`flex w-full items-center justify-between px-3 py-3 text-left ${i < arr.length - 1 ? "border-b border-border" : ""}`}
            onClick={() => toast({ title: `${item.label}${copy("demo")}`, tone: "info" })}
          >
            <div>
              <p className="text-xs text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
            </div>
            <span className="text-muted-foreground text-xs">&gt;</span>
          </button>
        ))}
      </div>

      <div className="h-4" />
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

const TAB_ITEMS: TabBarItem[] = [
  { key: "home", label: copy("home"), icon: <Home className="size-4" aria-hidden /> },
  {
    key: "category",
    label: copy("categories"),
    icon: <LayoutGrid className="size-4" aria-hidden />,
  },
  {
    key: "cart",
    label: copy("cart"),
    icon: <ShoppingCart className="size-4" aria-hidden />,
  },
  { key: "me", label: copy("profile"), icon: <User className="size-4" aria-hidden /> },
];

export function MobileStore() {
  const [tab, setTab] = useState("home");
  const { cartCount } = useShop();
  const screenRef = useRef<HTMLDivElement>(null);

  // 把 cartCount 注入 TabBar items
  const tabItems: TabBarItem[] = TAB_ITEMS.map((item) =>
    item.key === "cart" ? { ...item, badge: cartCount > 0 ? cartCount : undefined } : item,
  );

  const handleScrollTop = useCallback(() => {
    screenRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    toast({ title: copy("backAtTheTop"), tone: "info" });
  }, []);

  return (
    // 屏幕容器：relative 是让 Fab 用 absolute 定位约束在这里面
    <div
      ref={screenRef}
      className="relative flex h-full flex-col overflow-hidden bg-bg"
    >
      {/* 顶部安全区 + 标题栏 */}
      <SafeArea edges={["top"]} mode="padding" min={0}>
        <div className="flex items-center justify-between border-b border-border bg-surface/90 px-3 py-2 backdrop-blur-sm">
          <span className="text-sm font-bold text-foreground">{copy("hanshop")}</span>
          <button
            className="rounded-full bg-surface-hover p-1.5"
            onClick={() => toast({ title: copy("searchDemo"), tone: "info" })}
            aria-label={copy("search")}
          >
            <Search className="size-4 text-muted-foreground" />
          </button>
        </div>
      </SafeArea>

      {/* 主内容区（flex-1 撑满，各 tab 内部自行管理滚动）*/}
      <div className="relative flex-1 overflow-hidden">
        <div className={tab === "home" ? "h-full" : "hidden"}>
          <HomeTab />
        </div>
        <div className={tab === "category" ? "h-full" : "hidden"}>
          <CategoryTab />
        </div>
        <div className={tab === "cart" ? "h-full" : "hidden"}>
          <CartTab />
        </div>
        <div className={tab === "me" ? "h-full" : "hidden"}>
          <MeTab />
        </div>
      </div>

      {/* Fab：速拨客服 — absolute 定位在屏幕容器右下角，不跑出 iPhone 外壳 */}
      <div className="pointer-events-none absolute inset-0">
        <Fab
          className="pointer-events-auto absolute bottom-14 right-3"
          aria-label={copy("support")}
          icon={<MessageCircle className="size-5" aria-hidden />}
          actions={[
            {
              key: "service",
              icon: <MessageCircle className="size-5" aria-hidden />,
              label: copy("liveSupport"),
              onClick: () => toast({ title: copy("connectingToSupportDemo"), tone: "info" }),
            },
            {
              key: "top",
              icon: <ChevronUp className="size-5" aria-hidden />,
              label: copy("backToTop"),
              onClick: handleScrollTop,
            },
          ]}
        />
      </div>

      {/* TabBar：fixed={false} + safeArea={false} 随文档流贴屏底，不贴视口 */}
      <TabBar
        items={tabItems}
        value={tab}
        onChange={setTab}
        fixed={false}
        safeArea={false}
      />
    </div>
  );
}
