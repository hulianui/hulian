"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ProfileCard } from "./profile-card";

/** 深色底容器，让全息炫彩与光晕更清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid min-h-[520px] w-full place-items-center overflow-hidden rounded-xl border border-border p-6"
      style={{ background: "oklch(0.16 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const profileCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "name", type: "text", defaultValue: "林屿", label: "姓名" },
    { prop: "title", type: "text", defaultValue: "独立开发者", label: "职位" },
    { prop: "handle", type: "text", defaultValue: "linyu", label: "Handle" },
    { prop: "status", type: "text", defaultValue: "在线", label: "状态" },
    { prop: "enableTilt", type: "boolean", defaultValue: true, label: "倾斜交互" },
    {
      prop: "glowColor",
      type: "select",
      options: [
        "var(--color-chart-1)",
        "var(--color-chart-2)",
        "var(--color-chart-3)",
        "var(--color-chart-4)",
      ],
      defaultValue: "var(--color-chart-1)",
      label: "光晕色",
    },
  ],

  states: [
    {
      name: "default（首字母占位·倾斜开启）",
      render: () => (
        <Stage>
          <ProfileCard name="林屿" title="独立开发者" handle="linyu" />
        </Stage>
      ),
    },
    {
      name: "暖色光晕",
      render: () => (
        <Stage>
          <ProfileCard
            name="苏晚"
            title="产品设计师"
            handle="suwan"
            status="忙碌"
            glowColor="var(--color-chart-3)"
          />
        </Stage>
      ),
    },
    {
      name: "静态（关闭倾斜）",
      render: () => (
        <Stage>
          <ProfileCard
            name="瑚琏"
            title="前端工程师"
            handle="hulianui"
            enableTilt={false}
          />
        </Stage>
      ),
    },
    {
      name: "无信息条",
      render: () => (
        <Stage>
          <ProfileCard
            name="Javi Torres"
            title="Software Engineer"
            showUserInfo={false}
            glowColor="var(--color-chart-2)"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ProfileCard
        name={p.name as string}
        title={p.title as string}
        handle={p.handle as string}
        status={p.status as string}
        enableTilt={p.enableTilt as boolean}
        glowColor={p.glowColor as string}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="grid min-h-[520px] place-items-center rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 265)" }}>`,
      `  <ProfileCard`,
      `    name="${p.name}"`,
      `    title="${p.title}"`,
      `    handle="${p.handle}"`,
      `    status="${p.status}"`,
      `    enableTilt={${p.enableTilt}}`,
      `    glowColor="${p.glowColor}"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
