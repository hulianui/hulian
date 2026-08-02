"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { File } from "../../../../packages/ui/src/_icons";
import { Artifact } from "../../../../packages/ui/src/artifact/artifact";
const LONG_BODY = (<div className="space-y-3 text-sm text-foreground">
    <p className="font-medium">To Yunqi Technology · Apply for President's Personal Secretary</p>
    <p>
      Five years of experience in administration and cross-department coordination. He has independently supported the CEO office in 200+ meetings and travel arrangements throughout the year.
      Good at maintaining order and priority in an environment with extremely high information density.
    </p>
    <p>
      Established an automatic detection process for executive schedule conflicts during the previous company, reducing the schedule rework rate by 60%;
      Lead the arrangement and confidential circulation of annual board of directors materials, delivering them without errors for three years.
    </p>
    <p>
      I know that your company is in a period of parallel expansion of multiple product lines. The president's office needs more than just execution.
      It's more about predicting and knowing the truth. I would like to use a two-week trial to prove the above judgment.
    </p>
  </div>);
const Demo = () => (<div className="w-full max-w-md">
    <Artifact title="Resume Draft · Lin Wanqing" icon={<File className="size-4"/>} version="v2" actions={<Button size="sm" variant="ghost">
          Export
        </Button>}>
      {LONG_BODY}
    </Artifact>
  </div>);
export const artifactShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "With title/icon/version chip/operation area, long content is folded by default (height limit + fade + expand button).",
            code: `<Artifact
  title="Draft resume \u00B7 Lin Wanqing"
  icon={<File className="size-4" />}
  version="v2"
  actions={<Button size="sm" variant="ghost">Export</Button>}
>
  {body}
</Artifact>`,
            render: () => (<div className="w-full max-w-md">
          <Artifact title="Resume Draft · Lin Wanqing" icon={<File className="size-4"/>} version="v2" actions={<Button size="sm" variant="ghost">
                Export
              </Button>}>
            {LONG_BODY}
          </Artifact>
        </div>),
        },
        {
            title: "Expand by default",
            description: "defaultExpanded Let the full text be spread out at the beginning of the output.",
            code: `<Artifact title="Draft resume" version="v1" defaultExpanded>
  {body}
</Artifact>`,
            render: () => (<div className="w-full max-w-md">
          <Artifact title="Resume Draft" version="v1" defaultExpanded>
            {LONG_BODY}
          </Artifact>
        </div>),
        },
        {
            title: "Not foldable",
            description: "collapsedHeight={0} Close folding, suitable for short output.",
            code: `<Artifact title="Short output" collapsedHeight={0}>
  <p className="text-sm">A short piece of content that does not require folding. </p>
</Artifact>`,
            render: () => (<div className="w-full max-w-md">
          <Artifact title="Short output" collapsedHeight={0}>
            <p className="text-sm">A brief piece of content that does not require folding.</p>
          </Artifact>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Folded state (height limit + fade + expand button)", render: () => <Demo /> },
        {
            name: "Expand by default",
            render: () => (<div className="w-full max-w-md">
          <Artifact title="Resume Draft" version="v1" defaultExpanded>
            {LONG_BODY}
          </Artifact>
        </div>),
        },
        {
            name: "Not foldable (collapsedHeight=0)",
            render: () => (<div className="w-full max-w-md">
          <Artifact title="Short output" collapsedHeight={0}>
            <p className="text-sm">A brief piece of content that does not require folding.</p>
          </Artifact>
        </div>),
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<Artifact title="Draft Resume" version="v2" actions={<Button>Export</Button>}>...</Artifact>`,
};
