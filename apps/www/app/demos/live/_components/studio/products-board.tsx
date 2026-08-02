"use client";
import { copy } from "./products-board.content";
import { useState } from "react";
import {
  Button,
  LiveProductCard,
  ProTable,
  Segmented,
  Sortable,
  Tag,
  toast,
  type ColumnDef,
} from "@hulianui/ui";
import { PRODUCTS } from "../../_data/content";
import type { LiveProduct } from "../../_data/types";

export function ProductsBoard() {
  const [products, setProducts] = useState<LiveProduct[]>(PRODUCTS);
  const [explainingId, setExplainingId] = useState<string>("p1");
  const [view, setView] = useState("sort");
  const [keyword, setKeyword] = useState("");

  const explaining = products.find((p) => p.id === explainingId) ?? products[0];
  const tableRows = keyword ? products.filter((p) => p.title.includes(keyword)) : products;

  const startExplain = (p: LiveProduct) => {
    setExplainingId(p.id);
    toast({ title: `${copy("nowPresenting")}${p.index}${copy("product")}${p.title.slice(0, 12)}${copy("text")}`, tone: "info" });
  };

  const columns: ColumnDef<LiveProduct>[] = [
    { accessorKey: "index", header: copy("link"), cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.index}  {copy("product2")}</span> },
    {
      accessorKey: "title",
      header: copy("products"),
      cell: ({ row }) => <span className="line-clamp-1 max-w-[260px]">{row.original.title}</span>,
    },
    {
      accessorKey: "price",
      header: copy("price"),
      cell: ({ row }) => (
        <span>
          <span className="font-semibold text-danger">¥{row.original.price}</span>
          <span className="ml-1 text-xs text-muted line-through">¥{row.original.originalPrice}</span>
        </span>
      ),
    },
    { accessorKey: "stock", header: copy("inventory"), cell: ({ row }) => <span className="tabular-nums">{row.original.stock}</span> },
    { accessorKey: "sold", header: copy("sold"), cell: ({ row }) => <span className="tabular-nums">{row.original.sold}</span> },
    {
      id: "status",
      header: copy("status"),
      cell: ({ row }) =>
        row.original.id === explainingId ? (
          <Tag tone="danger" size="sm" dot>

            {copy("presenting")}
          </Tag>
        ) : (
          <Button size="sm" variant="outline" onClick={() => startExplain(row.original)}>

            {copy("startPresenting")}
          </Button>
        ),
    },
  ];

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{copy("shoppingPanel")} {products.length}  {copy("products2")}</h2>
          <Segmented
            value={view}
            onValueChange={setView}
            items={[
              { value: "sort", label: copy("presentationOrder") },
              { value: "table", label: copy("productTable") },
            ]}
          />
        </div>

        {view === "sort" ? (
          <Sortable
            items={products}
            getId={(p) => p.id}
            onChange={setProducts}
            handle
            renderItem={(p) => (
              <LiveProductCard
                index={p.index}
                image={p.image}
                title={p.title}
                price={p.price}
                originalPrice={p.originalPrice}
                explaining={p.id === explainingId}
                stock={p.stock}
                sold={p.sold}
                tag={p.tag}
                action={
                  p.id === explainingId ? (
                    <Tag tone="danger" size="sm" dot>

                      {copy("presenting")}
                    </Tag>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startExplain(p)}>

                      {copy("present")}
                    </Button>
                  )
                }
              />
            )}
          />
        ) : (
          <ProTable<LiveProduct>
            title={copy("productList")}
            columns={columns}
            data={tableRows}
            getRowId={(r) => r.id}
            search={{
              fields: [{ name: "keyword", label: copy("keywords"), placeholder: copy("product3") }],
              onSearch: (v) => setKeyword(((v as { keyword?: string }).keyword ?? "").trim()),
            }}
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">{copy("currentProductPreview")}</div>
        <LiveProductCard
          layout="card"
          index={explaining.index}
          image={explaining.image}
          title={explaining.title}
          price={explaining.price}
          originalPrice={explaining.originalPrice}
          explaining
          stock={explaining.stock}
          sold={explaining.sold}
          tag={explaining.tag}
          action={
            <Button size="sm" className="w-full" onClick={() => toast({ title: copy("audienceShoppingPanelOpened"), tone: "info" })}>

              {copy("openInAudienceRoom")}
            </Button>
          }
        />
        <p className="text-xs leading-relaxed text-muted">

          {copy("dragCardsToReorderTheRundownSelectPresentToFeatureAProductAndSyncItToTheAudienceShoppingPanel")}
        </p>
      </div>
    </div>
  );
}
