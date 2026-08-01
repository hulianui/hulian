"use client";

// 中后台列表页主体区块 —— 顶部查询工具栏（搜索 + Select 筛选 + 新建按钮）
// + ProTable 数据表格（状态 Tag 列、头像列、行内操作 + Popconfirm 删除确认）。
// 数据全内联，复制即独立运行，无外部依赖。

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import {
  Avatar,
  Button,
  Input,
  Popconfirm,
  ProTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type ColumnDef,
} from "@hulianui/ui";

type OrderStatus = "待处理" | "进行中" | "已完成" | "已取消";
type Priority = "高" | "中" | "低";

interface WorkOrder {
  id: string;
  title: string;
  assignee: string;
  department: string;
  status: OrderStatus;
  priority: Priority;
  createdAt: string;
}

const STATUS_TONE: Record<OrderStatus, "warning" | "brand" | "success" | "danger"> = {
  待处理: "warning",
  进行中: "brand",
  已完成: "success",
  已取消: "danger",
};

const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "neutral"> = {
  高: "danger",
  中: "warning",
  低: "neutral",
};

const SEED_DATA: WorkOrder[] = [
  { id: "WO-001", title: "服务器迁移至新机房", assignee: "张晓明", department: "基础架构", status: "进行中", priority: "高", createdAt: "2026-06-01" },
  { id: "WO-002", title: "数据库索引优化", assignee: "李思远", department: "数据库", status: "待处理", priority: "中", createdAt: "2026-06-02" },
  { id: "WO-003", title: "前端性能监控接入", assignee: "王雪梅", department: "前端", status: "已完成", priority: "低", createdAt: "2026-06-02" },
  { id: "WO-004", title: "安全漏洞修复 CVE-2026", assignee: "陈建国", department: "安全", status: "进行中", priority: "高", createdAt: "2026-06-03" },
  { id: "WO-005", title: "日志系统扩容", assignee: "刘芳", department: "运维", status: "待处理", priority: "中", createdAt: "2026-06-03" },
  { id: "WO-006", title: "API 接口文档更新", assignee: "赵磊", department: "后端", status: "已完成", priority: "低", createdAt: "2026-06-04" },
  { id: "WO-007", title: "测试环境数据脱敏", assignee: "周晨", department: "数据库", status: "已取消", priority: "中", createdAt: "2026-06-04" },
  { id: "WO-008", title: "CI/CD 流水线优化", assignee: "吴凯", department: "基础架构", status: "进行中", priority: "高", createdAt: "2026-06-05" },
  { id: "WO-009", title: "移动端适配改版", assignee: "孙丽", department: "前端", status: "待处理", priority: "中", createdAt: "2026-06-05" },
  { id: "WO-010", title: "缓存层架构重构", assignee: "何明", department: "后端", status: "待处理", priority: "高", createdAt: "2026-06-05" },
];

const DEPARTMENTS = ["基础架构", "数据库", "前端", "后端", "安全", "运维"];
const STATUSES: OrderStatus[] = ["待处理", "进行中", "已完成", "已取消"];

const opt = (arr: readonly string[], allLabel = "全部") => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: v })),
];

const PAGE_SIZE = 6;

export function DataTableBlock() {
  const [rows, setRows] = useState<WorkOrder[]>(SEED_DATA);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return rows.filter((r) => {
      if (kw && !`${r.title}${r.assignee}${r.id}`.includes(kw)) return false;
      if (status && r.status !== status) return false;
      if (department && r.department !== department) return false;
      return true;
    });
  }, [rows, keyword, status, department]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: "id",
      header: "工单号",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted tabular-nums">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "工单标题",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={row.original.assignee.slice(0, 1)} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{row.original.title}</div>
            <div className="text-xs text-muted">{row.original.assignee} · {row.original.department}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "优先级",
      cell: ({ row }) => (
        <Tag tone={PRIORITY_TONE[row.original.priority]} size="sm" variant="soft">
          {row.original.priority}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Tag tone={STATUS_TONE[row.original.status]} size="sm" dot>
          {row.original.status}
        </Tag>
      ),
    },
    { accessorKey: "createdAt", header: "创建时间" },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label={`查看工单 ${row.original.id}`}
                  onClick={() =>
                    toast({ title: "查看工单", description: row.original.title, tone: "info" })
                  }
                >
                  <Eye className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent>查看详情</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label={`编辑工单 ${row.original.id}`}
                  onClick={() =>
                    toast({ title: "编辑工单", description: row.original.title, tone: "info" })
                  }
                >
                  <Pencil className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent>编辑</TooltipContent>
          </Tooltip>
          <Popconfirm
            title="删除该工单？"
            description="删除后数据不可恢复。"
            danger
            okText="删除"
            onConfirm={() => {
              setRows((rs) => rs.filter((r) => r.id !== row.original.id));
              toast({ title: "已删除工单", description: row.original.id, tone: "danger" });
            }}
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="iconSm"
                    tone="danger"
                    aria-label={`删除工单 ${row.original.id}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>删除</TooltipContent>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ProTable<WorkOrder>
        title="工单列表"
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        toolbarActions={
          <Button
            size="sm"
            onClick={() => toast({ title: "新建工单", description: "打开新建表单（演示）", tone: "info" })}
          >
            <Plus className="size-4" />
            新建工单
          </Button>
        }
        search={{
          fields: [
            { name: "keyword", label: "关键词", placeholder: "工单标题 / 负责人 / 编号" },
            { name: "status", label: "状态", type: "select", options: opt(STATUSES) },
            { name: "department", label: "部门", type: "select", options: opt(DEPARTMENTS) },
          ],
          onSearch: (v) => {
            setKeyword(String(v.keyword ?? ""));
            setStatus(String(v.status ?? ""));
            setDepartment(String(v.department ?? ""));
            setPage(1);
          },
          onReset: () => {
            setKeyword("");
            setStatus("");
            setDepartment("");
            setPage(1);
          },
        }}
        pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />
    </div>
  );
}
