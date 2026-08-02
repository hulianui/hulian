import { PageHeaderBlock } from "../../blocks/_blocks/page-header.en";
import { KpiRailBlock } from "../../blocks/_blocks/kpi-rail.en";
import { ChartGridBlock } from "../../blocks/_blocks/chart-grid.en";
import { DataTableBlock } from "../../blocks/_blocks/data-table.en";
export function DashboardPage() {
    return (<div className="space-y-8 bg-bg px-6 py-8">
      <PageHeaderBlock />
      <KpiRailBlock />
      <ChartGridBlock />
      <DataTableBlock />
    </div>);
}
