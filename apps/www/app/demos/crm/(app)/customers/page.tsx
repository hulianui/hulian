"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Alert,
  Avatar,
  Button,
  Field,
  Input,
  ModalForm,
  Popconfirm,
  ProTable,
  RegionCascader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  useForm,
  type ColumnDef,
} from "@hulian/ui";
import { customers as seed } from "../../_data/customers";
import { customerLevelTone, customerStatusTone, yuan } from "../../_data/status";
import { OWNERS, type Customer, type CustomerLevel, type CustomerStatus } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

const LEVELS: CustomerLevel[] = ["重要", "普通", "潜在"];
const STATUSES: CustomerStatus[] = ["待分配", "跟进中", "已成交", "已流失"];
const INDUSTRIES = ["制造", "互联网", "金融", "医疗", "教育", "零售", "物流", "餐饮", "能源", "咨询"];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], allLabel = "全部") => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: v })),
];

type FormState = {
  name: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  level: string;
  status: string;
  owner: string;
  industry: string;
  region: string;
  regionCodes: string[];
};

const EMPTY: FormState = {
  name: "", company: "", contactName: "", phone: "", email: "",
  level: "普通", status: "待分配", owner: OWNERS[0], industry: "制造", region: "", regionCodes: [],
};

export default function CustomersPage() {
  const { data, loading, error, reload } = useMockData(seed, { failOnce: true });
  const [rows, setRows] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [, run] = usePending();

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const form = useForm<FormState>({ initialValues: EMPTY });

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((r) => {
      if (kw && !`${r.name}${r.company}${r.contactName}`.includes(kw)) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.level && r.level !== filters.level) return false;
      if (filters.owner && r.owner !== filters.owner) return false;
      return true;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    form.resetFields();
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (c: Customer) => {
    form.setFieldsValue({
      name: c.name, company: c.company, contactName: c.contactName, phone: c.phone, email: c.email,
      level: c.level, status: c.status, owner: c.owner, industry: c.industry, region: c.region, regionCodes: [],
    });
    setEditing(c);
    setOpen(true);
  };

  const handleFinish = (v: Record<string, unknown>) => {
    const val = v as FormState;
    return run(() => {
      if (editing) {
        setRows((rs) => rs.map((r) => (r.id === editing.id ? { ...r, ...val, level: val.level as CustomerLevel, status: val.status as CustomerStatus } : r)));
        toast({ title: "客户已更新", description: val.name, tone: "info" });
      } else {
        const nextId = `C${1000 + rows.length + 1}`;
        setRows((rs) => [
          {
            id: nextId, ...val, level: val.level as CustomerLevel, status: val.status as CustomerStatus,
            amount: 0, lastFollowAt: "2026-06-04", createdAt: "2026-06-04", tags: ["新建"],
          },
          ...rs,
        ]);
        setPage(1);
        toast({ title: "已新建客户", description: val.name, tone: "info" });
      }
    });
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "客户",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar fallback={c.name.slice(0, 1)} />
            <div className="min-w-0">
              <Link href={`/demos/crm/customers/${c.id}`} className="font-medium hover:text-primary">
                {c.name}
              </Link>
              <div className="truncate text-xs text-muted">{c.company}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contactName",
      header: "联系人",
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.original.contactName}</div>
          <div className="text-xs text-muted tabular-nums">{row.original.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: "level",
      header: "等级",
      cell: ({ row }) => (
        <Tag tone={customerLevelTone[row.original.level]} size="sm">
          {row.original.level}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Tag tone={customerStatusTone[row.original.status]} size="sm" dot>
          {row.original.status}
        </Tag>
      ),
    },
    { accessorKey: "owner", header: "负责人" },
    {
      accessorKey: "amount",
      header: "累计成交",
      cell: ({ row }) => <span className="tabular-nums">{yuan(row.original.amount)}</span>,
    },
    { accessorKey: "lastFollowAt", header: "最近跟进" },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href={`/demos/crm/customers/${row.original.id}`} />}>
            查看
          </Button>
          <Tooltip>
            <TooltipTrigger render={
              <Button variant="ghost" size="iconSm" onClick={() => openEdit(row.original)}>
                <Pencil className="size-3.5" />
              </Button>
            } />
            <TooltipContent>编辑客户</TooltipContent>
          </Tooltip>
          <Popconfirm
            title="删除该客户？"
            description="删除后数据不可恢复（demo 内存态，刷新还原）。"
            danger
            okText="删除"
            onConfirm={() => {
              setRows((rs) => rs.filter((r) => r.id !== row.original.id));
              toast({ title: "已删除客户", description: row.original.name, tone: "danger" });
            }}
          >
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="iconSm" tone="danger">
                  <Trash2 className="size-3.5" />
                </Button>
              } />
              <TooltipContent>删除客户</TooltipContent>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 每字段只 register 一次（register 第二次无 config 会覆盖 rules，故集中注册）。
  const reg = {
    name: form.register("name", { rules: [{ required: true, message: "请输入客户简称" }] }),
    company: form.register("company", { rules: [{ required: true, message: "请输入公司全称" }] }),
    contactName: form.register("contactName"),
    phone: form.register("phone", { rules: [{ pattern: /\d/, message: "电话需含数字" }] }),
    email: form.register("email", { rules: [{ pattern: /@/, message: "邮箱需含 @" }] }),
    region: form.register("region"),
    regionCodes: form.register("regionCodes"),
    owner: form.register("owner"),
    level: form.register("level"),
    status: form.register("status"),
    industry: form.register("industry"),
  };

  return (
    <>
      {error && (
        <Alert tone="danger" className="mb-3">
          {error}{" "}
          <Button size="sm" variant="ghost" onClick={reload}>
            重试
          </Button>
        </Alert>
      )}
      <ProTable<Customer>
        title="客户列表"
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        toolbarActions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> 新建客户
          </Button>
        }
        search={{
          fields: [
            { name: "keyword", label: "关键词", placeholder: "客户 / 公司 / 联系人" },
            { name: "status", label: "状态", type: "select", options: opt(STATUSES) },
            { name: "level", label: "等级", type: "select", options: opt(LEVELS) },
            { name: "owner", label: "负责人", type: "select", options: opt(OWNERS) },
          ],
          onSearch: (v) => {
            setFilters(v);
            setPage(1);
          },
          onReset: () => {
            setFilters({});
            setPage(1);
          },
        }}
        pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />

      <ModalForm
        title={editing ? "编辑客户" : "新建客户"}
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={handleFinish}
        className="w-[560px]"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="客户简称" error={reg.name.error}>
            <Input {...bind(reg.name)} placeholder="如：晨光文具" />
          </Field>
          <Field label="负责人">
            <FormSelect field={reg.owner} options={OWNERS} />
          </Field>
          <Field label="公司全称" className="col-span-2" error={reg.company.error}>
            <Input {...bind(reg.company)} placeholder="营业执照全称" />
          </Field>
          <Field label="联系人">
            <Input {...bind(reg.contactName)} placeholder="对接人姓名" />
          </Field>
          <Field label="联系电话" error={reg.phone.error}>
            <Input {...bind(reg.phone)} placeholder="手机 / 座机" />
          </Field>
          <Field label="邮箱" error={reg.email.error}>
            <Input {...bind(reg.email)} placeholder="name@company.com" />
          </Field>
          <Field label="所在地区" className="col-span-2">
            <RegionCascader
              value={reg.regionCodes.value as string[]}
              onChange={(codes, names) => {
                reg.regionCodes.onChange(codes);
                // 将省/市/区名拼成 region 文本字段
                reg.region.onChange(names.join("/"));
              }}
              placeholder="省 / 市 / 区县"
              showSearch
            />
          </Field>
          <div className="col-span-2 py-1">
            <Separator />
          </div>
          <Field label="客户等级">
            <FormSelect field={reg.level} options={LEVELS} />
          </Field>
          <Field label="跟进状态">
            <FormSelect field={reg.status} options={STATUSES} />
          </Field>
          <Field label="所属行业" className="col-span-2">
            <FormSelect field={reg.industry} options={INDUSTRIES} />
          </Field>
        </div>
      </ModalForm>
    </>
  );
}

// Input 绑定 form.register 返回值（value/onChange/onBlur）。
function bind(field: ReturnType<ReturnType<typeof useForm>["register"]>) {
  return {
    value: field.value as string,
    onChange: field.onChange,
    onBlur: field.onBlur,
  };
}

function FormSelect({
  field,
  options,
}: {
  field: ReturnType<ReturnType<typeof useForm>["register"]>;
  options: readonly string[];
}) {
  const items = options.map((o) => ({ value: o, label: o }));
  return (
    <Select
      items={items}
      value={field.value as string}
      onValueChange={(v) => field.onChange(v as string)}
    >
      <SelectTrigger />
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
