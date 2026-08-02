"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { InterceptCard } from "../../../../packages/ui/src/intercept-card/intercept-card";
import type { InterceptSeverity } from "../../../../packages/ui/src/intercept-card/intercept-card.types";
const blocked = {
    severity: "block" as const,
    title: "Upper limit of parallel subtasks",
    message: "A maximum of 2 parallel subtasks are allowed in the same session (\u2265 3 is considered excessive splitting)",
    source: "Team Agreement \u00B7 Hard Constraint 4",
    violation: "This is the third sub-task: \"Sort out the historical root causes\"",
    suggestion: "Let the first two run out before sending them out; or combine the three things into a clearer task.",
};
const confirmed = {
    severity: "confirm" as const,
    title: "Confirmation is required when writing meta-products",
    message: "Don't take the initiative to write meta-products such as \"pit trampling records/candidate marks/drift explanations\" (will be written after users ask)",
    source: "Team Agreement \u00B7 Hard Constraint 5",
    violation: "~/.config/notes/skills/xxx/NOTE.md",
    suggestion: "Confirm that this is the output explicitly requested by the user before releasing it.",
};
const noticed = {
    severity: "notice" as const,
    title: "Style patch reminder",
    message: "The UI of this project should all be carried by the design system components to avoid partial overwriting",
    source: "Engineering Specifications \u00B7 \u00A77.1",
    violation: "apps/console/src/app/custom.css",
};
function OverrideDemo() {
    const [done, setDone] = useState<{
        reason: string;
        at: string;
    } | null>(null);
    return (<InterceptCard {...blocked} onOverride={async (reason) => {
            await new Promise((r) => setTimeout(r, 500));
            setDone({ reason, at: new Date().toTimeString().slice(0, 5) });
        }} {...(done != null ? { overridden: done } : {})}/>);
}
export const interceptCardShowcase: ShowcaseSpec = {
    controls: [
        {
            prop: "severity",
            type: "select",
            options: ["block", "confirm", "notice"],
            defaultValue: "block",
            label: "Strength",
        },
        { prop: "withOverride", type: "boolean", defaultValue: true, label: "Can be released" },
    ],
    states: [
        { name: "Intercepted block", render: () => <InterceptCard {...blocked}/> },
        { name: "To be confirmed confirm", render: () => <InterceptCard {...confirmed}/> },
        { name: "Reminder notice", render: () => <InterceptCard {...noticed}/> },
        {
            name: "Released",
            render: () => (<InterceptCard {...blocked} overridden={{ reason: "I really need a third one this time", at: "09:13" }}/>),
        },
    ],
    examples: [
        {
            title: "Complete interception account",
            description: "What is the rule \u00B7 Where is the source \u00B7 Where is the violation \u00B7 How to change it. Only when these four things are in place will users follow it instead of turning it off.",
            code: `<InterceptCard
  severity="block"
  title="Parallel subtask upper limit"
  message="Maximum of 2 parallel subtasks allowed in the same session"
  source="Team Agreement \u00B7 Hard Constraint 4"
  violation="This is the 3rd subtask"
  suggestion="Let the first two finish running before sending them out"
/>`,
            render: () => <InterceptCard {...blocked}/>,
        },
        {
            title: "With release entrance (reason required)",
            description: "Point release will not take effect directly. The reason must be written first. The confirmation button is disabled when the reason is empty - releasing without a reason equals no management.",
            code: `<InterceptCard
  {...rule}
  onOverride={async (reason) => {
    await api.override(event.id, reason);
  }}
/>`,
            render: () => <OverrideDemo />,
        },
        {
            title: "Three levels of intensity tied",
            description: "The left edge color bar is the only visual anchor for severity. Do not dye the entire card - when the card appears in a row, the entire card will become a color block.",
            code: `<InterceptCard severity="block" ... />
<InterceptCard severity="confirm" ... />
<InterceptCard severity="notice" ... />`,
            render: () => (<div className="flex flex-col gap-3">
          <InterceptCard {...blocked}/>
          <InterceptCard {...confirmed}/>
          <InterceptCard {...noticed}/>
        </div>),
        },
    ],
    renderWithProps: (p) => {
        const sev = (p.severity as InterceptSeverity) ?? "block";
        const src = sev === "confirm" ? confirmed : sev === "notice" ? noticed : blocked;
        return (<InterceptCard {...src} severity={sev} {...(p.withOverride ? { onOverride: () => { } } : {})}/>);
    },
    toCode: (p) => `<InterceptCard
  severity="${(p.severity as string) ?? "block"}"
  title="Parallel subtask upper limit"
  message="Maximum of 2 parallel subtasks allowed in the same session"
  source="Team Agreement \u00B7 Hard Constraint 4"
  violation="This is the 3rd subtask"${p.withOverride ? "\n  onOverride={(reason) => api.override(id, reason)}" : ""}
/>`,
};
