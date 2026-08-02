"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Alert } from "../../../../packages/ui/src/alert/alert";
import { Button } from "../../../../packages/ui/src/button";
import { Spinner } from "../../../../packages/ui/src/spinner";
const InfoIcon = (<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
  </svg>);
const SuccessIcon = (<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd"/>
  </svg>);
const WarningIcon = (<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
  </svg>);
const DangerIcon = (<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
  </svg>);
type Tone = "neutral" | "info" | "success" | "warning" | "danger";
const iconByTone: Record<Tone, ReactNode> = {
    neutral: InfoIcon,
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    danger: DangerIcon,
};
export const alertShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Five tone",
            description: "tone offers neutral / info / success / warning / danger with icon slot.",
            code: `<>
  <Alert tone="info" icon={<InfoIcon />} title="Information Tip">This is a general information tip. </Alert>
  <Alert tone="success" icon={<SuccessIcon />} title="Operation successful">Personal information has been saved. </Alert>
  <Alert tone="warning" icon={<WarningIcon />} title="Planned maintenance">Service will be maintained on Sunday. </Alert>
  <Alert tone="danger" icon={<DangerIcon />} title="Unable to connect to the server">Please try again later. </Alert>
</>`,
            render: () => (<div className="flex w-96 flex-col gap-3">
          <Alert tone="info" icon={InfoIcon} title="Information prompt">
            This is a general information prompt.
          </Alert>
          <Alert tone="success" icon={SuccessIcon} title="Action completed">
            Profile has been saved.
          </Alert>
          <Alert tone="warning" icon={WarningIcon} title="Planned maintenance">
            The service will be under maintenance on Sunday.
          </Alert>
          <Alert tone="danger" icon={DangerIcon} title="Unable to connect to the server">
            Please try again later.
          </Alert>
        </div>),
        },
        {
            title: "With action button",
            description: "action slots the operation buttons on the right side, side by side with the text.",
            code: `<Alert tone="info" icon={<InfoIcon />} title="Update available" action={<Button size="sm">Refresh</Button>}>
  There is a new version of the app, please refresh to get the latest features.
</Alert>`,
            render: () => (<Alert tone="info" icon={InfoIcon} title="Update available" action={<Button size="sm">Refresh</Button>} className="w-96">
          There is a new version of the app, please refresh to get the latest features.
        </Alert>),
        },
        {
            title: "Dismissible",
            description: "Pass onClose Renders the close button in the upper right corner, blanking is controlled by the caller.",
            code: `<Alert tone="success" icon={<SuccessIcon />} title="Personal information updated successfully" onClose={() => setShow(false)} />`,
            render: () => (<Alert tone="success" icon={SuccessIcon} title="Personal information updated successfully" onClose={() => { }} className="w-96"/>),
        },
        {
            title: "Loading state",
            description: "icon slot Spinner, expressing an ongoing asynchronous operation.",
            code: `<Alert tone="info" icon={<Spinner size="sm" />} title="Processing your request">
  Synchronizing data, please wait...
</Alert>`,
            render: () => (<Alert tone="info" icon={<Spinner size="sm"/>} title="Processing your request" className="w-96">
          Synchronizing data, please wait...
        </Alert>),
        },
        {
            title: "Stroke variant",
            description: "variant=\"outline\" Delimited by a transparent bottom border.",
            code: `<Alert variant="outline" tone="warning" icon={<WarningIcon />} title="Stroke Warning">
  The transparent bottom is demarcated by the border.
</Alert>`,
            render: () => (<Alert variant="outline" tone="warning" icon={WarningIcon} title="Stroke warning" className="w-96">
          The transparent bottom is demarcated by the border.
        </Alert>),
        },
    ],
    controls: [
        { prop: "tone", type: "select", options: ["neutral", "info", "success", "warning", "danger"], defaultValue: "info" },
        { prop: "variant", type: "select", options: ["soft", "outline"], defaultValue: "soft" },
        { prop: "title", type: "text", defaultValue: "Prompt title", label: "Title" },
        { prop: "description", type: "text", defaultValue: "This is a prompt message.", label: "Text" },
        { prop: "withIcon", type: "boolean", defaultValue: true, label: "Show icon" },
        { prop: "withAction", type: "boolean", defaultValue: false, label: "Action button" },
        { prop: "dismissible", type: "boolean", defaultValue: false, label: "Dismissible" },
    ],
    states: [
        {
            name: "List of five tones",
            render: () => (<div className="flex w-96 flex-col gap-3">
          <Alert tone="neutral" icon={InfoIcon} title="Neutral reminder">
            This is a tip for a neutral background.
          </Alert>
          <Alert tone="info" icon={InfoIcon} title="Information prompt">
            This is a general information prompt.
          </Alert>
          <Alert tone="success" icon={SuccessIcon} title="Action completed">
            Profile has been saved.
          </Alert>
          <Alert tone="warning" icon={WarningIcon} title="Planned maintenance">
            The service will be unavailable from 02:00–06:00 on Sunday.
          </Alert>
          <Alert tone="danger" icon={DangerIcon} title="Unable to connect to the server">
            There is a connection problem, please try again later.
          </Alert>
        </div>),
        },
        {
            name: "With action button",
            render: () => (<div className="flex w-96 flex-col gap-3">
          <Alert tone="info" icon={InfoIcon} title="Update available" action={<Button size="sm">Refresh</Button>}>
            There is a new version of the app, please refresh to get the latest features.
          </Alert>
          <Alert tone="danger" icon={DangerIcon} title="Unable to connect to the server" action={<Button size="sm" tone="danger">
                Try again
              </Button>}>
            There is a connection problem, please try again later.
          </Alert>
        </div>),
        },
        {
            name: "Dismissible",
            render: () => (<Alert tone="success" icon={SuccessIcon} title="Personal information updated successfully" onClose={() => { }} className="w-96"/>),
        },
        {
            name: "Loading state",
            render: () => (<Alert tone="info" icon={<Spinner size="sm"/>} title="Processing your request" className="w-96">
          Synchronizing data, please wait...
        </Alert>),
        },
        {
            name: "Rich text (list)",
            render: () => (<Alert tone="danger" icon={DangerIcon} title="Unable to connect to the server" className="w-96">
          If there is a connection problem, please try the following:
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>Check network connection</li>
            <li>Refresh the page</li>
            <li>Clear browser cache</li>
          </ul>
        </Alert>),
        },
        {
            name: "Stroke variant",
            render: () => (<div className="flex w-96 flex-col gap-3">
          <Alert variant="outline" tone="info" icon={InfoIcon} title="Stroke information">
            The transparent bottom is demarcated by the border.
          </Alert>
          <Alert variant="outline" tone="warning" icon={WarningIcon} title="Stroke warning">
            Stroke warning status.
          </Alert>
        </div>),
        },
        {
            name: "Text only (No title No icon)",
            render: () => <Alert className="w-96">A condensed prompt with only one line of text.</Alert>,
        },
    ],
    renderWithProps: (p) => {
        const tone = p.tone as Tone;
        return (<Alert tone={tone} variant={p.variant as "soft" | "outline"} icon={p.withIcon ? iconByTone[tone] : undefined} title={(p.title as string) || undefined} action={p.withAction ? (<Button size="sm" tone={tone === "danger" ? "danger" : "brand"}>
              Actions
            </Button>) : undefined} onClose={p.dismissible ? () => { } : undefined} className="w-96">
        {(p.description as string) || undefined}
      </Alert>);
    },
    toCode: (p) => `<Alert tone="${p.tone}" variant="${p.variant}"${p.withIcon ? " icon={<Icon />}" : ""}${p.title ? ` title="${p.title}"` : ""}${p.withAction ? " action={<Button size=\"sm\">Operation</Button>}" : ""}${p.dismissible ? " onClose={() => {}}" : ""}>${p.description ?? ""}</Alert>`,
};
