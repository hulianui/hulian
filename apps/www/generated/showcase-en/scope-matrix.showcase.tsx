"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScopeMatrix } from "../../../../packages/ui/src/scope-matrix/scope-matrix";
const SUGGESTIONS = [
    "src/**",
    "docs/**",
    "**/node_modules/**",
    "**/*.test.ts",
    "packages/ui/**",
    "**/dist/**",
];
function EditableDemo({ initialAllow = ["src/**"], initialDeny = ["**/node_modules/**"], validate, }: {
    initialAllow?: string[];
    initialDeny?: string[];
    validate?: (p: string) => string | null;
}) {
    const [value, setValue] = useState({ allow: initialAllow, deny: initialDeny });
    return (<ScopeMatrix allow={value.allow} deny={value.deny} onChange={setValue} suggestions={SUGGESTIONS} {...(validate ? { validate } : {})}/>);
}
export const scopeMatrixShowcase: ShowcaseSpec = {
    controls: [
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
        { prop: "withSuggestions", type: "boolean", defaultValue: true, label: "Show candidates" },
    ],
    states: [
        { name: "Editable", render: () => <EditableDemo /> },
        { name: "Read only", render: () => <ScopeMatrix allow={["src/**"]} deny={["**/dist/**"]}/> },
        { name: "Empty", render: () => <EditableDemo initialAllow={[]} initialDeny={[]}/> },
        {
            name: "Ban only (whitelist not enabled)",
            render: () => <ScopeMatrix allow={[]} deny={["**/secrets/**", "**/*.pem"]}/>,
        },
    ],
    examples: [
        {
            title: "Task scope configuration",
            description: "Two semantically opposed buckets. The summary at the bottom will write down the \"final effective range\" in human terms - the most common mistakes in this type of configuration are the blank list and priority.",
            code: `<ScopeMatrix
  allow={scope.allow}
  deny={scope.deny}
  onChange={setScope}
  suggestions={derivedFromProject}
/>`,
            render: () => <EditableDemo />,
        },
        {
            title: "With syntax check",
            description: "The component does not have built-in pattern syntax checking - glob / Regular / ant The style is very different, and guessing wrong is worse than not guessing at all. If needed, please send validate.",
            code: `<ScopeMatrix
  allow={allow}
  deny={deny}
  onChange={onChange}
  validate={(p) => (p.startsWith("/") ? "Please use relative mode, not absolute path" : null)}
/>`,
            render: () => (<EditableDemo initialAllow={[]} initialDeny={[]} validate={(p) => (p.startsWith("/") ? "Please use relative mode, not absolute path" : null)}/>),
        },
        {
            title: "Read-only review",
            description: "If onChange is not given, it is read-only and is used for audit view or historical configuration review.",
            code: `<ScopeMatrix allow={record.allow} deny={record.deny} />`,
            render: () => (<ScopeMatrix allow={["packages/ui/**", "docs/**"]} deny={["**/dist/**", "**/node_modules/**"]}/>),
        },
    ],
    renderWithProps: (p) => (<ScopeMatrix allow={["src/**"]} deny={["**/node_modules/**"]} onChange={() => { }} readOnly={p.readOnly as boolean} suggestions={p.withSuggestions ? SUGGESTIONS : []}/>),
    toCode: (p) => `<ScopeMatrix
  allow={scope.allow}
  deny={scope.deny}
  onChange={setScope}${p.withSuggestions ? "\n  suggestions={derivedFromProject}" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
