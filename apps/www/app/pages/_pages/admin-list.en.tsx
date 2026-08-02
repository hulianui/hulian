import { PageHeaderBlock } from "../../blocks/_blocks/page-header.en";
import { KpiRailBlock } from "../../blocks/_blocks/kpi-rail.en";
import { DataTableBlock } from "../../blocks/_blocks/data-table.en";
export function AdminListPage() {
    return (<div className="space-y-8 bg-bg px-6 py-8">
      <PageHeaderBlock />
      <KpiRailBlock />
      <DataTableBlock />
    </div>);
}
