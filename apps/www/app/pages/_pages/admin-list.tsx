/** @jsxImportSource ../../../lib/fixture-jsx */
import { PageHeaderBlock } from "../../blocks/_blocks/page-header";
import { KpiRailBlock } from "../../blocks/_blocks/kpi-rail";
import { DataTableBlock } from "../../blocks/_blocks/data-table";

// 中后台列表页 —— 页头 + KPI 概览横轨 + 数据表格（查询工具栏 + ProTable + 行内操作），最常见的资源管理页范式。
export function AdminListPage() {
  return (
    <div className="space-y-8 bg-bg px-6 py-8">
      <PageHeaderBlock />
      <KpiRailBlock />
      <DataTableBlock />
    </div>
  );
}
