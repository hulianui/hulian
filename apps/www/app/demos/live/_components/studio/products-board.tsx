"use client";
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
} from "@hulian/ui";
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
    toast({ title: `已上架讲解：${p.index} 号 · ${p.title.slice(0, 12)}…`, tone: "info" });
  };

  const columns: ColumnDef<LiveProduct>[] = [
    { accessorKey: "index", header: "链接", cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.index} 号</span> },
    {
      accessorKey: "title",
      header: "商品",
      cell: ({ row }) => <span className="line-clamp-1 max-w-[260px]">{row.original.title}</span>,
    },
    {
      accessorKey: "price",
      header: "价格",
      cell: ({ row }) => (
        <span>
          <span className="font-semibold text-danger">¥{row.original.price}</span>
          <span className="ml-1 text-xs text-muted line-through">¥{row.original.originalPrice}</span>
        </span>
      ),
    },
    { accessorKey: "stock", header: "库存", cell: ({ row }) => <span className="tabular-nums">{row.original.stock}</span> },
    { accessorKey: "sold", header: "已售", cell: ({ row }) => <span className="tabular-nums">{row.original.sold}</span> },
    {
      id: "status",
      header: "状态",
      cell: ({ row }) =>
        row.original.id === explainingId ? (
          <Tag tone="danger" size="sm" dot>
            讲解中
          </Tag>
        ) : (
          <Button size="sm" variant="outline" onClick={() => startExplain(row.original)}>
            开始讲解
          </Button>
        ),
    },
  ];

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">小黄车 · {products.length} 件商品</h2>
          <Segmented
            value={view}
            onValueChange={setView}
            items={[
              { value: "sort", label: "讲解排序" },
              { value: "table", label: "商品表格" },
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
                      讲解中
                    </Tag>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startExplain(p)}>
                      讲解
                    </Button>
                  )
                }
              />
            )}
          />
        ) : (
          <ProTable<LiveProduct>
            title="商品列表"
            columns={columns}
            data={tableRows}
            getRowId={(r) => r.id}
            search={{
              fields: [{ name: "keyword", label: "关键词", placeholder: "商品名" }],
              onSearch: (v) => setKeyword(((v as { keyword?: string }).keyword ?? "").trim()),
            }}
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">当前讲解预览</div>
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
            <Button size="sm" className="w-full" onClick={() => toast({ title: "已弹出小黄车到直播间", tone: "info" })}>
              弹出到直播间
            </Button>
          }
        />
        <p className="text-xs leading-relaxed text-muted">
          拖动左侧卡片调整讲解顺序，点「讲解」即把该商品置为讲解中并同步到观众端小黄车。
        </p>
      </div>
    </div>
  );
}
