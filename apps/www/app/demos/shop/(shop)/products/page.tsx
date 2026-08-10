"use client";
import { copy } from "./page.content";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import {
  Alert,
  Breadcrumb,
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  Empty,
  InfiniteScroll,
  Pagination,
  Segmented,
  Skeleton,
  Slider,
  toast,
} from "@hulianui/ui";
import type { ComboboxItemData } from "@hulianui/ui";
import { products, formatPrice } from "../../_data/products";
import { categories } from "../../_data/categories";
import type { CategoryKey, Product } from "../../_data/types";
import { useMockData } from "../../../lib/async";
import { ProductCard } from "../../_components/product-card";
import { SHOP_BASE, SHOP_LOCATION_BASE } from "../../_components/nav-config";

const PAGE_SIZE = 8;

// 品牌列表（从商品数据中提取）
const allBrands = Array.from(new Set(products.map((p) => p.brand)));

// 排序选项
const SORT_ITEMS = [
  { value: "default", label: copy("recommended") },
  { value: "price-asc", label: copy("priceLowToHigh") },
  { value: "price-desc", label: copy("priceHighToLow") },
  { value: "sales", label: copy("sales") },
  { value: "rating", label: copy("rating") },
];

// 搜索候选项（商品名 + 品牌）
const searchCandidates: ComboboxItemData[] = [
  ...products.map((p) => ({ value: p.id, label: p.name })),
  ...allBrands.map((b) => ({ value: `brand:${b}`, label: b })),
];

function FilterSidebar({
  selectedCats: selectedCats,
  setSelectedCats,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
}: {
  selectedCats: string[];
  setSelectedCats: (v: string[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
}) {
  return (
    <aside className="w-52 shrink-0 space-y-6">
      {/* 品类 */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">{copy("category")}</p>
        <CheckboxGroup value={selectedCats} onValueChange={setSelectedCats}>
          {categories.map((c) => (
            <Checkbox key={c.key} value={c.key} label={c.name} />
          ))}
        </CheckboxGroup>
      </div>

      {/* 品牌 */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">{copy("brand")}</p>
        <CheckboxGroup value={selectedBrands} onValueChange={setSelectedBrands}>
          {allBrands.map((b) => (
            <Checkbox key={b} value={b} label={b} />
          ))}
        </CheckboxGroup>
      </div>

      {/* 价格区间 */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">

          {copy("priceRange")}
          <span className="ml-2 font-normal text-muted-foreground">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </span>
        </p>
        <Slider
          value={priceRange}
          onValueChange={(v) => {
            const arr = Array.isArray(v) ? v : [v, v];
            if (arr.length >= 2) {
              setPriceRange([arr[0] as number, arr[1] as number]);
            }
          }}
          min={0}
          max={6000}
          step={50}
          className="mt-2"
        />
      </div>
    </aside>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[var(--radius)] border border-border">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsInner() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get("cat") as CategoryKey | null;
  const isFlash = searchParams.get("flash") === "1";

  // 筛选状态
  const [selectedCats, setSelectedCats] = useState<string[]>(initCat ? [initCat] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 6000]);
  const [sort, setSort] = useState("default");
  const [flashOnly] = useState(isFlash);
  const [viewMode, setViewMode] = useState<"page" | "infinite">("page");
  const [page, setPage] = useState(1);
  const [infiniteCount, setInfiniteCount] = useState(PAGE_SIZE);
  const [searchValue, setSearchValue] = useState<ComboboxItemData | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // useMockData 驱动首屏 loading，failOnce 模拟失败
  const { data: allProducts, loading, error, reload } = useMockData(products, { failOnce: true });

  // 过滤逻辑
  const filtered = useMemo(() => {
    if (!allProducts) return [];
    let result = [...allProducts];

    // 限时秒杀
    if (flashOnly) result = result.filter((p) => p.flashSale);

    // 关键词搜索
    if (searchValue) {
      if (searchValue.value.startsWith("brand:")) {
        const brand = searchValue.value.replace("brand:", "");
        result = result.filter((p) => p.brand === brand);
      } else {
        result = result.filter((p) => p.id === searchValue.value);
      }
    }

    // 品类
    if (selectedCats.length > 0) {
      result = result.filter((p) => selectedCats.includes(p.category));
    }

    // 品牌
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // 价格区间
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // 排序
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "sales") result.sort((a, b) => b.sales - a.sales);
    else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [allProducts, flashOnly, searchValue, selectedCats, selectedBrands, priceRange, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedItems: Product[] = viewMode === "page"
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered.slice(0, infiniteCount);

  const hasMore = infiniteCount < filtered.length;

  const loadMore = useCallback(async () => {
    await new Promise<void>((r) => setTimeout(r, 500));
    setInfiniteCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  // 已选条件 chips
  const activeFilters: { key: string; label: string; onClose: () => void }[] = [
    ...selectedCats.map((k) => ({
      key: `cat-${k}`,
      label: categories.find((c) => c.key === k)?.name ?? k,
      onClose: () => setSelectedCats(selectedCats.filter((c) => c !== k)),
    })),
    ...selectedBrands.map((b) => ({
      key: `brand-${b}`,
      label: b,
      onClose: () => setSelectedBrands(selectedBrands.filter((x) => x !== b)),
    })),
    ...(priceRange[0] > 0 || priceRange[1] < 6000
      ? [
          {
            key: "price",
            label: `${formatPrice(priceRange[0])}-${formatPrice(priceRange[1])}`,
            onClose: () => setPriceRange([0, 6000]),
          },
        ]
      : []),
    ...(searchValue
      ? [
          {
            key: "search",
            label: `${copy("search")}${searchValue.label}`,
            onClose: () => setSearchValue(null),
          },
        ]
      : []),
  ];

  const resetAllFilters = () => {
    setSelectedCats([]);
    setSelectedBrands([]);
    setPriceRange([0, 6000]);
    setSearchValue(null);
    setPage(1);
    setInfiniteCount(PAGE_SIZE);
  };

  const breadcrumbItems = [
    { label: copy("home"), href: SHOP_LOCATION_BASE },
    { label: isFlash ? copy("flashSale") : copy("allProducts") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {isFlash ? copy("flashSale") : copy("allProducts")}
          {!loading && allProducts && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">{copy("total")} {filtered.length}  {copy("items")}</span>
          )}
        </h1>
        {/* 移动端筛选按钮 */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <SlidersHorizontal className="mr-1.5 size-4" />

          {copy("filters")}
        </Button>
      </div>

      {/* 加载失败 */}
      {error && (
        <Alert
          tone="danger"
          title={copy("unableToLoad")}
          action={
            <Button size="sm" variant="outline" onClick={reload}>
              <RefreshCw className="mr-1.5 size-4" />

              {copy("retry")}
            </Button>
          }
          className="mb-6"
        >
          {error}
        </Alert>
      )}

      <div className="flex gap-6">
        {/* 左侧筛选栏（桌面端） */}
        <div className={`${mobileFilterOpen ? "block" : "hidden"} lg:block`}>
          <FilterSidebar
            selectedCats={selectedCats}
            setSelectedCats={(v) => { setSelectedCats(v); setPage(1); setInfiniteCount(PAGE_SIZE); }}
            selectedBrands={selectedBrands}
            setSelectedBrands={(v) => { setSelectedBrands(v); setPage(1); setInfiniteCount(PAGE_SIZE); }}
            priceRange={priceRange}
            setPriceRange={(v) => { setPriceRange(v); setPage(1); setInfiniteCount(PAGE_SIZE); }}
          />
        </div>

        {/* 右侧主区 */}
        <div className="min-w-0 flex-1">
          {/* 顶部工具栏 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* 关键词搜索 Combobox */}
            <div className="w-56">
              {/* key 清空：resetAllFilters 触发 searchValue 变 null 时 key 变化，重新挂载完成清空 */}
              <Combobox
                key={searchValue?.value ?? "__empty__"}
                items={searchCandidates}
                defaultValue={searchValue ?? undefined}
                onValueChange={(v) => {
                  setSearchValue((v as ComboboxItemData) ?? null);
                  setPage(1);
                  setInfiniteCount(PAGE_SIZE);
                  if (v) toast({ title: `${copy("search")}${(v as ComboboxItemData).label}`, tone: "info" });
                }}
              >
                <ComboboxInput placeholder={copy("searchProductsOrBrands")} clearable />
                <ComboboxContent>
                  {(item) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxContent>
              </Combobox>
            </div>

            {/* 排序 */}
            <Segmented
              items={SORT_ITEMS}
              value={sort}
              onValueChange={(v) => { setSort(v); setPage(1); }}
              size="sm"
              aria-label={copy("sortOrder")}
            />

            {/* 视图切换 */}
            <div className="ml-auto flex items-center gap-1.5">
              <Segmented
                items={[
                  { value: "page", label: <LayoutGrid className="size-4" /> },
                  { value: "infinite", label: <List className="size-4" /> },
                ]}
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "page" | "infinite")}
                size="sm"
                aria-label={copy("viewMode")}
              />
              <span className="text-xs text-muted-foreground">{viewMode === "page" ? copy("pages") : copy("infiniteScroll")}</span>
            </div>
          </div>

          {/* 已选条件 */}
          {activeFilters.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{copy("selected")}</span>
              {activeFilters.map((f) => (
                <Chip
                  key={f.key}
                  size="sm"
                  variant="soft"
                  tone="brand"
                  onClose={f.onClose}
                >
                  {f.label}
                </Chip>
              ))}
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />

                {copy("clear")}
              </button>
            </div>
          )}

          {/* 内容区 */}
          {loading ? (
            <ProductGridSkeleton />
          ) : error ? (
            <Empty
              title={copy("unableToLoad")}
              description={copy("useTheRetryButtonAbove")}
              size="md"
            />
          ) : filtered.length === 0 ? (
            <Empty
              title={copy("noMatchingProducts")}
              description={copy("adjustYourFiltersOrTryAnotherSearch")}
              size="md"
            >
              <Button size="sm" onClick={resetAllFilters}>

                {copy("resetFilters")}
              </Button>
            </Empty>
          ) : viewMode === "page" ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {pagedItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    page={page}
                    total={totalPages}
                    onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  />
                </div>
              )}
            </>
          ) : (
            <InfiniteScroll
              onLoadMore={loadMore}
              hasMore={hasMore}
              loadingText={copy("loadingMoreProducts")}
              finishedText={`${copy("allProductsShown")}${filtered.length}${copy("products")}`}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {pagedItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>

      {/* 快速品类导航（桌面端右侧浮动） */}
      <div className="fixed bottom-24 right-6 hidden xl:block">
        <nav className="rounded-[var(--radius)] border border-border bg-surface p-3 shadow-md">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{copy("categoryNavigation")}</p>
          <div className="space-y-1">
            {categories.map((c) => (
              <a
                key={c.key}
                href={`${SHOP_LOCATION_BASE}/products?cat=${c.key}`}
                className="block rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {c.name}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

// output:export 下 useSearchParams 必须包在 Suspense 边界内，否则构建报 CSR bailout。
export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsInner />
    </Suspense>
  );
}
