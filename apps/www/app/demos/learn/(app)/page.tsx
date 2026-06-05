import { Suspense } from "react";
import { CatalogClient } from "../_components/catalog-client";

// useSearchParams（view=mine）在 output:export 下须包 Suspense，否则构建 CSR bailout。
export default function LearnCatalogPage() {
  return (
    <Suspense>
      <CatalogClient />
    </Suspense>
  );
}
