"use client";
import { copy } from "./page.content";

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
} from "@hulianui/ui";
import { customers as seed } from "../../_data/customers";
import { customerLevelLabel, customerLevelTone, customerStatusLabel, customerStatusTone, yuan } from "../../_data/status";
import { OWNERS, type Customer, type CustomerLevel, type CustomerStatus } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

const LEVELS: CustomerLevel[] = ["重要", "普通", "潜在"];
const STATUSES: CustomerStatus[] = ["待分配", "跟进中", "已成交", "已流失"];
const INDUSTRIES = [copy("manufacturing"), copy("internet"), copy("finance"), copy("medical"), copy("education"), copy("retail"), copy("logistics"), copy("catering"), copy("energy"), copy("consultation")];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], allLabel = copy("all"), labels?: Readonly<Record<string, string>>) => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: labels?.[v] ?? v })),
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
  level: copy("ordinary2"), status: copy("toBeAllocated2"), owner: OWNERS[0], industry: copy("manufacturing2"), region: "", regionCodes: [],
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
        toast({ title: copy("customerUpdated"), description: val.name, tone: "success" });
      } else {
        const nextId = `C${1000 + rows.length + 1}`;
        setRows((rs) => [
          {
            id: nextId, ...val, level: val.level as CustomerLevel, status: val.status as CustomerStatus,
            amount: 0, lastFollowAt: "2026-06-04", createdAt: "2026-06-04", tags: [copy("new")],
          },
          ...rs,
        ]);
        setPage(1);
        toast({ title: copy("newCustomerHasBeenCreated"), description: val.name, tone: "success" });
      }
    });
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: copy("customer"),
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
      header: copy("contactPerson"),
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.original.contactName}</div>
          <div className="text-xs text-muted tabular-nums">{row.original.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: "level",
      header: copy("level"),
      cell: ({ row }) => (
        <Tag tone={customerLevelTone[row.original.level]} size="sm">
          {customerLevelLabel[row.original.level]}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: copy("status"),
      cell: ({ row }) => (
        <Tag tone={customerStatusTone[row.original.status]} size="sm" dot>
          {customerStatusLabel[row.original.status]}
        </Tag>
      ),
    },
    { accessorKey: "owner", header: copy("personInCharge") },
    {
      accessorKey: "amount",
      header: copy("accumulatedTransactions"),
      cell: ({ row }) => <span className="tabular-nums">{yuan(row.original.amount)}</span>,
    },
    { accessorKey: "lastFollowAt", header: copy("latestFollowUp") },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href={`/demos/crm/customers/${row.original.id}`} />}>{copy("view")}</Button>
          <Tooltip>
            <TooltipTrigger render={
              <Button variant="ghost" size="iconSm" onClick={() => openEdit(row.original)}>
                <Pencil className="size-3.5" />
              </Button>
            } />
            <TooltipContent>{copy("editCustomer")}</TooltipContent>
          </Tooltip>
          <Popconfirm
            title={copy("deleteThisCustomer")}
            description={copy("theDataCannotBeRecoveredAfterDeletion")}
            danger
            okText={copy("delete")}
            onConfirm={() => {
              setRows((rs) => rs.filter((r) => r.id !== row.original.id));
              toast({ title: copy("customerDeleted"), description: row.original.name, tone: "danger" });
            }}
          >
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="iconSm" tone="danger">
                  <Trash2 className="size-3.5" />
                </Button>
              } />
              <TooltipContent>{copy("deleteCustomer")}</TooltipContent>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 每字段只 register 一次（register 第二次无 config 会覆盖 rules，故集中注册）。
  const reg = {
    name: form.register("name", { rules: [{ required: true, message: copy("pleaseEnterTheCustomerSShortName") }] }),
    company: form.register("company", { rules: [{ required: true, message: copy("pleaseEnterFullCompanyName") }] }),
    contactName: form.register("contactName"),
    phone: form.register("phone", { rules: [{ pattern: /\d/, message: copy("phoneNumberMustIncludeNumbers") }] }),
    email: form.register("email", { rules: [{ pattern: /@/, message: copy("emailMustContain") }] }),
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
          <Button size="sm" variant="ghost" onClick={reload}>{copy("tryAgain")}</Button>
        </Alert>
      )}
      <ProTable<Customer>
        title={copy("customerList")}
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        toolbarActions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />{copy("createNewCustomer")}</Button>
        }
        search={{
          fields: [
            { name: "keyword", label: copy("keywords"), placeholder: copy("customerCompanyContact") },
            { name: "status", label: copy("status2"), type: "select", options: opt(STATUSES, copy("all"), customerStatusLabel) },
            { name: "level", label: copy("level2"), type: "select", options: opt(LEVELS, copy("all"), customerLevelLabel) },
            { name: "owner", label: copy("personInCharge2"), type: "select", options: opt(OWNERS) },
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
        title={editing ? copy("editCustomer2") : copy("createNewCustomer2")}
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={handleFinish}
        className="w-[560px]"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Field label={copy("customerAbbreviation")} error={reg.name.error}>
            <Input {...bind(reg.name)} placeholder={copy("suchAsMorningLightStationery")} />
          </Field>
          <Field label={copy("personInCharge3")}>
            <FormSelect field={reg.owner} options={OWNERS} />
          </Field>
          <Field label={copy("fullCompanyName")} className="col-span-2" error={reg.company.error}>
            <Input {...bind(reg.company)} placeholder={copy("fullNameOfBusinessLicense")} />
          </Field>
          <Field label={copy("contactPerson2")}>
            <Input {...bind(reg.contactName)} placeholder={copy("nameOfContactPerson")} />
          </Field>
          <Field label={copy("contactNumber")} error={reg.phone.error}>
            <Input {...bind(reg.phone)} placeholder={copy("cellPhoneLandline")} />
          </Field>
          <Field label={copy("email")} error={reg.email.error}>
            <Input {...bind(reg.email)} placeholder="name@company.com" />
          </Field>
          <Field label={copy("area")} className="col-span-2">
            <RegionCascader
              value={reg.regionCodes.value as string[]}
              onChange={(codes, names) => {
                reg.regionCodes.onChange(codes);
                // 将省/市/区名拼成 region 文本字段
                reg.region.onChange(names.join("/"));
              }}
              placeholder={copy("provinceCityDistrictCounty")}
              showSearch
            />
          </Field>
          <div className="col-span-2 py-1">
            <Separator />
          </div>
          <Field label={copy("customerLevel")}>
            <FormSelect field={reg.level} options={LEVELS} labels={customerLevelLabel} />
          </Field>
          <Field label={copy("followUpStatus")}>
            <FormSelect field={reg.status} options={STATUSES} labels={customerStatusLabel} />
          </Field>
          <Field label={copy("industry")} className="col-span-2">
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
  labels,
}: {
  field: ReturnType<ReturnType<typeof useForm>["register"]>;
  options: readonly string[];
  labels?: Readonly<Record<string, string>>;
}) {
  const items = options.map((o) => ({ value: o, label: labels?.[o] ?? o }));
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
            {labels?.[o] ?? o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
