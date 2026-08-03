import { Heading, Text, Tag } from "@hulianui/ui";
import { ProductGridBlock } from "../../blocks/_blocks/product-grid.en";
export function ProductListPage() {
    return (<div className="bg-bg px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3">
          <Heading level={1} size="2xl" weight="bold" className="text-foreground">
            All products
          </Heading>
          <Text tone="muted">Curated products, quality guaranteed · 128 items</Text>
          <div className="mt-1 flex flex-wrap gap-2">
            {["All", "Electronics", "Home and living", "Clothing, shoes and bags", "Beauty and personal care", "Food and groceries"].map((c, i) => (<Tag key={c} variant={i === 0 ? "solid" : "soft"} tone={i === 0 ? "brand" : "neutral"}>
                  {c}
                </Tag>))}
          </div>
        </div>
      </div>
      <ProductGridBlock />
    </div>);
}
