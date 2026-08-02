"use client";
import { useState } from "react";
import { Avatar, Button, Field, Heading, Input, Separator, Switch, Tabs, TabsPanel, Text, toast, } from "@hulianui/ui";
import { Bell, Lock, Palette, User } from "lucide-react";
const NAV_ITEMS = [
    { value: "profile", label: "Profile", icon: User },
    { value: "notify", label: "Notification settings", icon: Bell },
    { value: "appearance", label: "Appearance", icon: Palette },
    { value: "security", label: "Account security", icon: Lock },
] as const;
type NavValue = (typeof NAV_ITEMS)[number]["value"];
const NOTIF_ITEMS = [
    { key: "assign", title: "New task assignment notification", desc: "Notify me in the app and by email when a task is assigned to me" },
    { key: "comment", title: "Comments and @mentions", desc: "Alert when someone comments on my work item or @me" },
    { key: "status", title: "Status change notification", desc: "Notify me when one of my tickets changes status" },
    { key: "weekly", title: "Weekly digest", desc: "Send a summary of last week's activity every Monday morning" },
    { key: "security", title: "Account security alert", desc: "Real-time reminders of security events such as remote login and password changes" },
] as const;
type NotifKey = (typeof NOTIF_ITEMS)[number]["key"];
export function SettingsPanelBlock() {
    const [activeTab, setActiveTab] = useState<NavValue>("profile");
    const [name, setName] = useState("Lin Wanqing");
    const [email, setEmail] = useState("lin@hulian.com");
    const [phone, setPhone] = useState("138-0000-8888");
    const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
        assign: true,
        comment: true,
        status: true,
        weekly: false,
        security: true,
    });
    const [compactMode, setCompactMode] = useState(false);
    const [animEnabled, setAnimEnabled] = useState(true);
    const [saving, setSaving] = useState(false);
    const handleSaveProfile = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast({ title: "Profile saved", description: `Name: ${name}`, tone: "success" });
        }, 600);
    };
    return (<div className="mx-auto w-full max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex gap-6">

          <aside className="w-44 shrink-0">
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((n) => (<button key={n.value} type="button" onClick={() => setActiveTab(n.value)} className={[
                "flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
                activeTab === n.value
                    ? "bg-surface-hover text-foreground" : "text-muted hover:bg-surface-hover/60 hover:text-foreground",
            ].join(" ")}>
                  <n.icon className="size-4 shrink-0"/>
                  {n.label}
                </button>))}
            </nav>
          </aside>

          <Separator orientation="vertical" className="h-auto"/>


          <div className="min-w-0 flex-1">

            <TabsPanel value="profile">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                Profile
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                Update your name, email address, and contact details.
              </Text>


              <div className="mb-5 flex items-center gap-4">
                <Avatar fallback="Lin" size="xl"/>
                <div>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Upload avatar", description: "Demo placeholder; file upload is not connected", tone: "neutral" })}>
                    Change avatar
                  </Button>
                  <Text tone="muted" size="xs" className="mt-1">
                    PNG/JPG, max 2MB
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Field label="name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name"/>
                </Field>
                <Field label="Email" description="Used for sign-in and notifications">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"/>
                </Field>
                <Field label="Mobile phone number" description="Optional">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="138-0000-0000"/>
                </Field>
              </div>

              <div className="mt-5 flex gap-2">
                <Button loading={saving} onClick={handleSaveProfile}>
                  Save changes
                </Button>
                <Button variant="outline" onClick={() => { setName("Lin Wanqing"); setEmail("lin@hulian.com"); setPhone("138-0000-8888"); }}>
                  Reset
                </Button>
              </div>
            </TabsPanel>


            <TabsPanel value="notify">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                Notification settings
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                Choose which notifications to receive. You can change these settings anytime.
              </Text>

              <div className="flex flex-col divide-y divide-border">
                {NOTIF_ITEMS.map((n) => (<div key={n.key} className="flex items-center justify-between py-4">
                    <div className="pr-6">
                      <div className="text-sm font-medium">{n.title}</div>
                      <Text size="sm" tone="muted" className="mt-0.5">
                        {n.desc}
                      </Text>
                    </div>
                    <Switch checked={notif[n.key]} onCheckedChange={(c) => setNotif((s) => ({ ...s, [n.key]: c }))} aria-label={n.title}/>
                  </div>))}
              </div>

              <Button className="mt-5" onClick={() => {
            const on = Object.values(notif).filter(Boolean).length;
            toast({ title: "Notification settings saved", description: `On ${on}/${NOTIF_ITEMS.length} notifications`, tone: "success" });
        }}>
                Save settings
              </Button>
            </TabsPanel>


            <TabsPanel value="appearance">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                Appearance
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                Adjust interface compactness and animation preferences.
              </Text>

              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">compact mode</div>
                    <Text size="sm" tone="muted" className="mt-0.5">
                      Reduce spacing and font size to display more content
                    </Text>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} aria-label="compact mode"/>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Transition animation</div>
                    <Text size="sm" tone="muted" className="mt-0.5">
                      When off, disable page transitions and dialog animations
                    </Text>
                  </div>
                  <Switch checked={animEnabled} onCheckedChange={setAnimEnabled} aria-label="Transition animation"/>
                </div>
              </div>

              <Button className="mt-5" onClick={() => toast({
            title: "Appearance settings saved",
            description: `Compact mode: ${compactMode ? "On" : "Off"} \u00B7 Animation: ${animEnabled ? "On" : "Off"}`,
            tone: "success",
        })}>
                Save preferences
              </Button>
            </TabsPanel>


            <TabsPanel value="security">
              <Heading level={2} size="lg" weight="semibold" className="mb-1">
                Account security
              </Heading>
              <Text tone="muted" size="sm" className="mb-5">
                Change your password regularly and enable two-step verification to protect your account.
              </Text>

              <div className="flex flex-col gap-4">
                <Field label="Current password">
                  <Input type="password" placeholder="Enter current password"/>
                </Field>
                <Field label="new password" description="At least 8 characters, including uppercase and lowercase letters and numbers">
                  <Input type="password" placeholder="Enter new password"/>
                </Field>
                <Field label="Confirm new password">
                  <Input type="password" placeholder="Enter new password again"/>
                </Field>
              </div>

              <Button className="mt-5" onClick={() => toast({ title: "Password updated (demo)", description: "Connect a server-side validation endpoint in production", tone: "success" })}>
                Update password
              </Button>
            </TabsPanel>
          </div>
        </div>
      </Tabs>
    </div>);
}
