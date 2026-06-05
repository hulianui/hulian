import { PageHeaderBlock } from "../../blocks/_blocks/page-header";
import { KpiRailBlock } from "../../blocks/_blocks/kpi-rail";
import { ChartGridBlock } from "../../blocks/_blocks/chart-grid";
import { DataTableBlock } from "../../blocks/_blocks/data-table";

// 中后台仪表盘页 —— 页头 + KPI 指标卡排 + 图表网格 + 近期数据表，由 4 个应用区块顺序组合。
// 区块各自 mx-auto 自居中；页面只负责背景、横向留白与纵向节奏。
export function DashboardPage() {
  return (
    <div className="space-y-8 bg-bg px-6 py-8">
      <PageHeaderBlock />
      <KpiRailBlock />
      <ChartGridBlock />
      <DataTableBlock />
    </div>
  );
}
