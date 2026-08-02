"use client";
import { Brand } from "../../../../packages/ui/src/brand/brand";
import { LoginForm } from "../../../../packages/ui/src/login-form/login-form";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AuthPanel } from "../../../../packages/ui/src/auth-panel/auth-panel";
const HIGHLIGHTS = ["Start for free, and the computing power will automatically return to zero when you are free.", "From git push to global edge online", "End-to-end observable, fault location in seconds"];
const BOX = "h-80 overflow-hidden rounded-[var(--radius)] border border-border";
export const authPanelShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Split screen login page",
            description: "The left panel + right form is the standard layout for login/registration/password retrieval. The right half is equipped with LoginForm surface={false} - the visual weight is already borne by the left panel, and adding another card is the card within the card.",
            code: `<div className="grid md:grid-cols-2">
  <AuthPanel
    brand={<Brand name="Hanyun" description="Global Edge Computing" />}
    title="Sending ideas to the edge of the world"
    description="Create an account in five minutes and start your first project. No credit card required."
    highlights={["Start for free, computing power will automatically return to zero when idle", "From git push to global edge online"]}
  />
  <div className="grid place-items-center p-8">
    <LoginForm surface={false} />
  </div>
</div>`,
            render: () => (<div className={`grid md:grid-cols-2 ${BOX}`}>
          <AuthPanel brand={<Brand name="Hanyun" description="Global Edge Computing"/>} title="Taking ideas to the edge of the world" description="Create an account and start your first project in five minutes." highlights={HIGHLIGHTS.slice(0, 2)}/>
          <div className="hidden place-items-center overflow-auto p-6 md:grid">
            <LoginForm surface={false} showRemember={false}/>
          </div>
        </div>),
        },
        {
            title: "Background recipe",
            description: "The three levels are all written in the component with token color mixing (use --color-bg as base, and dark colors will follow automatically). The Tailwind tool class cannot provide radial-gradient with color-mix, and guard prohibits consumers from transmitting style to the library - this is the reason for the existence of this component.",
            code: `<>
  <AuthPanel gradient="radial" title="radial" />
  <AuthPanel gradient="linear" title="linear" />
  <AuthPanel gradient="mesh"   title="mesh" />
  <AuthPanel gradient="none"   title="none" />
</>`,
            render: () => (<div className="grid gap-3 sm:grid-cols-2">
          {(["radial", "linear", "mesh", "none"] as const).map((g) => (<div key={g} className="h-40 overflow-hidden rounded-[var(--radius)] border border-border">
              <AuthPanel gradient={g} title={g} description="Use --color-bg as base, dark colors will follow automatically"/>
            </div>))}
        </div>),
        },
        {
            title: "Brand Color",
            description: "color goes to resolveTone, which is the same path as Brand.color / Dot.color / ChartSeries.color: semantic color name, any CSS color or variable can be received. The gradient changes color along with the check mark.",
            code: `<AuthPanel color="chart-2" title="Change brand color" highlights={["Gradient follows with check mark"]} />`,
            render: () => (<div className="grid gap-3 sm:grid-cols-2">
          <div className={`h-52 overflow-hidden rounded-[var(--radius)] border border-border`}>
            <AuthPanel color="chart-2" gradient="mesh" title="chart-2" highlights={["Gradient follows along with check mark"]}/>
          </div>
          <div className={`h-52 overflow-hidden rounded-[var(--radius)] border border-border`}>
            <AuthPanel color="success" gradient="mesh" title="success" highlights={["Semantic color names are parsed as usual"]}/>
          </div>
        </div>),
        },
        {
            title: "Bottom area",
            description: "footer is affixed to the bottom of the panel (Registration Number/Copyright/Secondary Links), with the top content aligned to both ends of it.",
            code: `<AuthPanel
  brand={<Brand name="Hanyun" />}
  title="Welcome back"
  footer="\u00A9 2026 Hanyun \u00B7 Beijing ICP No. 000000"
/>`,
            render: () => (<div className={BOX}>
          <AuthPanel brand={<Brand name="Hanyun"/>} title="Welcome back" description="Log in to continue" footer="© 2026 Hanyun · Beijing ICP No. 000000"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "gradient",
            type: "select",
            options: ["radial", "linear", "mesh", "none"],
            defaultValue: "radial",
            label: "Background recipe",
        },
        {
            prop: "color",
            type: "select",
            options: ["primary", "success", "warning", "danger", "chart-2", "chart-4"],
            defaultValue: "primary",
            label: "Brand Color",
        },
        { prop: "title", type: "text", defaultValue: "Taking ideas to the edge of the world" },
        { prop: "description", type: "text", defaultValue: "Create an account and start your first project in five minutes." },
    ],
    states: [
        {
            name: "radial (default)",
            render: () => (<div className="h-40 w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <AuthPanel title="Welcome back" description="Log in to continue"/>
        </div>),
        },
        {
            name: "mesh + Selling Points",
            render: () => (<div className="h-40 w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <AuthPanel gradient="mesh" title="Get started" highlights={["Start for free"]}/>
        </div>),
        },
        {
            name: "none (for self-stacked patterns)",
            render: () => (<div className="h-40 w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <AuthPanel gradient="none" title="Pure bottom"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="h-60 w-full overflow-hidden rounded-[var(--radius)] border border-border">
      <AuthPanel brand={<Brand name="Hanyun"/>} gradient={p.gradient as "radial" | "linear" | "mesh" | "none"} color={p.color as string} title={p.title as string} description={p.description as string} highlights={HIGHLIGHTS.slice(0, 2)}/>
    </div>),
    toCode: (p) => `<AuthPanel
  gradient="${p.gradient}"
  color="${p.color}"
  title="${p.title}"
  description="${p.description}"
/>`,
};
