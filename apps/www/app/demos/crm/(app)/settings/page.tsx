"use client";
import { copy } from "./page.content";

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
  Checkbox,
  CheckboxGroup,
  Field,
  Heading,
  Input,
  List,
  ListItem,
  ListItemMeta,
  ModalForm,
  ProForm,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
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
} from "@hulianui/ui";

const INDUSTRIES = [copy("internet"), copy("manufacturing"), copy("finance"), copy("medical"), copy("education"), copy("retail"), copy("logistics"), copy("energy"), copy("consultation")];
const SIZES = [copy("people"), copy("people2"), copy("people3"), copy("people4"), copy("moreThanPeople")];

type Member = {
  name: string;
  role: string;
  email: string;
  status: "在职" | "试用期" | "邀请中";
  roleTone: "brand" | "neutral";
};

const INITIAL_MEMBERS: Member[] = [
  { name: copy("linWanqing"), role: copy("salesDirector"), email: "lin@hulian.com", status: "在职", roleTone: "brand" },
  { name: copy("zhouMingyuan"), role: copy("advancedSales"), email: "zhou@hulian.com", status: "在职", roleTone: "neutral" },
  { name: copy("highSensitivity"), role: copy("salesSpecialist"), email: "gao@hulian.com", status: "在职", roleTone: "neutral" },
  { name: copy("chenCe"), role: copy("keyAccountManager"), email: "chen@hulian.com", status: "在职", roleTone: "brand" },
  { name: copy("suXiao"), role: copy("salesAssistant"), email: "su@hulian.com", status: "试用期", roleTone: "neutral" },
];

const MEMBER_STATUS_LABEL: Record<Member["status"], string> = {
  在职: copy("onTheJob"),
  试用期: copy("trialPeriod"),
  邀请中: copy("inviting"),
};

const ROLES = [copy("salesDirector2"), copy("advancedSales2"), copy("keyAccountManager2"), copy("salesSpecialist2"), copy("salesAssistant2")];

const NOTIF_ITEMS = [
  { key: "assign", title: copy("alertsForNewOpportunityAssignments"), desc: copy("whenNewBusinessOpportunitiesAreAssignedTo") },
  { key: "due", title: copy("customerFollowUpDueReminder"), desc: copy("alertMeWhenACustomerHasnT") },
  { key: "order", title: copy("orderStatusChangeNotification"), desc: copy("notifiedWhenTheStatusOfTheOrder") },
  { key: "weekly", title: copy("weeklyPerformanceReportEmail"), desc: copy("aSummaryOfLastWeekSPerformance") },
  { key: "security", title: copy("accountSecurityAlert"), desc: copy("securityEventsSuchAsRemoteLoginAnd") },
] as const;

export default function SettingsPage() {
  const form = useForm({
    initialValues: {
      name: copy("hulianTechnologyCoLtd"),
      short: copy("hulianCrm"),
      industry: copy("internet2"),
      size: copy("people5"),
      site: "https://hulian.com",
      phone: "021-8888-6666",
      address: copy("zhangjiangHighTechParkPudongNewArea"),
      intro: copy("aOneStopCrmServiceProviderFocusing"),
    },
  });
  const reg = {
    name: form.register("name", { rules: [{ required: true, message: copy("pleaseEnterCompanyName") }] }),
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
  // 通知渠道多选（CheckboxGroup）
  const [notifChannels, setNotifChannels] = useState<string[]>(["email", "inapp"]);
  // 默认首页视图单选（RadioGroup）
  const [defaultView, setDefaultView] = useState("workbench");

  // 成员管理：改为 state，邀请表单提交后真加进列表
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const inviteForm = useForm({ initialValues: { name: "", email: "", role: copy("salesSpecialist3") } });
  const invReg = {
    name: inviteForm.register("name", { rules: [{ required: true, message: copy("pleaseEnterMemberName") }] }),
    email: inviteForm.register("email", {
      rules: [
        { required: true, message: copy("pleaseEnterYourEmail") },
        { pattern: /@/, message: copy("emailMustContain") },
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
    toast({ title: copy("invitationSent"), description: copy("valueValueHasBeenInvitedToJoin", val.name, val.email), tone: "success" });
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
      <Heading level={2} size="xl">{copy("systemSettings")}</Heading>

      <Card variant="outline">
        <CardBody>
          <Tabs defaultValue="company">
            <TabsList>
              <TabsTab value="company">{copy("corporateInformation")}</TabsTab>
              <TabsTab value="members">{copy("memberManagement")}</TabsTab>
              <TabsTab value="notify">{copy("notificationSettings")}</TabsTab>
            </TabsList>

            {/* 企业资料 */}
            <TabsPanel value="company" className="pt-6">
              <div className="flex flex-col gap-8 lg:flex-row">
                <ProForm
                  form={form}
                  columns={2}
                  className="flex-1"
                  submitText={copy("saveChanges")}
                  resetText={copy("reset")}
                  onFinish={(v) => {
                    toast({ title: copy("companyInformationHasBeenSaved"), description: String(v.name), tone: "success" });
                  }}
                >
                  <Field label={copy("companyName")} error={reg.name.error}>
                    <Input {...bindInput(reg.name)} />
                  </Field>
                  <Field label={copy("companyAbbreviation")}>
                    <Input {...bindInput(reg.short)} />
                  </Field>
                  <Field label={copy("industry")}>
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
                  <Field label={copy("companySize")}>
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
                  <Field label={copy("officialWebsite")}>
                    <Input {...bindInput(reg.site)} />
                  </Field>
                  <Field label={copy("contactNumber")}>
                    <Input {...bindInput(reg.phone)} />
                  </Field>
                  <Field label={copy("companyAddress")} colSpan="full">
                    <Input {...bindInput(reg.address)} />
                  </Field>
                  <Field label={copy("companyProfile")} colSpan="full">
                    <Textarea value={reg.intro.value as string} onChange={reg.intro.onChange} onBlur={reg.intro.onBlur} rows={3} />
                  </Field>
                </ProForm>

                <aside className="flex shrink-0 flex-col gap-6 lg:w-64">
                  <div>
                    <div className="text-sm font-medium">{copy("companyLogo")}</div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="grid size-14 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/10 text-lg font-semibold text-primary">{copy("coral")}</div>
                      <button
                        type="button"
                        onClick={() => toast({ title: copy("uploadLogo"), description: copy("demoOccupancyNoRealUpload"), tone: "neutral" })}
                        className="flex-1 rounded-[var(--radius)] border border-dashed border-border px-3 py-2.5 text-center text-xs text-muted transition-colors hover:border-primary hover:text-primary"
                      >{copy("clickToUpload")}<br />
                        PNG / JPG ≤ 2MB
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{copy("dataCompleteness")}</span>
                      <span className="text-sm tabular-nums text-muted">{completeness}%</span>
                    </div>
                    <Progress value={completeness} size={6} tone="primary" className="mt-2.5" aria-label={copy("dataCompleteness2")} />
                    <Text size="xs" tone="muted" className="mt-2">{copy("perfectingYourBusinessProfileHelpsBuildTrust")}</Text>
                  </div>
                </aside>
              </div>
            </TabsPanel>

            {/* 成员管理 */}
            <TabsPanel value="members" className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Text size="sm" tone="muted">{copy("teamTotal")}{members.length}{copy("members")}</Text>
                <Button
                  size="sm"
                  onClick={() => {
                    inviteForm.resetFields();
                    setInviteOpen(true);
                  }}
                >
                  <UserPlus className="size-4" />{copy("inviteMembers")}</Button>
              </div>
              <List
                items={members}
                bordered
                renderItem={(m) => (
                  <ListItem
                    actions={[
                      <Tag key="st" tone={m.status === "在职" ? "success" : "warning"} size="sm">
                        {MEMBER_STATUS_LABEL[m.status]}
                      </Tag>,
                      <Button
                        key="edit"
                        variant="ghost"
                        size="sm"
                        onClick={() => toast({ title: copy("editValue", m.name), description: copy("memberPermissionsEditingDemo"), tone: "neutral" })}
                      >{copy("edit")}</Button>,
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
              {/* 通知渠道多选 */}
              <div className="mb-5">
                <div className="mb-2 text-sm font-medium">{copy("notificationChannel")}</div>
                <Text size="sm" tone="muted" className="mb-3">{copy("selectTheChannelToReceiveNotificationsAnd")}</Text>
                <CheckboxGroup
                  value={notifChannels}
                  onValueChange={setNotifChannels}
                  orientation="horizontal"
                  aria-label={copy("notificationChannel2")}
                >
                  <Checkbox value="email" label={copy("mail")} />
                  <Checkbox value="sms" label={copy("sms")} />
                  <Checkbox value="inapp" label={copy("siteMessage")} />
                  <Checkbox value="dingtalk" label={copy("dingtalk")} />
                </CheckboxGroup>
              </div>

              <Separator className="my-5" />

              {/* 默认首页视图单选 */}
              <div className="mb-5">
                <div className="mb-2 text-sm font-medium">{copy("defaultHomePageView")}</div>
                <Text size="sm" tone="muted" className="mb-3">{copy("thePageThatJumpsByDefaultAfter")}</Text>
                <RadioGroup
                  value={defaultView}
                  onValueChange={setDefaultView}
                  orientation="horizontal"
                  aria-label={copy("defaultHomePageView2")}
                >
                  <Radio value="workbench" label={copy("workbench")} />
                  <Radio value="customers" label={copy("customerList")} />
                  <Radio value="opportunities" label={copy("businessOpportunityBoard")} />
                </RadioGroup>
              </div>

              <Separator className="my-5" />

              {/* 通知事件开关列表 */}
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
                      const channelLabels: Record<string, string> = { email: copy("mail2"), sms: copy("sms2"), inapp: copy("siteMessage2"), dingtalk: copy("dingtalk2") };
                      const viewLabels: Record<string, string> = { workbench: copy("workbench2"), customers: copy("customerList2"), opportunities: copy("businessOpportunityBoard2") };
                      toast({
                        title: copy("notificationSettingsSaved"),
                        description: copy("channelValueHomePageValueValueValue", notifChannels.map((c) => channelLabels[c]).join("/"), viewLabels[defaultView], on, NOTIF_ITEMS.length),
                        tone: "success",
                      });
                    }, 500);
                  }}
                >{copy("saveSettings")}</Button>
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
              <div className="text-sm font-medium text-danger">{copy("dangerousOperation")}</div>
              <Text size="sm" tone="muted" className="mt-0.5">{copy("resettingTheDemoDataWillClearAll")}</Text>
            </div>
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="outline" tone="danger" size="sm" className="shrink-0">
                  <RotateCcw className="size-3.5" />{copy("resetDemoData")}</Button>
              } />
              <AlertDialogContent
                title={copy("confirmToResetDemoData")}
                description={copy("thisOperationWillClearAllMemoryState")}
              >
                <AlertDialogClose render={<Button variant="outline">{copy("cancel")}</Button>} />
                <AlertDialogClose
                  render={
                    <Button
                      tone="danger"
                      onClick={() => toast({ title: copy("demoDataReset"), description: copy("fullyRestoredAfterRefreshingThePage"), tone: "danger" })}
                    >{copy("confirmReset")}</Button>
                  }
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardBody>
      </Card>

      <ModalForm
        title={copy("inviteMembers2")}
        form={inviteForm}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onFinish={handleInvite}
        submitText={copy("sendInvitation")}
        className="w-[460px]"
      >
        <div className="flex flex-col gap-1">
          <Field label={copy("memberName")} error={invReg.name.error}>
            <Input {...bindInput(invReg.name)} placeholder={copy("suchAsWangLei")} />
          </Field>
          <Field label={copy("email")} error={invReg.email.error}>
            <Input {...bindInput(invReg.email)} placeholder={copy("anInvitationLinkWillBeSentTo")} />
          </Field>
          <Field label={copy("role")}>
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
