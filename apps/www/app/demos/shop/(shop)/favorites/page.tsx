"use client";
import { copy } from "./page.content";
import { Button, Empty, Skeleton, toast } from "@hulianui/ui";
import { useMockData } from "../../../lib/async";
import { productById } from "../../_data/products";
import { useShop } from "../../_lib/shop-store";
import { ProductCard } from "../../_components/product-card";
import { SHOP_LOCATION_BASE } from "../../_components/nav-config";
import type { Product } from "../../_data/types";

function FavoriteSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <div key={k} className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-3">
          <Skeleton className="aspect-square w-full rounded-[var(--radius)]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, addToCart } = useShop();

  // 用 useMockData 包一层，模拟加载态（seed 是收藏 id 列表）
  const { loading } = useMockData(favorites);

  const favoriteProducts = favorites
    .map((id) => productById[id])
    .filter(Boolean) as Product[];

  const handleAddAllToCart = () => {
    const available = favoriteProducts.filter((p) => p.stock > 0);
    if (available.length === 0) {
      toast({ title: copy("allSavedItemsAreCurrentlySoldOut"), tone: "danger" });
      return;
    }
    available.forEach((p) => {
      addToCart({
        productId: p.id,
        color: p.colors[0]?.name ?? copy("default"),
        size: p.sizes[0] ?? copy("default"),
        qty: 1,
        price: p.price,
      });
    });
    toast({ title: `${copy("added")}${available.length}${copy("itemsToYourCart")}`, tone: "info" });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* 页头 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{copy("myFavorites")}</h1>
          {!loading && favoriteProducts.length > 0 && (
            <p className="mt-0.5 text-sm text-muted">{copy("total")} {favoriteProducts.length}  {copy("savedItems")}</p>
          )}
        </div>
        {!loading && favoriteProducts.length > 0 && (
          <Button tone="brand" variant="outline" size="sm" onClick={handleAddAllToCart}>

            {copy("addAllToCart")}
          </Button>
        )}
      </div>

      {loading ? (
        <FavoriteSkeleton />
      ) : favoriteProducts.length === 0 ? (
        <Empty
          title={copy("yourFavoritesAreEmpty")}
          description={copy("browseTheCatalogAndSaveTheProductsYouLove")}
        >
          <Button tone="brand" onClick={() => (window.location.href = `${SHOP_LOCATION_BASE}/products`)}>

            {copy("browseProducts")}
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {/* 卡片右上角爱心 icon 即可取消收藏，无需额外按钮 */}
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
