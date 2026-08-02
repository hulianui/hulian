"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GitCommit } from "../../../../packages/ui/src/git-commit/git-commit";
function Avatar({ children }: {
    children: string;
}) {
    return (<span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
      {children}
    </span>);
}
function Row({ children }: {
    children: React.ReactNode;
}) {
    return <div className="border-b border-border py-2.5 last:border-0">{children}</div>;
}
export const gitCommitShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Branch chip + short hash + commit message, inline single line typesetting.",
            code: `<GitCommit
  branch="master"
  sha="10577b9aaaa"
  message="fix(www): ai-chat deployment station is not responding"
/>`,
            render: () => (<div className="w-[30rem] max-w-full">
          <GitCommit sha="10577b9aaaa" branch="master" message="fix(www): ai-chat deployment station does not respond"/>
        </div>),
        },
        {
            title: "Two-line typesetting",
            description: "layout=\"stacked\" The information is at the top and the reference is at the bottom. Table/list cells are just needed.",
            code: `<GitCommit
  layout="stacked"
  branch="master"
  sha="36e347faaa"
  message="feat(www): Global routing progress bar"
  author="Hulian"
  avatar={<Avatar>hu</Avatar>}
/>`,
            render: () => (<div className="w-[26rem] max-w-full">
          <GitCommit layout="stacked" sha="36e347faaa" branch="master" message="feat(www): Global routing progress bar" author="Hulian" avatar={<Avatar>Hu</Avatar>}/>
        </div>),
        },
        {
            title: "Clickable short hash",
            description: "Pass href to make the short hash jump to commit details, shaLength controls the number of bits.",
            code: `<>
  <GitCommit branch="release" sha="cb2ae42ddd0099" href="#cb2ae42" message="chore(release): @hulianui/ui@0.1.2" />
  <GitCommit branch="hotfix" sha="f79cbb812345" shaLength={12} message="Hair Border token" />
</>`,
            render: () => (<div className="flex flex-col gap-2.5">
          <GitCommit sha="cb2ae42ddd0099" branch="release" href="https://example.com/#cb2ae42" message="chore(release): @hulianui/ui@0.1.2"/>
          <GitCommit sha="f79cbb812345" shaLength={12} branch="hotfix" message="Hair border token"/>
        </div>),
        },
        {
            title: "Small size \u00B7 Quote only",
            description: "size=\"sm\" Compact; omitting message only renders the branch + hash reference.",
            code: `<>
  <GitCommit size="sm" branch="master" sha="10577b9000" author="Hulian" avatar={<Avatar>Hu</Avatar>} />
  <GitCommit size="sm" branch="feat/x" sha="abcdef0123" />
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <GitCommit size="sm" sha="10577b9000" branch="master" author="Hulian" avatar={<Avatar>Hu</Avatar>}/>
          <GitCommit size="sm" sha="abcdef0123" branch="feat/x"/>
        </div>),
        },
    ],
    controls: [
        { prop: "layout", type: "select", options: ["inline", "stacked"], defaultValue: "inline" },
        { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
    ],
    states: [
        {
            name: "inline single line",
            render: () => (<div className="w-[30rem] max-w-full">
          <Row>
            <GitCommit sha="10577b9aaaa" branch="master" message="fix(www,mocks): ai-chat deployment station does not respond"/>
          </Row>
          <Row>
            <GitCommit sha="33434b9bbbb" branch="feat/loading" message="feat(www): Add loading skeleton to component page"/>
          </Row>
        </div>),
        },
        {
            name: "stacked Two rows (table/list cells)",
            render: () => (<div className="w-[26rem] max-w-full">
          <Row>
            <GitCommit layout="stacked" sha="36e347faaa" branch="master" message="feat(www): Global routing progress bar, fix App Router navigation zero feedback" author="Hulian" avatar={<Avatar>Hu</Avatar>}/>
          </Row>
          <Row>
            <GitCommit layout="stacked" sha="24fa7bbccc" branch="docs/readme" message="docs (readme): Add &quot;Release (Maintainer)&quot; chapter" author="Lin Yu" avatar={<Avatar>Lin</Avatar>}/>
          </Row>
        </div>),
        },
        {
            name: "Clickable short hash + custom number of digits",
            render: () => (<div className="flex flex-col gap-2.5">
          <GitCommit sha="cb2ae42ddd0099" branch="release" href="https://example.com/#cb2ae42" message="chore(release): @hulianui/ui@0.1.2"/>
          <GitCommit sha="f79cbb812345" shaLength={12} branch="hotfix" message="Hair border token"/>
        </div>),
        },
        {
            name: "Small size \u00B7 Quote only (no message)",
            render: () => (<div className="flex flex-col gap-2">
          <GitCommit size="sm" sha="10577b9000" branch="master" author="Hulian" avatar={<Avatar>Hu</Avatar>}/>
          <GitCommit size="sm" sha="abcdef0123" branch="feat/x"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-80 max-w-full">
      <GitCommit sha="10577b9aaaa" branch="master" message="fix(www): ai-chat deployment station does not respond" author="Hulian" avatar={<Avatar>Hu</Avatar>} layout={(p.layout as "inline" | "stacked") ?? "inline"} size={(p.size as "md" | "sm") ?? "md"}/>
    </div>),
    toCode: (p) => `<GitCommit
  branch="master"
  sha={deploy.sha}
  message={deploy.message}${p.layout === "stacked" ? "\n  layout=\"stacked\"" : ""}${p.size === "sm" ? "\n  size=\"sm\"" : ""}
/>`,
};
