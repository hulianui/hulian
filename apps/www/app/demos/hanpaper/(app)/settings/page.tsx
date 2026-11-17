"use client";
import { copy } from "./page.content";

import { useMemo, useState, type ReactNode } from "react";
import { Trash2, TriangleAlert, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTrigger,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  Field,
  Heading,
  Input,
  Popconfirm,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  enUS,
  toast,
  useForm,
  zhCN,
} from "@hulianui/ui";
import type { Locale } from "@hulianui/ui";
import { AUTHORS } from "../../_data/papers";
import { usePending } from "../../../lib/async";

const WORKSPACE_NAME = "hanpaper-lab";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORCID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

// ---------- Typesetting ----------

type CaptionLang = "zh" | "en";
/** The Paper `labels` each caption language resolves to, read from the library's own locales. */
type PaperLocale = NonNullable<NonNullable<Locale["components"]>["paper"]>;
const PAPER_LABELS: Record<CaptionLang, PaperLocale | undefined> = {
  zh: zhCN.components?.paper,
  en: enUS.components?.paper,
};
const CAPTION_LANG_ITEMS = [
  { value: "zh", label: copy("captionLangZh") },
  { value: "en", label: copy("captionLangEn") },
];

type SerifFont = "source-han-serif" | "noto-serif" | "georgia" | "system";
const SERIF_FONTS: Record<SerifFont, { label: string; stack: string }> = {
  "source-han-serif": { label: copy("fontSourceHanSerif"), stack: '"Source Han Serif SC", "Noto Serif SC", serif' },
  "noto-serif": { label: copy("fontNotoSerif"), stack: '"Noto Serif", "Noto Serif SC", serif' },
  georgia: { label: copy("fontGeorgia"), stack: 'Georgia, "Times New Roman", serif' },
  system: { label: copy("fontSystem"), stack: "var(--hl-font-serif, serif)" },
};
const FONT_ITEMS = (Object.keys(SERIF_FONTS) as SerifFont[]).map((f) => ({ value: f, label: SERIF_FONTS[f].label }));

// ---------- Export ----------

const SVG_BG_ITEMS = [
  { value: "white", label: copy("svgBgWhite") },
  { value: "transparent", label: copy("svgBgTransparent") },
];
const EXPORT_THEME_ITEMS = [
  { value: "light", label: copy("exportThemeLight") },
  { value: "current", label: copy("exportThemeCurrent") },
];

// ---------- Collaborators ----------

type Role = "owner" | "editor" | "reviewer" | "viewer";
const ROLE_LABEL: Record<Role, string> = {
  owner: copy("roleOwner"),
  editor: copy("roleEditor"),
  reviewer: copy("roleReviewer"),
  viewer: copy("roleViewer"),
};
const ASSIGNABLE_ROLES = (["editor", "reviewer", "viewer"] as const).map((r) => ({ value: r, label: ROLE_LABEL[r] }));

type Member = { id: string; name: string; email: string; role: Role };
const SEED_MEMBERS: Member[] = [
  { id: "lin", name: AUTHORS.lin, email: "lin@hanpaper.dev", role: "owner" },
  { id: "zhou", name: AUTHORS.zhou, email: "zhou@hanpaper.dev", role: "editor" },
  { id: "chen", name: AUTHORS.chen, email: "chen@hanpaper.dev", role: "editor" },
  { id: "he", name: AUTHORS.he, email: "he@hanpaper.dev", role: "reviewer" },
];

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <Text size="xs" tone="muted">
          {description}
        </Text>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">{children}</CardBody>
    </Card>
  );
}

function ProfileTab() {
  const form = useForm({
    initialValues: { name: AUTHORS.lin, email: "lin@hanpaper.dev", affiliation: copy("defaultAffiliation"), orcid: "0000-0002-1825-0097" },
  });
  const name = form.register("name", { rules: [{ required: true, message: copy("nameRequired") }] });
  const email = form.register("email", {
    rules: [
      { required: true, message: copy("emailRequired") },
      { pattern: EMAIL_RE, message: copy("emailInvalid") },
    ],
  });
  const affiliation = form.register("affiliation");
  const orcid = form.register("orcid", { rules: [{ pattern: ORCID_RE, message: copy("orcidInvalid") }] });
  const [saving, run] = usePending();

  return (
    <form
      noValidate
      onSubmit={form.submit(
        () =>
          void run(() => {
            form.markPristine();
            toast({ tone: "success", title: copy("profileSaved") });
          }),
        () => toast({ tone: "danger", title: copy("fixErrors") }),
      )}
    >
      <SectionCard title={copy("profileTitle")} description={copy("profileDescription")}>
        <div className="flex items-center gap-4">
          <Avatar size="xl" fallback={String(name.value).slice(0, 1) || "?"} />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{String(name.value) || copy("unnamed")}</span>
            <Text size="sm" tone="muted">
              {String(affiliation.value)}
            </Text>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={copy("nameLabel")} required={name.required} error={name.error}>
            <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} />
          </Field>
          <Field label={copy("emailLabel")} required={email.required} error={email.error} description={copy("emailHint")}>
            <Input type="email" value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} />
          </Field>
          <Field label={copy("affiliationLabel")} description={copy("affiliationHint")}>
            <Input value={affiliation.value as string} onChange={affiliation.onChange} onBlur={affiliation.onBlur} />
          </Field>
          <Field label={copy("orcidLabel")} error={orcid.error} description={copy("orcidHint")}>
            <Input
              value={orcid.value as string}
              onChange={orcid.onChange}
              onBlur={orcid.onBlur}
              placeholder="0000-0000-0000-0000"
              className="font-mono"
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving} disabled={saving}>
            {copy("saveProfile")}
          </Button>
        </div>
      </SectionCard>
    </form>
  );
}

function TypesettingTab() {
  const [lang, setLang] = useState<CaptionLang>("zh");
  const [font, setFont] = useState<SerifFont>("source-han-serif");
  const [numbering, setNumbering] = useState(true);
  const [saving, run] = usePending();
  const labels = PAPER_LABELS[lang];
  const sectionLabel = labels?.section ? labels.section("2.1") : "2.1";

  return (
    <SectionCard title={copy("typesettingTitle")} description={copy("typesettingDescription")}>
      <Field label={copy("captionLangLabel")} description={copy("captionLangHint")}>
        <Segmented
          items={CAPTION_LANG_ITEMS}
          value={lang}
          onValueChange={(v) => setLang(v as CaptionLang)}
          aria-label={copy("captionLangLabel")}
          className="w-64"
        />
      </Field>
      <Field label={copy("serifFontLabel")} description={copy("serifFontHint")}>
        <Select items={FONT_ITEMS} value={font} onValueChange={(v) => setFont(v as SerifFont)}>
          <SelectTrigger className="w-64" />
          <SelectContent>
            {FONT_ITEMS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal" label={copy("numberingLabel")} description={copy("numberingHint")}>
        <Switch checked={numbering} onCheckedChange={setNumbering} aria-label={copy("numberingLabel")} />
      </Field>

      <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-muted/40 p-4">
        <Text size="xs" tone="muted">
          {copy("previewLabel")}
        </Text>
        <div className="flex flex-col gap-1.5 text-foreground" style={{ fontFamily: SERIF_FONTS[font].stack }}>
          <span className="text-base font-semibold">
            {numbering ? `${sectionLabel}  ${copy("previewSectionTitle")}` : copy("previewSectionTitle")}
          </span>
          <span className="text-sm">
            <span className="font-semibold">
              {labels?.figure} 1{labels?.separator}
            </span>
            {copy("previewCaption")}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          loading={saving}
          disabled={saving}
          onClick={() => void run(() => {
                toast({ tone: "success", title: copy("typesettingSaved") });
              })}
        >
          {copy("saveTypesetting")}
        </Button>
      </div>
    </SectionCard>
  );
}

function ExportTab() {
  const [bg, setBg] = useState("white");
  const [theme, setTheme] = useState("light");
  const [width, setWidth] = useState(80);
  const [saving, run] = usePending();

  return (
    <SectionCard title={copy("exportTitle")} description={copy("exportDescription")}>
      <Field label={copy("svgBgLabel")} description={copy("svgBgHint")}>
        <Segmented items={SVG_BG_ITEMS} value={bg} onValueChange={setBg} aria-label={copy("svgBgLabel")} className="w-64" />
      </Field>
      <Field label={copy("exportThemeLabel")} description={copy("exportThemeHint")}>
        <Segmented
          items={EXPORT_THEME_ITEMS}
          value={theme}
          onValueChange={setTheme}
          aria-label={copy("exportThemeLabel")}
          className="w-64"
        />
      </Field>
      <Field label={copy("figureWidthLabel")} description={copy("figureWidthHint", width)}>
        <Slider
          value={width}
          onValueChange={(v) => setWidth(v as number)}
          min={40}
          max={100}
          step={5}
          showValue
          aria-label={copy("figureWidthLabel")}
          className="w-80"
        />
      </Field>
      <div className="flex justify-end">
        <Button
          loading={saving}
          disabled={saving}
          onClick={() => void run(() => {
                toast({ tone: "success", title: copy("exportSaved") });
              })}
        >
          {copy("saveExport")}
        </Button>
      </div>
    </SectionCard>
  );
}

function CollaboratorsTab() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, run] = usePending();
  const others = useMemo(() => members.filter((m) => m.role !== "owner"), [members]);

  const changeRole = (m: Member, role: Role) => {
    setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, role } : x)));
    toast({ tone: "success", title: copy("roleChanged", m.name, ROLE_LABEL[role]) });
  };
  const removeMember = (m: Member) => {
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
    toast({ tone: "success", title: copy("memberRemoved", m.name) });
  };
  const invite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setInviteError(copy("emailInvalid"));
      return;
    }
    if (members.some((m) => m.email === email)) {
      setInviteError(copy("alreadyMember"));
      return;
    }
    setInviteError(null);
    void run(() => {
      setMembers((prev) => [...prev, { id: email, name: email.split("@")[0], email, role: inviteRole }]);
      setInviteEmail("");
      toast({ tone: "success", title: copy("inviteSent"), description: email });
    });
  };

  return (
    <SectionCard title={copy("collaboratorsTitle")} description={copy("collaboratorsDescription")}>
      <form
        noValidate
        className="flex flex-wrap items-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          invite();
        }}
      >
        <Field label={copy("inviteLabel")} error={inviteError ?? undefined} className="min-w-64 flex-1">
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => {
              setInviteEmail(e.target.value);
              if (inviteError) setInviteError(null);
            }}
            placeholder="name@university.edu"
          />
        </Field>
        <Field label={copy("inviteRoleLabel")}>
          <Select items={ASSIGNABLE_ROLES} value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
            <SelectTrigger className="w-36" />
            <SelectContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit" loading={inviting} disabled={inviting} className="mt-6">
          <UserPlus className="size-4" />
          {copy("sendInvite")}
        </Button>
      </form>

      <ul className="flex flex-col divide-y divide-hairline rounded-[var(--radius)] border border-border">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
            <Avatar size="sm" fallback={m.name.slice(0, 1)} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{m.name}</span>
              <Text size="xs" tone="muted" truncate>
                {m.email}
              </Text>
            </div>
            {m.role === "owner" ? (
              <Tag size="sm" tone="brand">
                {copy("ownerYou")}
              </Tag>
            ) : (
              <>
                <Select items={ASSIGNABLE_ROLES} value={m.role} onValueChange={(v) => changeRole(m, v as Role)}>
                  <SelectTrigger size="sm" className="w-32" aria-label={copy("roleOf", m.name)} />
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Two overlays on one button: Tooltip root outside, Popconfirm in the trigger chain. */}
                <Tooltip>
                  <Popconfirm
                    danger
                    title={copy("removeConfirmTitle", m.name)}
                    description={copy("removeConfirmBody")}
                    okText={copy("removeOk")}
                    onConfirm={() => removeMember(m)}
                  >
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="sm" tone="danger" className="size-8 px-0" aria-label={copy("removeMember")}>
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  </Popconfirm>
                  <TooltipContent>{copy("removeMember")}</TooltipContent>
                </Tooltip>
              </>
            )}
          </li>
        ))}
      </ul>
      {others.length === 0 && (
        <Empty size="sm" title={copy("noCollaboratorsTitle")} description={copy("noCollaboratorsBody")} />
      )}
    </SectionCard>
  );
}

function DangerZone() {
  const [typed, setTyped] = useState("");
  const [deleting, run] = usePending();
  const [open, setOpen] = useState(false);
  const matches = typed === WORKSPACE_NAME;

  return (
    <Card className="border-danger/40">
      <CardHeader className="text-sm font-medium text-danger">{copy("dangerZone")}</CardHeader>
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-foreground">{copy("deleteWorkspace")}</div>
          <Text size="sm" tone="muted">
            {copy("deleteWorkspaceBody")}
          </Text>
        </div>
        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            if (deleting) return;
            setOpen(next);
            if (!next) setTyped("");
          }}
        >
          <AlertDialogTrigger
            render={
              <Button tone="danger">
                <Trash2 className="size-4" />
                {copy("deleteWorkspace")}
              </Button>
            }
          />
          <AlertDialogContent
            icon={<TriangleAlert className="size-5 text-danger" />}
            title={copy("deleteWorkspaceTitle")}
            description={copy("deleteWorkspaceConfirmBody", WORKSPACE_NAME)}
            body={
              <Field label={copy("typeToConfirm", WORKSPACE_NAME)}>
                <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={WORKSPACE_NAME} className="font-mono" />
              </Field>
            }
          >
            <AlertDialogClose render={<Button variant="outline" size="sm" disabled={deleting}>{copy("cancel")}</Button>} />
            <Button
              tone="danger"
              size="sm"
              disabled={!matches || deleting}
              loading={deleting}
              onClick={() =>
                void run(() => {
                  setOpen(false);
                  setTyped("");
                  toast({ tone: "danger", title: copy("workspaceDeleted"), description: WORKSPACE_NAME });
                })
              }
            >
              {copy("deletePermanently")}
            </Button>
          </AlertDialogContent>
        </AlertDialog>
      </CardBody>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Heading level={1} size="xl">
          {copy("pageTitle")}
        </Heading>
        <Text size="sm" tone="muted">
          {copy("pageDescription")}
        </Text>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTab value="profile">{copy("tabProfile")}</TabsTab>
          <TabsTab value="typesetting">{copy("tabTypesetting")}</TabsTab>
          <TabsTab value="export">{copy("tabExport")}</TabsTab>
          <TabsTab value="collaborators">{copy("tabCollaborators")}</TabsTab>
        </TabsList>
        <TabsPanel value="profile" className="pt-4">
          <ProfileTab />
        </TabsPanel>
        <TabsPanel value="typesetting" className="pt-4">
          <TypesettingTab />
        </TabsPanel>
        <TabsPanel value="export" className="pt-4">
          <ExportTab />
        </TabsPanel>
        <TabsPanel value="collaborators" className="pt-4">
          <CollaboratorsTab />
        </TabsPanel>
      </Tabs>

      <DangerZone />
    </div>
  );
}
