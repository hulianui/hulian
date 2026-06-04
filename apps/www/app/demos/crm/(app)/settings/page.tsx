"use client";
import { useState } from "react";
import { RotateCcw, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTrigger,
  Avatar,
  Button,
  Card,
  CardBody,
  Field,
  Heading,
  Input,
  List,
  ListItem,
  ListItemMeta,
  ModalForm,
  ProForm,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Text,
  Textarea,
  toast,
  useForm,
} from "@hulian/ui";

const INDUSTRIES = ["互联网", "制造", "金融", "医疗", "教育", "零售", "物流", "能源", "咨询"];
const SIZES = ["1-50 人", "50-200 人", "200-500 人", "500-1000 人", "1000 人以上"];

type Member = {
  name: string;
  role: string;
  email: string;
  status: "在职" | "试用期" | "邀请中";
  roleTone: "brand" | "neutral";
};

const INITIAL_MEMBERS: Member[] = [
  { name: "林晚晴", role: "销售总监", email: "lin@hulian.com", status: "在职", roleTone: "brand" },
  { name: "周明远", role: "高级销售", email: "zhou@hulian.com", status: "在职", roleTone: "neutral" },
  { name: "高敏", role: "销售专员", email: "gao@hulian.com", status: "在职", roleTone: "neutral" },
  { name: "陈策", role: "大客户经理", email: "chen@hulian.com", status: "在职", roleTone: "brand" },
  { name: "苏晓", role: "销售助理", email: "su@hulian.com", status: "试用期", roleTone: "neutral" },
];

const ROLES = ["销售总监", "高级销售", "大客户经理", "销售专员", "销售助理"];

const NOTIF_ITEMS = [
  { key: "assign", title: "新商机分配提醒", desc: "有新商机分配给我时，站内 + 邮件通知" },
  { key: "due", title: "客户跟进到期提醒", desc: "客户超过 7 天未跟进时提醒我" },
  { key: "order", title: "订单状态变更通知", desc: "我负责的订单状态变化时通知" },
  { key: "weekly", title: "每周业绩周报邮件", desc: "每周一上午推送上周业绩汇总" },
  { key: "security", title: "账号安全告警", desc: "异地登录、密码变更等安全事件" },
] as const;

export default function SettingsPage() {
  const form = useForm({
    initialValues: {
      name: "瑚琏科技有限公司",
      short: "瑚琏 CRM",
      industry: "互联网",
      size: "50-200 人",
      site: "https://hulian.com",
      phone: "021-8888-6666",
      address: "上海市浦东新区张江高科技园区",
      intro: "专注中后台与销售管理的一站式 CRM 服务商。",
    },
  });
  const reg = {
    name: form.register("name", { rules: [{ required: true, message: "请输入公司名称" }] }),
    short: form.register("short"),
    industry: form.register("industry"),
    size: form.register("size"),
    site: form.register("site"),
    phone: form.register("phone"),
    address: form.register("address"),
    intro: form.register("intro"),
  };

  const [notif, setNotif] = useState<Record<string, boolean>>({
    assign: true,
    due: true,
    order: true,
    weekly: false,
    security: true,
  });
  const [savingNotif, setSavingNotif] = useState(false);

  // 成员管理：改为 state，邀请表单提交后真加进列表
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const inviteForm = useForm({ initialValues: { name: "", email: "", role: "销售专员" } });
  const invReg = {
    name: inviteForm.register("name", { rules: [{ required: true, message: "请输入成员姓名" }] }),
    email: inviteForm.register("email", {
      rules: [
        { required: true, message: "请输入邮箱" },
        { pattern: /@/, message: "邮箱需含 @" },
      ],
    }),
    role: inviteForm.register("role"),
  };
  const handleInvite = (v: Record<string, unknown>) => {
    const val = v as { name: string; email: string; role: string };
    setMembers((ms) => [
      ...ms,
      { name: val.name, role: val.role, email: val.email, status: "邀请中", roleTone: "neutral" },
    ]);
    toast({ title: "邀请已发送", description: `已邀请 ${val.name}（${val.email}）加入团队`, tone: "info" });
  };

  const bindInput = (f: typeof reg.name) => ({
    value: f.value as string,
    onChange: f.onChange,
    onBlur: f.onBlur,
  });

  // 企业资料完整度：随输入实时变化，演示右侧信息栏的「填写引导」价值
  const companyKeys = ["name", "short", "industry", "size", "site", "phone", "address", "intro"] as const;
  const filledCount = companyKeys.filter((k) => String((form.values as Record<string, unknown>)[k] ?? "").trim()).length;
  const completeness = Math.round((filledCount / companyKeys.length) * 100);

  return (
    // 设置页内容限宽，卡片贴合内容宽度；企业资料用「表单 + 右信息栏」两栏把宽屏空间用起来
    <div className="flex max-w-5xl flex-col gap-5">
      <Heading level={2} size="xl">
        系统设置
      </Heading>

      <Card variant="outline">
        <CardBody>
          <Tabs defaultValue="company">
            <TabsList>
              <TabsTab value="company">企业资料</TabsTab>
              <TabsTab value="members">成员管理</TabsTab>
              <TabsTab value="notify">通知设置</TabsTab>
            </TabsList>

            {/* 企业资料 */}
            <TabsPanel value="company" className="pt-6">
              <div className="flex flex-col gap-8 lg:flex-row">
                <ProForm
                  form={form}
                  columns={2}
                  className="flex-1"
                  submitText="保存修改"
                  resetText="重置"
                  onFinish={(v) => {
                    toast({ title: "企业资料已保存", description: String(v.name), tone: "info" });
                  }}
                >
                  <Field label="公司名称" error={reg.name.error}>
                    <Input {...bindInput(reg.name)} />
                  </Field>
                  <Field label="公司简称">
                    <Input {...bindInput(reg.short)} />
                  </Field>
                  <Field label="所属行业">
                    <Select
                      items={INDUSTRIES.map((i) => ({ value: i, label: i }))}
                      value={reg.industry.value as string}
                      onValueChange={(v) => reg.industry.onChange(v as string)}
                    >
                      <SelectTrigger />
                      <SelectContent>
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="公司规模">
                    <Select
                      items={SIZES.map((s) => ({ value: s, label: s }))}
                      value={reg.size.value as string}
                      onValueChange={(v) => reg.size.onChange(v as string)}
                    >
                      <SelectTrigger />
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="官网">
                    <Input {...bindInput(reg.site)} />
                  </Field>
                  <Field label="联系电话">
                    <Input {...bindInput(reg.phone)} />
                  </Field>
                  <Field label="公司地址" colSpan="full">
                    <Input {...bindInput(reg.address)} />
                  </Field>
                  <Field label="公司简介" colSpan="full">
                    <Textarea value={reg.intro.value as string} onChange={reg.intro.onChange} onBlur={reg.intro.onBlur} rows={3} />
                  </Field>
                </ProForm>

                <aside className="flex shrink-0 flex-col gap-6 lg:w-64">
                  <div>
                    <div className="text-sm font-medium">公司 Logo</div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="grid size-14 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/10 text-lg font-semibold text-primary">
                        瑚
                      </div>
                      <button
                        type="button"
                        onClick={() => toast({ title: "上传 Logo", description: "demo 占位，未接真实上传", tone: "neutral" })}
                        className="flex-1 rounded-[var(--radius)] border border-dashed border-border px-3 py-2.5 text-center text-xs text-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        点击上传
                        <br />
                        PNG / JPG ≤ 2MB
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">资料完整度</span>
                      <span className="text-sm tabular-nums text-muted">{completeness}%</span>
                    </div>
                    <Progress value={completeness} size={6} tone="primary" className="mt-2.5" aria-label="资料完整度" />
                    <Text size="xs" tone="muted" className="mt-2">
                      完善企业资料有助于在客户侧建立信任。
                    </Text>
                  </div>
                </aside>
              </div>
            </TabsPanel>

            {/* 成员管理 */}
            <TabsPanel value="members" className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Text size="sm" tone="muted">
                  团队共 {members.length} 名成员
                </Text>
                <Button
                  size="sm"
                  onClick={() => {
                    inviteForm.resetFields();
                    setInviteOpen(true);
                  }}
                >
                  <UserPlus className="size-4" /> 邀请成员
                </Button>
              </div>
              <List
                items={members}
                bordered
                renderItem={(m) => (
                  <ListItem
                    actions={[
                      <Tag key="st" tone={m.status === "在职" ? "success" : "warning"} size="sm">
                        {m.status}
                      </Tag>,
                      <Button
                        key="edit"
                        variant="ghost"
                        size="sm"
                        onClick={() => toast({ title: `编辑 ${m.name}`, description: "成员权限编辑（demo）", tone: "neutral" })}
                      >
                        编辑
                      </Button>,
                    ]}
                  >
                    <ListItemMeta
                      avatar={<Avatar fallback={m.name.slice(0, 1)} />}
                      title={
                        <span className="flex items-center gap-2">
                          {m.name}
                          <Tag tone={m.roleTone} size="sm" variant="soft">
                            {m.role}
                          </Tag>
                        </span>
                      }
                      description={m.email}
                    />
                  </ListItem>
                )}
              />
            </TabsPanel>

            {/* 通知设置 */}
            <TabsPanel value="notify" className="pt-6">
              <div className="flex flex-col divide-y divide-border">
                {NOTIF_ITEMS.map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-4">
                    <div className="pr-6">
                      <div className="text-sm font-medium">{n.title}</div>
                      <Text size="sm" tone="muted" className="mt-0.5">
                        {n.desc}
                      </Text>
                    </div>
                    <Switch
                      checked={notif[n.key]}
                      onCheckedChange={(c) => setNotif((s) => ({ ...s, [n.key]: c }))}
                      aria-label={n.title}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button
                  loading={savingNotif}
                  onClick={() => {
                    setSavingNotif(true);
                    setTimeout(() => {
                      setSavingNotif(false);
                      const on = Object.values(notif).filter(Boolean).length;
                      toast({ title: "通知设置已保存", description: `已开启 ${on} / ${NOTIF_ITEMS.length} 项`, tone: "info" });
                    }, 500);
                  }}
                >
                  保存设置
                </Button>
              </div>
            </TabsPanel>
          </Tabs>
        </CardBody>
      </Card>

      {/* 危险区：重置演示数据（演示 AlertDialog 高危二次确认件） */}
      <Card variant="outline" className="border-danger/40">
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-danger">危险操作</div>
              <Text size="sm" tone="muted" className="mt-0.5">
                重置演示数据将清空所有内存态变更（客户 / 商机 / 订单），刷新页面即可还原，本操作仅在 demo 中生效。
              </Text>
            </div>
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="outline" tone="danger" size="sm" className="shrink-0">
                  <RotateCcw className="size-3.5" /> 重置演示数据
                </Button>
              } />
              <AlertDialogContent
                title="确认重置演示数据？"
                description="此操作将清空所有内存态变更，刷新页面可还原。仅影响当前 demo 会话，不涉及真实数据。"
              >
                <AlertDialogClose render={<Button variant="outline">取消</Button>} />
                <AlertDialogClose
                  render={
                    <Button
                      tone="danger"
                      onClick={() => toast({ title: "演示数据已重置", description: "刷新页面后完全还原", tone: "danger" })}
                    >
                      确认重置
                    </Button>
                  }
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardBody>
      </Card>

      <ModalForm
        title="邀请成员"
        form={inviteForm}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onFinish={handleInvite}
        submitText="发送邀请"
        className="w-[460px]"
      >
        <div className="flex flex-col gap-1">
          <Field label="成员姓名" error={invReg.name.error}>
            <Input {...bindInput(invReg.name)} placeholder="如：王磊" />
          </Field>
          <Field label="邮箱" error={invReg.email.error}>
            <Input {...bindInput(invReg.email)} placeholder="邀请链接将发送至此邮箱" />
          </Field>
          <Field label="角色">
            <Select
              items={ROLES.map((r) => ({ value: r, label: r }))}
              value={invReg.role.value as string}
              onValueChange={(v) => invReg.role.onChange(v as string)}
            >
              <SelectTrigger />
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
