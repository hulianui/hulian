"use client";

// 设置页区块 —— 垂直 Tabs 分区（个人资料/通知/外观/安全）+ 右侧表单内容区。
// 复制后改：NOTIF_ITEMS 通知项配置、initialValues 表单默认值、各 Switch 项。
// toast 用法同 contact-form.tsx：tone 为 "info" | "danger" | "neutral" | "warning"。

import { useState } from "react";
import {
  Avatar,
  Button,
  Field,
  Heading,
  Input,
  Separator,
  Switch,
  Tabs,
  TabsPanel,
  Text,
  toast,
} from "@hulianui/ui";
import { Bell, Lock, Palette, User } from "lucide-react";

// 侧边导航项配置 —— 复制后按需增删
const NAV_ITEMS = [
  { value: "profile", label: "个人资料", icon: User },
  { value: "notify", label: "通知设置", icon: Bell },
  { value: "appearance", label: "外观偏好", icon: Palette },
  { value: "security", label: "账号安全", icon: Lock },
] as const;

type NavValue = (typeof NAV_ITEMS)[number]["value"];

// 通知事件配置 —— 复制后按需增删
const NOTIF_ITEMS = [
  { key: "assign", title: "新任务分配通知", desc: "有任务分配给我时，站内 + 邮件同步通知" },
  { key: "comment", title: "评论与@提及", desc: "有人评论我的工作项或 @ 我时提醒" },
  { key: "status", title: "状态变更通知", desc: "我负责的工单状态变化时通知" },
  { key: "weekly", title: "每周汇总周报", desc: "每周一上午推送上周工作量汇总" },
  { key: "security", title: "账号安全告警", desc: "异地登录、密码变更等安全事件即时提醒" },
] as const;

type NotifKey = (typeof NOTIF_ITEMS)[number]["key"];

export function SettingsPanelBlock() {
  // 侧边导航受控值
  const [activeTab, setActiveTab] = useState<NavValue>("profile");

  // 个人资料表单
  const [name, setName] = useState("林晚晴");
  const [email, setEmail] = useState("lin@hulian.com");
  const [phone, setPhone] = useState("138-0000-8888");

  // 通知开关
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    assign: true,
    comment: true,
    status: true,
    weekly: false,
    security: true,
  });

  // 外观偏好
  const [compactMode, setCompactMode] = useState(false);
  const [animEnabled, setAnimEnabled] = useState(true);

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "个人资料已保存", description: `姓名：${name}`, tone: "success" });
    }, 600);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex gap-6">
          {/* 左侧导航：普通按钮列表，受控驱动 Tabs value */}
          <aside className="w-44 shrink-0">
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => setActiveTab(n.value)}
                  className={[
                    "flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === n.value
                      ? "bg-surface-hover text-foreground"
                      : "text-muted hover:bg-surface-hover/60 hover:text-foreground",
                  ].join(" ")}
                >
                  <n.icon className="size-4 shrink-0" />
                  {n.label}
                </button>
              ))}
            </nav>
          </aside>

          <Separator orientation="vertical" className="h-auto" />

          {/* 右侧内容 */}
          <div className="min-w-0 flex-1">
            {/* 个人资料 */}
            <TabsPanel value="profile">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                个人资料
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                修改你的姓名、邮箱及联系方式。
              </Text>

              {/* 头像区 */}
              <div className="mb-5 flex items-center gap-4">
                <Avatar fallback="林" size="xl" />
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: "上传头像", description: "demo 占位，未接真实上传", tone: "neutral" })}
                  >
                    更换头像
                  </Button>
                  <Text tone="muted" size="xs" className="mt-1">
                    PNG / JPG，最大 2MB
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Field label="姓名">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="你的姓名" />
                </Field>
                <Field label="邮箱" description="用于登录与接收通知">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                </Field>
                <Field label="手机号" description="选填">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="138-0000-0000" />
                </Field>
              </div>

              <div className="mt-5 flex gap-2">
                <Button loading={saving} onClick={handleSaveProfile}>
                  保存修改
                </Button>
                <Button variant="outline" onClick={() => { setName("林晚晴"); setEmail("lin@hulian.com"); setPhone("138-0000-8888"); }}>
                  重置
                </Button>
              </div>
            </TabsPanel>

            {/* 通知设置 */}
            <TabsPanel value="notify">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                通知设置
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                选择你希望接收的通知类型，随时可调整。
              </Text>

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

              <Button
                className="mt-5"
                onClick={() => {
                  const on = Object.values(notif).filter(Boolean).length;
                  toast({ title: "通知设置已保存", description: `已开启 ${on}/${NOTIF_ITEMS.length} 项通知`, tone: "success" });
                }}
              >
                保存设置
              </Button>
            </TabsPanel>

            {/* 外观偏好 */}
            <TabsPanel value="appearance">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                外观偏好
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                调整界面紧凑度与动效偏好。
              </Text>

              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">紧凑模式</div>
                    <Text size="sm" tone="muted" className="mt-0.5">
                      缩小间距与字号，显示更多内容
                    </Text>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                    aria-label="紧凑模式"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">过渡动效</div>
                    <Text size="sm" tone="muted" className="mt-0.5">
                      关闭后禁用页面切换与弹窗动画
                    </Text>
                  </div>
                  <Switch
                    checked={animEnabled}
                    onCheckedChange={setAnimEnabled}
                    aria-label="过渡动效"
                  />
                </div>
              </div>

              <Button
                className="mt-5"
                onClick={() =>
                  toast({
                    title: "外观设置已保存",
                    description: `紧凑模式：${compactMode ? "开" : "关"} · 动效：${animEnabled ? "开" : "关"}`,
                    tone: "success",
                  })
                }
              >
                保存偏好
              </Button>
            </TabsPanel>

            {/* 账号安全 */}
            <TabsPanel value="security">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                账号安全
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                定期更换密码，开启两步验证保护账号安全。
              </Text>

              <div className="flex flex-col gap-4">
                <Field label="当前密码">
                  <Input type="password" placeholder="输入当前密码" />
                </Field>
                <Field label="新密码" description="至少 8 位，含大小写字母与数字">
                  <Input type="password" placeholder="输入新密码" />
                </Field>
                <Field label="确认新密码">
                  <Input type="password" placeholder="再次输入新密码" />
                </Field>
              </div>

              <Button
                className="mt-5"
                onClick={() => toast({ title: "密码已更新（demo）", description: "真实场景需接后端校验接口", tone: "success" })}
              >
                更新密码
              </Button>
            </TabsPanel>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
